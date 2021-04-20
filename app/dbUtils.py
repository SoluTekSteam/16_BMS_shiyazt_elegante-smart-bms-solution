from pymongo import MongoClient
from pymongo.collection import Collection
from collections import OrderedDict

"""
Admin : 'mongodb://admin:admin1234@localhost:27017/?authSource=admin'
Application Admin : 'mongodb://appAdministrator:admin1234@localhost:27017/?authSource=admin'

"""

class dbConnector:

    def __init__(self, name: str, uri: str='mongodb://admin:admin1234@localhost:27017/?authSource=admin') -> None:
        self.name: str = name
        self.uri: str = uri
        self.client: MongoClient = None
        self.connected: bool = False
        self.db = None
        self.selectedCollection = None
    
    def connect(self) -> bool:
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.name]
            if self.db:
                self.connected = True
                return True
            else:
                return False
        except Exception as error:
            print(f"[ERROR] connect: {error}")
            return False

    def selectCollection(self, name: str) -> Collection:
        try:
            if not name:
                raise Exception("Name field is empty")
            self.selectedCollection = self.db[name]
            if self.selectCollection:
                return self.selectedCollection
        except Exception as error:
            print(f"[ERROR] selectCollection: {error}")
            return False


    def createCollection(self, name: str, valRequired: bool, valExpr: dict = {}) -> bool:
        try:
            if not name:
                return False
            ret = self.db.create_collection(name)
            print(f"[INFO] createCollection: {ret}")
            if valRequired:
                cmd = OrderedDict([('collMod', name),
                    ('validator', valExpr),
                    ('validationLevel', 'moderate')])
                ret = self.db.command(cmd)
                print(f"[INFO] validation: {ret}")
        except Exception as error:
            print(f"[ERROR] createCollection: {error}")
            return False
    
    def dropCollection(self, name: str) -> bool:
        try:
            ret = self.db.drop_collection(name)
            print(f"[INFO] dropCollection: {ret}")
            if ret:
                return True
            else:
                return False
        except Exception as error:
            print(f"[ERROR] dropCollection: {error}")
            return False
        