from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required
def dashboard(request):
    return render(request, 'portal/index.html')

def login_view(request):
    return render(request, 'portal/login.html')

@login_required
def password_view(request):
    return render(request, 'portal/password.html')

def root_redirect(request):
    return redirect('login')
