# portfolios viewsets.py
import django_filters
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from .filters import SecurityFilter
from .models import Portfolio, PortfolioFund, Security
from .serializers import PortfolioSerializer, PortfolioFundSerializer,\
    SecuritySerializer


class SecurityViewSet(ModelViewSet):
    """
        A ViewSet for portfolio associated with the user.
    """
    serializer_class = SecuritySerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = SecurityFilter
    pagination_class = None
    permission_classes = []

    def get_queryset(self):
        return Security.objects.filter(created_by=self.request.user)


class PortfolioViewSet(ModelViewSet):
    """
       A ViewSet for portfolio associated with the user.
    """
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        return Portfolio.objects.filter(created_by=self.request.user)


class PortfolioFundViewSet(ModelViewSet):
    """
        A ViewSet for portfolio fund associated with the user.
    """
    serializer_class = PortfolioFundSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filterset_fields = ('portfolio',)

    def get_queryset(self):
        return PortfolioFund.objects.filter(created_by=self.request.user)
