import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ConversationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'conversation_{self.conversation_id}'
        self.user = self.scope['user']

        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        # Verify user is a participant
        is_participant = await self.check_participant()
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        body = data.get('body', '').strip()
        if not body:
            return

        message = await self.save_message(body)
        if not message:
            return

        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def check_participant(self):
        from .models import Conversation
        try:
            conv = Conversation.objects.get(id=self.conversation_id)
            return conv.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, body):
        from .models import Conversation, Message
        from useraccount.serializers import UserSerializer
        try:
            conv = Conversation.objects.get(id=self.conversation_id)
            msg = Message.objects.create(
                conversation=conv,
                sender=self.user,
                body=body,
            )
            conv.save()
            return {
                'id': str(msg.id),
                'body': msg.body,
                'created_at': msg.created_at.isoformat(),
                'sender': {
                    'id': str(self.user.id),
                    'name': self.user.name,
                    'avatar': self.user.avatar.url if self.user.avatar else None,
                    'avatar_url': f'http://localhost:8000{self.user.avatar.url}' if self.user.avatar else None,
                }
            }
        except Exception:
            return None
