import os
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date, timedelta

db = SQLAlchemy()


class User(db.Model):
    """User model for storing user data"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=True)
    education = db.Column(db.String(255), nullable=True)
    resume_path = db.Column(db.String(255), nullable=True)
    avatar_path = db.Column(db.String(255), nullable=True)
    avatar_scale = db.Column(db.Float, default=1.0)
    avatar_offset_x = db.Column(db.Float, default=0.0)
    avatar_offset_y = db.Column(db.Float, default=0.0)
    responsibility = db.Column(db.String(255), nullable=True)
    profile_files = db.Column(db.Text, nullable=True)  # JSON mapping for profile file uploads
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone_number = db.Column(db.String(32), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'admin' or 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    def set_password(self, password):
        """Hash and set the user password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify the password against the hash"""
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """Update the last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'full_name': self.full_name,
            'education': self.education,
            'resume_path': self.resume_path,
            'avatar_path': self.avatar_path,
            'avatar_scale': self.avatar_scale,
            'avatar_offset_x': self.avatar_offset_x,
            'avatar_offset_y': self.avatar_offset_y,
            'responsibility': self.responsibility,
            'profile_files': self.profile_files,
            'username': self.username,
            'email': self.email,
            'phone_number': self.phone_number,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<User {self.username}>'


class Task(db.Model):
    """Task model for user assignments"""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending|done
    view_status = db.Column(db.String(20), default='send', nullable=False)  # send|seen
    viewed_at = db.Column(db.DateTime, nullable=True)
    admin_locked = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    recurrence_type = db.Column(db.String(20), default='one_time', nullable=False)  # one_time/daily/weekly/monthly/yearly
    recurrence_group_id = db.Column(db.String(64), nullable=True, index=True)

    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='tasks_assigned')
    created_by = db.relationship('User', foreign_keys=[created_by_id], backref='tasks_created')

    def is_overdue(self):
        return self.status != 'done' and self.due_date < date.today()

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat(),
            'status': self.status,
            'view_status': self.view_status,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None,
            'admin_locked': self.admin_locked,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'recurrence_type': self.recurrence_type,
            'recurrence_group_id': self.recurrence_group_id,
            'assigned_to': {
                'id': self.assigned_to_id,
                'username': self.assigned_to.username if self.assigned_to else None,
                'role': self.assigned_to.role if self.assigned_to else None,
            },
            'created_by': {
                'id': self.created_by_id,
                'username': self.created_by.username if self.created_by else None,
                'role': self.created_by.role if self.created_by else None,
            },
            'overdue': self.is_overdue(),
        }


class TaskAttachment(db.Model):
    """File attachments for tasks"""
    __tablename__ = 'task_attachments'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    stored_path = db.Column(db.String(255), nullable=False)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    task = db.relationship('Task', backref='attachments')
    uploaded_by = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'stored_path': self.stored_path,
            'uploaded_by_id': self.uploaded_by_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProjectNodeAssignee(db.Model):
    """Assignment pivot for project nodes"""
    __tablename__ = 'project_node_assignees'

    id = db.Column(db.Integer, primary_key=True)
    node_id = db.Column(db.Integer, db.ForeignKey('project_nodes.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'node_id': self.node_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProjectNode(db.Model):
    """Tree-like project structure; parent_id is null for main trunks."""
    __tablename__ = 'project_nodes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('project_nodes.id'), nullable=True, index=True)
    researcher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parent = db.relationship('ProjectNode', remote_side=[id], backref='children')
    researcher = db.relationship('User')
    assignee_links = db.relationship(
        'ProjectNodeAssignee',
        backref='node',
        cascade='all, delete-orphan',
        lazy='joined',
        overlaps='assignees',
    )
    assignees = db.relationship(
        'User',
        secondary='project_node_assignees',
        lazy='joined',
        overlaps='assignee_links',
    )

    def _assignee_dicts(self):
        seen = set()
        items = []
        for link in self.assignee_links:
            if not link.user or link.user_id in seen:
                continue
            seen.add(link.user_id)
            items.append({
                'id': link.user.id,
                'username': link.user.username,
                'full_name': link.user.full_name,
                'role': link.user.role,
            })
        # Fallback to legacy single researcher column to avoid losing data.
        if not items and self.researcher:
            items.append({
                'id': self.researcher.id,
                'username': self.researcher.username,
                'full_name': self.researcher.full_name,
                'role': self.researcher.role,
            })
        return items

    def to_dict(self):
        assignees = self._assignee_dicts()
        primary = assignees[0] if assignees else None
        return {
            'id': self.id,
            'name': self.name,
            'parent_id': self.parent_id,
            'researcher_id': primary['id'] if primary else None,
            'researcher': primary,
            'assignees': assignees,
            'assignee_ids': [a['id'] for a in assignees],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class ChatMessage(db.Model):
    """Chat messages for group and private conversations"""
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # null for group chat
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    sender = db.relationship('User', foreign_keys=[sender_id])
    recipient = db.relationship('User', foreign_keys=[recipient_id])

    def to_dict(self, current_user_id=None, can_delete=False):
        return {
            'id': self.id,
            'body': self.body,
            'sender_id': self.sender_id,
            'sender_name': self.sender.full_name or self.sender.username if self.sender else None,
            'recipient_id': self.recipient_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_mine': current_user_id is not None and self.sender_id == current_user_id,
            'can_delete': can_delete,
        }


class ChatReadState(db.Model):
    """Tracks last read chat message per user/peer (peer_id is null for group)"""
    __tablename__ = 'chat_read_state'
    __table_args__ = (db.UniqueConstraint('user_id', 'peer_id', name='uq_chat_read'),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    peer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # null for group
    last_read_id = db.Column(db.Integer, default=0, nullable=False)

    user = db.relationship('User', foreign_keys=[user_id])
    peer = db.relationship('User', foreign_keys=[peer_id])

class Mail(db.Model):
    """Simple mailbox message"""
    __tablename__ = 'mails'

    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_draft = db.Column(db.Boolean, default=False, nullable=False)
    is_saved = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_mails')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_mails')

    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'body': self.body,
            'sender': self.sender.username if self.sender else 'System',
            'recipient_id': self.recipient_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_draft': self.is_draft,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
        }


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    permissions = db.Column(db.Text, nullable=True)  # JSON string of permissions

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'permissions': self.permissions,
        }
