import os
import jwt
import datetime

def encode(info: dict) -> str:
  """
  Encodes a dictionary into a JWT (JSON Web Token) with an expiration date.

  Args:
    info (dict): The dictionary containing information to be encoded into the token.

  Returns:
    str: The encoded JWT as a string.
  """
  expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=30)
  info["exp"] = expiration_time

  return jwt.encode(
    info,
    os.getenv("SECRET"),
    algorithm='HS256'
  )

def decode(token: str):
  """
  Decodes a JWT (JSON Web Token) and retrieves the information it contains.

  Args:
    token (str): The encoded JWT as a string.

  Returns:
    dict: The decoded information contained in the JWT.
  """
  return jwt.decode(
    token,
    os.getenv("SECRET"),
    algorithms=['HS256']
  )