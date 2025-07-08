from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .utils import log_user_action

User = get_user_model()

@receiver(post_save, sender=User)
def log_user_created_or_updated(sender, instance, created, **kwargs):
    if created:
        log_user_action(
            user=instance,
            action_type='User Created',
            performed_by=None,
            description='User account created'
        )
    else:
        # Example: log role change, suspension, deletion
        changed_fields = []
        if hasattr(instance, '_pre_save_instance'):
            pre = instance._pre_save_instance
            if pre.support_role != instance.support_role:
                changed_fields.append('Role Changed')
                log_user_action(
                    user=instance,
                    action_type='Role Changed',
                    performed_by=None,
                    description=f"Role changed from {pre.support_role} to {instance.support_role}"
                )
            if pre.is_deleted != instance.is_deleted and instance.is_deleted:
                changed_fields.append('Deleted')
                log_user_action(
                    user=instance,
                    action_type='Deleted',
                    performed_by=None,
                    description='User account deleted'
                )
            if pre.suspended_at != instance.suspended_at and instance.suspended_at:
                changed_fields.append('Suspended')
                log_user_action(
                    user=instance,
                    action_type='Suspended',
                    performed_by=None,
                    description='User account suspended'
                )

# Attach pre-save instance for comparison
def pre_save_user(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._pre_save_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._pre_save_instance = None

from django.db.models.signals import pre_save
pre_save.connect(pre_save_user, sender=User) 