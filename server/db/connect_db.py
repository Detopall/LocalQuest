from dotenv import load_dotenv
import os

load_dotenv()

# connect to database
username = os.getenv("MONGODB_USERNAME")
password = os.getenv("MONGODB_PASSWORD")
cluster = os.getenv("MONGODB_CLUSTER")
endpoint = os.getenv("MONGODB_ENDPOINT")

uri = f"mongodb+srv://{username}:{password}@cluster0.att9q.mongodb.net/{endpoint}"
