#!/usr/bin/env python
"""Script to create demo users in the database."""

import os
import sys
from app import app, db
from models import User

def create_users():
    """Create admin and test users."""
    with app.app_context():
        # Check if users already exist
        admin_exists = User.query.filter_by(username='Mostafa').first()
        test_exists = User.query.filter_by(username='test').first()
        
        if admin_exists:
            print("✓ Admin user 'Mostafa' already exists")
        else:
            admin = User(
                username='Mostafa',
                email='mostafa@creatia.local',
                role='admin',
                is_active=True
            )
            admin.set_password('Mostafa@ho3in')
            db.session.add(admin)
            print("✓ Created admin user: Mostafa / Mostafa@ho3in")
        
        if test_exists:
            print("✓ Test user 'test' already exists")
        else:
            test_user = User(
                username='test',
                email='test@creatia.local',
                role='user',
                is_active=True
            )
            test_user.set_password('Mostafa@ho4in')
            db.session.add(test_user)
            print("✓ Created test user: test / Mostafa@ho4in")
        
        db.session.commit()
        print("\n✓ Users setup complete!")
        print("\nYou can now login with:")
        print("  Admin: Mostafa / Mostafa@ho3in")
        print("  User:  test / Mostafa@ho4in")

if __name__ == '__main__':
    create_users()
