from django.urls import path
from . import views

urlpatterns = [
    path('', views.property_list, name='property_list'),
    path('my/', views.my_properties, name='my_properties'),
    path('create/', views.property_create, name='property_create'),
    path('favourites/', views.my_favourites, name='my_favourites'),
    path('landlord/<uuid:landlord_id>/', views.landlord_properties, name='landlord_properties'),
    path('<uuid:pk>/', views.property_detail, name='property_detail'),
    path('<uuid:pk>/update/', views.property_update, name='property_update'),
    path('<uuid:pk>/delete/', views.property_delete, name='property_delete'),
    path('<uuid:pk>/images/', views.add_property_images, name='add_property_images'),
    path('<uuid:pk>/images/<uuid:image_id>/delete/', views.delete_property_image, name='delete_property_image'),
    path('<uuid:property_id>/toggle-favourite/', views.toggle_favourite, name='toggle_favourite'),
]
