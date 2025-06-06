from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.CharField(max_length=256)
    using_date = models.DateField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.title