from django.urls import path
from .controllers import authController, photosController, albumsController

urlpatterns = [
  ##############
  # Authentication
  ##############
  path(
    'auth/login',
    authController.login,
    name='login'
  ),
  path(
    'auth/register',
    authController.register,
    name='register'
  ),
  
  ##############
  # Photos
  ##############
  path(
    'photos/',
    photosController.getPhotos,
    name='get_photos'
  ),
  path(
    'photos/upload',
    photosController.uploadPhotos,
    name='upload_photos'
  ),
  path(
    'photos/delete/<int:photo_id>',
    photosController.deletePhoto,
    name='delete_photo'
  ),

  ##############
  # Albums
  ##############
  path(
    'albums/<int:album_id>',
    albumsController.getAlbumDetails,
    name='get_album_details'
  ),
]