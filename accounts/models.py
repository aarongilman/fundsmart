"""account app models"""

from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractUser

from allauth.account.models import EmailAddress


class User(AbstractUser):
    """User model class"""
    phone_number = models.CharField(max_length=15)


@receiver(post_save, sender=User)
def created_user(sender, instance, created, raw, **kwargs):
    if created and instance.is_superuser:
        email, email_created = EmailAddress.objects.get_or_create(user=instance, email=instance.email)
        if email_created:
            email.verified = True
            email.primary = True
            email.save()
