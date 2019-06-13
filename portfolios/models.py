# portfolios app models.py file

from django.db import models
from django.core.validators import RegexValidator

from accounts.models import User


class Price(models.Model):
    """Price model class"""
    date = models.DateField()
    id_value = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=7, decimal_places=3)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class FXRate(models.Model):
    """FXRate model class"""
    date = models.DateField()
    currency = models.CharField(max_length=50)
    base = models.CharField(max_length=50)
    rate = models.DecimalField(max_digits=7, decimal_places=3)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class FundHolding(models.Model):
    """"FundHoldings model class"""
    date = models.DateField()
    fund = models.CharField(max_length=100)
    fund_id = models.CharField(max_length=50)
    id_value = models.CharField(max_length=50)
    quantity = models.IntegerField()
    market_value = models.DecimalField(max_digits=21, decimal_places=15)
    net_asset_percentage = models.DecimalField(max_digits=21, decimal_places=15)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Security(models.Model):
    """Security model class"""
    name = models.CharField(max_length=100)
    isin = models.CharField(max_length=30, unique=True)
    id_value = models.CharField(max_length=50)
    date = models.DateField()
    ticker = models.CharField(max_length=30, null=True, blank=True)
    asset_type = models.CharField(max_length=100)
    currency = models.CharField(max_length=30)
    country = models.CharField(max_length=100)
    industry = models.CharField(max_length=100, null=True, blank=True)
    rating = models.CharField(max_length=80, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class FundDetail(models.Model):
    """FundDetail model class"""
    asset_type = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    fund_id = models.CharField(max_length=30)
    benchmark = models.CharField(max_length=100)
    aum = models.DecimalField(max_digits=21, decimal_places=15)
    regular = models.CharField(max_length=15)
    direct = models.CharField(max_length=15)
    fund_exp_ratio = models.CharField(max_length=15)
    return_1_year = models.DecimalField(max_digits=21, decimal_places=15)
    return_3_year = models.DecimalField(max_digits=21, decimal_places=15)
    return_5_year = models.DecimalField(max_digits=21, decimal_places=15)
    benchmark_1_year = models.DecimalField(max_digits=21, decimal_places=15)
    benchmark_3_year = models.DecimalField(max_digits=21, decimal_places=15)
    benchmark_5_year = models.DecimalField(max_digits=21, decimal_places=15)
    return_over_bench_1_year = models.DecimalField(max_digits=21,
                                                   decimal_places=15)
    return_over_bench_3_year = models.DecimalField(max_digits=21,
                                                   decimal_places=15)
    return_over_bench_5_year = models.DecimalField(max_digits=21,
                                                   decimal_places=15)
    for_recommendation = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Portfolio(models.Model):
    """Portfolio model class"""
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=250, null=True, blank=True)
    owner_1 = models.CharField(max_length=100, null=True, blank=True)
    owner_2 = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    marginal_tax_range = models.DecimalField(max_digits=7, decimal_places=3,
                                             null=True, blank=True)
    location = models.CharField(max_length=80, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name="created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True,
                                   blank=True, related_name="updated")
    updated_at = models.DateTimeField(auto_now=True)


class PortfolioFund(models.Model):
    """PortfolioFund model class"""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    security = models.ForeignKey(Security, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=20, validators=[RegexValidator(
        regex=r'^\d+(\%)?$', message='Only number and percentage value allowed.',
        code='Invalid number')])
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name="created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True,
                                   blank=True, related_name='updatde_by')
    updated_at = models.DateTimeField(auto_now=True)
