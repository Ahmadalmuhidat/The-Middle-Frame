from django.db import models

class user(models.Model):
  username = models.CharField(max_length=255)
  email = models.EmailField(max_length=255)
  password = models.CharField(max_length=255)
  role = models.CharField(max_length=255)
  created_at = models.DateTimeField(auto_now_add=True)
  
  class Meta:
    ordering = ['-created_at']
    db_table = 'users'