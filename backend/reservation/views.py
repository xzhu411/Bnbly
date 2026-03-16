from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Reservation
from .serializers import ReservationSerializer, CreateReservationSerializer
from property.models import Property


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request, property_id):
    try:
        property = Property.objects.get(pk=property_id)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

    # 不能预订自己的房源
    if property.landlord == request.user:
        return Response({'error': 'Can not book your own property'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CreateReservationSerializer(data=request.data)
    if serializer.is_valid():
        # 检查日期冲突
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']

        conflict = Reservation.objects.filter(
            property=property,
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()

        if conflict:
            return Response(
                {'error': 'The selected dates are not available. Please choose different dates.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(property=property, guest=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reservations(request):
    """Get all reservations for the current user"""
    reservations = Reservation.objects.filter(
        guest=request.user
    ).select_related('property').order_by('-created_at')

    serializer = ReservationSerializer(reservations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, reservation_id):
    try:
        reservation = Reservation.objects.get(pk=reservation_id, guest=request.user)
        reservation.delete()
        return Response({'message': 'Reservation cancelled'}, status=status.HTTP_200_OK)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def host_reservations(request):
    """Get all reservations for properties owned by current user"""
    from property.models import Property
    my_properties = Property.objects.filter(landlord=request.user)
    reservations = Reservation.objects.filter(
        property__in=my_properties
    ).select_related('property', 'guest').order_by('-created_at')
    serializer = ReservationSerializer(reservations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation_as_host(request, reservation_id):
    """Host cancels a guest's reservation"""
    try:
        reservation = Reservation.objects.get(
            pk=reservation_id,
            property__landlord=request.user
        )
        reservation.delete()
        return Response({'message': 'Reservation cancelled'}, status=status.HTTP_200_OK)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def booked_dates(request, property_id):
    """Return all booked date ranges for a property"""
    reservations = Reservation.objects.filter(property_id=property_id)
    data = [{'check_in': str(r.check_in), 'check_out': str(r.check_out)} for r in reservations]
    return Response(data)
