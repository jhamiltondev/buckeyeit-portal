"""
Local development settings for buckeyeit_portal project.
This file overrides production settings for local development.
"""

from .settings import *

# Override database for local development
# Using SQLite for local development to avoid needing access to production database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Optional: If you want to use a local PostgreSQL database instead of SQLite
# Uncomment and configure the following:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'buckeyeit_local',
#         'USER': 'postgres',
#         'PASSWORD': 'your_local_password',
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }

# Disable HTTPS requirements for local development
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
SECURE_PROXY_SSL_HEADER = None

# Add localhost to allowed hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

# CORS settings for local development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Disable email verification for local development
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_EMAIL_REQUIRED = False

# Static files configuration for development
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Debug settings
DEBUG = True

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_DOMAIN = None
CSRF_COOKIE_DOMAIN = None

print("Using local development settings") 