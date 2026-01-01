from django.db import models
from .user import user

class photo(models.Model):
  user = models.ForeignKey(user, on_delete=models.CASCADE)
  title = models.CharField(max_length=255)
  image = models.ImageField(upload_to='photos/')
  created_at = models.DateTimeField(auto_now_add=True)
  description = models.TextField()
  capture_date = models.DateField()
  original_image = models.ImageField(upload_to='photos/original/')
  compressed_image = models.ImageField(upload_to='photos/compressed/')
  
  class Meta:
    ordering = ['-created_at']
    db_table = 'photos'
