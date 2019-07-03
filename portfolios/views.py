"""views.py in portfolios app"""
import logging
import xlrd
from datetime import date

from django.db.models import Count, Max, Min, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, status

from .serializers import ImportPortfolioFundSerializer
from .models import Security, Portfolio, PortfolioFund, FundDetail, Price,\
    HoldingDetail

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
            portfolios = Portfolio.objects.filter(created_by=request.user)
            try:
                if len(portfolios) < 3:
                    for i in range(0, 3 - len(portfolios)):
                        portfolios = Portfolio.objects.create(
                            name="Portfolio"+str(i+1), created_by=request.user)
                    portfolios = Portfolio.objects.filter(created_by=request.user)
            except Exception as e:
                LOGGER.error(
                    'ImportPortfolioFund:Error {} occurred while creating\
                    portfolios'.format(e))
                return Response("Failed to import funds",
                                status.HTTP_400_BAD_REQUEST)
            try:
                security_isin = ws.col_values(0)
                securities = Security.objects.filter(isin__in=security_isin)
                objects = []
                user = request.user
                for i in range(1, ws.nrows):
                    row = ws.row_values(i)
                    security = securities.filter(isin=row[0]).first()
                    if security:
                        obj1 = PortfolioFund(security=security,
                                             quantity=row[1],
                                             portfolio=portfolios[0],
                                             created_by=user)
                        obj2 = PortfolioFund(security=security,
                                             quantity=row[2],
                                             portfolio=portfolios[1],
                                             created_by=user)
                        obj3 = PortfolioFund(security=security,
                                             quantity=row[3],
                                             portfolio=portfolios[2],
                                             created_by=user)
                        objects += [obj1, obj2, obj3]
                PortfolioFund.objects.bulk_create(objects, ignore_conflicts=True)
                return Response("Data imported successfully", status=204)
            except Exception as e:
                LOGGER.error(
                    'ImportPortfolioFund:Error {} occurred while creating\
                    funds'.format(e))
                return Response("Failed to import funds",
                                status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            LOGGER.error(
                'ImportPortfolioFund:Error {} occurred while importing'.format(
                    e))
            return Response("failed to add into list",
                            status.HTTP_400_BAD_REQUEST)


class HistoricalPerformanceDifference(APIView):
    """API view to get historical Performance difference calculation"""
    def get(self, request):
        fund_details = FundDetail.objects.all()
        # Get your portfolio's funds
        portfolio = Portfolio.objects.filter(created_by=request.user)
        if portfolio:
            portfolio = portfolio.first()
            isin_list = PortfolioFund.objects.\
                filter(security__asset_type='Mutual Fund', portfolio=portfolio,
                       created_by=request.user).values_list('security__id_value',
                                                            flat=True)

            # fund details for existing funds
            portfolio_fund_details = fund_details.filter(fund_id__in=isin_list)
            # Annual expense calculation for existing funds
            if portfolio_fund_details:
                portfolio_annual_expense = [float(x) for x in portfolio_fund_details.
                                            values_list('fund_exp_ratio', flat=True)]
                portfolio_avg_annual_expense =\
                    sum(portfolio_annual_expense)/len(portfolio_annual_expense)

                # 1 year, 3 year and 5 year return for existing funds
                portfolio_1_year = [float(x) for x in portfolio_fund_details.
                                    values_list('return_1_year', flat=True)]
                portfolio_avg_1_year = sum(portfolio_1_year)/len(portfolio_1_year)

                portfolio_3_year = [float(x) for x in portfolio_fund_details.
                                    values_list('return_3_year', flat=True)]
                portfolio_avg_3_year = sum(portfolio_3_year)/len(portfolio_3_year)

                portfolio_5_year = [float(x) for x in portfolio_fund_details.
                                    values_list('return_5_year', flat=True)]
                portfolio_avg_5_year = sum(portfolio_5_year)/len(portfolio_5_year)

                # recommended 4 funds
                recommended_funds = fund_details[:4]#.filter(for_recommendation=True)[:4]
                # Annual expense calculation for recommended
                recommended_annual_expense = [float(x) for x in recommended_funds.
                                              values_list('fund_exp_ratio', flat=True)]
                recommended_avg_annual_expense = \
                    sum(recommended_annual_expense)/len(recommended_annual_expense)

                # 1 year, 3 year and 5 year for existing
                recommended_1_year = [float(x) for x in recommended_funds.
                                      values_list('return_1_year', flat=True)]
                recommended_avg_1_year = sum(recommended_1_year)/len(recommended_1_year)

                recommended_3_year = [float(x) for x in recommended_funds.
                                      values_list('return_3_year', flat=True)]
                recommended_avg_3_year = sum(recommended_3_year)/len(recommended_3_year)

                recommended_5_year = [float(x) for x in recommended_funds.
                                      values_list('return_5_year', flat=True)]
                recommended_avg_5_year = sum(recommended_5_year)/len(recommended_5_year)

                exp_diff = recommended_avg_annual_expense - portfolio_avg_annual_expense
                data = [{"existing": {'annual_expense': portfolio_avg_annual_expense,
                                      '1-year': portfolio_avg_1_year,
                                      '3-year': portfolio_avg_3_year,
                                      '5-year': portfolio_avg_5_year},
                         "recommended": {
                             'annual_expense': recommended_avg_annual_expense,
                             '1-year': recommended_avg_1_year,
                             '3-year': recommended_avg_3_year,
                             '5-year': recommended_avg_5_year},
                         "difference": {
                             'annual_expense': exp_diff,
                             '1-year': recommended_avg_1_year-portfolio_avg_1_year,
                             '3-year': recommended_avg_3_year-portfolio_avg_3_year,
                             '5-year': recommended_avg_5_year-portfolio_avg_5_year}}]
                return Response(data, status=200)
        return Response([], status=200)


class DashboardLinePlotApi(APIView):
    """API view to compare historical market values of three portfolios"""

    def get(self, request):
        data = []
        portfolios = Portfolio.objects.filter(created_by=request.user)
        portfolio_funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
        fund_isin = portfolio_funds.values_list('security__id_value',
                                                flat=True).distinct()
        price = Price.objects.filter(id_value__in=fund_isin)
        if price:
            date_list = price.values_list('id_value').annotate(count=Min('date'))\
                .distinct()
            common_date = max([x[1] for x in date_list])
            for portfolio in portfolios:
                funds = portfolio_funds.filter(portfolio=portfolio)
                temp_dict = {'portfolio': portfolio.name, 'series': [], 'label': []}
                funds_avg_mkt_value = {}
                for fund in funds:
                    average = price.values_list('date__year').\
                        filter(id_value=fund.security.id_value, date__year__gte=
                               common_date.year).annotate(avg=Avg('price'))\
                        .distinct()
                    if '%' in fund.quantity:
                        quantity = (float(fund.quantity.replace("%", "")) / 100) *\
                                   1000000
                    else:
                        quantity = float(fund.quantity)
                    for item in average:
                        if funds_avg_mkt_value.get(item[0]):
                            funds_avg_mkt_value.get(item[0]).append(float(item[1])
                                                                    * quantity)
                        else:
                            funds_avg_mkt_value.update({item[0]: [float(item[1])
                                                                  * quantity]})
                for key, value in funds_avg_mkt_value.items():
                    temp_dict.get('label').append(key)
                    temp_dict.get('series').append(sum(value)/len(value))
                data.append(temp_dict)
        return Response(data, status=200)


class DashboardDoughnutChart(APIView):
    """APIView to display analytics on user’s holding in different Industries"""

    def get(self, request):
        portfolio = Portfolio.objects.filter(created_by=request.user).first()
        data = PortfolioFund.objects.filter(
            portfolio=portfolio, created_by=request.user).\
            values('security__industry').\
            annotate(total=Count('security__industry', istinct=True)).\
            order_by('total')
        return Response(data, status=200)


class DashboardPieChart(APIView):
    """APIView to display  holdings’ asset classes in user’s portfolio"""

    def get(self, request):
        portfolio = Portfolio.objects.filter(created_by=request.user).first()
        data = PortfolioFund.objects.filter(
            portfolio=portfolio, created_by=request.user).\
            values('security__asset_type').\
            annotate(total=Count('security__asset_type', distinct=False)).\
            order_by('total')
        return Response(data, status=200)


class HoldingDetailAPIView(APIView):
    """APIView to import Portfolio"""

    def get(self, request):
        """post method in HoldingDetailAPIView"""
        data = []
        portfolios = Portfolio.objects.filter(created_by=request.user)
        funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
        price = Price.objects.filter(id_value__in=
                                     funds.values_list('security__id_value'))
        fund_details = FundDetail.objects.filter(
            fund_id__in=funds.values_list('security__id_value'))
        for fund in funds:
            try:
                try:
                    holding_detail = HoldingDetail.objects.get(fund=fund)
                except Exception as e:
                    holding_detail = None
                if holding_detail and holding_detail.price:
                    basic_price = holding_detail.price
                else:
                    basic_price = price.filter(id_value=fund.security.id_value,
                                               date=fund.portfolio.created_at.date()
                                               )[0].price
            except Exception as e:
                LOGGER.error("Error {} occurred:holding details!".
                             format(e))
                basic_price = 0
            if '%' in fund.quantity:
                quantity = (float(fund.quantity.replace("%", "")) / 100) * \
                           1000000
            else:
                quantity = fund.quantity
            basis = float(quantity) * float(basic_price)
            # Quantity is different for mutual funds
            if fund.security.asset_type == 'Mutual Fund':
                aum = fund_details.get(fund_id=fund.security.id_value).aum
                quantity = float(basis) / float(aum) * 1000000
                basis = float(quantity) * float(basic_price)
            try:
                current_price = price.filter(id_value=fund.security.id_value)\
                    .latest('date').price
            except:
                current_price = 0
            if fund.security.asset_type == 'Mutual Fund':
                if fund.security.asset_type == 'Mutual Fund':
                    aum = fund_details.get(fund_id=fund.security.id_value).aum
                    quantity = float(float(fund.quantity) * float(basic_price) /
                                     float(aum)) * 1000000
                market_value = float(quantity) * float(current_price)
            else:
                market_value = float(quantity) * float(current_price)
            currency = fund.security.currency
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

            data.append({'fund_id': fund.id, 'portfolio': fund.portfolio.name,
                         'security': fund.security.name,
                         'isin': fund.security.isin, 'quantity': fund.quantity,
                         'ticker': fund.security.isin,
                         'basic_price': basic_price, 'basis': basis,
                         'current_price': current_price,
                         'market_value': market_value,
                         'asset_class': fund.security.asset_type,
                         'currency': currency, 'country': country,
                         'industry': industry, 'rating': rating
                         })
        return Response(data, status=204)

    def post(self, request):
        """post method in HoldingDetailAPIView"""
        try:
            holding_detail, created = HoldingDetail.objects.get_or_create(
                fund_id=int(request.data.get('id')))
            if request.data.get('currency'):
                holding_detail.currency = request.data.get('currency')
            if request.data.get('price'):
                holding_detail.price = request.data.get('price')
            if request.data.get('country'):
                holding_detail.country = request.data.get('country')
            if request.data.get('industry'):
                holding_detail.industry = request.data.get('industry')
            if request.data.get('rating'):
                holding_detail.rating = request.data.get('rating')
            holding_detail.save()
            return Response('data saved successfully!', status=204)
        except Exception as e:
            LOGGER.error("Error {} occurred while saving holding details!".
                         format(e))
            return Response('Failed to save data!', status=204)


def get_summary_data(request, type):
    data = []
    temp_dict = {}
    key = None
    if request.GET.get('portfolio_ids'):
        portfolio_ids = request.GET.get('portfolio_ids').split(",")
        portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                              created_by=request.user)
        funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
        fund_details = FundDetail.objects.all()
        price = Price.objects.all()
        for fund in funds:
            try:
                price_obj = price.filter(
                    id_value=fund.security.id_value).latest('date')
                price_value = price_obj.price
            except Exception as e:
                price_value = 0
            if '%' in fund.quantity:
                quantity = (float(fund.quantity.replace("%", "")) / 100) * \
                           1000000
            else:
                quantity = fund.quantity
            market_value = float(quantity) * float(price_value)
            if fund.security.asset_type == 'Mutual Fund':
                aum = fund_details.get(fund_id=fund.security.id_value).aum
                quantity = float(market_value) / float(aum) * 1000000
                market_value = float(quantity) * float(price_value)
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
            data.append({'total': total})
        return data


class HoldingSummaryByHoldingType(APIView):
    """Holding summary APIView to display market value"""
    def get(self, request):
        data = []
        temp_dict = {}
        if request.GET.get('portfolio_ids'):
            portfolio_ids = request.GET.get('portfolio_ids').split(",")
            portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                                  created_by=request.user)
            funds = PortfolioFund.objects.filter(portfolio__in=portfolios)
            fund_details = FundDetail.objects.all()
            price = Price.objects.all()
            for fund in funds:
                try:
                    price_obj = price.filter(id_value=fund.security.id_value).latest('date')
                    price_value = price_obj.price
                except Exception as e:
                    price_value = 0
                if '%' in fund.quantity:
                    quantity = (float(fund.quantity.replace("%", "")) / 100) * \
                               1000000
                else:
                    quantity = fund.quantity
                market_value = float(quantity) * float(price_value)
                if fund.security.asset_type == 'Mutual Fund':
                    aum = fund_details.get(fund_id=fund.security.id_value).aum
                    quantity = float(market_value) / float(aum) * 1000000
                    market_value = float(quantity) * float(price_value)
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
                data.append({'total': total})
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


def get_historical_performance(request):
    data = []
    if request.GET.get('portfolio_ids'):
        portfolio_ids = request.GET.get('portfolio_ids').split(',')
        portfolios = Portfolio.objects.filter(id__in=portfolio_ids,
                                              created_by=request.user)
        portfolio_funds = PortfolioFund.objects.filter(portfolio__in=
                                                       portfolios)
        fund_details = FundDetail.objects.all()
        total_annual_expense = 0
        total_1_year = []
        total_3_year = []
        total_5_year = []
        price = Price.objects.all()
        for portfolio in portfolios:
            isin_list = portfolio_funds.filter(
                portfolio=portfolio, created_by=request.user) \
                .values_list('security__id_value', flat=True)
            return_1_yr = []
            return_3_yr = []
            return_5_yr = []
            print(isin_list)
            for isin in isin_list:
                end_price_1_year = price.filter(id_value=isin,
                                                date=str(
                                                    date(date.today().year -
                                                         1, 12, 31)))
                beg_price_1_year = price.filter(id_value=isin,
                                                date=str(
                                                    date(date.today().year -
                                                         2, 12, 31)))
                end_price_3_year = price.filter(id_value=isin,
                                                date=str(
                                                    date(date.today().year -
                                                         3, 12, 31)))
                beg_price_3_year = price.filter(id_value=isin,
                                                date=str(
                                                    date(date.today().year -
                                                         4, 12, 31)))
                end_price_5_year = price.filter(id_value=isin,
                                                date=str(
                                                    date(date.today().year -
                                                         5, 12, 31)))
                beg_price_5_year = price.filter(id_value=isin,
                                                date=str(
                                                    date(date.today().year -
                                                         6, 12, 31)))
                print(end_price_1_year, beg_price_1_year, end_price_3_year,
                      beg_price_3_year,
                      end_price_5_year, beg_price_5_year)
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
        data.append({'total': {'total_annual_expense': total_annual_expense,
                               'total_1_year': sum(
                                   list(filter(None, total_1_year))),
                               'total_3_year': sum(
                                   list(filter(None, total_3_year))),
                               'total_5_year': sum(
                                   list(filter(None, total_5_year)))}})
        return data


class HoldingSummaryHistoricalPerformanceDifference(APIView):
    """APIView to get historical Performance difference-holding summary page"""
    def get(self, request):
        data = get_historical_performance(request)
        return Response(data, status=200)


class HoldingSummaryLineGraph(APIView):
    def get(self, request):
        result = get_historical_performance(request)
        data = []
        temp_dict = {'label': [], 'series': []}
        for key, value in result[0].items():
            print(key, value)
            temp_dict.get('label').append(key)
            temp_dict.get('series').append(value)
        data.append(temp_dict)
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
            fund_details = FundDetail.objects.all()
            recommended_funds = fund_details[:4]
            print(existing_funds, recommended_funds)
        return Response(data, status=200)
