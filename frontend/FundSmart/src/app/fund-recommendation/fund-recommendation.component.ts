import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ActivatedRoute, Params } from '@angular/router';
import { HistoricalData } from '../historicaldata';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';

@Component({
  selector: 'app-fund-recommendation',
  templateUrl: './fund-recommendation.component.html',
  styleUrls: ['./fund-recommendation.component.css']
})
export class FundRecommendationComponent implements OnInit {

  id: any;
  result: any = [];
  historical: any = [];
  PortfolioPerformance: any = [];
  RecommendedPerformance: any = [];
  PlotFundRecommendation: any = [];
  fund: any = [];
  country: any = [];
  industry: any = [];

  total4 = [];
  graph = [];
  linedata = [];
  linetype = 'LineChart';
  linetitle = 'Portfolio value over time';
  linewidth = '450px';
  lineheight = '500px';
  linecolumnNames = [];
  lineoptions;


  bartitle = 'Bar Chart';
  bardata = [];
  barwidth = 300;
  barheight = 200;
  bartype = 'BarChart';
  baroptions;
  barcolumnNames = [];

  constructor(
    private interconn: IntercomponentCommunicationService,
    private service: ServercommunicationService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
      this.id = queryParams.params.id;
    });
  }

  ngOnInit() {
    this.interconn.titleSettermethod('Fund Recommendation');
    this.getHistoricalPerformance();
    this.getPortfolioPerformance();
    this.getRecommendedPerformance();
    this.getPlotFundRecommendation();
  }

  //get portfolio data
  getHistoricalPerformance() {
    this.service.get(`api/historical_performance_fund_recommendation/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        const names = Object.keys(historical);
        console.log("names", names);
        names.forEach((key, value) => {
          const historicalObj = {
            name: names[value],
            value: historical[names[value]]
          }
          this.historical.push(historicalObj);
        })
      });
    });
  }


  //get portfolio Performance data 
  getPortfolioPerformance() {
    this.service.get(`api/portfolio_performance/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        this.PortfolioPerformance.push(historical);
        console.log("PortfolioPerformance", this.PortfolioPerformance);
      });
    });
  }

  //get portfolio Performance data 
  getRecommendedPerformance() {
    this.service.get(`api/recommended_performance/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        this.RecommendedPerformance.push(historical);
        console.log("RecommendedPerformance", this.RecommendedPerformance);
      });
    });
  }

  //get portfolio Performance data 
  getPlotFundRecommendation() {
    this.service.get(`api/bar_plot_fund_recommendation/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        // this.PlotFundRecommendation.push(historical);
        // console.log("PlotFundRecommendation", this.PlotFundRecommendation);
      });
    });

    this.bardata = [
      ["Apples", 3, 2, 2.5],
      ["Oranges", 2, 3, 2.5],
      ["Pears", 1, 5, 3],
      ["Bananas", 3, 9, 6],
      ["Plums", 4, 2, 3]
    ];
    this.barcolumnNames = ['Fruits', 'Jane', 'Jone', 'Average'];

    this.baroptions = {
      hAxis: {
        title: 'Person'
      },
      vAxis: {
        title: 'Fruits'
      },
      bars: 'vertical',
      seriesType: 'bars',
      series: { 2: { type: 'line' } }
    };
  }
}
