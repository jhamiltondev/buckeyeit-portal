from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.views import LogoutView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect

# Create your views here.

@login_required
def dashboard(request):
    return render(request, 'portal/index.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('login')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('portal:dashboard')
        else:
            messages.error(request, 'Invalid username/email or password.')
    
    return render(request, 'portal/login.html')

@login_required
def password_view(request):
    return render(request, 'portal/password.html')

def root_redirect(request):
    return redirect('login')

@method_decorator(csrf_exempt, name='dispatch')
class LogoutViewAllowGet(LogoutView):
    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)

@csrf_exempt
def logout_allow_get(request):
    logout(request)
    return HttpResponseRedirect('/login/')
