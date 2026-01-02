import json

from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from ..helpers import jsonWebTokenHelper
from ..models.user import user

@csrf_exempt
def login(request):
  try:
    if request.method != "POST":
      return JsonResponse({
        "success": False,
        "error": "Method not allowed"
      }, status=405)

    email = request.POST.get("email")
    password = request.POST.get("password")

    if not email or not password:
      return JsonResponse({
        "success": False,
        "error": "Email and password are required"
      }, status=400)
    
    user_object = user_object.objects.get(email=email)

    if not check_password(password, user_object.password):
      return JsonResponse({
        "success": False,
        "error": "Invalid email or password"
      }, status=401)
    
    token = jsonWebTokenHelper.encode({
      "id": user_object.id
    })
    
    return JsonResponse({
      "success": True,
      "token": token,
      "user": {
        "id": user_object.id,
        "username": user_object.username,
        "email": user_object.email,
        "role": user_object.role
      }
    }, status=200)

  except user.DoesNotExist:
    return JsonResponse({
      "success": False,
      "error": "Invalid email or password"
    }, status=401)
  except Exception as e:
    return JsonResponse({
      "success": False,
      "error": f"An error occurred: {str(e)}"
    }, status=500)

@csrf_exempt
def register(request):  
  try:
    if request.method != "POST":
      return JsonResponse({
        "success": False,
        "error": "Method not allowed"
      }, status=405)

    username = request.POST.get("username")
    email = request.POST.get("email")
    password = request.POST.get("password")
    role = request.POST.get("role")
    
    if not username or not email or not password or not role:
      return JsonResponse({
        "success": False,
        "error": "All fields are required: username, email, password, role"
      }, status=400)
    
    if role not in ["uploader", "buyer"]:
      return JsonResponse({
        "success": False,
        "error": "Role must be either 'uploader' or 'buyer'"
      }, status=400)
    
    if user.objects.filter(email=email).exists():
      return JsonResponse({
        "success": False,
        "error": "User with this email already exists"
      }, status=409)
    
    if user.objects.filter(username=username).exists():
      return JsonResponse({
        "success": False,
        "error": "User with this username already exists"
      }, status=409)

    new_user_object = user.objects.create(
      username=username,
      email=email,
      password=make_password(password),
      role=role
    )

    token = jsonWebTokenHelper.encode({
      "id": new_user_object.id
    })
    
    return JsonResponse({
      "success": True,
      "token": token,
      "user": {
        "id": new_user_object.id,
        "username": new_user_object.username,
        "email": new_user_object.email,
        "role": new_user_object.role
      }
    }, status=201)

  except Exception as e:
    return JsonResponse({
      "success": False,
      "error": f"An error occurred: {str(e)}"
    }, status=500)