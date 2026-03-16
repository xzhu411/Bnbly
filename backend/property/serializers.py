from rest_framework import serializers
from .models import Property, PropertyImage
from useraccount.serializers import UserSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'order']


class PropertyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'title', 'price_per_night', 'image', 'country', 'city', 'state', 'category']


class PropertyDetailSerializer(serializers.ModelSerializer):
    landlord = UserSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = '__all__'


class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'title', 'description', 'price_per_night',
            'bedrooms', 'bathrooms', 'guests',
            'country', 'country_code', 'category', 'image',
            'address', 'city', 'state', 'zip_code', 'lat', 'lng',
        ]
