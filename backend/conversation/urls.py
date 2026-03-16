from django.urls import path
from . import views

urlpatterns = [
    path('', views.inbox, name='inbox'),
    path('<uuid:pk>/', views.conversation_detail, name='conversation_detail'),
    path('<uuid:pk>/send/', views.send_message, name='send_message'),
    path('start/<uuid:landlord_id>/', views.start_conversation, name='start_conversation'),
]
