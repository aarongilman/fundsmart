# Serializers in portfolios app
from datetime import datetime
from rest_framework import serializers

from .models import Security, Portfolio, PortfolioFund, PortfolioFundPrice,\
                    Price


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


class PortfolioFundSerializer(serializers.ModelSerializer):
    """PortfolioFund Model Serializer"""
    security_name = serializers.SerializerMethodField(read_only=True)
    asset_type = serializers.SerializerMethodField(read_only=True)
    isin = serializers.SerializerMethodField(read_only=True)
    price = serializers.SerializerMethodField(read_only=True)

    def get_security_name(self, obj):
        return obj.security.name

    def get_asset_type(self, obj):
        return obj.security.asset_type

    def get_isin(self, obj):
        return obj.security.isin

    def get_price(self, obj):
        request = self.context.get('request')
        date = datetime.today().date()
        price = None
        if request.query_params.get('date'):
            date = request.query_params.get('date')
        try:
            price = PortfolioFundPrice.objects.get(fund=obj, created_at=date).price
        except Exception:
            price_obj = Price.objects.filter(date=date, id_value=obj.security.id_value)
            if price_obj:
                price = price_obj[0].price
        return price

    class Meta:
        model = PortfolioFund
        fields = ("id", "quantity", "created_at", "updated_at", "portfolio",
                  "security", "created_by", "updated_by", 'security_name',
                  'asset_type', 'isin', 'price')


class ImportPortfolioFundSerializer(serializers.Serializer):
    """Serializer to import Portfolio fund"""
    data_file = serializers.FileField(required=False)
