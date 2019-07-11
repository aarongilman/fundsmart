from .models import FundHolding


def get_quantity(quantity, security, aum, rate, price):
    """function to get quantity"""
    a = float(quantity.replace("%", "")) * 1000000
    if security.asset_type == 'Mutual Fund':
        b = float(aum * 1000000 * (1 / rate))
        aum = a / b
        holdings = FundHolding.objects.values_list('quantity', flat=True)\
            .filter(fund_id=security.id_value)
        quantity = aum * sum(holdings)
    else:
        quantity = a / float(price) if price else 0
    return quantity
