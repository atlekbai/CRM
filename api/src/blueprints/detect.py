import base64
from datetime import datetime

from flask import Blueprint, request, jsonify
from src.VisionAPI import VisionAPI

BP = Blueprint("detect", __name__, url_prefix="/detect")

@BP.route("/", methods=["POST", "OPTIONS", "PUT"])
def detectEndpoint():
    if request.method != "POST":
        return {}
    data = request.json
    image = data.get("image")
    if image == None:
        return {"error": "No image given"}
    visionAPI = VisionAPI()
    result = visionAPI.detect(base64.b64decode(image))
    response = {
        "data":result
    }
    return response

@BP.after_request
def after_request(response):
    """Middleware for CORS
    """
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
    return response
