from rest_framework import serializers
from bson.objectid import ObjectId
import bcrypt
from .mongo_client import get_db # For accessing the MongoDB database instance
from datetime import date # For NoteSerializer using_date

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True) # Represents MongoDB _id as string
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    email = serializers.EmailField(required=False, allow_blank=True)

    def create(self, validated_data):
        db = get_db()
        users_collection = db.users

        username = validated_data['username']
        if users_collection.find_one({"username": username}):
            raise serializers.ValidationError({"username": "A user with that username already exists."})

        password = validated_data['password'].encode('utf-8')
        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')

        user_document = {
            "username": username,
            "hashed_password": hashed_password,
        }
        if 'email' in validated_data and validated_data['email']:
            user_document['email'] = validated_data['email']

        result = users_collection.insert_one(user_document)

        created_user = {
            "id": str(result.inserted_id),
            "username": username,
        }
        if 'email' in user_document:
            created_user['email'] = user_document['email']

        return created_user

class NoteSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True) # Represents MongoDB _id as string
    title = serializers.CharField(max_length=256)
    # DRF DateField handles parsing from ISO format string to datetime.date object
    # and serializing datetime.date object to ISO format string.
    using_date = serializers.DateField()
    amount = serializers.FloatField() # Consider DecimalField for precision if critical and using Decimal128 in MongoDB
    author_id = serializers.CharField(read_only=True) # Should be populated by the view from request.user.id

    def to_representation(self, instance):
        # Convert MongoDB document (dict) to representation for API output
        representation = super().to_representation(instance)
        # Ensure 'id' is from '_id' if not already handled
        if '_id' in instance and 'id' not in representation:
            representation['id'] = str(instance['_id'])
        # Ensure 'author_id' is stringified if it's an ObjectId
        if 'author_id' in instance and isinstance(instance['author_id'], ObjectId):
            representation['author_id'] = str(instance['author_id'])
        # Ensure 'using_date' is a Python date object if it's a string from DB
        # DRF DateField should handle this on output, but good to be aware
        if 'using_date' in instance and isinstance(instance['using_date'], str):
            try:
                representation['using_date'] = date.fromisoformat(instance['using_date'])
            except (ValueError, TypeError):
                 # If it's not a valid ISO date string, or already a date object, pass
                pass
        return representation

    def create(self, validated_data):
        db = get_db()
        notes_collection = db.notes

        # 'author_id' is expected to be added to validated_data by the view
        # (e.g., from request.user.id, which will be our MongoDB user's _id as string)
        author_id_str = validated_data.get('author_id')
        if not author_id_str:
            raise serializers.ValidationError({"author_id": "Author ID is required and must be provided."})

        try:
            author_object_id = ObjectId(author_id_str)
        except Exception:
            raise serializers.ValidationError({"author_id": "Invalid Author ID format."})

        note_document = {
            "title": validated_data['title'],
            "using_date": validated_data['using_date'].isoformat(), # Store as ISO string "YYYY-MM-DD"
            "amount": float(validated_data['amount']),
            "author_id": author_object_id
        }

        result = notes_collection.insert_one(note_document)

        # Prepare the dictionary to return, matching serializer fields
        created_note_repr = {
            "id": str(result.inserted_id),
            "title": note_document['title'],
            "using_date": validated_data['using_date'], # Return as date object
            "amount": note_document['amount'],
            "author_id": str(note_document['author_id'])
        }
        return created_note_repr

    def update(self, instance, validated_data):
        # 'instance' here is the MongoDB document (dictionary) fetched by the view.
        # The view should pass the document's _id for update, or the document itself.
        # Let's assume 'instance' is the dictionary from MongoDB.
        db = get_db()
        notes_collection = db.notes

        # Get the MongoDB _id from the instance
        note_id = instance.get('_id')
        if not note_id:
            raise serializers.ValidationError("Instance provided to update must have an _id.")

        update_payload = {}
        if 'title' in validated_data:
            update_payload['title'] = validated_data['title']
            instance['title'] = validated_data['title']
        if 'using_date' in validated_data:
            # validated_data['using_date'] is a date object from DateField
            update_payload['using_date'] = validated_data['using_date'].isoformat()
            instance['using_date'] = validated_data['using_date'] # Keep instance field as date object
        if 'amount' in validated_data:
            update_payload['amount'] = float(validated_data['amount'])
            instance['amount'] = float(validated_data['amount'])

        if update_payload:
            result = notes_collection.update_one(
                {"_id": ObjectId(note_id)}, # Ensure note_id is ObjectId if it's a string
                {"$set": update_payload}
            )
            if result.matched_count == 0:
                raise serializers.ValidationError({"detail": "Note not found for update."})

        # Return the updated instance (dictionary) matching serializer fields
        # Ensure 'id' and 'author_id' are strings
        instance['id'] = str(instance['_id'])
        if 'author_id' in instance and isinstance(instance['author_id'], ObjectId):
            instance['author_id'] = str(instance['author_id'])
        # Ensure using_date is a date object for representation
        if 'using_date' in instance and isinstance(instance['using_date'], str):
            instance['using_date'] = date.fromisoformat(instance['using_date'])

        return instance