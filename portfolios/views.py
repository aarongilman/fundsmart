"""views.py in portfolios app"""
import xlrd
import logging
import itertools
import collections
from datetime import date

from django.db.models import F
from django.db.models import Count, Max, Min, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, status

from .common import get_quantity, get_line_graph_data, get_date_list
from .serializers import ImportPortfolioFundSerializer
from .models import Security, Portfolio, PortfolioFund, FundDetail, Price,\
    HoldingDetail, FundHolding, FXRate, PortfolioFundPrice

LOGGER = logging.getLogger('fundsmart')


class ImportPortfolioFund(APIView):
    """APIView to import Portfolio"""
    serializer_class = ImportPortfolioFundSerializer

    def post(self, request):
        """post method in ImportPortfolioFund"""
        try:
            data_file = request.FILES['data_file']
            wb = xlrd.open_workbook(file_contents=data_file.read())
            ws = wb.sheet_by_index(0)
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(
                created_by=request.user, id__in=portfolio_ids)
            security_isin = ws.col_values(0)
            securities = Security.objects.filter(isin__in=security_isin)
            objects = []
            user = request.user
            for i in range(1, ws.nrows):
                row = ws.row_values(i)
                security = securities.filter(isin=row[0]).first()
                if security:
                    for portfolio in portfolios:
                        objects.append(PortfolioFund(
                            security=security, quantity=row[1],
                            portfolio=portfolio, created_by=user))
            PortfolioFund.objects.bulk_create(objects, ignore_conflicts=True)
            return Response("Data imported successfully", status=204)
        except Exception as e:
            LOGGER.error(
                'ImportPortfolioFund:Error {} occurred while importing'.format(
                    e))
            return Response("failed to add into list",
                            status.HTTP_400_BAD_REQUEST)


class HistoricalPerformanceDifference(APIView):
    """API view to get historical Performance difference calculation"""
    permission_classes = []

    def post(self, request):
        base_currency = request.data.get('currency')
        fund_details = FundDetail.objects.all()
        fx_rate_objects = FXRate.objects.all()
        data = request.data.get('data')
        temp_list = []
        try:
            securities = Security.objects.filter(id__in=map(
                lambda d: d.get('securityId', 0), data),
                asset_type="Mutual FUnd")
            prices = Price.objects.all()
            existing_total_mkt_value = 0
            fx_rate_list = []
            for security in securities:
                quantity_data = [item for item in data if str(item.get('securityId'))
                                 == str(security.id)]
                fund_detail = fund_details.filter(fund_id=security.id_value)
                price_objs = prices.filter(id_value=security.id_value)
                if price_objs and fund_detail:
                    price_obj = price_objs.latest('date')
                    if not base_currency == security.currency:
                        fx_rate_obj = fx_rate_objects.filter(
                            base=base_currency, date=price_obj.date,
                            currency=security.currency)
                        if fx_rate_obj:
                            fx_rate = fx_rate_obj[0].rate
                        else:
                            fx_list = fx_rate_objects.filter(
                                base=base_currency, date__lt=price_obj.date,
                                currency=security.currency)
                            if fx_list:
                                fx_rate = fx_list.latest('date').rate
                                fx_rate_list.append(FXRate(
                                    base=base_currency, date=price_obj.date,
                                    currency=security.currency, rate=fx_rate))
                            else:
                                fx_rate = None
                    else:
                        fx_rate = 1
                    if fx_rate:
                        price = float(price_obj.price)
                        total_quantity = 0
                        for item in quantity_data:
                            quantity = item.get('portfolio')
                            if quantity:
                                if '%' in str(quantity):
                                    quantity = get_quantity(
                                        quantity, security, fund_detail[0].aum,
                                        fx_rate, price)
                                else:
                                    quantity = float(quantity)
                            total_quantity = total_quantity + quantity
                        existing_total_mkt_value = existing_total_mkt_value + (total_quantity * price)
                        temp_list.append({'market_value': total_quantity * price,
                                          'annual_expense': fund_detail[0].fund_exp_ratio,
                                          '1-year': fund_detail[0].return_1_year,
                                          '3-year': fund_detail[0].return_3_year,
                                          '5-year': fund_detail[0].return_5_year})
            existing_annual_expense = 0
            existing_return_1_year = 0
            existing_return_3_year = 0
            existing_return_5_year = 0
            for item in temp_list:
                if item.get('market_value'):
                    annual_expense = (item.get('market_value') /
                                      existing_total_mkt_value
                                      )*float(item.get('annual_expense'))
                    existing_annual_expense = existing_annual_expense + annual_expense
                    return_1_year = (item.get('market_value') /
                                     existing_total_mkt_value
                                     )*float(item.get('1-year'))
                    existing_return_1_year = existing_return_1_year + return_1_year
                    return_3_year = (item.get('market_value') /
                                     existing_total_mkt_value
                                     )*float(item.get('3-year'))
                    existing_return_3_year = existing_return_3_year + return_3_year
                    return_5_year = (item.get('market_value') /
                                     existing_total_mkt_value
                                     )*float(item.get('5-year'))
                    existing_return_5_year = existing_return_5_year + return_5_year
            recommended_funds = fund_details.filter(for_recommendation=True)[:4]
            rec_annual_expense = sum([float(exp) for exp in recommended_funds.
                                     values_list('fund_exp_ratio', flat=True)])
            rec_1_year_return = sum([float(exp) for exp in recommended_funds.
                                    values_list('return_1_year', flat=True)])
            rec_3_year_return = sum([float(exp) for exp in recommended_funds.
                                    values_list('return_3_year', flat=True)])
            rec_5_year_return = sum([float(exp) for exp in recommended_funds.
                                    values_list('return_5_year', flat=True)])
            perc_improvement_num = existing_annual_expense + existing_return_1_year
            dollar_improvement_num = perc_improvement_num * existing_total_mkt_value
            if fx_rate_list:
                FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
            data = [
                {"perc_improvement_num": perc_improvement_num,
                 "dollar_improvement_num": dollar_improvement_num,
                 "existing": {'annual_expense': existing_annual_expense,
                              '1-year': existing_return_1_year,
                              '3-year': existing_return_3_year,
                              '5-year': existing_return_5_year},
                 "recommended": {'annual_expense': rec_annual_expense,
                                 '1-year': rec_1_year_return,
                                 '3-year': rec_3_year_return,
                                 '5-year': rec_5_year_return},
                 "difference": {
                     'annual_expense': rec_annual_expense -
                     existing_annual_expense,
                     '1-year': rec_1_year_return-existing_return_1_year,
                     '3-year': rec_3_year_return-existing_return_3_year,
                     '5-year': rec_5_year_return-existing_return_5_year}}]
        except Exception as e:
            data = []
            LOGGER.error("Error {} occurred: historical performance".format(e))
        return Response(data, status=200)


class DashboardLinePlotApi(APIView):
    """API view to compare historical market values of three portfolios"""
    permission_classes = []

    def post(self, request):
        final_data = []
        try:
            base_currency = request.data.get('currency')
            data = request.data.get('data')
            securities = Security.objects.filter(id__in=map(
                lambda d: d.get('securityId', 0), data))
            price = Price.objects.filter(
                id_value__in=securities.values_list('id_value'))
            fund_details = FundDetail.objects.all()
            fx_rate_objects = FXRate.objects.all()
            if price:
                date_list = price.values_list('id_value').annotate(
                    count=Min('date')) \
                    .distinct()
                common_date = max([x[1] for x in date_list])
            prices = Price.objects.all()
            port_mkt_values = {}
            comp1_mkt_values = {}
            comp2_mkt_values = {}
            fx_rate_list = []
            date_range = list(get_date_list(common_date, date.today()))
            price_obj_list = []
            for security in securities:
                quantity_data = [item for item in data if str(item.get('securityId'))
                                 == str(security.id)]
                fund_detail = fund_details.filter(fund_id=security.id_value)
                for temp_date in date_range:
                    try:
                        price = prices.filter(id_value=security.id_value,
                                              date=temp_date).latest('date')
                        price_value = float(price.price)
                    except:
                        price_value = None
                        price_temp_obj = prices.filter(id_value=security.id_value,
                                                    date__lte=temp_date)
                        if price_temp_obj:
                            price_value = float(price_temp_obj.latest('date').price)
                            price_obj_list.append(Price(
                                id_value=security.id_value, date=temp_date,
                                price=price_value))
                    price_date = str(temp_date)
                    if not base_currency == security.currency:
                        fx_rate_obj = fx_rate_objects.filter(
                            base=base_currency, date=price_date,
                            currency=security.currency)
                        if fx_rate_obj:
                            fx_rate = fx_rate_obj[0].rate
                        else:
                            fx_list = fx_rate_objects.filter(
                                base=base_currency, date__lt=price_date,
                                currency=security.currency)
                            if fx_list:
                                fx_rate = fx_list.latest('date').rate
                                fx_rate_list.append(FXRate(
                                    base=base_currency, date=price_date,
                                    currency=security.currency, rate=fx_rate))
                            else:
                                fx_rate = None
                    else:
                        fx_rate = 1
                    if fx_rate and price_value:
                        for item in quantity_data:
                            port_quantity = item.get('portfolio')
                            if port_quantity:
                                if '%' in str(port_quantity):
                                    quantity = get_quantity(port_quantity, security,
                                                            fund_detail[0].aum,
                                                            fx_rate, price_value)
                                else:
                                    quantity = float(port_quantity)
                                if port_mkt_values.get(price_date):
                                    port_mkt_values.get(price_date).append(
                                        quantity * price_value)
                                else:
                                    port_mkt_values.update(
                                        {price_date: [quantity * price_value]})
                            comp1_quantity = item.get('COMPARISON1')
                            if comp1_quantity:
                                if '%' in str(comp1_quantity):
                                    quantity = get_quantity(comp1_quantity, security,
                                                            fund_detail[0].aum,
                                                            fx_rate, price_value)
                                else:
                                    quantity = float(comp1_quantity)
                                if comp1_mkt_values.get(price_date):
                                    comp1_mkt_values.get(price_date).append(quantity*price_value)
                                else:
                                    comp1_mkt_values.update({price_date: [quantity*price_value]})
                            comp2_quantity = item.get('COMPARISON2')
                            if comp2_quantity:
                                if '%' in str(comp2_quantity):
                                    quantity = get_quantity(comp2_quantity, security,
                                                            fund_detail[0].aum,
                                                            fx_rate, price_value)
                                else:
                                    quantity = float(comp2_quantity)
                                if comp2_mkt_values.get(price_date):
                                    comp2_mkt_values.get(price_date).append(quantity*price_value)
                                else:
                                    comp2_mkt_values.update({price_date: [quantity*price_value]})
            port_mkt_values = collections.OrderedDict(sorted(port_mkt_values.items()))
            comp1_mkt_values = collections.OrderedDict(sorted(comp1_mkt_values.items()))
            comp2_mkt_values = collections.OrderedDict(sorted(comp2_mkt_values.items()))
            for k, v in port_mkt_values.items():
                port_mkt_values[k] = sum(v) / len(v)
            for k, v in comp1_mkt_values.items():
                comp1_mkt_values[k] = sum(v) / len(v)
            for k, v in comp2_mkt_values.items():
                comp2_mkt_values[k] = sum(v) / len(v)
            if price_obj_list:
                Price.objects.bulk_create(price_obj_list, ignore_conflicts=True)
            if fx_rate_list:
                FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
            final_data.append(
                {'portfolio': "Your Portfolio", 'label': port_mkt_values.keys(),
                 'series': port_mkt_values.values()})
            final_data.append(
                {'portfolio': "Comparison1", 'label': comp1_mkt_values.keys(),
                 'series': comp1_mkt_values.values()})
            final_data.append(
                {'portfolio': "Comparison2", 'label': comp2_mkt_values.keys(),
                 'series': comp2_mkt_values.values()})
        except Exception as e:
            LOGGER.error("Error {} occurred: dashboard line graph".format(e))
        return Response(final_data, status=200)


def get_holding_list(request, data, base_currency):
    fx_rate_objects = FXRate.objects.all()
    fund_holdings = FundHolding.objects.all()
    fund_details = FundDetail.objects.all()
    prices = Price.objects.all()
    securities = Security.objects.filter(id__in=map(
        lambda d: d.get('securityId', 0), data))
    holding_list = []
    fx_rate_list = []
    for security in securities:
        quantity_data = [item for item in data if str(item.get('securityId'))
                         == str(security.id)]
        price_obj = prices.filter(id_value=security.id_value)
        fund_detail = fund_details.filter(fund_id=security.id_value)
        if price_obj and fund_detail:
            price = price_obj.latest('date')
            if not base_currency == security.currency:
                fx_rate_obj = fx_rate_objects.filter(
                    base=base_currency, date=price.date,
                    currency=security.currency)
                if fx_rate_obj:
                    fx_rate = fx_rate_obj[0].rate
                else:
                    fx_list = fx_rate_objects.filter(
                        base=base_currency, date__lt=price.date,
                        currency=security.currency)
                    if fx_list:
                        fx_rate = fx_list.latest('date').rate
                        fx_rate_list.append(FXRate(
                            base=base_currency, date=price.date,
                            currency=security.currency, rate=fx_rate))
                    else:
                        fx_rate = None
            else:
                fx_rate = 1
            if fx_rate:
                for item in quantity_data:
                    quantity = str(item.get('portfolio'))
                    if '%' in quantity:
                        a = float(quantity.replace("%", "")) * 1000000
                        if security.asset_type == 'Mutual Fund':
                            b = float(fund_detail[0].aum * 1000000 *
                                      (1 / fx_rate))
                            aum = a / b
                            holdings = list(fund_holdings.values_list('id_value')
                                            .filter(fund_id=security.id_value)
                                            .annotate(quantity=F('quantity')))
                            for holding in holdings:
                                holding = list(holding)
                                holding[1] = aum * holding[1]
                                holding_list.append(holding)
                        else:
                            quantity = a / float(price_obj[0].price)
                            holding_list.append([security.id_value, quantity])
                    else:
                        if security.asset_type == 'Mutual Fund':
                            holdings = list(fund_holdings.values_list('id_value')
                                            .filter(fund_id=security.id_value)
                                            .annotate(quantity=F('quantity')))
                            for holding in holdings:
                                holding = list(holding)
                                holding[1] = quantity
                                holding_list.append(holding)
                        else:
                            holding_list.append([security.id_value, quantity])
    if fx_rate_list:
        FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
    return holding_list


class DashboardDoughnutChart(APIView):
    """APIView to display analytics on user’s holding in different Industries"""

    permission_classes = []

    def post(self, request):
        base_currency = request.data.get('currency')
        return_data = []
        data = request.data.get('data')
        try:
            prices = Price.objects.all()
            holding_list = get_holding_list(request, data, base_currency)
            securities = Security.objects.filter(id_value__in=[item[0] for item in holding_list])
            return_dict = {}
            for item in holding_list:
                if item[0]:
                    security_obj = securities.filter(id_value=item[0])
                    price_obj = prices.filter(id_value=item[0])
                    if security_obj and price_obj:
                        industry = security_obj[0].industry
                        market_value = float(item[1]) * float(price_obj.latest('date').price)
                        if return_dict.get(industry):
                            market_value = return_dict.get(industry) + market_value
                        return_dict.update({industry: market_value})
            if return_dict.get(None):
                return_dict['Other'] = return_dict.pop(None)
            return Response([return_dict], status=200)
        except Exception as e:
            LOGGER.error("Error {} occurred:dashboard doughnut chart".format(e))
            return Response(return_data, status=200)


class DashboardPieChart(APIView):
    """APIView to display  holdings’ asset classes in user’s portfolio"""

    permission_classes = []

    def post(self, request):
        base_currency = request.data.get('currency')
        return_data = []
        data = request.data.get('data')
        try:
            prices = Price.objects.all()
            holding_list = get_holding_list(request, data, base_currency)
            securities = Security.objects.filter(id_value__in=[item[0] for item in holding_list])
            return_dict = {}
            for item in holding_list:
                if item[0]:
                    security_obj = securities.filter(id_value=item[0])
                    price_obj = prices.filter(id_value=item[0])
                    if security_obj and price_obj:
                        asset_type = security_obj[0].asset_type
                        market_value = float(item[1]) * float(price_obj.latest('price').price)
                        if return_dict.get(asset_type):
                            market_value = return_dict.get(asset_type) + market_value
                        return_dict.update({asset_type: market_value})
            return Response([return_dict], status=200)
        except Exception as e:
            LOGGER.error("Error {} occurred:dashboard doughnut chart".format(e))
            return Response(return_data, status=200)


def get_holding_detail_data(request, fund):
    basic_price = None
    current_price = None
    price_date = None
    fund_detail = FundDetail.objects.filter(fund_id=fund.security.id_value)
    fx_rate_objects = FXRate.objects.filter(currency=fund.security.currency)
    price = Price.objects.filter(id_value=fund.security.id_value)
    try:
        basic_price = PortfolioFundPrice \
            .objects.get(fund=fund, created_at=fund.created_at.date()).price
    except Exception as e:
        basic_price_obj = price. \
            filter(id_value=fund.security.id_value,
                   date=fund.created_at.date())
        if basic_price_obj:
            basic_price = basic_price_obj[0].price
    try:
        current_price_obj = PortfolioFundPrice.objects.filter(fund=fund)\
            .latest('created_at')
        current_price = current_price_obj.price
        price_date = current_price_obj.created_at
    except Exception as e:
        current_price_obj = price. \
            filter(id_value=fund.security.id_value)
        if current_price_obj:
            current_price = current_price_obj.latest('date').price
            price_date = current_price_obj.latest('date').date
    market_value = None
    basis = None
    new_fx_obj = None
    if current_price:
        base_currency = request.GET.get('currency')
        if not base_currency == fund.security.currency:
            fx_rate_obj = fx_rate_objects.filter(base=base_currency, date=price_date)
            if fx_rate_obj:
                fx_rate = fx_rate_obj[0].rate
                new_fx_obj = None
            else:
                fx_list = fx_rate_objects.filter(
                    base=base_currency, date__lt=price_date,
                    currency=fund.security.currency)
                if fx_list:
                    fx_rate = fx_list.latest('date').rate
                    new_fx_obj = FXRate(base=base_currency, date=price_date,
                                        currency=fund.security.currency, rate=fx_rate)
                else:
                    new_fx_obj = None
                    fx_rate = None
        else:
            new_fx_obj = None
            fx_rate = 1
    if '%' in fund.quantity:
        if current_price and fund_detail and fx_rate:
            quantity = get_quantity(fund.quantity, fund.security,
                                    fund_detail[0].aum, fx_rate, current_price)
        else:
            quantity = None
    else:
        quantity = fund.quantity
    if quantity:
        market_value = float(quantity) * float(current_price) if current_price else None
        basis = float(quantity) * float(basic_price) if basic_price else None
    currency = fund.security.currency
    try:
        holding_detail = HoldingDetail.objects.get(fund=fund)
    except Exception as e:
        holding_detail = None
    if holding_detail and holding_detail.currency:
        currency = holding_detail.currency

    country = fund.security.country
    if holding_detail and holding_detail.country:
        country = holding_detail.country

    industry = fund.security.industry
    if holding_detail and holding_detail.industry:
        industry = holding_detail.industry

    rating = fund.security.rating
    if holding_detail and holding_detail.rating:
        rating = holding_detail.rating
    return {'fund_id': fund.id, 'portfolio': fund.portfolio.name,
            'security': fund.security.name, 'isin': fund.security.isin,
            'quantity': fund.quantity, 'ticker': fund.security.ticker,
            'basic_price': basic_price, 'basis': basis, 'new_fx_obj': new_fx_obj,
            'current_price': current_price, 'market_value': market_value,
            'asset_class': fund.security.asset_type, 'currency': currency,
            'country': country,  'industry': industry, 'rating': rating}


class HoldingDetailAPIView(APIView):
    """APIView to import Portfolio"""

    def get(self, request):
        """post method in HoldingDetailAPIView"""
        data = []
        fx_rate_list = []
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
        else:
            portfolios = Portfolio.objects.filter(created_by=request.user)
        funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
        for fund in funds:
            temp_dict = get_holding_detail_data(request, fund)
            new_fx_obj = temp_dict.pop('new_fx_obj', None)
            if new_fx_obj:
                fx_rate_list.append(new_fx_obj)
            data.append(temp_dict)
        if fx_rate_list:
            FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
        return Response(data, status=200)

    def post(self, request):
        """post method in HoldingDetailAPIView"""
        try:
            holding_detail, created = HoldingDetail.objects.get_or_create(
                fund_id=int(request.data.get('id')))
            if request.data.get('currency'):
                holding_detail.currency = request.data.get('currency')
            if request.data.get('country'):
                holding_detail.country = request.data.get('country')
            if request.data.get('industry'):
                holding_detail.industry = request.data.get('industry')
            if request.data.get('rating'):
                holding_detail.rating = request.data.get('rating')
            holding_detail.save()
            fund = PortfolioFund.objects.get(id=request.data.get('id'))
            if request.data.get('basic_price'):
                fund_basic_price, created = PortfolioFundPrice.objects.get_or_create\
                    (fund_id=fund.id, created_by=request.user,
                     created_at=fund.created_at.date())
                fund_basic_price.price = request.data.get('basic_price')
                fund_basic_price.save()
            if request.data.get('current_price'):
                fund_current_price, created = PortfolioFundPrice.objects.get_or_create(
                    fund_id=int(request.data.get('id')),
                    created_by=request.user, created_at=date.today())
                fund_current_price.price = request.data.get('current_price')
                fund_current_price.save()
            fund = PortfolioFund.objects.get(id=request.data.get('id'))
            data = get_holding_detail_data(request, fund)
            return Response(data, status=200)
        except Exception as e:
            LOGGER.error("Error {} occurred while saving holding details!".
                         format(e))
            return Response('Failed to save data!', status=204)


def get_summary_data(request, type):
    data = []
    temp_dict = {}
    key = None
    fx_rate_list = []
    if request.GET.get('portfolio_ids'):
        portfolio_ids = request.GET.get('portfolio_ids').split(",")
        portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                              created_by=request.user)
    else:
        portfolios = Portfolio.objects.filter(created_by=request.user)
    funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
    fund_details = FundDetail.objects.all()
    fx_rate_objects = FXRate.objects.all()
    price = Price.objects.all()
    base_currency = request.GET.get('currency')
    for fund in funds:
        price_value = None
        price_date = None
        try:
            price_obj = PortfolioFundPrice \
                .objects.filter(fund=fund).latest('created_at')
            price_value = price_obj.price
            price_date = price_obj.created_at
        except Exception as e:
            price_obj = price.filter(id_value=fund.security.id_value)
            if price_obj:
                price_obj = price_obj.latest('date')
                price_value = price_obj.price
                price_date = price_obj.date
        fund_detail = fund_details.filter(fund_id=fund.security.id_value)
        if price_obj and not base_currency == fund.security.currency:
            fx_rate_obj = fx_rate_objects.filter(base=base_currency,
                             date=price_date, currency=fund.security.currency)
            if fx_rate_obj:
                fx_rate = fx_rate_obj[0].rate
            else:
                fx_list = fx_rate_objects.filter(
                    base=base_currency, date__lt=price_date,
                    currency=fund.security.currency)
                if fx_list:
                    fx_rate = fx_list.latest('date').rate
                    fx_rate_list.append(FXRate(
                        base=base_currency, date=price_date,
                        currency=fund.security.currency, rate=fx_rate))
                else:
                    fx_rate = None
        else:
            fx_rate = 1
        if price_value and fund_detail and fx_rate:
            if '%' in str(fund.quantity):
                quantity = get_quantity(quantity, fund.security,
                                        fund_detail[0].aum, fx_rate, price_value)
            else:
                quantity = float(fund.quantity)
            market_value = float(price_value) * quantity
            if type == 'asset_type':
                key = fund.security.asset_type if fund.security.asset_type else 'Empty'
            if type == 'country':
                key = fund.security.country if fund.security.country else 'Empty'
            if type == 'industry':
                key = fund.security.industry if fund.security.industry else 'Empty'
            if key:
                if temp_dict.get(key):
                    temp_dict.get(key).append(market_value)
                else:
                    temp_dict.update({key: [market_value]})
    total = 0
    if temp_dict:
        for key, value in temp_dict.items():
            total += sum(value)
            data.append({key: sum(value)})
        data.append({'Total': total})
    if fx_rate_list:
        FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
    return data


class HoldingSummaryByHoldingType(APIView):
    """Holding summary APIView to display market value"""
    def get(self, request):
        data = []
        temp_dict = {}
        fx_rate_list = []
        base_currency = request.GET.get('currency')
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
        else:
            portfolios = Portfolio.objects.filter(created_by=request.user)
        funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
        fund_details = FundDetail.objects.all()
        price = Price.objects.all()
        fx_rate_objects = FXRate.objects.all()
        for fund in funds:
            price_value = None
            try:
                price_obj = PortfolioFundPrice \
                    .objects.filter(fund=fund).latest('created_at')
                price_value = price_obj.price
                price_date = price_obj.created_at
            except Exception as e:
                price_obj = price.filter(
                    id_value=fund.security.id_value)
                if price_obj:
                    price_value = price_obj.latest('date').price
                    price_date= price_obj.latest('date').date
            fund_detail = fund_details.filter(fund_id=fund.security.id_value)
            if not base_currency == fund.security.currency:
                fx_rate_obj = fx_rate_objects.filter(base=base_currency,
                                                     date=price_date,
                                                     currency=fund.security.currency)
                if fx_rate_obj:
                    fx_rate = fx_rate_obj[0].rate
                else:
                    fx_list = fx_rate_objects.filter(
                        base=base_currency, date__lt=price_date,
                        currency=fund.security.currency)
                    if fx_list:
                        fx_rate = fx_list.latest('date').rate
                        fx_rate_list.append(FXRate(
                            base=base_currency, date=price_date,
                            currency=fund.security.currency, rate=fx_rate))
                    else:
                        fx_rate = None
            else:
                fx_rate = 1
            if price_value and fund_detail and fx_rate:
                if '%' in str(fund.quantity):
                    quantity = get_quantity(quantity, fund.security,
                                            fund_detail[0].aum,
                                            fx_rate_obj[0].rate, price_value)
                else:
                    quantity = float(fund.quantity)
                market_value = float(price_value)*quantity
                if fund.security.name:
                    key = fund.security.name if fund.security.asset_type == \
                                                'Mutual Fund' else 'Other'
                    if temp_dict.get(key):
                        temp_dict.get(key).append(market_value)
                    else:
                        temp_dict.update({key: [market_value]})
        total = 0
        if temp_dict:
            for key, value in temp_dict.items():
                total += sum(value)
                data.append({key: sum(value)})
            data.append({'Total': total})
        if fx_rate_list:
            FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
        return Response(data, status=200)


class HoldingSummaryByAssetClass(APIView):
    """Holding summary APIView to display market value"""
    def get(self, request):
        data = get_summary_data(request, 'asset_type')
        return Response(data, status=200)


class HoldingSummaryByIndustry(APIView):
    """Holding summary APIView to display market value"""
    def get(self, request):
        data = get_summary_data(request, 'industry')
        return Response(data, status=200)


class HoldingSummaryByCountry(APIView):
    """Holding summary APIView to display market value"""
    def get(self, request):
        data = get_summary_data(request, 'country')
        return Response(data, status=200)


def get_price(isin, portfolio, date):
    try:
        price_obj = PortfolioFundPrice.objects. \
            filter(fund__security__id_value=isin, fund__portfolio=portfolio,
                   created_at=date)
        if not price_obj:
            raise Exception
    except Exception as e:
        price_obj = Price.objects.filter(id_value=isin, date=date)
    return price_obj


def get_historical_performance(request):
    data = []
    if request.GET.get('portfolio_ids'):
        portfolio_ids = request.GET.get('portfolio_ids').split(',')
        portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                              created_by=request.user)
    else:
        portfolios = Portfolio.objects.filter(created_by=request.user)
    portfolio_funds = PortfolioFund.objects.filter(portfolio__in=
                                                   portfolios)
    fund_details = FundDetail.objects.all()
    total_annual_expense = 0
    total_1_year = []
    total_3_year = []
    total_5_year = []
    for portfolio in portfolios:
        isin_list = portfolio_funds.filter(
            portfolio=portfolio, created_by=request.user) \
            .values_list('security__id_value', flat=True)
        return_1_yr = []
        return_3_yr = []
        return_5_yr = []
        for isin in isin_list:
            end_price_1_year = get_price(isin, portfolio, str(
                date(date.today().year - 1, 12, 31)))
            beg_price_1_year = get_price(isin, portfolio, str(
                date(date.today().year - 2, 12, 31)))
            end_price_3_year = get_price(isin, portfolio, str(
                date(date.today().year - 3, 12, 31)))
            beg_price_3_year = get_price(isin, portfolio, str(
                date(date.today().year - 4, 12, 31)))
            end_price_5_year = get_price(isin, portfolio, str(
                date(date.today().year - 5, 12, 31)))
            beg_price_5_year = get_price(isin, portfolio, str(
                date(date.today().year - 6, 12, 31)))
            if end_price_1_year and beg_price_1_year:
                return_1_yr.append((end_price_1_year[0].price -
                                    beg_price_1_year[0].price) /
                                   beg_price_1_year[0].price)
            if end_price_3_year and beg_price_3_year:
                return_3_yr.append((end_price_3_year[0].price -
                                    beg_price_3_year[0].price) /
                                   beg_price_3_year[0].price)
            if end_price_5_year and beg_price_5_year:
                return_5_yr.append((end_price_5_year[0].price -
                                    beg_price_5_year[0].price) /
                                   beg_price_5_year[0].price)
        portfolio_fund_details = fund_details.filter(fund_id__in=isin_list)
        portfolio_annual_expense = [float(x) for x in
                                    portfolio_fund_details.
                                        values_list('fund_exp_ratio',
                                                    flat=True)]
        portfolio_avg_annual_expense = sum(portfolio_annual_expense)

        # 1 year, 3 year and 5 year return for existing funds
        return_1_year = sum(return_1_yr) if return_1_yr else None
        return_3_year = sum(return_3_yr) if return_3_yr else None
        return_5_year = sum(return_5_yr) if return_5_yr else None
        data.append({portfolio.name:
                         {'annual_expense': portfolio_avg_annual_expense,
                          '1-year': return_1_year, '3-year': return_3_year,
                          '5-year': return_5_year}})
        total_annual_expense += portfolio_avg_annual_expense
        total_1_year.append(return_1_year)
        total_3_year.append(return_3_year)
        total_5_year.append(return_5_year)
    data.append({'Total': {'annual_expense': total_annual_expense,
                           '1-year': sum(
                               list(filter(None, total_1_year))),
                           '3-year': sum(
                               list(filter(None, total_3_year))),
                           '5-year': sum(
                               list(filter(None, total_5_year)))}})
    return data


class HoldingSummaryHistoricalPerformanceDifference(APIView):
    """APIView to get historical Performance difference-holding summary page"""
    def get(self, request):
        data = get_historical_performance(request)
        return Response(data, status=200)


class HoldingSummaryLineGraph(APIView):
    def get(self, request):
        data = []
        fund_details = FundDetail.objects.all()
        fx_rate_objects = FXRate.objects.all()
        base_currency = request.GET.get('currency')
        fx_rate_list = []
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
            funds = PortfolioFund.objects.filter(
                portfolio__in=portfolios, security__asset_type='Mutual Fund',
                created_by=request.user)
            # price = Price.objects.all()
            try:
                port_fund_price = PortfolioFundPrice.objects.all()
                prices = Price.objects.filter(id_value__in=funds.
                                              values_list('security__id_value',
                                                          flat=True))
                if prices:
                    date_list = prices.values_list('id_value').annotate(
                        count=Min('date')) \
                        .distinct()
                    common_date = max([x[1] for x in date_list])
                for portfolio in portfolios:
                    portfolio_funds = funds.filter(portfolio=portfolio)
                    port_mkt_values = {}
                    for fund in portfolio_funds:
                        fund_detail = fund_details.filter(fund_id=fund.security.id_value)
                        price_obj = prices.filter(id_value=fund.security.id_value,
                                                  date__gte=common_date,
                                                  date__lte=date.today())\
                            .order_by('date').distinct()
                        for price in price_obj:
                            price_date = str(price.date)
                            try:
                                fund_price = port_fund_price.\
                                    filter(fund=fund, created_at=price_date)[0].price
                                price_value = float(fund_price.price)
                            except Exception as e:
                                price_value = float(price.price)
                            if not base_currency == fund.security.currency:
                                try:
                                    fx_rate = fx_rate_objects.filter(
                                        base=base_currency, date=price.date,
                                        currency=fund.security.currency)[0].rate
                                except Exception:
                                    fx_list = fx_rate_objects.filter(
                                        base=base_currency, date__lt=price.date,
                                        currency=fund.security.currency)
                                    if fx_list:
                                        fx_rate = fx_list.latest('date').rate
                                        fx_rate_list.append(FXRate(
                                            base=base_currency, date=price.date,
                                            currency=fund.security.currency,
                                            rate=fx_rate))
                                    else:
                                        fx_rate = None
                            else:
                                fx_rate = 1
                            if fx_rate:
                                if '%' in str(fund.quantity):
                                    quantity = get_quantity(fund.quantity,
                                                            fund.security,
                                                            fund_detail[0].aum,
                                                            fx_rate, price_value)
                                else:
                                    quantity = float(fund.quantity)
                                if port_mkt_values.get(price_date):
                                    port_mkt_values.get(price_date).append(
                                        quantity * price_value)
                                else:
                                    port_mkt_values.update({price_date: [quantity * price_value]})
                    port_mkt_values = collections.OrderedDict(sorted(port_mkt_values.items()))
                    for k, v in port_mkt_values.items():
                        port_mkt_values[k] = round(sum(v) / len(v), 3)
                    data.append({'portfolio': portfolio.name,
                                 'label': port_mkt_values.keys(),
                                 'series': port_mkt_values.values()})
                if fx_rate_list:
                    FXRate.objects.bulk_create(fx_rate_list,
                                               ignore_conflicts=True)
            except Exception as e:
                LOGGER.error("Error {} occurred while getting holding summary\
                line graph data!".format(e))
        return Response(data, status=200)


class FundRecommendationHistoricalPerformanceDiff(APIView):
    """APIView to display historical performance difference"""
    def get(self, request):
        data = []
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(',')
            existing_funds = PortfolioFund.objects.filter(
                portfolio__in=portfolio_ids, security__asset_type='Mutual Fund',
                created_by=request.user)
            base_currency = request.GET.get('currency')
            if existing_funds:
                existing_fund_ids = existing_funds.values_list('security__id_value',
                                                               flat=True)
                fund_details = FundDetail.objects.all()
                fx_rate_objects = FXRate.objects.all()
                recommended_funds = fund_details[:4]
                recommended_fund_ids = recommended_funds.values_list('fund_id',
                                                                     flat=True)
                price_objects = Price.objects.filter(
                    id_value__in=list(existing_fund_ids) +
                                 list(recommended_fund_ids))
                existing_funds_market_values = []
                temp_list = []
                fx_rate_list = []
                for fund in existing_funds:
                    fund_detail = fund_details.filter(fund_id=fund.security.id_value)

                    price_obj = price_objects.filter(id_value=
                                                     fund.security.id_value)
                    if price_obj:
                        price_value = price_obj.latest('date').price
                        price_date = price_obj.latest('date').date
                        if not base_currency == fund.security.currency:
                            fx_rate_obj = fx_rate_objects.filter(
                                base=base_currency, date=price_date,
                                currency=fund.security.currency)
                            if fx_rate_obj:
                                fx_rate = fx_rate_obj[0].rate
                            else:
                                fx_list = fx_rate_objects.filter(
                                    base=base_currency, date__lt=price_date,
                                    currency=fund.security.currency)
                                if fx_list:
                                    fx_rate = fx_list.latest('date').rate
                                    fx_rate_list.append(FXRate(
                                        base=base_currency, date=price_date,
                                        currency=fund.security.currency,
                                        rate=fx_rate))
                                else:
                                    fx_rate = None
                        else:
                            fx_rate = 1
                    else:
                        price_value = None
                        fx_rate = None
                    if price_value and fund_detail and fx_rate:
                        if '%' in str(fund.quantity):
                            quantity = get_quantity(fund.quantity, fund.security,
                                                    fund_detail[0].aum,
                                                    fx_rate, price_value)
                        else:
                            quantity = float(fund.quantity)
                        market_value = float(quantity) * float(price_value)
                    else:
                        market_value = None
                    temp_list.append({'market_value': market_value,
                                      'annual_expense': fund_detail[
                                          0].fund_exp_ratio,
                                      '1-year': fund_detail[0].return_1_year,
                                      '3-year': fund_detail[0].return_3_year,
                                      '5-year': fund_detail[0].return_5_year})
                    existing_funds_market_values.append(market_value)
                if fx_rate_list:
                    FXRate.objects.bulk_create(fx_rate_list,
                                               ignore_conflicts=True)
                total_mkt_value = sum(filter(None, existing_funds_market_values))
                existing_annual_expense = 0
                existing_return_1_year = 0
                existing_return_3_year = 0
                existing_return_5_year = 0
                for item in temp_list:
                    if item.get('market_value'):
                        annual_expense = (item.get('market_value') /
                                          total_mkt_value
                                          )*float(item.get('annual_expense'))
                        existing_annual_expense = existing_annual_expense + annual_expense
                        return_1_year = (item.get('market_value') /
                                         total_mkt_value
                                         )*float(item.get('1-year'))
                        existing_return_1_year = existing_return_1_year + return_1_year
                        return_3_year = (item.get('market_value') /
                                         total_mkt_value
                                         )*float(item.get('3-year'))
                        existing_return_3_year = existing_return_3_year + return_3_year
                        return_5_year = (item.get('market_value') /
                                         total_mkt_value
                                         )*float(item.get('5-year'))
                        existing_return_5_year = existing_return_5_year + return_5_year
                recommended_annual_exp = [float(x) for x in recommended_funds.
                                          values_list('fund_exp_ratio', flat=True)]
                recommended_avg_annual_exp = \
                    sum(recommended_annual_exp) / len(recommended_annual_exp)
                recommended_1_year = [float(x) for x in recommended_funds.
                                      values_list('return_1_year', flat=True)]
                recommended_avg_1_year = sum(recommended_1_year) / len(recommended_1_year)

                recommended_3_year = [float(x) for x in recommended_funds.
                                      values_list('return_3_year', flat=True)]
                recommended_avg_3_year = sum(recommended_3_year) / len(recommended_3_year)

                recommended_5_year = [float(x) for x in recommended_funds.
                                      values_list('return_5_year', flat=True)]
                recommended_avg_5_year = sum(recommended_5_year) / len(recommended_5_year)
                data.append(
                    {"existing":
                         {'annual_expense': round(existing_annual_expense, 2),
                          '1-year': round(existing_return_1_year, 2),
                          '3-year': round(existing_return_3_year, 2),
                          '5-year': round(existing_return_5_year, 2)},
                     "recommended":
                         {'annual_expense': round(recommended_avg_annual_exp, 2),
                          '1-year': round(recommended_avg_1_year, 2),
                          '3-year': round(recommended_avg_3_year, 2),
                          '5-year': round(recommended_avg_5_year, 2)},
                     "difference":
                         {'annual_expense': round(existing_annual_expense, 2) -
                                            round(recommended_avg_annual_exp, 2),
                          '1-year':
                              round(existing_return_1_year - recommended_avg_1_year, 2),
                          '3-year':
                              round(existing_return_3_year - recommended_avg_3_year, 2),
                          '5-year':
                              round(existing_return_5_year - recommended_avg_5_year, 2)
                         }
                    })
        return Response(data, status=200)


class BarPlotFundRecommendation(APIView):
    """APIView to display bar plot graph"""
    def get(self, request):
        data = []
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(',')
            fx_rate_objects = FXRate.objects.all()
            existing_funds = PortfolioFund.objects.filter(
                portfolio__in=portfolio_ids, security__asset_type='Mutual Fund',
                created_by=request.user)
            fund_holdings = FundHolding.objects.filter(
                fund_id__in=existing_funds.values_list('security__id_value',
                                                       flat=True))
            base_currency = request.GET.get("currency")
            prices = Price.objects.all()
            fund_details = FundDetail.objects.all()
            securities = Security.objects.all()
            existing_dict = {}
            for fund in existing_funds:
                fx_rate_obj = fx_rate_objects.filter(
                    base=base_currency, currency=fund.security.currency)
                fund_detail = fund_details.filter(fund_id=fund.security.id_value)
                if fx_rate_obj and fund_detail:
                    quantity = fund.quantity
                    if '%' in quantity:
                        a = float(quantity.replace("%", "")) * 1000000
                        b = float(fund_detail[0].aum * 1000000 *
                                  (1 / fx_rate_obj.latest('date').rate))
                        aum = a / b
                        holdings = list(
                            fund_holdings.values_list('id_value')
                            .filter(fund_id=fund.security.id_value)
                            .annotate(quantity=F('quantity')))
                        for holding in holdings:
                            holding[1] = aum * holding[1]
                            if holding[0]:
                                security_obj = securities.filter(id_value=holding[0])
                                price_obj = prices.filter(id_value=holding[0])
                                if security_obj and price_obj:
                                    asset_type = security_obj[0].asset_type
                                    market_value = holding[1] * float(
                                        price_obj.latest('date').price)
                                    if existing_dict.get(asset_type):
                                        market_value = existing_dict.get(
                                            asset_type) + market_value
                                    existing_dict.update(
                                        {asset_type: market_value})
                    else:
                        holdings = list(
                            fund_holdings.values_list('id_value')
                            .filter(fund_id=fund.security.id_value)
                            .annotate(quantity=F('quantity')))
                        for holding in holdings:
                            if holding[0]:
                                security_obj = securities.filter(
                                    id_value=holding[0])
                                price_obj = prices.filter(id_value=holding[0])
                                if security_obj and price_obj:
                                    asset_type = security_obj[0].asset_type
                                    market_value = float(quantity) * float(
                                        price_obj.latest('date').price)
                                    if existing_dict.get(asset_type):
                                        market_value = existing_dict.get(
                                            asset_type) + market_value
                                    existing_dict.update(
                                        {asset_type: market_value})
            if existing_dict.get(None):
                existing_dict['Other'] = existing_dict.pop(None)

            recommended_fund_ids = list(FundDetail.objects.values_list('fund_id',
                                                                  flat=True)[:4])
            fund_in_recommended = FundHolding.objects.values_list('id_value', flat=True)\
                .filter(fund_id__in=recommended_fund_ids)
            recommended_securites = securities.filter(id_value__in=fund_in_recommended)
            total_market_value = sum(list(existing_dict.values()))
            recommended_dict = {}
            for fund in recommended_securites:
                price_obj = prices.filter(id_value=fund.id_value)
                asset_type = fund.asset_type
                if price_obj:
                    quantity = (total_market_value / 4) / float(price_obj.latest('date').price)
                    market_value = quantity * float(price_obj.latest('date').price)
                    if recommended_dict.get(asset_type):
                        market_value = recommended_dict.get(asset_type) + market_value
                    recommended_dict.update({asset_type: market_value})
            data.append({'existing': existing_dict, 'recommended': recommended_dict})
            for key in data[0].get('existing').keys():
                if key not in data[0].get('recommended'):
                    data[0].get('recommended').update({key: 0})
            for key in data[0].get('recommended').keys():
                if key not in data[0].get('existing'):
                    data[0].get('existing').update({key: 0})
        return Response(data, status=200)


# def get_market_values(request, funds):
#     """function to get market values"""
#     market_values = []
#     fund_details = FundDetail.objects.all()
#     fx_rate = FXRate.objects.all()
#     price = Price.objects.all()
#     for fund in funds:
#         fund_detail = fund_details.filter(fund_id=fund.security.id_value)
#         fx_rate_obj = fx_rate.filter(date=date.today(),
#                                      currency=fund.security.currency)
#         try:
#             price_obj = price.filter(
#                 id_value=fund.security.id_value).latest('date')
#             price_value = price_obj.price
#         except Exception as e:
#             price_value = None
#         if price_value:
#             if '%' in str(fund.quantity):
#                 quantity = get_quantity(fund.quantity, fund.security,
#                                         fund_detail[0].aum,
#                                         fx_rate_obj[0].rate, price_value)
#             else:
#                 quantity = float(fund.quantity)
#             market_value = float(quantity) * float(price_value)
#             market_values.append({fund.security.id_value: market_value})
#     return market_values


class LineGraphFundRecommendation(APIView):
    """APIView to display Line graph in fund recommendation page"""
    def get(self, request):
        data = []
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
            funds = PortfolioFund.objects.filter(
                portfolio__in=portfolios, security__asset_type='Mutual Fund',
                created_by=request.user)
            base_currency = request.GET.get('currency')
            price = Price.objects.all()
            prices = price.filter(id_value__in=funds.
                                  values_list('security__id_value', flat=True))
            if prices:
                date_list = prices.values_list('id_value').annotate(
                    count=Min('date')) \
                    .distinct()
                common_date = max([x[1] for x in date_list])
                data = get_line_graph_data(base_currency, funds, common_date)
                # benchmark fund's price
                benchmark_price = Price.objects.\
                    filter(id_value='ISIN_US78390M1053', date__gte=common_date,
                           date__lte=date.today()).values_list('date')\
                    .annotate(price=F('price')).order_by('date').distinct()
                di = dict(list(benchmark_price))
                for k, v in di.items():
                    di[k] = round(v, 2)
                data.append(
                    {'portfolio': "Benchmark", 'label': di.keys(),
                     'series': di.values()})
        return Response(data, status=200)


class PortfolioPerformanceAPI(APIView):
    """APIView to display portfolio performance"""
    def get(self, request):
        data = []
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
            fund_ids = PortfolioFund.objects.values_list('security__id_value')\
                .filter(portfolio__in=portfolios, created_by=request.user,
                        security__asset_type='Mutual Fund')
            funds = FundDetail.objects.filter(fund_id__in=fund_ids)
            for fund in funds:
                data.append({'scheme': fund.name,
                             'portfolio_1_year': fund.return_1_year,
                             'portfolio_3_year': fund.return_3_year,
                             'portfolio_5_year': fund.return_5_year,
                             'benchmark_1_year': fund.benchmark_1_year,
                             'benchmark_3_year': fund.benchmark_3_year,
                             'benchmark_5_year': fund.benchmark_5_year,
                             'diff_1_year': fund.return_1_year -
                                                    fund.benchmark_1_year,
                             'diff_3_year': fund.return_3_year -
                                                    fund.benchmark_3_year,
                             'diff_5_year': fund.return_5_year -
                                                    fund.benchmark_5_year
                             })
        return Response(data, status=200)


class RecommendedPerformanceAPI(APIView):
    """APIView to display portfolio performance"""
    def get(self, request):
        data = []
        funds = FundDetail.objects.all()[:4]
        for fund in funds:
            data.append({
                'scheme': fund.name, 'portfolio_1_year': fund.return_1_year,
                'portfolio_3_year': fund.return_3_year,
                'portfolio_5_year': fund.return_5_year,
                'benchmark_1_year': fund.benchmark_1_year,
                'benchmark_3_year': fund.benchmark_3_year,
                'benchmark_5_year': fund.benchmark_5_year,
                'diff_1_year': fund.return_1_year - fund.benchmark_1_year,
                'diff_3_year': fund.return_3_year - fund.benchmark_3_year,
                'diff_5_year': fund.return_5_year - fund.benchmark_5_year
             })
        return Response(data, status=200)


class PortfolioFundData(APIView):
    """APIView to display Portfolio fund data on dashboard"""
    def get(self, request):
        data = []
        portfolios = Portfolio.objects.filter(created_by=request.user)
        portfolio_funds = PortfolioFund.objects\
            .filter(portfolio__in=portfolios, created_by=request.user)
        securities = portfolio_funds.values_list('security__id', flat=True).distinct()
        security_list = Security.objects.filter(id__in=securities)
        for security in securities:
            temp_dict = {'security_id': security}
            count = 1
            for portfolio in portfolios:
                obj_list = portfolio_funds.values_list('id', 'quantity', 'portfolio')\
                    .filter(portfolio=portfolio, security_id=security)
                temp_dict.update({'portfolio'+str(count): list(obj_list)})
                count = count + 1
            data.append(temp_dict)
        final_data = []
        for dict in data:
            security_id = dict.pop('security_id')
            details = list(itertools.zip_longest(*dict.values()))
            for portfolio_data in details:
                try:
                    security_name = security_list.get(id=security_id).name
                except:
                    security_name = None
                temp_dict = {}
                temp_dict.update({'security_id': security_id,
                                  'security_name': security_name})
                count = 1
                for data in portfolio_data:
                    portfolio_fund_id = None
                    quantity = None
                    if data:
                        portfolio_fund_id = data[0]
                        quantity = data[1]
                    temp_dict.update({'portfolio_id_'+str(count): portfolio_fund_id,
                                      'quantity'+str(count): quantity})
                    count = count+1
                final_data.append(temp_dict)
        return Response(final_data, status=200)


class PortfolioFundPriceAPI(APIView):
    def post(self, request):
        """post method in PortfolioFundData"""
        try:
            fund_price, created = PortfolioFundPrice.objects.get_or_create(
                fund_id=int(request.data.get('id')), created_by=request.user,
                created_at=request.data.get('date'))
            if request.data.get('price'):
                fund_price.price = request.data.get('price')
            fund_price.save()
            return Response("Price saved successfully", status=200)
        except Exception as e:
            LOGGER.error("Error {} occurred while saving fund price!".
                         format(e))
            return Response('Failed to save data!', status=204)


class CurrentAllocationAPI(APIView):
    """API to display current allocation in allocation recommendation page"""
    def get(self, request):
        data = []
        try:
            fx_rate_objects = FXRate.objects.all()
            fund_holdings = FundHolding.objects.all()
            fund_details = FundDetail.objects.all()
            prices = Price.objects.all()
            portfolio_ids = []
            if request.GET.get('portfolio_ids'):
                portfolio_ids = request.GET.get('portfolio_ids').split(',')
            base_currency = request.GET.get('currency')
            funds = PortfolioFund.objects.filter(portfolio__in=portfolio_ids,
                                                 created_by=request.user)
            holding_list = []
            fx_rate_list = []
            for fund in funds:
                price_obj = prices.filter(id_value=fund.security.id_value)
                if price_obj:
                    price_obj = price_obj.latest('date')
                if price_obj and not base_currency == fund.security.currency:
                    try:
                        fx_rate = fx_rate_objects.filter(
                            date=price_obj.date,
                            currency=fund.security.currency)[0].rate
                    except Exception:
                        fx_list = fx_rate_objects.filter(
                            base=base_currency, date__lt=price_obj.date,
                            currency=fund.security.currency)
                        if fx_list:
                            fx_rate = fx_list.latest('date').rate
                            fx_rate_list.append(FXRate(
                                base=base_currency, date=price_obj.date,
                                currency=fund.security.currency,
                                rate=fx_rate))
                        else:
                            fx_rate = None
                else:
                    fx_rate = 1
                fund_detail = fund_details.filter(fund_id=fund.security.id_value)
                if fx_rate and price_obj:
                    if '%' in fund.quantity:
                        a = float(fund.quantity.replace("%", "")) * 1000000
                        if fund.security.asset_type == 'Mutual Fund':
                            b = float(fund_detail[0].aum * 1000000 * (1 / fx_rate))
                            aum = a / b
                            holdings = list(
                                fund_holdings.values_list('id_value')
                                .filter(fund_id=fund.security.id_value)
                                .annotate(quantity=F('quantity')))
                            for holding in holdings:
                                holding = list(holding)
                                holding[1] = aum * holding[1]
                                holding_list.append(holding)
                        else:
                            quantity = a / float(price_obj.price)
                            holding_list.append(
                                [fund.security.id_value, quantity])
                    else:
                        if fund.security.asset_type == 'Mutual Fund':
                            holdings = list(
                                fund_holdings.values_list('id_value')
                                .filter(fund_id=fund.security.id_value)
                                .annotate(quantity=F('quantity')))
                            for holding in holdings:
                                holding = list(holding)
                                holding[1] = fund.quantity
                                holding_list.append(holding)
                        else:
                            holding_list.append(
                                [fund.security.id_value, fund.quantity])
            securities = Security.objects.filter(id_value__in=[item[0] for item in holding_list])
            return_dict = {}
            for item in holding_list:
                if item[0]:
                    security_obj = securities.filter(id_value=item[0])
                    price_obj = prices.filter(id_value=item[0])
                    if price_obj:
                        price_obj = price_obj.latest('date')
                    if security_obj and price_obj:
                        asset_type = security_obj[0].asset_type
                        country = security_obj[0].country
                        market_value = float(item[1]) * float(price_obj.price)
                        if return_dict.get("{} {}".format(country, asset_type)):
                            market_value = return_dict.get("{} {}".format(
                                country, asset_type)) + market_value
                        return_dict.update({"{} {}".format(
                            country, asset_type): market_value})
            if fx_rate_list:
                FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
            return Response([return_dict], status=200)
        except Exception as e:
            LOGGER.error("Error {} occurred: allocation recommendation".format(e))
            return Response(data, status=200)


class AllocationHistoricalPerformance(APIView):
    """APIView to get Historical performance allocation recommendation page"""
    def get(self, request):
        data = []
        fund_details = FundDetail.objects.all()
        fx_rate_objects = FXRate.objects.all()
        # prices = Price.objects.all()
        try:
            portfolio_ids = []
            if request.GET.get('portfolio_ids'):
                portfolio_ids = request.GET.get('portfolio_ids').split(',')
            base_currency = request.GET.get('currency')
            funds = PortfolioFund.objects.filter(portfolio__in=portfolio_ids,
                                                 created_by=request.user)
            prices = Price.objects.filter(
                id_value__in=funds.values_list("security__id_value"))
            existing_mkt_values = []
            temp_list = []
            fx_rate_list = []
            for fund in funds:
                fund_detail = fund_details.filter(fund_id=fund.security.id_value)
                price_obj = prices.filter(id_value=fund.security.id_value)
                if price_obj:
                    price_obj = price_obj.latest('date')
                if price_obj and not base_currency == fund.security.currency:
                    try:
                        fx_rate = fx_rate_objects.filter(
                            base=base_currency, date=price_obj.date,
                            currency=fund.security.currency)[0].rate
                    except Exception:
                        fx_list = fx_rate_objects.filter(
                            base=base_currency, date__lt=price_obj.date,
                            currency=fund.security.currency)
                        if fx_list:
                            fx_rate = fx_list.latest('date').rate
                            fx_rate_list.append(FXRate(
                                base=base_currency, date=price_obj.date,
                                currency=fund.security.currency,
                                rate=fx_rate))
                        else:
                            fx_rate = None
                else:
                    fx_rate = 1
                if price_obj and fx_rate and fund_detail:
                    price = float(price_obj.price)
                    if '%' in str(fund.quantity):
                        quantity = get_quantity(fund.quantity, fund.security,
                                                fund_detail[0].aum,
                                                fx_rate, price)
                    else:
                        quantity = float(fund.quantity)
                    existing_mkt_values.append(quantity * price)
                    temp_list.append({'market_value': quantity * price,
                                      '1-year': fund_detail[0].return_1_year,
                                      '3-year': fund_detail[0].return_3_year,
                                      '5-year': fund_detail[0].return_5_year})
            existing_return_1_year = 0
            existing_return_3_year = 0
            existing_return_5_year = 0
            for item in temp_list:
                if item.get('market_value'):
                    return_1_year = (item.get('market_value') /
                                     sum(filter(None, existing_mkt_values))
                                     )*float(item.get('1-year'))
                    existing_return_1_year = existing_return_1_year + return_1_year
                    return_3_year = (item.get('market_value') /
                                     sum(filter(None, existing_mkt_values))
                                     )*float(item.get('3-year'))
                    existing_return_3_year = existing_return_3_year + return_3_year
                    return_5_year = (item.get('market_value') /
                                     sum(filter(None, existing_mkt_values))
                                     )*float(item.get('5-year'))
                    existing_return_5_year = existing_return_5_year + return_5_year
            if fx_rate_list:
                FXRate.objects.bulk_create(fx_rate_list, ignore_conflicts=True)
            data.append({"Current Allocation":
                             {'1-year': existing_return_1_year,
                              '3-year': existing_return_3_year,
                              '5-year': existing_return_5_year},
                         "Recommended Allocation": {'1-year': 0.0001,
                                                    '3-year': 0.0001,
                                                    '5-year': 0.0001},
                         "Difference": {
                             '1-year': existing_return_1_year - 0.0001,
                             '3-year': existing_return_3_year - 0.0001,
                             '5-year': existing_return_5_year - 0.0001}})
        except Exception as e:
            LOGGER.error("Error {} occurred: allocation recommendation\
                         performance".format(e))
        return Response(data, status=200)


class AllocationLineGraph(APIView):
    """Allocation and Fund Analysis Page line graph API"""
    def get(self, request):
        if request.GET.get('portfolio_ids'):
            base_currency = request.GET.get('currency')
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
            funds = PortfolioFund.objects.filter(portfolio__in=portfolios,
                                                 created_by=request.user)
            prices = Price.objects.filter(
                id_value__in=funds.values_list('security__id_value', flat=True))
            if prices:
                date_list = prices.values_list('id_value').annotate(
                    count=Min('date')) \
                    .distinct()
                common_date = max([x[1] for x in date_list])
            data = get_line_graph_data(base_currency, funds, common_date)
        return Response(data, status=200)
