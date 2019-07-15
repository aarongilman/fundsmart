# routerss.py fundsmart project
from django.urls import re_path
from rest_framework import routers

from portfolios.views import HistoricalPerformanceDifference,\
    ImportPortfolioFund, DashboardLinePlotApi, DashboardDoughnutChart,\
    DashboardPieChart, HoldingDetailAPIView, HoldingSummaryByHoldingType,\
    HoldingSummaryByAssetClass, HoldingSummaryByIndustry,\
    HoldingSummaryByCountry, HoldingSummaryHistoricalPerformanceDifference,\
    FundRecommendationHistoricalPerformanceDiff, HoldingSummaryLineGraph,\
    BarPlotFundRecommendation, LineGraphFundRecommendation, PortfolioFundData,\
    PortfolioPerformanceAPI, RecommendedPerformanceAPI, PortfolioFundPriceAPI

from portfolios.viewsets import PortfolioViewSet, PortfolioFundViewSet,\
    SecurityViewSet

app_name = 'api'

router = routers.DefaultRouter()
router.register(r'portfolio', PortfolioViewSet, base_name='portfolio')
router.register(r'portfolio_fund', PortfolioFundViewSet,
                base_name='portfolio-fund')
router.register(r'security', SecurityViewSet, base_name='security')

urlpatterns = router.urls

urlpatterns += [
    re_path(r'^import_portfolio_fund/$', ImportPortfolioFund.as_view(),
            name='import-portfolio-fund'),
    re_path(r'^historical_performance_difference/$',
            HistoricalPerformanceDifference.as_view()),
    re_path(r'^dashboard_line_graph/$', DashboardLinePlotApi.as_view()),
    re_path(r'^dashboard_doughnut_chart/$', DashboardDoughnutChart.as_view()),
    re_path(r'^dashboard_pie_chart/$', DashboardPieChart.as_view()),
    re_path(r'^holding_detail/$', HoldingDetailAPIView.as_view()),
    re_path(r'^fund_holding_summary/$', HoldingSummaryByHoldingType.as_view()),
    re_path(r'^asset_class_holding_summary/$',
            HoldingSummaryByAssetClass.as_view()),
    re_path(r'^industry_holding_summary/$', HoldingSummaryByIndustry.as_view()),
    re_path(r'^country_holding_summary/$', HoldingSummaryByCountry.as_view()),
    re_path(r'^historical_performance_holding_summary/$',
            HoldingSummaryHistoricalPerformanceDifference.as_view()),
    re_path(r'^line_graph_holding_summary/',
            HoldingSummaryLineGraph.as_view()),
    re_path(r'^historical_performance_fund_recommendation/$',
            FundRecommendationHistoricalPerformanceDiff.as_view()),
    re_path(r'^bar_plot_fund_recommendation/$',
            BarPlotFundRecommendation.as_view()),
    re_path(r'^line_graph_fund_recommendation/$',
            LineGraphFundRecommendation.as_view()),
    re_path(r'^portfolio_performance/$', PortfolioPerformanceAPI.as_view()),
    re_path(r'^recommended_performance/$', RecommendedPerformanceAPI.as_view()),
    re_path(r'^portfolio_fund_data/$', PortfolioFundData.as_view()),
    re_path(r'^portfolio_fund_price/$', PortfolioFundPriceAPI.as_view())
]
