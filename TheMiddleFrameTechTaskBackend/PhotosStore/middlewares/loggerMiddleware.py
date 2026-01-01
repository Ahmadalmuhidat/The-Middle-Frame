import os

from django.utils.deprecation import MiddlewareMixin

class loggerMiddleware(MiddlewareMixin):
  def __init__(self, get_response):
    super().__init__(get_response)
    os.makedirs('logs', exist_ok=True)

  def logRequest(self, request):
    with open('logs/request.log', 'a') as logsFile:
      logsFile.write(f"Request: {request.method} {request.path}\n")
    return True
  
  def logResponse(self, response):
    with open('response.log', 'a') as logsFile:
      logsFile.write(f"Response: {response.status_code} {response.content} {response.headers}\n")
    return True

  def logError(self, error):
    with open('error.log', 'a') as logsFile:
      logsFile.write(f"Error: {error.message} {error.traceback}\n")
    return True