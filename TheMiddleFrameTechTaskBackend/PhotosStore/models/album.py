from django.db import models
from .user import User

class Album(models.Model):
  title = models.CharField(max_length=255)
  description = models.TextField()
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering = ["-created_at"]
    db_table = "albums"
    