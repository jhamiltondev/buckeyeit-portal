# PowerShell script to start localhost development environment
# This script will start both Django backend and React frontend

Write-Host "Starting BuckeyeIT Portal Local Development Environment..." -ForegroundColor Green

# Check if Python is installed
try {
    python --version
} catch {
    Write-Host "Python is not installed or not in PATH. Please install Python first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    node --version
} catch {
    Write-Host "Node.js is not installed or not in PATH. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    npm --version
} catch {
    Write-Host "npm is not installed or not in PATH. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Installing React dependencies..." -ForegroundColor Yellow
Set-Location "client-portal-frontend"
npm install
Set-Location ..

Write-Host "Running database migrations..." -ForegroundColor Yellow
python run_localhost.py migrate

Write-Host "Creating superuser (if needed)..." -ForegroundColor Yellow
Write-Host "You can create a superuser by running: python run_localhost.py createsuperuser" -ForegroundColor Cyan

Write-Host "Starting Django development server on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python run_localhost.py runserver 0.0.0.0:8000"

Write-Host "Starting React development server on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client-portal-frontend; npm start"

Write-Host "Development servers are starting..." -ForegroundColor Green
Write-Host "Django Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "React Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Django Admin: http://localhost:8000/admin/" -ForegroundColor Cyan
Write-Host "Admin Panel: http://localhost:8000/adminpanel/" -ForegroundColor Cyan

Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 