import os
from google import genai

api_key = "AIzaSyAjMSqS6onP3pDuysXGBuV3fx2eItvWg9M"
try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Hello"
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
