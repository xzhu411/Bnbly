from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Property, PropertyImage
from .serializers import PropertyListSerializer, PropertyDetailSerializer, PropertyCreateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def property_list(request):
    properties = Property.objects.all().order_by('-created_at')

    search = request.query_params.get('search', '').strip()
    category = request.query_params.get('category', '').strip()
    min_price = request.query_params.get('min_price', '').strip()
    max_price = request.query_params.get('max_price', '').strip()
    guests = request.query_params.get('guests', '').strip()
    check_in = request.query_params.get('check_in', '').strip()
    check_out = request.query_params.get('check_out', '').strip()

    if search:
        properties = properties.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(country__icontains=search) |
            Q(country_code__icontains=search) |
            Q(city__icontains=search) |
            Q(state__icontains=search)
        )
    if category:
        properties = properties.filter(category__iexact=category)
    if min_price:
        properties = properties.filter(price_per_night__gte=int(min_price))
    if max_price:
        properties = properties.filter(price_per_night__lte=int(max_price))
    if guests:
        properties = properties.filter(guests__gte=int(guests))
    if check_in and check_out:
        from reservation.models import Reservation
        booked_ids = Reservation.objects.filter(
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).values_list('property_id', flat=True)
        properties = properties.exclude(id__in=booked_ids)

    serializer = PropertyListSerializer(properties, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def property_detail(request, pk):
    try:
        prop = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = PropertyDetailSerializer(prop, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def property_create(request):
    serializer = PropertyCreateSerializer(data=request.data)
    if serializer.is_valid():
        prop = serializer.save(landlord=request.user)

        # Auto-geocode if no lat/lng provided
        if not prop.lat or not prop.lng:
            import urllib.parse
            lat, lng = geocode_address("", prop.city, prop.state, prop.country)
            if lat and lng:
                prop.lat = lat
                prop.lng = lng
                prop.save()

        # 处理额外图片上传（最多4张）
        images = request.FILES.getlist('images')
        for i, img in enumerate(images[:4]):
            PropertyImage.objects.create(property=prop, image=img, order=i)

        return Response(PropertyDetailSerializer(prop, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_properties(request):
    properties = Property.objects.filter(landlord=request.user).order_by('-created_at')
    serializer = PropertyListSerializer(properties, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def landlord_properties(request, landlord_id):
    properties = Property.objects.filter(landlord_id=landlord_id).order_by('-created_at')
    serializer = PropertyListSerializer(properties, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favourite(request, property_id):
    from .models import Favourite
    try:
        prop = Property.objects.get(pk=property_id)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
    favourite = Favourite.objects.filter(user=request.user, property=prop).first()
    if favourite:
        favourite.delete()
        return Response({'status': 'removed'})
    else:
        Favourite.objects.create(user=request.user, property=prop)
        return Response({'status': 'added'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_favourites(request):
    from .models import Favourite
    favourites = Favourite.objects.filter(user=request.user).select_related('property')
    properties = [f.property for f in favourites]
    serializer = PropertyListSerializer(properties, many=True, context={'request': request})
    return Response(serializer.data)


def geocode_address(address, city, state, country):
    """用 Nominatim 免费 geocoding 获取经纬度"""
    import urllib.request
    import json
    query = ', '.join(filter(None, [address, city, state, country]))
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'bnbly-app/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read())
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception:
        pass
    return None, None


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def property_update(request, pk):
    try:
        prop = Property.objects.get(pk=pk, landlord=request.user)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PropertyCreateSerializer(prop, data=request.data, partial=True)
    # Debug
    if not serializer.is_valid():
        import logging
        logging.error(f"Serializer errors: {serializer.errors}")
    if serializer.is_valid():
        prop = serializer.save()

        # Auto geocode if city changed
        if 'city' in request.data or 'country' in request.data:
            import urllib.parse
            lat, lng = geocode_address("", prop.city, prop.state, prop.country)
            if lat and lng:
                prop.lat = lat
                prop.lng = lng
                prop.save()

        return Response(PropertyDetailSerializer(prop, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def property_delete(request, pk):
    try:
        prop = Property.objects.get(pk=pk, landlord=request.user)
        prop.delete()
        return Response({'message': 'Property deleted'}, status=status.HTTP_200_OK)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def add_property_images(request, pk):
    """Add extra images to an existing property"""
    try:
        prop = Property.objects.get(pk=pk, landlord=request.user)
    except Property.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    images = request.FILES.getlist('images')
    created = []
    for i, img in enumerate(images[:4]):
        pi = PropertyImage.objects.create(property=prop, image=img, order=i)
        created.append({'id': str(pi.id), 'image': request.build_absolute_uri(pi.image.url)})

    return Response(created, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_property_image(request, pk, image_id):
    """Delete a specific extra image"""
    try:
        prop = Property.objects.get(pk=pk, landlord=request.user)
        img = PropertyImage.objects.get(id=image_id, property=prop)
        img.image.delete(save=False)
        img.delete()
        return Response({'message': 'Deleted'})
    except (Property.DoesNotExist, PropertyImage.DoesNotExist):
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
