from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class NoNewUsersAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        # Allow social logins but prevent regular signups
        if request and hasattr(request, 'session'):
            # Check if this is a social login
            social_login = request.session.get('socialaccount_sociallogin')
            if social_login:
                return True
        return False

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request, sociallogin):
        # Always allow social logins to create accounts
        return True
    
    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        # Ensure social users are active
        user.is_active = True
        user.save()
        return user 