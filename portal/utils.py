from .models import UserAuditLog

def log_user_action(user, action_type, performed_by=None, ip_address=None, description='', details=None):
    UserAuditLog.objects.create(
        user=user,
        action_type=action_type,
        performed_by=performed_by,
        ip_address=ip_address,
        description=description,
        details=details or {}
    ) 