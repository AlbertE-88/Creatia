import os
import logging
from datetime import datetime, date, timedelta
import uuid
import json
import mimetypes
from flask import Flask, render_template, redirect, url_for, flash, request, session, jsonify, send_from_directory, abort
from sqlalchemy import or_, and_
from flask_wtf.csrf import CSRFProtect
from forms import LoginForm, RegisterForm
from models import db, User, Task, TaskAttachment, Mail, Role, ChatMessage, ChatReadState, ProjectNode, ProjectNodeAssignee
from werkzeug.utils import secure_filename
from authlib.integrations.flask_client import OAuth
from notification_service import notify_user_channels


# Single application instance and configuration
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
app.secret_key = app.config['SECRET_KEY']

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'creatia.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
# Extend or disable CSRF token expiry to avoid "token expired" on logins
app.config['WTF_CSRF_TIME_LIMIT'] = None

# Initialize database and CSRF protection
db.init_app(app)
csrf = CSRFProtect(app)

# Configure OAuth (Google)
oauth = OAuth(app)
google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
google_client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
if google_client_id and google_client_secret:
    oauth.register(
        name='google',
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_id=google_client_id,
        client_secret=google_client_secret,
        client_kwargs={'scope': 'openid email profile'},
    )

# Configure logging to help debug server errors
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Create database tables and ensure schema compatibility
with app.app_context():
    db.create_all()
    # Ensure newer columns exist when running on an older SQLite file (lightweight migration)
    try:
        result_users = db.session.execute(db.text("PRAGMA table_info(users)")).fetchall()
        user_cols = {row[1] for row in result_users}
        if "full_name" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN full_name TEXT"))
        if "education" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN education TEXT"))
        if "resume_path" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN resume_path TEXT"))
        if "avatar_path" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN avatar_path TEXT"))
        if "avatar_scale" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN avatar_scale REAL DEFAULT 1.0"))
        if "avatar_offset_x" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN avatar_offset_x REAL DEFAULT 0.0"))
        if "avatar_offset_y" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN avatar_offset_y REAL DEFAULT 0.0"))
        if "responsibility" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN responsibility TEXT"))
        if "profile_files" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN profile_files TEXT"))
        if "phone_number" not in user_cols:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN phone_number TEXT"))

        result = db.session.execute(db.text("PRAGMA table_info(tasks)")).fetchall()
        cols = {row[1] for row in result}
        if "description" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN description TEXT"))
        if "view_status" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN view_status TEXT DEFAULT 'send'"))
        if "viewed_at" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN viewed_at DATETIME"))
        if "approved_at" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN approved_at DATETIME"))
        if "recurrence_type" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN recurrence_type TEXT DEFAULT 'one_time'"))
        if "recurrence_group_id" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN recurrence_group_id TEXT"))
        if "submitted_at" not in cols:
            db.session.execute(db.text("ALTER TABLE tasks ADD COLUMN submitted_at DATETIME"))
        # Mail table migrations
        result_mail = db.session.execute(db.text("PRAGMA table_info(mails)")).fetchall()
        mail_cols = {row[1] for row in result_mail}
        if "is_draft" not in mail_cols:
            db.session.execute(db.text("ALTER TABLE mails ADD COLUMN is_draft BOOLEAN DEFAULT 0"))
        if "deleted_at" not in mail_cols:
            db.session.execute(db.text("ALTER TABLE mails ADD COLUMN deleted_at DATETIME"))
        if "is_saved" not in mail_cols:
            db.session.execute(db.text("ALTER TABLE mails ADD COLUMN is_saved BOOLEAN DEFAULT 0"))
        # Project tree tables
        result_nodes = db.session.execute(db.text("PRAGMA table_info(project_nodes)")).fetchall()
        node_cols = {row[1] for row in result_nodes}
        if not result_nodes:
            db.session.execute(db.text("""
                CREATE TABLE IF NOT EXISTS project_nodes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    parent_id INTEGER REFERENCES project_nodes(id),
                    researcher_id INTEGER REFERENCES users(id),
                    created_at DATETIME,
                    updated_at DATETIME
                )
            """))
        else:
            if "researcher_id" not in node_cols:
                db.session.execute(db.text("ALTER TABLE project_nodes ADD COLUMN researcher_id INTEGER REFERENCES users(id)"))
        result_node_assignees = db.session.execute(db.text("PRAGMA table_info(project_node_assignees)")).fetchall()
        if not result_node_assignees:
            db.session.execute(db.text("""
                CREATE TABLE IF NOT EXISTS project_node_assignees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id INTEGER NOT NULL REFERENCES project_nodes(id),
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    created_at DATETIME,
                    CONSTRAINT uq_node_user UNIQUE (node_id, user_id)
                )
            """))
        result_roles = db.session.execute(db.text("PRAGMA table_info(roles)")).fetchall()
        if not result_roles:
            db.session.execute(db.text("CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, permissions TEXT)"))
        # Chat tables (create if missing)
        db.create_all()
        db.session.commit()
    except Exception:
        logger.exception("Schema check failed while ensuring tasks table columns")


def current_user():
    uid = session.get('user_id')
    if not uid:
        return None
    return User.query.get(uid)


def unread_mail_count(user_id):
    now = datetime.utcnow()
    # purge trash older than 20 days
    threshold = now - timedelta(days=20)
    Mail.query.filter(Mail.deleted_at.isnot(None), Mail.deleted_at < threshold).delete()
    db.session.commit()
    return Mail.query.filter_by(recipient_id=user_id, is_read=False, deleted_at=None, is_draft=False).count()


ROLE_DISPLAY_ORDER = {'admin': 0, 'supervisor': 1, 'researcher': 2}


def ordered_users_for_cards():
    """Return users sorted by role priority then name for UI cards."""
    users = User.query.order_by(User.username).all()
    def sort_key(u):
        name = (u.full_name or u.username or u.email or '').lower()
        return (ROLE_DISPLAY_ORDER.get(u.role, len(ROLE_DISPLAY_ORDER)), name)
    return sorted(users, key=sort_key)


def user_task_stats_map(users):
    """Compute lightweight task stats for a set of users (for cards)."""
    ids = [u.id for u in users if u and u.id]
    stats = {uid: {'assigned': 0, 'completed': 0, 'overdue': 0, 'on_time_pct': 0.0} for uid in ids}
    if not ids:
        return stats
    today = date.today()
    tasks = Task.query.filter(Task.assigned_to_id.in_(ids)).all()
    for task in tasks:
        s = stats.get(task.assigned_to_id)
        if s is None:
            continue
        s['assigned'] += 1
        if task.status == 'done':
            s['completed'] += 1
        elif task.due_date and task.due_date < today:
            s['overdue'] += 1
    for uid, s in stats.items():
        denom = s['completed'] + s['overdue']
        pct = (s['completed'] / denom) * 100 if denom else 0
        s['on_time_pct'] = round(max(0, min(100, pct)), 1)
    return stats


def send_mail(subject, body, recipient_id, sender_id=None):
    msg = Mail(subject=subject, body=body, recipient_id=recipient_id, sender_id=sender_id, is_draft=False)
    db.session.add(msg)
    db.session.commit()
    return msg


def notify_task_assignment(task, assigner):
    """Send email + SMS when a task is assigned."""
    assignee = task.assigned_to
    if not assignee:
        return
    assigner_name = (assigner.full_name or assigner.username) if assigner else "System"
    due_text = task.due_date.isoformat() if task.due_date else "unspecified due date"
    dash_route = 'admin_dashboard' if assignee.role == 'admin' else ('supervisor_dashboard' if assignee.role == 'supervisor' else 'researcher_dashboard')
    dashboard_url = url_for(dash_route, _external=True)
    description = (task.description or "").strip() or "No description provided."
    email_body = (
        f"Hi {assignee.full_name or assignee.username},\n\n"
        f"{assigner_name} assigned you a new task.\n"
        f"Title: {task.title}\n"
        f"Due: {due_text}\n"
        f"Details: {description}\n\n"
        f"Open your dashboard: {dashboard_url}"
    )
    sms_body = f"New task from {assigner_name}: {task.title} (due {due_text})"
    notify_user_channels(assignee, f"New task: {task.title}", email_body, sms_body, sender_name=assigner_name)


def notify_mail_received(mail):
    """Send email + SMS when a mailbox message arrives."""
    if not mail or mail.is_draft:
        return
    recipient = mail.recipient
    if not recipient:
        return
    sender_name = (mail.sender.full_name or mail.sender.username) if mail.sender else "System"
    inbox_url = url_for('mails', _external=True)
    email_body = (
        f"Hi {recipient.full_name or recipient.username},\n\n"
        f"You received a new inbox message from {sender_name}.\n"
        f"Subject: {mail.subject}\n\n"
        f"Read it here: {inbox_url}"
    )
    sms_body = f"New inbox message from {sender_name}: {mail.subject}"
    notify_user_channels(recipient, f"New message from {sender_name}", email_body, sms_body, sender_name=sender_name)


def next_recurrence_date(cur_date, rtype):
    if rtype == 'daily':
        return cur_date + timedelta(days=1)
    if rtype == 'weekly':
        return cur_date + timedelta(weeks=1)
    if rtype == 'monthly':
        month = cur_date.month + 1
        year = cur_date.year
        if month > 12:
            month = 1
            year += 1
        try:
            return date(year, month, cur_date.day)
        except ValueError:
            # clamp to end of month
            if month == 2:
                return date(year, month, 28)
            return date(year, month, 30)
    if rtype == 'yearly':
        return date(cur_date.year + 1, cur_date.month, cur_date.day)
    return cur_date


def require_login():
    user = current_user()
    if not user:
        abort(401)
    return user


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    error = None
    try:
        if form.validate_on_submit():
            username = form.username.data
            password = form.password.data

            # Query user from database
            user = User.query.filter_by(username=username).first()

            if not user or not user.check_password(password):
                error = 'Invalid username or password'
            elif not user.is_active:
                error = 'Account is inactive'
            else:
                # Update last login and set session
                user.update_last_login()
                session['user_id'] = user.id
                session['username'] = user.username
                session['role'] = user.role

                if user.role == 'admin':
                    return redirect(url_for('admin_dashboard'))
                if user.role == 'supervisor':
                    return redirect(url_for('supervisor_dashboard'))
                return redirect(url_for('researcher_dashboard'))
        elif request.method == 'POST':
            error = 'Please fill in both fields.'

        return render_template('login.html', form=form, error=error)
    except Exception:
        logger.exception('Exception in /login handler')
        raise


@app.route('/login/google')
def login_google():
    """Start Google OAuth flow."""
    if not (google_client_id and google_client_secret):
        flash('Google OAuth not configured.', 'danger')
        return redirect(url_for('login'))
    redirect_uri = url_for('auth_google', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@app.route('/auth/google')
def auth_google():
    """Handle response from Google and sign the user in/up."""
    try:
        token = oauth.google.authorize_access_token()
        userinfo = oauth.google.parse_id_token(token)
    except Exception:
        logger.exception('Google OAuth failed')
        flash('Google login failed. Try again.', 'danger')
        return redirect(url_for('login'))

    email = userinfo.get('email')
    name = userinfo.get('name') or (email.split('@')[0] if email else None)

    if not email:
        flash('Could not obtain email from Google account.', 'danger')
        return redirect(url_for('login'))

    # Find existing user by email, otherwise create one
    user = User.query.filter_by(email=email).first()
    if not user:
        # create a user with a random password (OAuth users don't use it)
        user = User(
            username=name or email.split('@')[0],
            full_name=name or email.split('@')[0],
            email=email,
            role='user'
        )
        # set a random password
        user.set_password(os.urandom(16).hex())
        db.session.add(user)
        db.session.commit()

    # finalize login
    user.update_last_login()
    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role
    flash(f'Logged in as {user.username} via Google', 'success')
    return redirect(url_for('user_dashboard'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    error = None
    try:
        if form.validate_on_submit():
            username = form.username.data
            email = form.email.data
            password = form.password.data

            # Check if user already exists
            if User.query.filter_by(username=username).first():
                error = 'Username already exists'
            elif User.query.filter_by(email=email).first():
                error = 'Email already registered'
            else:
                # Create new user
                user = User(username=username, full_name=username, email=email, role='user')
                user.set_password(password)
                db.session.add(user)
                db.session.commit()

                flash('Account created successfully! Please log in.', 'success')
                return redirect(url_for('login'))
        elif request.method == 'POST':
            error = 'Please fill in all fields correctly.'

        return render_template('register.html', form=form, error=error)
    except Exception:
        logger.exception('Exception in /register handler')
        raise


@app.route('/admin')
def admin_dashboard():
    if not session.get('user_id') or session.get('role') != 'admin':
        return redirect(url_for('login'))

    user = User.query.get(session.get('user_id'))
    all_users = ordered_users_for_cards()
    user_stats = user_task_stats_map(all_users)
    assignee_list = [
        {
            'id': u.id,
            'username': u.username,
            'full_name': u.full_name,
            'role': u.role,
        }
        for u in all_users
    ]
    return render_template(
        'admin_dashboard.html',
        user=user,
        users=all_users,
        user_cards=all_users,
        user_card_stats=user_stats,
        assignees_json=assignee_list,
        unread_mails=unread_mail_count(user.id),
    )


@app.route('/rsch')
def researcher_dashboard():
    if not session.get('user_id'):
        return redirect(url_for('login'))

    user = User.query.get(session.get('user_id'))
    if not user or not user.is_active:
        session.clear()
        return redirect(url_for('login'))

    cards = ordered_users_for_cards()
    user_stats = user_task_stats_map(cards)
    return render_template(
        'researcher_dashboard.html',
        user=user,
        unread_mails=unread_mail_count(user.id),
        user_cards=cards,
        user_card_stats=user_stats,
    )


@app.route('/supv')
def supervisor_dashboard():
    if not session.get('user_id') or session.get('role') != 'supervisor':
        return redirect(url_for('login'))

    user = User.query.get(session.get('user_id'))
    if not user or not user.is_active:
        session.clear()
        return redirect(url_for('login'))

    cards = ordered_users_for_cards()
    user_stats = user_task_stats_map(cards)
    return render_template(
        'supervisor_dashboard.html',
        user=user,
        unread_mails=unread_mail_count(user.id),
        user_cards=cards,
        user_card_stats=user_stats,
    )


@app.route('/logout')
def logout():
    username = session.get('username', 'User')
    session.clear()
    return redirect(url_for('login'))


@app.route('/profile', methods=['GET', 'POST'])
@csrf.exempt
def profile():
    user = require_login()
    profile_file_labels = [
        ("proposal", "پروپوزال"),
        ("report1", "گزارش اول"),
        ("report2", "گزارش دوم"),
        ("final", "گزارش پایانی"),
    ]
    try:
        profile_files = json.loads(user.profile_files) if user.profile_files else {}
    except Exception:
        profile_files = {}
    error = None
    if request.method == 'POST':
        full_name = (request.form.get('full_name') or '').strip()
        username = (request.form.get('username') or '').strip()
        email = (request.form.get('email') or '').strip()
        phone_number = (request.form.get('phone_number') or '').strip()
        education = (request.form.get('education') or '').strip()
        responsibility = (request.form.get('responsibility') or '').strip()
        avatar_scale = request.form.get('avatar_scale')
        avatar_offset_x = request.form.get('avatar_offset_x')
        avatar_offset_y = request.form.get('avatar_offset_y')
        password = (request.form.get('password') or '').strip()
        resume_file = request.files.get('resume')
        avatar_file = request.files.get('avatar')
        uploaded_files = request.files.getlist('uploads')
        remove_keys = request.form.getlist('remove_files')
        resume_filename = None
        avatar_filename = None
        new_full_name = full_name or user.full_name
        new_username = username or user.username
        new_email = email or user.email
        if User.query.filter(User.username == new_username, User.id != user.id).first():
            error = "Username already taken."
        elif User.query.filter(User.email == new_email, User.id != user.id).first():
            error = "Email already in use."
        else:
            user.full_name = new_full_name
            user.username = new_username
            user.email = new_email
            user.phone_number = phone_number or None
            user.education = education or None
            user.responsibility = responsibility or None
            try:
                user.avatar_scale = float(avatar_scale) if avatar_scale is not None else user.avatar_scale
                user.avatar_offset_x = float(avatar_offset_x) if avatar_offset_x is not None else user.avatar_offset_x
                user.avatar_offset_y = float(avatar_offset_y) if avatar_offset_y is not None else user.avatar_offset_y
            except (TypeError, ValueError):
                error = "Invalid avatar transform values."
            if resume_file and resume_file.filename:
                safe_name = secure_filename(resume_file.filename)
                mimetype = resume_file.mimetype or ''
                if not safe_name:
                    error = "Invalid resume file."
                elif not (safe_name.lower().endswith('.pdf') or mimetype in ('application/pdf', 'application/x-pdf')):
                    error = "Resume must be a PDF file."
                else:
                    resume_filename = f"resume_{user.id}_{int(datetime.utcnow().timestamp())}.pdf"
                    full_path = os.path.join(app.config['UPLOAD_FOLDER'], resume_filename)
                    resume_file.save(full_path)
                    user.resume_path = resume_filename
            if avatar_file and avatar_file.filename:
                safe_avatar = secure_filename(avatar_file.filename)
                mimetype_avatar = avatar_file.mimetype or ''
                valid_ext = safe_avatar.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))
                valid_type = mimetype_avatar.startswith('image/')
                if not safe_avatar or not (valid_ext or valid_type):
                    error = "Avatar must be an image file."
                else:
                    ext = os.path.splitext(safe_avatar)[1] or '.jpg'
                    avatar_filename = f"avatar_{user.id}_{int(datetime.utcnow().timestamp())}{ext}"
                    avatar_path = os.path.join(app.config['UPLOAD_FOLDER'], avatar_filename)
                    avatar_file.save(avatar_path)
                    user.avatar_path = avatar_filename
            # Remove requested files before applying new uploads
            if remove_keys:
                for key in remove_keys:
                    if key in profile_files:
                        try:
                            existing_path = os.path.join(app.config['UPLOAD_FOLDER'], profile_files[key]['stored_path'])
                            if os.path.exists(existing_path):
                                os.remove(existing_path)
                        except Exception:
                            logger.exception("Failed to remove profile file for key %s", key)
                        profile_files.pop(key, None)

            if uploaded_files:
                for idx, file in enumerate(uploaded_files):
                    if not file or not file.filename:
                        continue
                    if idx >= len(profile_file_labels):
                        break
                    safe_name = secure_filename(file.filename)
                    if not safe_name:
                        continue
                    key, _label = profile_file_labels[idx]
                    ext = os.path.splitext(safe_name)[1]
                    stored_filename = f"profile_{user.id}_{key}_{int(datetime.utcnow().timestamp())}{ext}"
                    stored_path = os.path.join(app.config['UPLOAD_FOLDER'], stored_filename)
                    file.save(stored_path)
                    profile_files[key] = {
                        "filename": safe_name,
                        "stored_path": stored_filename,
                    }
            user.profile_files = json.dumps(profile_files)
            if password:
                user.set_password(password)
            if not error:
                db.session.commit()
                flash("Profile updated.", "success")
                return redirect(url_for('profile'))
    tasks_q = Task.query.filter_by(assigned_to_id=user.id).all()
    assigned_count = len(tasks_q)
    completed_tasks = [t for t in tasks_q if t.status == 'done']
    overdue_tasks = [t for t in tasks_q if t.status != 'done' and t.due_date and t.due_date < date.today()]
    completed_count = len(completed_tasks)
    overdue_count = len(overdue_tasks)
    total_finished_or_due = completed_count + overdue_count
    on_time_pct = round((completed_count / total_finished_or_due) * 100, 1) if total_finished_or_due else 0
    completion_pct = round((completed_count / assigned_count) * 100, 1) if assigned_count else 0
    overdue_pct = round((overdue_count / assigned_count) * 100, 1) if assigned_count else 0
    return render_template(
        'profile.html',
        user=user,
        unread_mails=unread_mail_count(user.id),
        error=error,
        assigned_count=assigned_count,
        completed_count=completed_count,
        overdue_count=overdue_count,
        on_time_pct=on_time_pct,
        completion_pct=completion_pct,
        overdue_pct=overdue_pct,
        profile_files=profile_files,
        profile_file_labels=profile_file_labels,
    )


@app.route('/mails')
def mails():
    user = require_login()
    users = User.query.order_by(User.username).all()
    return render_template('mails.html', user=user, unread_mails=unread_mail_count(user.id), users=users)


@app.route('/chat')
def chat():
    user = require_login()
    users = User.query.filter(User.id != user.id).order_by(User.username).all()
    return render_template(
        'chat.html',
        user=user,
        users=users,
        unread_mails=unread_mail_count(user.id),
    )


@csrf.exempt
@app.route('/api/chat/messages', methods=['GET', 'POST'])
def api_chat_messages():
    user = require_login()
    if request.method == 'GET':
        target_raw = request.args.get('target', 'group')
        after_id = request.args.get('after', type=int)
        mark_read = request.args.get('mark_read', '1') == '1'
        q = ChatMessage.query
        if target_raw == 'group':
            q = q.filter(ChatMessage.recipient_id.is_(None))
        else:
            try:
                target_id = int(target_raw)
            except (TypeError, ValueError):
                return jsonify({'error': 'Invalid target.'}), 400
            q = q.filter(
                or_(
                    and_(ChatMessage.sender_id == user.id, ChatMessage.recipient_id == target_id),
                    and_(ChatMessage.sender_id == target_id, ChatMessage.recipient_id == user.id),
                )
            )
        if after_id:
            q = q.filter(ChatMessage.id > after_id)
        msgs = q.order_by(ChatMessage.id.asc()).limit(200).all()
        if mark_read and msgs:
            last_id = msgs[-1].id
            _set_last_read(user.id, None if target_raw == 'group' else int(target_raw), last_id)
        return jsonify([m.to_dict(user.id, can_delete=_can_delete_message(user, m)) for m in msgs])

    # POST
    data = request.get_json() or {}
    body = (data.get('body') or '').strip()
    if not body:
        return jsonify({'error': 'Message body is required.'}), 400
    target_raw = data.get('target') or 'group'
    if target_raw == 'group':
        recipient_id = None
    else:
        try:
            recipient_id = int(target_raw)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid recipient.'}), 400
        if recipient_id == user.id:
            return jsonify({'error': 'Cannot send a private message to yourself.'}), 400
        if not User.query.get(recipient_id):
            return jsonify({'error': 'Recipient not found.'}), 404

    msg = ChatMessage(sender_id=user.id, recipient_id=recipient_id, body=body)
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict(user.id, can_delete=_can_delete_message(user, msg))), 201


def _set_last_read(user_id, peer_id, last_id):
    state = ChatReadState.query.filter_by(user_id=user_id, peer_id=peer_id).first()
    if not state:
        state = ChatReadState(user_id=user_id, peer_id=peer_id, last_read_id=last_id)
        db.session.add(state)
    else:
        state.last_read_id = max(state.last_read_id or 0, last_id)
    db.session.commit()


@csrf.exempt
@app.route('/api/chat/read', methods=['POST'])
def api_chat_read():
    user = require_login()
    data = request.get_json() or {}
    target_raw = data.get('target') or 'group'
    last_id = data.get('last_id')
    try:
        last_id = int(last_id or 0)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid last_id'}), 400
    peer_id = None
    if target_raw != 'group':
        try:
            peer_id = int(target_raw)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid target'}), 400
    _set_last_read(user.id, peer_id, last_id)
    return jsonify({'ok': True})


@app.route('/api/chat/unread')
def api_chat_unread():
    user = require_login()
    latest_id = db.session.query(db.func.max(ChatMessage.id)).scalar() or 0
    states = { (s.peer_id if s.peer_id is not None else 'group'): s.last_read_id for s in ChatReadState.query.filter_by(user_id=user.id).all() }

    # group unread
    group_last = states.get('group', 0)
    group_unread = (
        ChatMessage.query.filter(ChatMessage.recipient_id.is_(None))
        .filter(ChatMessage.id > group_last)
        .filter(ChatMessage.sender_id != user.id)
        .count()
    )
    private_counts = {}
    if latest_id:
        # only fetch users with messages to current user
        privates = (
            db.session.query(ChatMessage.sender_id, db.func.max(ChatMessage.id))
            .filter(ChatMessage.recipient_id == user.id)
            .group_by(ChatMessage.sender_id)
            .all()
        )
        for sender_id, max_id in privates:
            last_seen = states.get(sender_id, 0)
            cnt = (
                ChatMessage.query.filter(ChatMessage.sender_id == sender_id, ChatMessage.recipient_id == user.id, ChatMessage.id > last_seen).count()
            )
            if cnt:
                private_counts[sender_id] = cnt

    return jsonify({'group': group_unread, 'privates': private_counts})


def _message_is_read(msg):
    # Group: only consider other users' reads (sender's own read should not block deletion)
    if msg.recipient_id is None:
        other_read = ChatReadState.query.filter(
            ChatReadState.peer_id.is_(None),
            ChatReadState.user_id != msg.sender_id,
            ChatReadState.last_read_id >= msg.id
        ).first()
        return other_read is not None
    # Private: only the recipient's read matters
    state = ChatReadState.query.filter_by(user_id=msg.recipient_id, peer_id=msg.sender_id).first()
    return state is not None and state.last_read_id >= msg.id


def _can_delete_message(user, msg):
    if user.role == 'admin':
        return True
    if msg.sender_id != user.id:
        return False
    # Sender can delete until someone else has read it
    return not _message_is_read(msg)


@csrf.exempt
@app.route('/api/chat/messages/<int:msg_id>', methods=['DELETE'])
def api_chat_delete(msg_id):
    user = require_login()
    msg = ChatMessage.query.get_or_404(msg_id)
    if not _can_delete_message(user, msg):
        return jsonify({'error': 'اجازه حذف این پیام را ندارید.'}), 403
    db.session.delete(msg)
    db.session.commit()
    return jsonify({'ok': True})


@app.route('/admin/users')
def admin_users():
    if not session.get('user_id') or session.get('role') != 'admin':
        return redirect(url_for('login'))
    user = User.query.get(session.get('user_id'))
    users = User.query.order_by(User.username).all()
    roles = Role.query.order_by(Role.name).all()
    # ensure defaults
    existing = {r.name for r in roles}
    for default in ['admin', 'supervisor', 'researcher']:
        if default not in existing:
            r = Role(name=default, permissions="")
            db.session.add(r)
    db.session.commit()
    roles = Role.query.order_by(Role.name).all()
    return render_template('manage_users.html', user=user, users=users, roles=roles, unread_mails=unread_mail_count(user.id))


@csrf.exempt
@app.route('/api/mails/unread_count')
def api_unread_mails():
    user = require_login()
    return jsonify({'count': unread_mail_count(user.id)})


@csrf.exempt
@app.route('/api/roles', methods=['GET', 'POST'])
def api_roles():
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Not allowed'}), 403
    if request.method == 'GET':
        roles = Role.query.order_by(Role.name).all()
        return jsonify([r.to_dict() for r in roles])
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    permissions = data.get('permissions') or ''
    if not name:
        return jsonify({'error': 'Role name required'}), 400
    if Role.query.filter_by(name=name).first():
        return jsonify({'error': 'Role already exists'}), 400
    role = Role(name=name, permissions=permissions)
    db.session.add(role)
    db.session.commit()
    return jsonify(role.to_dict()), 201


@csrf.exempt
@app.route('/api/admin/users', methods=['POST'])
def api_admin_users():
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Not allowed'}), 403
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    role = (data.get('role') or 'user').strip()
    phone_number = (data.get('phone_number') or '').strip() or None
    if not username or not email or not password:
        return jsonify({'error': 'All fields required.'}), 400
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'User exists.'}), 400
    new_user = User(username=username, email=email, role=role, phone_number=phone_number)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201


@csrf.exempt
@app.route('/api/admin/users/<int:user_id>', methods=['PATCH'])
def api_admin_user_update(user_id):
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Not allowed'}), 403
    target = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    if 'username' in data:
        target.username = (data['username'] or target.username).strip()
    if 'email' in data:
        target.email = (data['email'] or target.email).strip()
    if 'phone_number' in data:
        target.phone_number = (data['phone_number'] or '').strip() or None
    if 'role' in data:
        target.role = data['role'] or target.role
    if 'password' in data and data['password']:
        target.set_password(data['password'])
    if 'is_active' in data:
        target.is_active = bool(data['is_active'])
    db.session.commit()
    return jsonify(target.to_dict())


@csrf.exempt
@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def api_admin_user_delete(user_id):
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Not allowed'}), 403
    target = User.query.get_or_404(user_id)
    # delete related tasks/attachments/mails
    tasks = Task.query.filter(
        (Task.assigned_to_id == target.id) | (Task.created_by_id == target.id)
    ).all()
    for t in tasks:
        for att in list(t.attachments):
            db.session.delete(att)
        db.session.delete(t)
    Mail.query.filter((Mail.sender_id == target.id) | (Mail.recipient_id == target.id)).delete(synchronize_session=False)
    db.session.delete(target)
    db.session.commit()
    return jsonify({'ok': True})


@csrf.exempt
@app.route('/api/mails', methods=['GET', 'POST'])
def api_mails():
    user = require_login()
    if request.method == 'POST':
        data = request.get_json() or {}
        subject = (data.get('subject') or '').strip() or 'No subject'
        body = (data.get('body') or '').strip() or ''
        recipient_id = data.get('recipient_id')
        is_draft = bool(data.get('is_draft'))
        if not recipient_id and not is_draft:
            return jsonify({'error': 'Recipient required'}), 400
        msg = Mail(
            subject=subject,
            body=body,
            sender_id=user.id,
            recipient_id=recipient_id or user.id,
            is_draft=is_draft,
            is_read=is_draft,
        )
        db.session.add(msg)
        db.session.commit()
        try:
            if not is_draft:
                notify_mail_received(msg)
        except Exception:
            logger.exception("Failed to send inbox notifications")
        return jsonify(msg.to_dict()), 201

    folder = request.args.get('folder', 'inbox')
    base = Mail.query.filter(Mail.deleted_at.is_(None))
    if folder == 'inbox':
        query = base.filter_by(recipient_id=user.id, is_draft=False, is_saved=False)
    elif folder == 'sent':
        query = base.filter_by(sender_id=user.id, is_draft=False)
    elif folder == 'draft':
        query = base.filter_by(sender_id=user.id, is_draft=True)
    elif folder == 'trash':
        query = Mail.query.filter(Mail.deleted_at.isnot(None)).filter(
            (Mail.recipient_id == user.id) | (Mail.sender_id == user.id)
        )
    elif folder == 'saved':
        query = base.filter_by(recipient_id=user.id, is_draft=False, is_saved=True)
    else:
        return jsonify({'error': 'Invalid folder'}), 400
    mails = query.order_by(Mail.created_at.desc()).all()
    return jsonify([m.to_dict() for m in mails])


@csrf.exempt
@app.route('/api/mails/<int:mail_id>/read', methods=['POST'])
def api_mail_read(mail_id):
    user = require_login()
    mail = Mail.query.get_or_404(mail_id)
    if mail.recipient_id != user.id and mail.sender_id != user.id:
        return jsonify({'error': 'Not allowed'}), 403
    mail.is_read = True
    db.session.commit()
    return jsonify({'ok': True})


@csrf.exempt
@app.route('/api/mails/bulk', methods=['POST'])
def api_mail_bulk():
    user = require_login()
    data = request.get_json() or {}
    ids = data.get('ids') or []
    action = data.get('action')
    if not ids or action not in ('read', 'delete', 'restore', 'purge', 'move'):
        return jsonify({'error': 'Invalid request'}), 400
    q = Mail.query.filter(Mail.id.in_(ids)).filter(
        (Mail.recipient_id == user.id) | (Mail.sender_id == user.id)
    )
    now = datetime.utcnow()
    if action == 'purge':
        q.delete(synchronize_session=False)
    elif action == 'move':
        target = data.get('target')
        for mail in q:
            if target == 'trash':
                mail.deleted_at = now
                mail.is_saved = False
            elif target == 'inbox':
                mail.deleted_at = None
                mail.is_saved = False
            elif target == 'saved':
                mail.deleted_at = None
                mail.is_saved = True
    else:
        for mail in q:
            if action == 'read':
                mail.is_read = True
            elif action == 'delete':
                mail.deleted_at = now
            elif action == 'restore':
                mail.deleted_at = None
    db.session.commit()
    return jsonify({'ok': True})


def project_node_payload(node):
    data = node.to_dict()
    data['child_count'] = len(node.children)
    return data


def normalize_assignee_ids(raw_value):
    if raw_value is None:
        return None
    if isinstance(raw_value, (str, int)):
        raw_value = [raw_value]
    if not isinstance(raw_value, (list, tuple, set)):
        raise ValueError("Assignee ids must be a list.")
    normalized = []
    for val in raw_value:
        try:
            uid = int(val)
        except (TypeError, ValueError):
            raise ValueError("Invalid assignee id.")
        if uid <= 0:
            continue
        if uid not in normalized:
            normalized.append(uid)
    return normalized


def set_node_assignees(node, assignee_ids):
    desired = normalize_assignee_ids(assignee_ids)
    desired_list = desired or []
    desired_set = set(desired_list)
    if desired is None:
        return
    users = User.query.filter(User.id.in_(desired_set)).all() if desired_set else []
    user_map = {u.id: u for u in users}
    ordered_users = [user_map[uid] for uid in desired_list if uid in user_map]
    found_ids = {u.id for u in users}
    missing = desired_set - found_ids
    if missing:
        raise ValueError(f"Assignee(s) not found: {', '.join(str(m) for m in sorted(missing))}")

    existing = {link.user_id: link for link in node.assignee_links}
    for uid, link in list(existing.items()):
        if uid not in desired_set:
            db.session.delete(link)
    for user in ordered_users:
        if user.id in existing:
            continue
        node.assignee_links.append(ProjectNodeAssignee(user=user, node=node))
    node.researcher = ordered_users[0] if ordered_users else None


@csrf.exempt
@app.route('/api/project-tree', methods=['GET'])
def api_project_tree_list():
    try:
        nodes = ProjectNode.query.order_by(ProjectNode.parent_id.asc(), ProjectNode.name.asc()).all()
        return jsonify([project_node_payload(n) for n in nodes])
    except Exception as exc:
        logger.exception("Failed to load project tree")
        return jsonify([]), 200


@csrf.exempt
@app.route('/api/project-tree', methods=['POST'])
def api_project_tree_create():
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can modify the project tree.'}), 403
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Name is required.'}), 400
    parent_id = data.get('parent_id')
    assignee_ids = data.get('assignee_ids')
    researcher_id = data.get('researcher_id')
    parent = None
    if parent_id not in (None, '', 'null'):
        try:
            pid = int(parent_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid parent id.'}), 400
        parent = ProjectNode.query.get(pid)
        if not parent:
            return jsonify({'error': 'Parent node not found.'}), 404
    node = ProjectNode(name=name, parent=parent)
    db.session.add(node)
    try:
        target_assignees = assignee_ids if assignee_ids is not None else researcher_id
        if target_assignees is not None:
            set_node_assignees(node, target_assignees)
    except ValueError as exc:
        db.session.rollback()
        return jsonify({'error': str(exc)}), 400
    db.session.commit()
    return jsonify(project_node_payload(node)), 201


@csrf.exempt
@app.route('/api/project-tree/<int:node_id>', methods=['POST'])
def api_project_tree_update(node_id):
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can modify the project tree.'}), 403
    node = ProjectNode.query.get_or_404(node_id)
    data = request.get_json() or {}

    if 'name' in data:
        new_name = (data.get('name') or '').strip()
        if not new_name:
            return jsonify({'error': 'Name cannot be empty.'}), 400
        node.name = new_name

    if 'assignee_ids' in data or 'researcher_id' in data:
        try:
            target_assignees = data.get('assignee_ids') if 'assignee_ids' in data else None
            if 'assignee_ids' in data and target_assignees is None:
                target_assignees = []
            if target_assignees is None:
                target_assignees = [] if data.get('researcher_id') in (None, '', 'null') else [data.get('researcher_id')]
            set_node_assignees(node, target_assignees)
        except ValueError as exc:
            return jsonify({'error': str(exc)}), 400

    if 'parent_id' in data:
        pid_raw = data.get('parent_id')
        if pid_raw in (None, '', 'null'):
            new_parent = None
        else:
            try:
                pid = int(pid_raw)
            except (TypeError, ValueError):
                return jsonify({'error': 'Invalid parent id.'}), 400
            new_parent = ProjectNode.query.get(pid)
            if not new_parent:
                return jsonify({'error': 'Parent node not found.'}), 404
        cur = new_parent
        while cur:
            if cur.id == node.id:
                return jsonify({'error': 'Cannot move a node under its own branch.'}), 400
            cur = cur.parent
        node.parent = new_parent

    db.session.commit()
    return jsonify(project_node_payload(node))


@csrf.exempt
@app.route('/api/project-tree/<int:node_id>', methods=['DELETE'])
def api_project_tree_delete(node_id):
    user = require_login()
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can modify the project tree.'}), 403
    node = ProjectNode.query.get_or_404(node_id)

    def delete_subtree(n):
        for child in list(n.children):
            delete_subtree(child)
        db.session.delete(n)

    delete_subtree(node)
    db.session.commit()
    return jsonify({'ok': True})


def task_to_dict(task):
    data = task.to_dict()
    data['attachments'] = [
        {
          **att.to_dict(),
          'url': url_for('uploaded_file', filename=att.stored_path, _external=False),
        } for att in task.attachments
    ]
    data['approval_pending'] = task.view_status == 'awaiting_admin'
    data['created_by_admin'] = bool(task.created_by and task.created_by.role == 'admin')
    data['approved_at'] = task.approved_at.isoformat() if task.approved_at else None
    return data


@csrf.exempt
@app.route('/api/tasks', methods=['GET'])
def api_tasks_list():
    user = require_login()
    self_created_researcher = and_(
        Task.created_by_id.isnot(None),
        Task.created_by_id == Task.assigned_to_id,
        Task.assigned_to.has(User.role == 'user'),
    )
    if user.role == 'admin' and request.args.get('all') == '1':
        query = Task.query.filter(~self_created_researcher)
    else:
        if user.role == 'supervisor':
            # supervisors see only tasks assigned to themselves
            query = Task.query.filter(Task.assigned_to_id == user.id)
        else:
            # researchers/non-admin users see only tasks assigned to themselves and not to supervisors/admins
            query = Task.query.filter(
                Task.assigned_to_id == user.id,
                Task.assigned_to.has(User.role != 'supervisor'),
            )
    tasks = query.order_by(Task.due_date.asc(), Task.id.asc()).all()
    today = date.today()
    grouped = {}
    for t in tasks:
        gid = t.recurrence_group_id
        if not gid:
            grouped.setdefault(f"single-{t.id}", t)
            continue
        existing = grouped.get(gid)
        if not existing:
            grouped[gid] = t
            continue
        # choose the nearest future occurrence; if none future, keep earliest
        def score(task):
            if task.due_date >= today:
                return (0, task.due_date)
            return (1, task.due_date)
        if score(t) < score(existing):
            grouped[gid] = t
    return jsonify([task_to_dict(t) for t in grouped.values()])


@csrf.exempt
@app.route('/api/tasks', methods=['POST'])
def api_tasks_create():
    user = require_login()
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip() or None
    due_date_raw = data.get('due_date')
    assigned_raw = data.get('assigned_to_id')
    recurrence_type = (data.get('recurrence_type') or 'one_time').strip() or 'one_time'
    try:
        if assigned_raw == 'all_researchers':
            assigned_to_id = 'all_researchers'
        else:
            assigned_to_id = int(assigned_raw) if assigned_raw not in (None, "", 0) else int(user.id)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid assignee id.'}), 400

    if not title or not due_date_raw:
        return jsonify({'error': 'Title and due date are required.'}), 400

    # Role-based assignment rules
    assignee = None
    if assigned_to_id != 'all_researchers':
        assignee = User.query.get(assigned_to_id)
        if not assignee:
            return jsonify({'error': 'Assignee not found.'}), 404

    if user.role == 'admin':
        if assigned_to_id == 'all_researchers':
            assignees = User.query.filter_by(role='researcher', is_active=True).all()
            if not assignees:
                return jsonify({'error': 'No researchers found.'}), 404
        else:
            if assignee.role not in ('admin', 'researcher', 'supervisor'):
                return jsonify({'error': 'Admins may assign only to admins, supervisors, or researchers.'}), 403
            assignees = [assignee]
    else:
        if assigned_to_id == 'all_researchers':
            return jsonify({'error': 'Only admins can assign to all researchers.'}), 403
        # Non-admin and supervisors may only assign to themselves (default already self)
        if assigned_to_id != user.id:
            return jsonify({'error': 'You can only assign tasks to yourself.'}), 403
        assignee = user
        assignees = [assignee]

    try:
        due_dt = datetime.fromisoformat(due_date_raw).date()
    except Exception:
        return jsonify({'error': 'Invalid due date format. Use YYYY-MM-DD.'}), 400

    if recurrence_type not in ('one_time', 'daily', 'weekly', 'monthly', 'yearly'):
        return jsonify({'error': 'Invalid recurrence type.'}), 400

    group_id = uuid.uuid4().hex if recurrence_type != 'one_time' else None
    created_tasks = []
    for assignee in assignees:
        task = Task(
            title=title,
            description=description,
            due_date=due_dt,
            assigned_to=assignee,
            created_by=user,
            admin_locked=user.role == 'admin',
            recurrence_type=recurrence_type,
            recurrence_group_id=group_id if recurrence_type != 'one_time' else None
        )
        db.session.add(task)
        created_tasks.append(task)
    db.session.commit()
    try:
        for task in created_tasks:
            notify_task_assignment(task, user)
    except Exception:
        logger.exception("Failed to send task assignment notifications")
    return jsonify(task_to_dict(created_tasks[0])), 201


@csrf.exempt
@app.route('/api/tasks/<int:task_id>/status', methods=['POST'])
def api_tasks_status(task_id):
    user = require_login()
    task = Task.query.get_or_404(task_id)
    if task.assigned_to_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Not allowed.'}), 403
    data = request.get_json() or {}
    new_status = data.get('status')
    valid_statuses = ('pending', 'done', 'done-overdue')
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status.'}), 400
    overdue_now = task.due_date and task.due_date < date.today()
    if (
        new_status == 'done'
        and overdue_now
        and task.status != 'done'
    ):
        return jsonify({'error': 'This task is overdue. Use done-overdue instead.'}), 400
    if new_status == 'done-overdue' and not overdue_now:
        return jsonify({'error': 'done-overdue is only valid for overdue tasks.'}), 400
    # Non-admin assignees of admin-created tasks must be approved
    requires_admin = task.admin_locked and user.role != 'admin'
    is_recurring = task.recurrence_type != 'one_time'
    if new_status == 'pending' and requires_admin and task.view_status == 'awaiting_admin':
        task.view_status = 'seen'
        task.status = 'pending'
        task.submitted_at = None
    elif new_status in ('done', 'done-overdue') and requires_admin:
        task.view_status = 'awaiting_admin'
        task.status = 'pending'
        task.submitted_at = datetime.utcnow()
    else:
        if new_status in ('done', 'done-overdue') and is_recurring:
            # advance to next occurrence instead of completing
            if task.recurrence_group_id:
                Task.query.filter(
                    Task.recurrence_group_id == task.recurrence_group_id,
                    Task.id != task.id
                ).delete(synchronize_session=False)
            task.due_date = next_recurrence_date(task.due_date, task.recurrence_type)
            task.status = 'pending'
            task.view_status = 'send'
            task.approved_at = None
        else:
            task.status = new_status
            if new_status in ('done', 'done-overdue'):
                if user.role == 'admin':
                    task.view_status = 'approved'
                    task.approved_at = datetime.utcnow()
                    task.submitted_at = task.submitted_at or datetime.utcnow()
                else:
                    task.view_status = task.view_status
            elif new_status == 'pending':
                task.view_status = 'seen'
                task.submitted_at = None
            if task.view_status != 'seen' and task.assigned_to_id == user.id:
                task.view_status = 'seen'
                task.viewed_at = datetime.utcnow()
    db.session.commit()
    return jsonify(task_to_dict(task))


@csrf.exempt
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def api_tasks_delete(task_id):
    user = require_login()
    task = Task.query.get_or_404(task_id)
    # admins can delete any task; others only their own self-created/self-assigned tasks
    if user.role != 'admin':
        same_actor = task.created_by_id and task.created_by_id == task.assigned_to_id == user.id
        if not same_actor:
            return jsonify({'error': 'Not allowed to delete this task.'}), 403
    targets = [task]
    if user.role == 'admin' and task.recurrence_group_id:
        targets = Task.query.filter(Task.recurrence_group_id == task.recurrence_group_id).all() or [task]
    for t in targets:
        for att in list(t.attachments):
            db.session.delete(att)
        db.session.delete(t)
    db.session.commit()
    return jsonify({'ok': True})


@csrf.exempt
@app.route('/api/tasks/<int:task_id>/due', methods=['POST'])
def api_tasks_update_due(task_id):
    user = require_login()
    task = Task.query.get_or_404(task_id)
    data = request.get_json() or {}
    due_date_raw = data.get('due_date')
    if not due_date_raw:
        return jsonify({'error': 'New due date is required.'}), 400
    # Only allow creator/assignee same user to change their own task
    same_actor = task.created_by_id and task.created_by_id == task.assigned_to_id == user.id
    if not same_actor:
        return jsonify({'error': 'Not allowed to change this due date.'}), 403
    try:
        due_dt = datetime.fromisoformat(due_date_raw).date()
    except Exception:
        return jsonify({'error': 'Invalid due date format. Use YYYY-MM-DD.'}), 400
    task.due_date = due_dt
    db.session.commit()
    return jsonify(task_to_dict(task))


@csrf.exempt
@app.route('/api/tasks/<int:task_id>/edit', methods=['POST'])
def api_tasks_edit(task_id):
    user = require_login()
    task = Task.query.get_or_404(task_id)
    # Admin can edit any task; others only their own self-created/self-assigned tasks
    if user.role != 'admin':
        same_actor = task.created_by_id == task.assigned_to_id == user.id
        if not same_actor:
            return jsonify({'error': 'Not allowed to edit this task.'}), 403
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip() or None
    due_date_raw = data.get('due_date')
    if title:
        task.title = title
    task.description = description
    if due_date_raw:
        try:
            task.due_date = datetime.fromisoformat(due_date_raw).date()
        except Exception:
            return jsonify({'error': 'Invalid due date format. Use YYYY-MM-DD.'}), 400
    db.session.commit()
    return jsonify(task_to_dict(task))


@csrf.exempt
@app.route('/api/tasks/<int:task_id>/seen', methods=['POST'])
def api_tasks_seen(task_id):
    user = require_login()
    task = Task.query.get_or_404(task_id)
    if task.assigned_to_id != user.id:
        return jsonify({'error': 'Only the assignee can mark this task as seen.'}), 403
    task.view_status = 'seen'
    task.viewed_at = datetime.utcnow()
    db.session.commit()
    return jsonify(task_to_dict(task))


@csrf.exempt
@app.route('/api/tasks/<int:task_id>/attach', methods=['POST'])
def api_tasks_attach(task_id):
    user = require_login()
    task = Task.query.get_or_404(task_id)
    if task.assigned_to_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Not allowed.'}), 403
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400
    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'Invalid file.'}), 400
    safe_name = secure_filename(file.filename)
    stored_path = f"{task_id}_{int(datetime.utcnow().timestamp())}_{safe_name}"
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], stored_path)
    file.save(full_path)
    attachment = TaskAttachment(task=task, filename=safe_name, stored_path=stored_path, uploaded_by=user)
    db.session.add(attachment)
    db.session.commit()
    return jsonify(task_to_dict(task))


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    mime_type, _ = mimetypes.guess_type(filename)
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        filename,
        mimetype=mime_type,
        as_attachment=False,
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)
