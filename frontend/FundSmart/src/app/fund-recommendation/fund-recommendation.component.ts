import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
  linewidth = 700;
  lineheight = 500;
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
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) {
    this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
      console.log("Id", queryParams.params.id);
      this.id = queryParams.params.id;
    });

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        this.route.navigate(['/home']);
      }
    );

  }

  ngOnInit() {
    this.interconn.titleSettermethod('Fund Recommendation');
    this.getHistoricalPerformance();
    this.getPortfolioPerformance();
    this.getRecommendedPerformance();
    this.getPlotFundRecommendation();
    this.getLinePlotChart();
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

  getLinePlotChart() {
    this.service.fundRecommendationLineChart(this.id).subscribe(
      (jsondata: any) => {
        this.linedata = [];
        this.linecolumnNames = ['label'];
        const tempArray = [];
        const mainObj = {};
        for (let i = 0; i < jsondata.length; i++) {
          const element = jsondata[i];
          if (this.linedata !== null) {
            this.linecolumnNames.push(element.portfolio);
          }
          for (let k = 0; k < element['label'].length; k++) {
            const label = element['label'][k];
            if (tempArray.filter(x => x === label).length === 0) {
              tempArray.push(label);
            }
            if (mainObj[label] || mainObj[label] === 0) {
              mainObj[label] = mainObj[label] + ',' + ((element.series[k]) ? element.series[k] : 0);
            } else {
              mainObj[label] = (element.series[k]) ? element.series[k] : 0;
            }
          }
          console.log(mainObj);
        }
        for (let i = 0; i < tempArray.length; i++) {
          const element = tempArray[i];
          const values = (mainObj[element].toString().split(',')).filter(Boolean);
          const valuesCollection = [];
          valuesCollection.push(element);
          for (const iterator of values) {
            valuesCollection.push(parseFloat(iterator));
          }
          this.linedata.push(valuesCollection);
        }
        console.log("Line data", this.linedata, this.linecolumnNames);

        this.lineoptions = {
          pointSize: 5,
          curveType: 'function',

        };
      });
  }
}
