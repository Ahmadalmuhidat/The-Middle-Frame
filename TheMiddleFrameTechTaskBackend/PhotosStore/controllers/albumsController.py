from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models.album import Album
from ..models.photo import Photo

@csrf_exempt
def getAlbums(request):
  if request.method != "GET":
    return JsonResponse({"success": False, "error": "Method not allowed"}, status=405)

  albums = Album.objects.select_related('user').all()
  data = []
  for album in albums:
    first_photo = Photo.objects.filter(album=album).first()
    data.append({
      "id": album.id,
      "title": album.title,
      "uploader": album.user.username,
      "photo_count": Photo.objects.filter(album=album).count(),
      "cover_image": first_photo.compressed_image.url if first_photo and first_photo.compressed_image else None
    })
  return JsonResponse(data, safe=False)

@csrf_exempt
def getAlbumDetails(request, album_id):
  try:
    if request.method != "GET":
      return JsonResponse({
        "success": False,
        "error": "Method not allowed"
      }, status=405)

    album = Album.objects.select_related('user').get(id=album_id)

    photos = Photo.objects.filter(album=album).all()
    photo_list = []
    
    for photo in photos:
      photo_list.append({
        "id": photo.id,
        "title": photo.title,
        "description": photo.description,
        "capture_date": photo.capture_date.strftime("%Y-%m-%d"),
        "image": photo.compressed_image.url if photo.compressed_image else None,
        "original_image": photo.original_image.url if photo.original_image else None,
        "uploader": album.user.username,
        "album": {
          "id": album.id,
          "title": album.title
        }
      })

    return JsonResponse({
      "success": True,
      "album": {
        "id": album.id,
        "title": album.title,
        "description": album.description,
        "uploader": album.user.username,
        "created_at": album.created_at.strftime("%Y-%m-%d")
      },
      "photos": photo_list
    })

  except Album.DoesNotExist:
    return JsonResponse({
      "success": False,
      "error": "Album not found"
    }, status=404)
  except Exception as e:
    return JsonResponse({
      "success": False,
      "error": f"An error occurred: {str(e)}"
    }, status=500)
