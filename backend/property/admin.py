from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'landlord', 'price_per_night', 'country', 'category', 'created_at']
    list_filter = ['category', 'country']
    search_fields = ['title', 'description']
