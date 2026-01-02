from django.http import JsonResponse
from ..models.user import User
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def getUsers(request):
  if request.method != "GET":
    return JsonResponse({
      "success": False,
      "error": "Method not allowed"
    }, status=405)

  users = User.objects.all()
  return JsonResponse(users, safe=False)

@csrf_exempt
def updateUser(request):
  if request.method != "PUT":
    return JsonResponse({
      "success": False,
      "error": "Method not allowed"
    }, status=405)

  user_object = User.objects.get(id=request.POST["id"])

  if not user_object:
    return JsonResponse({"error": "User not found"}, status=404)

  user_object.username = request.POST["username"]
  user_object.email = request.POST["email"]
  user_object.password = request.POST["password"]
  user_object.role = request.POST["role"]
  user_object.save()

  return JsonResponse({
    "message": "User updated successfully"
  }, status=200)

@csrf_exempt
def deleteUser(request):
  if request.method != "DELETE":
    return JsonResponse({
      "success": False,
      "error": "Method not allowed"
    }, status=405)

  user_object = User.objects.get(id=request.POST["id"])

  if not user_object:
    return JsonResponse({"error": "User not found"}, status=404)

  user_object.delete()

  return JsonResponse({
    "message": "User deleted successfully"
  }, status=200)