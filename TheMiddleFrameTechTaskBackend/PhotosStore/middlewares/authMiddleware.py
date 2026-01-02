import jwt

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from ..helpers.jsonWebTokenHelper import decode
from ..models.user import User

class authMiddleware(MiddlewareMixin):
  EXCLUDED_PATHS = [
    "/api/auth/register",
    "/api/auth/login",
    "/media/",
  ]

  PUBLIC_GET_PATHS = [
    "/api/photos/",
    "/api/albums/",
  ]

  def decodeToken(self, token: str):
    """
    Decodes a JWT and retrieves the information it contains.

    Args:
      token (str): The encoded JWT as a string.

    Returns:
      dict: The decoded information contained in the JWT.
      None: If token is invalid (error response should be returned by caller).
    """ 
    try:
      decoded_token = decode(token)
      return decoded_token

    except jwt.ExpiredSignatureError:
      return JsonResponse({ 
        "success": False, 
        "error": "Token is expired" 
      }, status=401)
    except jwt.InvalidTokenError:
      return JsonResponse({ 
        "success": False, 
        "error": "Invalid token" 
      }, status=401)
    except Exception as e:
      return JsonResponse({ 
        "success": False, 
        "error": e 
      }, status=500)

  def process_request(self, request):
    """
    Processes the request and decodes the JWT (JSON Web Token) to retrieve the information it contains.

    Args:
      request (Request): The request object.

    Returns:
      None: If the request is valid.
      JsonResponse: If the request is invalid.
    """
    try:
      if any(request.path.startswith(path) for path in self.EXCLUDED_PATHS):
        return None

      if request.method == "GET" and any(request.path.startswith(path) for path in self.PUBLIC_GET_PATHS):
        return None

      token = None
      auth_header = request.META.get("HTTP_AUTHORIZATION", "")

      if auth_header.startswith("Bearer "):
        token = auth_header.split("Bearer ")[1]

      if not token:
        return JsonResponse({ 
          "success": False, 
          "error": "Token is required. Please provide token in Authorization header (Bearer token)." 
        }, status=401)

      decoded_token = self.decodeToken(token)

      user_id = decoded_token.get("id")
      
      if not user_id:
        return JsonResponse({ 
          "success": False, 
          "error": "Invalid token: user ID not found" 
        }, status=401)

      request.user_obj = User.objects.get(id=user_id)
      request.user_role = request.user_obj.role
      request.user_id = user_id

    except User.DoesNotExist:
      return JsonResponse({ 
        "success": False, 
        "error": "User not found" 
      }, status=401)
    except Exception as e:
      return JsonResponse({
        "success": False,
        "error": f"An error occurred: {str(e)}"
      }, status=500)