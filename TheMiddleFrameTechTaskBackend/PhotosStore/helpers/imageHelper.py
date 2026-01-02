import sys
import os
import base64

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

def compressImage(image: InMemoryUploadedFile, max_width: int = 1200, quality: int = 85) -> BytesIO:
  """
  Compresses an image to a maximum width while maintaining aspect ratio.
  
  Args:
    image: PIL Image object or Django uploaded file
    max_width (int): Maximum width for the compressed image (default: 1200px)
    quality (int): JPEG quality (1-100, default: 85)
  
  Returns:
    BytesIO: Compressed image as BytesIO object
  """
  img = Image.open(image) if not isinstance(image, Image.Image) else image

  if img.mode != 'RGB':
    img = img.convert('RGB')

  width, height = img.size
  if width > max_width:
    ratio = max_width / width
    img = img.resize((max_width, int(height * ratio)), Image.Resampling.LANCZOS)

  output = BytesIO()
  img.save(output, format='JPEG', quality=quality, optimize=True)
  output.seek(0)

  return output

def addWatermark(image_bytes: BytesIO, watermark_text: str = "TMF Marketplace") -> BytesIO:
  """
  Adds a watermark to an image.
  
  Args:
    image_bytes: BytesIO object containing the image
    watermark_text (str): Text to use as watermark (default: "TMF Marketplace")
  
  Returns:
    BytesIO: Watermarked image as BytesIO object
  """
  image_bytes.seek(0)
  img = Image.open(image_bytes).convert('RGB')

  draw = ImageDraw.Draw(img)
  
  font_size = max(24, img.width // 20)
  try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
  except:
    font = ImageFont.load_default()

  bbox = draw.textbbox((0, 0), watermark_text, font=font)
  text_width = bbox[2] - bbox[0]
  text_height = bbox[3] - bbox[1]

  padding = 20
  x = img.width - text_width - padding
  y = img.height - text_height - padding

  overlay = Image.new('RGBA', img.size, (255, 255, 255, 0))
  overlay_draw = ImageDraw.Draw(overlay)
  overlay_draw.rectangle(
    [x - 10, y - 5, x + text_width + 10, y + text_height + 5],
    fill=(255, 255, 255, 180)
  )

  img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
  ImageDraw.Draw(img).text((x, y), watermark_text, fill=(100, 100, 100), font=font)

  output = BytesIO()
  img.save(output, format='JPEG', quality=85, optimize=True)
  output.seek(0)

  return output

def processImageForUpload(image_file: InMemoryUploadedFile, max_width: int = 1200, quality: int = 85, watermark_text: str = "TMF Marketplace") -> BytesIO:
  """
  Processes an image bt compressing it and adding a watermark to it.
  
  Args:
    image_file (InMemoryUploadedFile): Django uploaded file or file path
    max_width (int): Maximum width for compression (default: 1200px)
    quality (int): JPEG quality (default: 85)
    watermark_text (str): Watermark text (default: "TMF Marketplace")
  
  Returns:
    BytesIO: Processed (compressed and watermarked) image as BytesIO object
  """
  compressed = compressImage(image_file, max_width = max_width, quality = quality)
  watermarked = addWatermark(compressed, watermark_text = watermark_text)
  return watermarked

def createInMemoryUploadedFile(image_bytes: BytesIO, original_filename: str) -> InMemoryUploadedFile:
  """
  Creates a Django InMemoryUploadedFile from BytesIO.
  
  Args:
    image_bytes: BytesIO object containing the image
    original_filename: Original filename of the uploaded file
  
  Returns:
    InMemoryUploadedFile: Django file object ready to save to model
  """
  image_bytes.seek(0)
  
  name, ext = os.path.splitext(original_filename)
  new_filename = f"{name}_compressed.jpg"
  
  file = InMemoryUploadedFile(
    image_bytes,
    None,
    new_filename,
    'image/jpeg',
    sys.getsizeof(image_bytes),
    None
  )

  return file

def base64ToImageFile(base64_string: str, filename: str) -> InMemoryUploadedFile:
  """
  Converts a base64 encoded string to a Django InMemoryUploadedFile.
  
  Args:
    base64_string (str): Base64 encoded image string (with or without data URL prefix)
    filename (str): Filename for the resulting file (default: "image.jpg")
  
  Returns:
    InMemoryUploadedFile: Django file object ready to use
  """
  try:
    base64_string = base64_string.split(",")[1] if "," in base64_string else base64_string
    image_data = base64.b64decode(base64_string)
    
    image_bytes = BytesIO(image_data)
    image_bytes.seek(0)

    content_type = 'image/jpeg'

    if filename.lower().endswith('.png'):
      content_type = 'image/png'
    elif filename.lower().endswith('.webp'):
      content_type = 'image/webp'
    
    return InMemoryUploadedFile(
      image_bytes,
      None,
      filename,
      content_type,
      sys.getsizeof(image_bytes),
      None
    )
    
  except Exception as e:
    raise ValueError(f"Invalid base64 image data: {str(e)}")