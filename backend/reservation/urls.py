from django.urls import path
from . import views

urlpatterns = [
    path('my/', views.my_reservations, name='my_reservations'),
    path('hosting/', views.host_reservations, name='host_reservations'),
    path('create/<uuid:property_id>/', views.create_reservation, name='create_reservation'),
    path('cancel/<uuid:reservation_id>/', views.cancel_reservation, name='cancel_reservation'),
    path('host-cancel/<uuid:reservation_id>/', views.cancel_reservation_as_host, name='cancel_reservation_as_host'),
    path('booked-dates/<uuid:property_id>/', views.booked_dates, name='booked_dates'),
]
