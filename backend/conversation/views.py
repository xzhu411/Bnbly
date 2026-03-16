from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ConversationListSerializer, ConversationDetailSerializer
from useraccount.models import User
from property.models import Property


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inbox(request):
    conversations = request.user.conversations.all()
    serializer = ConversationListSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, pk):
    try:
        conversation = Conversation.objects.get(pk=pk, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ConversationDetailSerializer(conversation, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, pk):
    try:
        conversation = Conversation.objects.get(pk=pk, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    body = request.data.get('body', '').strip()
    if not body:
        return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        body=body,
    )
    conversation.save()

    from .serializers import MessageSerializer
    return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request, landlord_id):
    """Start or resume a conversation about a specific property"""
    try:
        landlord = User.objects.get(pk=landlord_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if landlord == request.user:
        return Response({'error': 'Cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)

    # 获取 property_id（可选）
    property_id = request.data.get('property_id')
    property_obj = None

    if property_id:
        try:
            property_obj = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            pass

    # 查找已有对话：同一对用户 + 同一个 property
    if property_obj:
        conversation = Conversation.objects.filter(
            participants=request.user,
            property=property_obj,
        ).filter(
            participants=landlord
        ).first()
    else:
        # 没有指定 property，查找这对用户之间没有 property 的对话
        conversation = Conversation.objects.filter(
            participants=request.user,
            property=None,
        ).filter(
            participants=landlord
        ).first()

    if not conversation:
        conversation = Conversation.objects.create(
            property=property_obj
        )
        conversation.participants.add(request.user, landlord)

    # 发送初始消息（可选）
    body = request.data.get('body', '').strip()
    if body:
        Message.objects.create(
            conversation=conversation,
            sender=request.user,
            body=body,
        )
        conversation.save()

    return Response({'conversation_id': str(conversation.id)}, status=status.HTTP_200_OK)
