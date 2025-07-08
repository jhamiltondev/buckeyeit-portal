#!/usr/bin/env python
"""
Script to run Django development server with local settings
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    # Set the Django settings module to use local settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buckeyeit_portal.settings_local')
    
    # Add the project directory to Python path
    project_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(project_dir))
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Run the development server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])

if __name__ == '__main__':
    main() 