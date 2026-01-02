import os
import traceback

from django.utils.deprecation import MiddlewareMixin

class loggerMiddleware(MiddlewareMixin):
  def __init__(self, get_response):
    super().__init__(get_response)
    self.logs_dir = "PhotosStore/logs"

    os.makedirs(self.logs_dir, exist_ok=True)

  def process_request(self, request):
    try:
      body = request.body.decode("utf-8") if request.body else ""
    except:
      body = "<could not decode>"
    with open(f"{self.logs_dir}/request.log", "a") as logs_file:
      logs_file.write(f"Request: {request.method} {request.path} {body}\n")

  def process_response(self, request, response):
    try:
      content = response.content.decode("utf-8") if hasattr(response, "content") else ""
    except:
      content = "<could not decode>"
    with open(f"{self.logs_dir}/response.log", "a") as logs_file:
      logs_file.write(f"Response: {response.status_code} {content}\n")
    return response

  def process_exception(self, request, exception):
    tb = traceback.format_exc()
    with open(f"{self.logs_dir}/error.log", "a") as logs_file:
      logs_file.write(f"Exception: {str(exception)}\n{tb}\n")
