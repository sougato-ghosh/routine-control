from django.contrib.auth.backends import BaseBackend
from .mongo_client import get_db # Adjust if mongo_client is elsewhere
from bson.objectid import ObjectId
import bcrypt # For the authenticate method

class MongoUser:
    def __init__(self, user_doc):
        self._id = user_doc['_id']
        self.id = str(user_doc['_id'])
        self.pk = self.id
        self.username = user_doc.get('username')
        self.email = user_doc.get('email')
        self.is_active = True
        self.is_authenticated = True

    def __str__(self):
        return self.username

    # For DRF/Django, is_anonymous and is_authenticated are often checked.
    # @property
    # def is_anonymous(self):
    #     return False

    # @property
    # def is_authenticated(self):
    #     return True

    # For Django's permission system (not fully used here but good for completeness)
    def has_perm(self, perm, obj=None):
        # Simplistic: For now, all authenticated users have all permissions
        # Or, implement role-based logic if you add roles to user_doc
        return True

    def has_module_perms(self, app_label):
        # Simplistic: For now, access to all apps
        return True


class MongoDBAuthenticationBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        # This method is for direct username/password authentication.
        # Our LoginView handles this for token generation.
        # If another part of Django/DRF tries to authenticate with username/password, this will be called.
        if username and password:
            db = get_db()
            user_doc = db.users.find_one({"username": username})
            if user_doc and 'hashed_password' in user_doc and \
               bcrypt.checkpw(password.encode('utf-8'), user_doc['hashed_password'].encode('utf-8')):
                return MongoUser(user_doc)
        return None

    def get_user(self, user_id_from_token):
        # This is critical for JWT. simplejwt will call this with user_id from token payload.
        # The user_id_from_token comes from the 'user_id' claim we set in LoginView.
        db = get_db()
        try:
            user_doc = db.users.find_one({"_id": ObjectId(user_id_from_token)})
            if user_doc:
                return MongoUser(user_doc)
        except Exception: # Handles invalid ObjectId format or other error
            return None
        return None
