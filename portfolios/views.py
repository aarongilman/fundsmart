# views.py in portfolios app
import xlrd, logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, status

from .serializers import ImportPortfolioFundSerializer
from .models import Security, Portfolio, PortfolioFund

logger = logging.getLogger('fundsmart')


class ImportPortfolioFund(APIView):
    """APIView to import Portfolio"""
    serializer_class = ImportPortfolioFundSerializer

    def post(self, request):
        try:
            data_file = request.FILES['data_file']
            wb = xlrd.open_workbook(file_contents=data_file.read())
            ws = wb.sheet_by_index(0)
            portfolios = Portfolio.objects.all()
            try:
                if len(portfolios) < 3:
                    portfolios = Portfolio.objects. \
                        bulk_create([Portfolio(name="Portfolio1"),
                                     Portfolio(name="Portfolio2"),
                                     Portfolio(name="Portfolio3")])
            except Exception as e:
                logger.error(
                    'ImportPortfolioFund:Error {} occurred while creating portfolios'.format(
                        e))
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
                logger.error(
                    'ImportPortfolioFund:Error {} occurred while creating\
                    funds'.format(e))
                return Response("Failed to import funds",
                                status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(
                'ImportPortfolioFund:Error {} occurred while importing'.format(
                    e))
            return Response("failed to add into list",
                            status.HTTP_400_BAD_REQUEST)
