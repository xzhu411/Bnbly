from rest_framework import serializers
from .models import Reservation
from property.serializers import PropertyListSerializer
from useraccount.serializers import UserSerializer


class ReservationSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)
    guest = UserSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'property', 'guest', 'check_in', 'check_out', 'guests', 'total_price', 'created_at']


class CreateReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['check_in', 'check_out', 'guests', 'total_price']

    def validate(self, data):
        if data['check_in'] >= data['check_out']:
            raise serializers.ValidationError("Check-out must be after check-in")
        return data
