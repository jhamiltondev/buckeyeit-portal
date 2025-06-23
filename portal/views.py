from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, 'portal/index.html')

def login_view(request):
    return render(request, 'portal/login.html')

def password_view(request):
    return render(request, 'portal/password.html')
