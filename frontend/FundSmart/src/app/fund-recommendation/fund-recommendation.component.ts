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
      ['Galaxy', 'Distance', 'Brightness'],
      ['Canis Major Dwarf', 8000, 23.3],
      ['Sagittarius Dwarf', 24000, 4.5],
      ['Ursa Major II Dwarf', 30000, 14.3],
      ['Lg. Magellanic Cloud', 50000, 0.9],
      ['Bootes I', 60000, 13.1]
    ];

    var options = {
      width: 800,
      chart: {
        title: 'Nearby galaxies',
        subtitle: 'distance on the left, brightness on the right'
      },
      bars: 'horizontal', // Required for Material Bar Charts.
      series: {
        0: { axis: 'distance' }, // Bind series 0 to an axis named 'distance'.
        1: { axis: 'brightness' } // Bind series 1 to an axis named 'brightness'.
      },
      axes: {
        x: {
          distance: { label: 'parsecs' }, // Bottom x-axis.
          brightness: { side: 'top', label: 'apparent magnitude' } // Top x-axis.
        }
      }
    };
  }
}
