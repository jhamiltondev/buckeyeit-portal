from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Tenant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)
