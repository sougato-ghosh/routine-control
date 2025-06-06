from django.urls import path
# Ensure views are correctly imported based on the previous step
from .views import CreateUserView, NoteListCreateView, NoteDetailView, LoginView

urlpatterns = [
    path("user/register/", CreateUserView.as_view(), name="register"),
    path("token/", LoginView.as_view(), name="login"), # New login path
    path("notes/", NoteListCreateView.as_view(), name="note-list-create"),
    path("notes/<str:pk>/", NoteDetailView.as_view(), name="note-detail"), # pk is MongoDB _id string
]