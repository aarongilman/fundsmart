# routerss.py fundsmart project
from django.urls import re_path
from rest_framework import routers

from portfolios.views import ImportPortfolioFund
from portfolios.viewsets import PortfolioViewSet, PortfolioFundViewSet,\
    SecurityViewSet

app_name = 'api'

router = routers.DefaultRouter()
router.register(r'portfolio', PortfolioViewSet, base_name='portfolio')
router.register(r'portfolio_fund', PortfolioFundViewSet, base_name='portfolio-fund')
router.register(r'security', SecurityViewSet, base_name='security')

urlpatterns = router.urls

urlpatterns += [
    re_path(r'^import_portfolio_fund/$', ImportPortfolioFund.as_view(),
            name='import-portfolio-fund')
]
