# Serializers in portfolios app
from rest_framework import serializers
from .models import Security, Portfolio, PortfolioFund


class SecuritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Security
        fields = '__all__'


class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = '__all__'


class PortfolioFundSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioFund
        fields = '__all__'
