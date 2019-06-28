# Serializers in portfolios app
from datetime import datetime
from rest_framework import serializers

from .models import Security, Portfolio, PortfolioFund, Price, HoldingDetail


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
    security_name = serializers.SerializerMethodField(read_only=True)
    asset_type = serializers.SerializerMethodField(read_only=True)
    isin = serializers.SerializerMethodField(read_only=True)
    market_value = serializers.SerializerMethodField(read_only=True)

    def get_security_name(self, obj):
        return obj.security.name

    def get_asset_type(self, obj):
        return obj.security.asset_type

    def get_isin(self, obj):
        return obj.security.isin

    def get_market_value(self, obj):
        request = self.context.get('request')
        date = datetime.today().date()
        price = None
        if request.query_params.get('date'):
            date = request.query_params.get('date')
        if '%' in obj.quantity:
            quantity = (float(obj.quantity.replace("%", "")) / 100) * \
                       1000000
        else:
            quantity = float(obj.quantity)
        try:
            price = HoldingDetail.objects.get(fund=obj).price
            if not price:
                raise Exception
        except Exception:
            price_obj = Price.objects.filter(date=date, id_value=obj.security.id_value)
            if price_obj:
                price = price_obj[0].price
        market_value = float(price) * quantity if price else 0
        return market_value

    class Meta:
        model = PortfolioFund
        fields = ("id", "quantity", "created_at", "updated_at", "portfolio",
                  "security", "created_by", "updated_by", 'security_name',
                  'asset_type', 'isin', 'market_value')


class ImportPortfolioFundSerializer(serializers.Serializer):
    """Serializer to import Portfolio fund"""
    data_file = serializers.FileField(required=False)
