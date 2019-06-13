# Serializers in portfolios app
from rest_framework import serializers

from .models import Security, Portfolio, PortfolioFund


class SecuritySerializer(serializers.ModelSerializer):
    """Security model serializer"""
    class Meta:
        model = Security
        fields = '__all__'


class PortfolioSerializer(serializers.ModelSerializer):
    """Portfolio model serializer"""
    class Meta:
        model = Portfolio
        fields = '__all__'

    def validate(self, data):
        """
        Check that maximum 3 portfolio will get created
        """
        portfolios = Portfolio.objects.all()
        if len(portfolios) >= 3:
            raise serializers.ValidationError(
                "You can't create more than 3 Portfolios")
        return data


class PortfolioFundSerializer(serializers.ModelSerializer):
    """PortfolioFund Model Serializer"""
    class Meta:
        model = PortfolioFund
        fields = '__all__'


class ImportPortfolioFundSerializer(serializers.Serializer):
    """Serializer to import Portfolio fund"""
    data_file = serializers.FileField(required=False)
