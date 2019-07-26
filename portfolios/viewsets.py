# portfolios viewsets.py
import django_filters
from rest_framework import filters
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
    queryset = Security.objects.all()
    serializer_class = SecuritySerializer
    # filter_backends = (DjangoFilterBackend,)
    # filter_class = SecurityFilter
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'isin', 'ticker')
    pagination_class = None
    permission_classes = []


class PortfolioViewSet(ModelViewSet):
    """
       A ViewSet for portfolio associated with the user.
    """
    serializer_class = PortfolioSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', )

    def get_queryset(self):
        return Portfolio.objects.filter(created_by=self.request.user)


class PortfolioFundViewSet(ModelViewSet):
    """
        A ViewSet for portfolio fund associated with the user.
    """
    serializer_class = PortfolioFundSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.SearchFilter,)
    filterset_fields = ('portfolio', )
    search_fields = ('security__name', )

    def get_queryset(self):
        portfolio_ids = []
        if self.request.GET.get('portfolio_ids'):
            portfolio_ids = self.request.GET.get('portfolio_ids').split(",")
        return PortfolioFund.objects.filter(created_by=self.request.user,
                                            portfolio__in=portfolio_ids)
