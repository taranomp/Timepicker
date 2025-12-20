from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from timepicker.models import Course, CalendarSlot  # ← مسیر را با نام اپ خود تنظیم کن
import random

class Command(BaseCommand):
    help = "Seed the database with initial admin, courses, and calendar slots."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Flushing database..."))
        call_command("flush", "--noinput")

        # === Admin setup ===
        self.stdout.write("Creating groups...")
        groups_info = {"Admin": "full"}
        for group_name in groups_info:
            Group.objects.get_or_create(name=group_name)

        self.stdout.write("Creating admin user...")
        User = get_user_model()
        admin_user, created = User.objects.get_or_create(username="admin")
        if created:
            admin_user.set_password("admin")
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()
            admin_user.groups.add(Group.objects.get(name="Admin"))
            self.stdout.write(self.style.SUCCESS("Admin user created."))
        else:
            self.stdout.write("Admin user already exists.")

        # === Create Courses ===
        self.stdout.write("Creating courses...")
        courses_data = [
            {"title": "Python Course"},
            {"title": "Web Design Course"},
        ]
        courses = []
        for data in courses_data:
            course, _ = Course.objects.get_or_create(**data)
            courses.append(course)
        self.stdout.write(self.style.SUCCESS("Courses created."))

        # === Create CalendarSlots ===
        days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
        times = ["3-5", "5-7", "7-9"]

        for course in courses:
            for day in days:
                for time in times:
                    # Randomly deactivate some slots
                    status = random.choice([True, True, True, False])  # 75% active
                    CalendarSlot.objects.create(
                        course=course,
                        day=day,
                        time=time,
                        status=status,
                        count=0,
                    )
        self.stdout.write(self.style.SUCCESS("Calendar slots created successfully."))

        self.stdout.write(self.style.SUCCESS("✅ Seeding complete!"))
