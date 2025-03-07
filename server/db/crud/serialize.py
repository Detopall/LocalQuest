from bson.objectid import ObjectId
from datetime import datetime

def serialize_objectid(obj):
	"""
	Recursively converts ObjectId to string in a dict or list.
	"""
	if isinstance(obj, ObjectId):
		return str(obj)
	elif isinstance(obj, dict):
		return {key: serialize_objectid(value) for key, value in obj.items()}
	elif isinstance(obj, list):
		return [serialize_objectid(item) for item in obj]
	elif isinstance(obj, datetime):
		return obj.isoformat()
	else:
		return obj
