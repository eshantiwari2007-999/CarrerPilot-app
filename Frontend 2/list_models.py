import os
from google import genai

api_key = "AIzaSyCM2Lyw0krTEflA1--Z8WG0KlPgt5YGubU"
client = genai.Client(api_key=api_key)

for m in client.models.list():
    pass

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents="Hello"
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", repr(e))
