import uuid
from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class CalendarSlot(models.Model):
    DAYS_OF_WEEK = [
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
    ]

    TIME_SLOTS = [
        ('3-5', '3 PM - 5 PM'),
        ('5-7', '5 PM - 7 PM'),
        ('7-9', '7 PM - 9 PM'),
    ]

    course = models.ForeignKey(Course, related_name='calendar_slots', on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    time = models.CharField(max_length=5, choices=TIME_SLOTS)
    status = models.BooleanField(default=True)
    count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course', 'day', 'time')
        ordering = ['day', 'time']

    def __str__(self):
        return f"{self.course.title} - {self.day} ({self.time})"


class StudentPick(models.Model):
    calendar_slot = models.ForeignKey(CalendarSlot, related_name='student_picks', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"
