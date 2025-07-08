# BuckeyeIT Portal - Local Development Setup

This guide will help you set up and run the BuckeyeIT Portal project on localhost for testing and development.

## Prerequisites

Before starting, make sure you have the following installed:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download Node.js](https://nodejs.org/)
3. **npm** (comes with Node.js)
4. **Git** - [Download Git](https://git-scm.com/)

## Quick Start (Recommended)

The easiest way to start the development environment is using the provided PowerShell script:

```powershell
.\start_localhost.ps1
```

This script will:
- Install all Python dependencies
- Install all React dependencies
- Run database migrations
- Start both Django backend and React frontend servers

## Manual Setup

If you prefer to set up manually or the script doesn't work, follow these steps:

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install React Dependencies

```bash
cd client-portal-frontend
npm install
cd ..
```

### 3. Set Up Database

```bash
# Run migrations
python run_localhost.py migrate

# Create a superuser (optional)
python run_localhost.py createsuperuser
```

### 4. Start Django Backend

```bash
python run_localhost.py runserver 0.0.0.0:8000
```

### 5. Start React Frontend

In a new terminal:

```bash
cd client-portal-frontend
npm start
```

## Access Points

Once both servers are running, you can access:

- **React Frontend**: http://localhost:3000
- **Django Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin/
- **Admin Panel**: http://localhost:8000/adminpanel/

## Development Notes

### Database
- Local development uses SQLite database (`db.sqlite3`) by default
- This avoids needing access to your private production PostgreSQL database
- Production settings are overridden in `buckeyeit_portal/settings_local.py`
- If you prefer to use PostgreSQL locally, you can configure it in the local settings file

### CORS
- CORS is configured to allow requests from `localhost:3000` to `localhost:8000`
- This enables the React frontend to communicate with the Django backend

### Authentication
- Email verification is disabled for local development
- You can use the Django admin interface to manage users

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Find processes using the ports
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Python Virtual Environment
It's recommended to use a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Node.js Issues
If you encounter Node.js issues:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
cd client-portal-frontend
rm -rf node_modules package-lock.json
npm install
```

## Stopping the Servers

To stop the development servers:
1. Press `Ctrl+C` in each terminal window running the servers
2. Or close the terminal windows

## Next Steps

After the servers are running:
1. Create a superuser account if you haven't already
2. Access the Django admin to set up initial data
3. Test the React frontend functionality
4. Begin your development work!

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Ensure all prerequisites are installed correctly
3. Verify that ports 8000 and 3000 are available
4. Check that the database migrations ran successfully 