from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

# connect to database
username = os.getenv("MONGODB_USERNAME")
password = os.getenv("MONGODB_PASSWORD")
cluster = os.getenv("MONGODB_CLUSTER")
endpoint = os.getenv("MONGODB_ENDPOINT")

uri = f"mongodb+srv://{username}:{password}@cluster0.att9q.mongodb.net/{endpoint}"

try:
	client = MongoClient(uri, server_api=ServerApi('1'))
	client.admin.command('ping')
	print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
	print(e)
