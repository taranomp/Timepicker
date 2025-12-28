from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, CalendarSlot, StudentPick, Student
from .serializers import CourseSerializer, CalendarSlotSerializer, StudentPickSerializer, StudentSerializer
from django.shortcuts import get_object_or_404

DAYS = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
TIMES = ["3-5", "5-7", "7-9"]

class StudentViewSet(viewsets.ModelViewSet):
    """
    Student endpoints: list, create, retrieve, update, destroy
    """
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer

class CourseViewSet(viewsets.ModelViewSet):
    """
    Course endpoints: list, create, retrieve, update, destroy
    When creating a Course, default 7x3 CalendarSlot rows are created automatically.
    """
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer

    def perform_create(self, serializer):
        course = serializer.save()
        # Create 7x3 calendar slots automatically
        slots = [
            CalendarSlot(course=course, day=day, time=time, status=True, count=0)
            for day in DAYS for time in TIMES
        ]
        CalendarSlot.objects.bulk_create(slots)

    @action(detail=True, methods=['post'])
    def reset_calendar(self, request, pk=None):
        """
        Reset the calendar for a course (clear picks, reset counts, set status True).
        POST /api/courses/{id}/reset_calendar/
        """
        course = self.get_object()
        # delete all related student picks
        StudentPick.objects.filter(calendar_slot__course=course).delete()
        # reset slots
        slots = CalendarSlot.objects.filter(course=course)
        slots.update(status=True, count=0)
        return Response({'ok': True})

class CalendarSlotViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only list/retrieve for slots.
    Additional actions:
      - toggle_status (PATCH) -> toggles active/inactive
      - students (GET) -> list students for the slot
    """
    queryset = CalendarSlot.objects.all().select_related('course').prefetch_related('student_picks')
    serializer_class = CalendarSlotSerializer

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        slot = self.get_object()
        slot.status = not slot.status
        slot.save()
        return Response(CalendarSlotSerializer(slot).data)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        slot = self.get_object()
        students = slot.student_picks.all()
        return Response(StudentPickSerializer(students, many=True).data)

class StudentPickViewSet(viewsets.ModelViewSet):
    """
    Create a StudentPick:
      POST /api/picks/  with { calendar_slot: slot_id, student: student_id }
    On create: check slot.status; prevent duplicate same student for same slot; update slot.count.
    """
    queryset = StudentPick.objects.all().order_by('-id')
    serializer_class = StudentPickSerializer

    def create(self, request, *args, **kwargs):
        slot_id = request.data.get('calendar_slot')
        student_id = request.data.get('student')

        if not slot_id or not student_id:
            return Response({'error': 'calendar_slot and student are required'}, status=status.HTTP_400_BAD_REQUEST)

        slot = get_object_or_404(CalendarSlot, id=slot_id)
        student = get_object_or_404(Student, id=student_id)

        if not slot.status:
            return Response({'error': 'Slot is not available'}, status=status.HTTP_400_BAD_REQUEST)

        # prevent duplicate pick by same student for same slot
        if StudentPick.objects.filter(calendar_slot=slot, student=student).exists():
            return Response({'error': 'You already picked this slot'}, status=status.HTTP_400_BAD_REQUEST)

        pick = StudentPick.objects.create(calendar_slot=slot, student=student)
        # update count (can also be calculated dynamically)
        slot.count = slot.student_picks.count()
        slot.save()

        return Response(StudentPickSerializer(pick).data, status=status.HTTP_201_CREATED)
