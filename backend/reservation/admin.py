from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['property', 'guest', 'check_in', 'check_out', 'guests', 'total_price', 'created_at']
    list_filter = ['check_in', 'check_out']
    search_fields = ['property__title', 'guest__email']
