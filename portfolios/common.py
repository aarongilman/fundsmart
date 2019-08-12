# Common functions used in portfolios app
import collections
from datetime import date, timedelta

from .models import FundHolding, FXRate, FundDetail, Price


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


def get_line_graph_data(funds, common_date):
    data = []
    existing_fund_mkt_value = []

    fund_details = FundDetail.objects.all()
    fx_rate = FXRate.objects.all()
    price = Price.objects.all()
    prices = price.filter(id_value__in=funds.
                          values_list('security__id_value', flat=True))
    # get market value and % movement of existing funds
    for fund in funds:
        price_obj = prices.filter(id_value=fund.security.id_value,
                                  date__gte=common_date,
                                  date__lte=date.today()) \
            .order_by('date').distinct()
        fund_detail = fund_details.filter(
            fund_id=fund.security.id_value)
        mkt_value_dict = {}
        for price in price_obj:
            if '%' in str(fund.quantity):
                fx_rate_obj = fx_rate.filter(date=date.today(),
                                             currency=fund.security.currency)
                quantity = None
                if fund_detail:
                    quantity = get_quantity(fund.quantity, fund.security,
                                            fund_detail[0].aum,
                                            fx_rate_obj[0].rate,
                                            price.price)
            else:
                quantity = float(fund.quantity)
            if quantity:
                mkt_value_dict.update(
                    {str(price.date): float(quantity) * float(price.price)})
        existing_fund_mkt_value.append({fund.id: mkt_value_dict})
    per_movement_list = []
    for item in existing_fund_mkt_value:
        temp_dict = {}
        value_dict = list(item.values())[0]
        for i in range(0, len(value_dict)):
            key = list(value_dict.keys())[i]
            if i >= 1:
                value_list = list(value_dict.values())
                value = (value_list[i] - value_list[i - 1]) / value_list[
                    i - 1]
                temp_dict.update({key: value})
            else:
                temp_dict.update({key: 0})
        per_movement_list.append({list(item.keys())[0]: temp_dict})

    final_dict = {}
    for item in per_movement_list:
        value_dict = list(item.values())[0]
        temp_value = 100
        for i in range(0, len(value_dict)):
            key = list(value_dict.keys())[i]
            if i >= 1:
                value_list = list(value_dict.values())
                temp_value = temp_value * (1 + value_list[i])
            if final_dict.get(key):
                final_dict[key].append(temp_value)
            else:
                final_dict.update({key: [temp_value]})
    final_dict = collections.OrderedDict(sorted(final_dict.items()))
    for k, v in final_dict.items():
        final_dict[k] = round(sum(v) / len(v), 2)
    data.append(
        {'portfolio': "Existing", 'label': final_dict.keys(),
         'series': final_dict.values()})
    # market value of recommended funds
    recommended_funds = fund_details.filter(for_recommendation=True)[:4]
    total_market_value = {}
    for dict_item in existing_fund_mkt_value:
        value_dict = list(dict_item.values())[0]
        for key, value in value_dict.items():
            if total_market_value.get(key):
                total_market_value[key].append(value)
            else:
                total_market_value.update({key: [value]})
    for k, v in total_market_value.items():
        total_market_value[k] = round(sum(v), 4)
    recommended_fund_mkt_value = {}
    for fund in recommended_funds:
        price_obj = prices.filter(id_value=fund.fund_id,
                                  date__gte=common_date,
                                  date__lte=date.today()) \
            .order_by('date').distinct()
        for price in price_obj:
            ext_mkt_value = total_market_value.get(str(price.date))
            if ext_mkt_value:
                quantity = (ext_mkt_value / 4) / float(price.price)
                if recommended_fund_mkt_value.get(key):
                    recommended_fund_mkt_value[key].append(float(quantity) *
                                                           float(
                                                               price.price))
                else:
                    recommended_fund_mkt_value.update(
                        {str(price.date): [float(quantity) *
                                           float(price.price)]})
    for k, v in recommended_fund_mkt_value.items():
        recommended_fund_mkt_value[k] = round(sum(v) / len(v), 2)
    data.append(
        {'portfolio': "Recommended",
         'label': recommended_fund_mkt_value.keys(),
         'series': recommended_fund_mkt_value.values()})
    return data


def get_date_list(common_date, today_date):
    for n in range(int ((today_date - common_date).days)+1):
        yield common_date + timedelta(n)
