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
        portfolios = Portfolio.objects.filter(created_by=
                                              self.context.get('request').user)
        if len(portfolios) >= 3:
            raise serializers.ValidationError(
                "You can't create more than 3 Portfolios")
        return data


class PortfolioFundSerializer(serializers.ModelSerializer):
    """PortfolioFund Model Serializer"""
    security_name = serializers.SerializerMethodField('security', read_only=True)

    def security(self, obj):
        security_name = obj.security.name
        return security_name

    class Meta:
        model = PortfolioFund
        fields = ("id", "quantity", "created_at", "updated_at", "portfolio",
                  "security", "created_by", "updated_by", 'security_name')


class ImportPortfolioFundSerializer(serializers.Serializer):
    """Serializer to import Portfolio fund"""
    data_file = serializers.FileField(required=False)
