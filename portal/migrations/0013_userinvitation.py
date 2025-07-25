# Generated by Django 5.2.3 on 2025-07-02 14:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0012_ticketstatusseen'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('role_assigned', models.CharField(max_length=50)),
                ('date_sent', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('redeemed', 'Redeemed'), ('expired', 'Expired'), ('revoked', 'Revoked')], default='pending', max_length=20)),
                ('redeemed_on', models.DateTimeField(blank=True, null=True)),
                ('token', models.CharField(max_length=64, unique=True)),
                ('expiration_date', models.DateTimeField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, help_text='Optional: store invite metadata, e.g. IP, user agent, etc.', null=True)),
                ('invited_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invitations_sent', to=settings.AUTH_USER_MODEL)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='portal.tenant')),
            ],
        ),
    ]
