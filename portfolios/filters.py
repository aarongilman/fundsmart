"""Filters in portfolios app"""
import django_filters

from .models import Security


class SecurityFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    ticker = django_filters.CharFilter(lookup_expr='icontains')
    isin = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Security
        fields = ['name', 'ticker', 'isin']
