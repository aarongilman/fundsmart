import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
  linetitle = '';
  linewidth = 600;
  lineheight = 300;
  linecolumnNames = [];
  lineoptions;


  bartitle = 'Bar Chart';
  bardata = [];
  barwidth = 600;
  barheight = 300;
  bartype = 'ColumnChart';
  baroptions = {
    isStacked: true,
    colors: ['#7FFFD4', '#800000', '#DC143C', '#006400'],
  };
  barcolumnNames = [];

  constructor(
    private interconn: IntercomponentCommunicationService,
    private service: ServercommunicationService,
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) {
    this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
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
    this.getLinePlotChart();
    this.getPortfolioPerformance();
    this.getRecommendedPerformance();
    this.getPlotFundRecommendation();
  }

  //get portfolio data
  getHistoricalPerformance() {
    this.service.get(`api/historical_performance_fund_recommendation/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        const names = Object.keys(historical);
        // console.log("names", names);
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
        // console.log("PortfolioPerformance", this.PortfolioPerformance);
      });
    });
  }

  //get portfolio Performance data 
  getRecommendedPerformance() {
    this.service.get(`api/recommended_performance/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        this.RecommendedPerformance.push(historical);
        // console.log("RecommendedPerformance", this.RecommendedPerformance);
      });
    });
  }

//line chart
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
            // debugger;
            if (tempArray.filter(x => x === label).length === 0) {
              tempArray.push(label);
            }
            if (mainObj[label]) {
              mainObj[label] = mainObj[label] + ',' + element.series[k];
            } else {
              mainObj[label] = element.series[k];
            }
          }
        }
        // debugger;
        for (let i = 0; i < tempArray.length; i++) {
          const element = tempArray[i];
          const values = (mainObj[element].split(',')).filter(Boolean);
          // console.log("values are", values, "length", values.length);
          if (values.length === 3) {
            const valuesCollection = [];

            valuesCollection.push(element);
            for (const iterator of values) {
              valuesCollection.push(parseFloat(iterator));
              // console.log("ele",valuesCollection.length);
              // valuesCollection[0] = i;
            }
            // debugger;
            this.linedata.push(valuesCollection);
            console.log("line",this.linedata);
          }
        }
        this.lineoptions = {
          pointSize: 1,
          curveType: 'function',
          tooltips: {
            mode: 'index'
          }
        };

      });
  }

  //get portfolio Performance data 
  getPlotFundRecommendation() {
    this.service.get(`api/bar_plot_fund_recommendation/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
      historicalData.forEach(historical => {
        // console.log(historical);
        const name = Object.keys(historical);
        const obj = Object.values(historical);

        // tslint:disable-next-line: forin
        for (const n in name) {
          // console.log('N is', name[n], historical[name[n]]);
          // this.bardata.push([name[n], historical[name[n]]]);
          let barobj = Object.values(obj[n]);
          barobj.unshift(name[n]);
          this.bardata.push(barobj);
        }
        // console.log("Bar data",this.bardata);
        // console.log("Object count", Object.values(obj[0]));
        // this.barcolumnNames = name;
        // tslint:disable-next-line: forin
        for (let i in obj[0]) {
          // console.log("elements are", i);
          this.barcolumnNames.push(i);
        }
        this.barcolumnNames.unshift('Fund Types');
        // this.barcolumnNames = element;

      });
    });
    
  }

}
