import json

from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models.photo import Photo
from ..models.album import Album
from ..helpers.imageHelper import processImageForUpload, createInMemoryUploadedFile, base64ToImageFile

@csrf_exempt
def getPhotos(request):
  try:
    if request.method != "GET":
      return JsonResponse({
        "success": False,
        "error": "Method not allowed"
      }, status=405)

    photos = Photo.objects.select_related('user', 'album').all()
    data = []

    for photo in photos:
      data.append({
        "id": photo.id,
        "title": photo.title,
        "description": photo.description,
        "capture_date": photo.capture_date.strftime("%Y-%m-%d"),
        "image": photo.compressed_image.url if photo.compressed_image else None,
        "original_image": photo.original_image.url if photo.original_image else None,
        "user": {
          "id": photo.user.id,
          "username": photo.user.username
        },
        "album": {
          "id": photo.album.id,
          "title": photo.album.title
        } if photo.album else None
      })

    return JsonResponse(data, safe=False)

  except Exception as e:
    return JsonResponse({
      "success": False,
      "error": f"An error occurred: {str(e)}"
    }, status=500)

@csrf_exempt
def uploadPhotos(request):  
  try:
    if request.method != "POST":
      return JsonResponse({
        "success": False,
        "error": "Method not allowed"
      }, status=405)
    
    if request.user_role != "uploader":
      return JsonResponse({
        "success": False,
        "error": "Only uploaders can upload photos"
      }, status=403)
    
    data = json.loads(request.body)
    photos = data.get("photos", [])

    album_id = data.get("album_id")
    new_album_data = data.get("album")
    
    target_album = None
    
    if album_id:
      target_album = Album.objects.get(id=album_id, user=request.user_obj)
    elif new_album_data:
      title = new_album_data.get("title", "").strip()
      description = new_album_data.get("description", "").strip()
      if title:
        target_album = Album.objects.create(
          user=request.user_obj,
          title=title,
          description=description
        )
      else:
        return JsonResponse({
          "success": False,
          "error": "Album title is required to create a new collection"
        }, status=400)

    created_photos = []
    errors = []
    
    for index, photo in enumerate(photos):
      encoded_photo = photo.get("photo")

      if not encoded_photo:
        errors.append(f"Photo {index + 1}: Photo (base64) is required")
        continue

      try:
        filename = photo.get("filename", f"photo_{index + 1}.jpg")
        photo_file = base64ToImageFile(encoded_photo, filename)
      except ValueError as e:
        errors.append(f"Photo {index + 1}: {str(e)}")
        continue

      title = photo.get("title", "").strip()
      description = photo.get("description", "").strip()
      capture_date_str = photo.get("capture_date", "").strip()

      if not title:
        errors.append(f"Photo {index + 1}: Title is required")
        continue
      if not description:
        errors.append(f"Photo {index + 1}: Description is required")
        continue
      if not capture_date_str:
        errors.append(f"Photo {index + 1}: Capture date is required")
        continue

      capture_date = datetime.strptime(capture_date_str, "%Y-%m-%d").date()
      
      watermark_image = processImageForUpload(photo_file)
      compressed_file = createInMemoryUploadedFile(
        watermark_image,
        photo_file.name
      )
      
      photo_file.seek(0)
      
      new_photo = Photo.objects.create(
        user=request.user_obj,
        title=title,
        description=description,
        capture_date=capture_date,
        original_image=photo_file,
        compressed_image=compressed_file,
        album=target_album
      )
      created_photos.append({
        "id": new_photo.id,
        "title": new_photo.title
      })
    
    if errors and not created_photos:
      return JsonResponse({
        "success": False,
        "error": "Failed to upload photos",
        "errors": errors
      }, status=400)
    
    response_data = {
      "success": True,
      "message": f"Successfully uploaded {len(created_photos)} photo(s)",
      "photos": created_photos
    }
    
    if errors:
      response_data["warnings"] = errors
    
    status_code = 201 if created_photos else 400
    return JsonResponse(response_data, status=status_code)

  except Album.DoesNotExist:
    return JsonResponse({
      "success": False,
      "error": "Selected album not found or not yours"
    }, status=404)
  except json.JSONDecodeError:
      return JsonResponse({
        "success": False,
        "error": "Invalid JSON"
      }, status=400)
  except Exception as e:
    return JsonResponse({
      "success": False,
      "error": f"An error occurred: {str(e)}"
    }, status=500)

@csrf_exempt
def deletePhoto(request, photo_id):
  try:
    if request.method != "DELETE":
      return JsonResponse({
        "success": False,
        "error": "Method not allowed"
      }, status=405)
    if request.user_role != "uploader":
      return JsonResponse({
        "success": False,
        "error": "Only uploaders can delete photos"
      }, status=403)

    photo = Photo.objects.get(id=photo_id)

    if photo.user.id != request.user_obj.id:
      return JsonResponse({
        "success": False,
        "error": "You do not have permission to delete this photo"
      }, status=403)
    if photo.original_image:
      photo.original_image.delete(save=False)
    if photo.compressed_image:
      photo.compressed_image.delete(save=False)

    photo.delete()

    return JsonResponse({
      "success": True,
      "message": "Photo deleted successfully"
    }, status=200)

  except Exception as e:
    return JsonResponse({
      "success": False,
      "error": f"An error occurred: {str(e)}"
    }, status=500)