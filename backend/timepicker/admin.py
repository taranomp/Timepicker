from django.contrib import admin
from .models import Course, CalendarSlot, StudentPick, Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "created_at", "updated_at")
    search_fields = ("name", "phone")
    ordering = ("-created_at",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_at", "updated_at")
    search_fields = ("title",)
    ordering = ("-created_at",)


@admin.register(CalendarSlot)
class CalendarSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "day", "time", "status", "count", "created_at", "updated_at")
    list_filter = ("day", "status", "course")
    search_fields = ("course__title",)
    ordering = ("id",)


@admin.register(StudentPick)
class StudentPickAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "calendar_slot", "created_at")
    list_filter = ("calendar_slot__day", "calendar_slot__course")
    search_fields = ("student__name", "student__phone")
    ordering = ("-created_at",)
