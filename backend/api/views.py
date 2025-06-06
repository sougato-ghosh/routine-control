from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied # Import PermissionDenied
from .serializers import UserSerializer, NoteSerializer
from .mongo_client import get_db
from bson.objectid import ObjectId
from datetime import date # For date handling if needed, though serializer handles it mostly
import bcrypt
from rest_framework_simplejwt.tokens import RefreshToken

# Note: The functionality of request.user.id providing the MongoDB user's _id (as string)
# is dependent on the custom authentication setup in Step 7.

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    # The base class's create method will call serializer.save(), which calls our UserSerializer.create()

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # This method provides the list of items for the 'list' action.
        # It's called by DRF's ListAPIView.
        db = get_db()

        if not hasattr(self.request.user, 'id') or self.request.user.id is None:
            # This should ideally be caught by IsAuthenticated or a more specific permission.
            # If IsAuthenticated passes, request.user should be valid.
            # If request.user is an anonymous user, it might not have 'id'.
            # However, IsAuthenticated should prevent anonymous access.
            # This check is a safeguard.
            return []

        try:
            # self.request.user.id should be the string representation of the MongoDB user's _id
            author_obj_id = ObjectId(self.request.user.id)
        except Exception:
            # Invalid user ID format. This indicates a problem with how request.user is populated.
            # Log this error for debugging.
            print(f"Error: Invalid user ID format for request.user.id: {self.request.user.id}")
            return []

        notes_cursor = db.notes.find({"author_id": author_obj_id})

        notes_list = []
        for note_doc in notes_cursor:
            # Ensure 'id' field (string of _id) is present for the serializer
            note_doc['id'] = str(note_doc['_id'])

            # Convert 'author_id' (ObjectId) to string for consistent output via serializer if needed,
            # but our NoteSerializer.to_representation handles this.
            if 'author_id' in note_doc and isinstance(note_doc['author_id'], ObjectId):
                 note_doc['author_id'] = str(note_doc['author_id'])

            # Convert 'using_date' (ISO string from DB) to Python date object
            # because DRF DateField expects a date object for serialization.
            if 'using_date' in note_doc and isinstance(note_doc['using_date'], str):
                try:
                    note_doc['using_date'] = date.fromisoformat(note_doc['using_date'])
                except ValueError:
                    # Handle cases where date might be malformed or already a date object
                    # Or log an error if dates should always be valid ISO strings
                    print(f"Warning: Could not parse date string '{note_doc['using_date']}' for note {note_doc['id']}")
                    # Depending on strictness, either skip this field or the whole note
                    pass
            notes_list.append(note_doc)
        return notes_list # ListAPIView passes this to the serializer with many=True

    def perform_create(self, serializer):
        # This method is called by CreateAPIView when creating an instance.
        # serializer.save() will ultimately call NoteSerializer.create().
        if not hasattr(self.request.user, 'id') or self.request.user.id is None:
            # As above, IsAuthenticated should prevent this.
            raise PermissionDenied("User ID not found in request. Cannot assign author to note.")

        user_id_str = str(self.request.user.id)
        try:
            ObjectId(user_id_str) # Validate that user_id_str is a valid ObjectId string
        except Exception:
            raise PermissionDenied("Invalid user ID format in request. Cannot assign author to note.")

        # Pass author_id to the serializer's create method.
        # Our NoteSerializer expects 'author_id' in its validated_data for create.
        serializer.save(author_id=user_id_str)


class NoteDetailView(views.APIView):
    permission_classes = [IsAuthenticated]
    # serializer_class = NoteSerializer # Useful for DRF's UI and some auto-configurations

    def get_object_and_check_permission(self, pk_str, user_id_str):
        db = get_db()
        try:
            obj_id = ObjectId(pk_str)
            auth_id = ObjectId(user_id_str)
        except Exception: # Invalid ObjectId format
            return None

        note = db.notes.find_one({"_id": obj_id, "author_id": auth_id})
        if note:
            # Prepare for serializer: ensure 'id' is string of _id, 'using_date' is date object
            note['id'] = str(note['_id'])
            if 'author_id' in note and isinstance(note['author_id'], ObjectId):
                 note['author_id'] = str(note['author_id'])
            if 'using_date' in note and isinstance(note['using_date'], str):
                try:
                    note['using_date'] = date.fromisoformat(note['using_date'])
                except ValueError:
                    # Log error or handle as per application requirements
                    pass
        return note

    def get(self, request, pk, format=None): # Retrieve a single note
        if not hasattr(request.user, 'id') or request.user.id is None:
            return Response({"detail": "Authentication credentials were not provided or user ID is missing."}, status=status.HTTP_401_UNAUTHORIZED)

        note = self.get_object_and_check_permission(pk, request.user.id)
        if note:
            # Pass the dictionary directly to the serializer
            serializer = NoteSerializer(note)
            return Response(serializer.data)
        return Response({"detail": "Not found or permission denied."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk, format=None): # Update a note
        if not hasattr(request.user, 'id') or request.user.id is None:
            return Response({"detail": "Authentication credentials were not provided or user ID is missing."}, status=status.HTTP_401_UNAUTHORIZED)

        note_instance_dict = self.get_object_and_check_permission(pk, request.user.id)
        if not note_instance_dict:
            return Response({"detail": "Not found or permission denied."}, status=status.HTTP_404_NOT_FOUND)

        # Pass the fetched dictionary as 'instance'
        # partial=True allows for partial updates (PATCH-like behavior with PUT)
        serializer = NoteSerializer(instance=note_instance_dict, data=request.data, partial=True)
        if serializer.is_valid():
            # serializer.save() calls NoteSerializer.update(instance_dict, validated_data)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None): # Delete a note
        if not hasattr(request.user, 'id') or request.user.id is None:
            return Response({"detail": "Authentication credentials were not provided or user ID is missing."}, status=status.HTTP_401_UNAUTHORIZED)

        db = get_db()
        try:
            obj_id = ObjectId(pk)
            auth_id = ObjectId(request.user.id)
        except Exception: # Invalid ObjectId format
            return Response({"detail": "Invalid ID format."}, status=status.HTTP_400_BAD_REQUEST)

        result = db.notes.delete_one({"_id": obj_id, "author_id": auth_id})
        if result.deleted_count == 1:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            # Either not found or not owned by the user (permission denied implicitly)
            return Response({"detail": "Not found or permission denied."}, status=status.HTTP_404_NOT_FOUND)


# Add this at the end of backend/api/views.py

# import bcrypt # Ensure bcrypt is imported at the top if not already
# from rest_framework_simplejwt.tokens import RefreshToken # Ensure this is imported

class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        db = get_db()
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user_doc = db.users.find_one({"username": username})

        if user_doc and bcrypt.checkpw(password.encode('utf-8'), user_doc['hashed_password'].encode('utf-8')):
            # Manually create tokens and add user_id to payload
            refresh = RefreshToken()
            refresh['user_id'] = str(user_doc['_id']) # This is what get_user will receive
            refresh['username'] = user_doc['username']
            if 'email' in user_doc: # Add email to token if it exists
                refresh['email'] = user_doc['email']

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)