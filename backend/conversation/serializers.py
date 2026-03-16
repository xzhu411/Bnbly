from rest_framework import serializers
from .models import Conversation, Message
from useraccount.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'body', 'created_at']


def get_reservation_info_for_conversation(obj, current_user_id):
    """Shared helper to get reservation info"""
    if not obj.property:
        return None
    from reservation.models import Reservation
    other_participants = obj.participants.exclude(id=current_user_id)
    for participant in other_participants:
        reservation = Reservation.objects.filter(
            property=obj.property,
            guest=participant,
        ).order_by('-created_at').first()
        if reservation:
            return {
                'check_in': str(reservation.check_in),
                'check_out': str(reservation.check_out),
                'guests': reservation.guests,
                'guest_name': participant.name,
            }
    return None


class ConversationListSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    property_title = serializers.SerializerMethodField()
    property_id = serializers.SerializerMethodField()
    property_landlord_id = serializers.SerializerMethodField()
    reservation_info = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'property_title', 'property_id', 'property_landlord_id', 'reservation_info', 'modified_at']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {'body': last.body, 'sender': last.sender.name}
        return None

    def get_property_title(self, obj):
        return obj.property.title if obj.property else None

    def get_property_id(self, obj):
        return str(obj.property.id) if obj.property else None

    def get_property_landlord_id(self, obj):
        return str(obj.property.landlord.id) if obj.property else None

    def get_reservation_info(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return get_reservation_info_for_conversation(obj, request.user.id)


class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    property_title = serializers.SerializerMethodField()
    property_id = serializers.SerializerMethodField()
    property_landlord_id = serializers.SerializerMethodField()
    reservation_info = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'messages', 'property_title', 'property_id', 'property_landlord_id', 'reservation_info', 'modified_at']

    def get_property_title(self, obj):
        return obj.property.title if obj.property else None

    def get_property_id(self, obj):
        return str(obj.property.id) if obj.property else None

    def get_property_landlord_id(self, obj):
        return str(obj.property.landlord.id) if obj.property else None

    def get_reservation_info(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return get_reservation_info_for_conversation(obj, request.user.id)
