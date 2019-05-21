"""account app models"""

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager
from django.db import models


class User(AbstractUser):
    """User model class"""
    phone_number = models.CharField(max_length=15)
