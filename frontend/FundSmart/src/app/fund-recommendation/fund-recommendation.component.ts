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
    historical: any = [];
    PortfolioPerformance: any = [];
    RecommendedPerformance: any = [];

    linedata = [];
    linetype = 'LineChart';
    linetitle = '';
    linewidth = 600;
    lineheight = 450;
    linecolumnNames = [];
    lineoptions;

    bartitle = '';
    bardata = [];
    barwidth = 600;
    barheight = 400;
    bartype = 'BarChart';
    baroptions;
    columnNames = [];

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
            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod('Fund Recommendation');
        this.getHistoricalPerformance();
        this.getPortfolioPerformance();
        this.getRecommendedPerformance();
        this.getBarChart()
        this.getLinePlotChart();
    }

    getHistoricalPerformance() {
        this.service.get(`api/historical_performance_fund_recommendation/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
            historicalData.forEach(historical => {
                const names = Object.keys(historical);
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

    getPortfolioPerformance() {
        this.service.get(`api/portfolio_performance/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
            historicalData.forEach(historical => {
                this.PortfolioPerformance.push(historical);
            });
        });
    }

    getRecommendedPerformance() {
        this.service.get(`api/recommended_performance/?portfolio_ids=${this.id}`).subscribe((historicalData: any) => {
            historicalData.forEach(historical => {
                this.RecommendedPerformance.push(historical);
                console.log("RecommendedPerformance", this.RecommendedPerformance);
            });
        });
    }

    getBarChart() {
        // this.service.fundRecommendationBarChart(this.id).subscribe(
        //   jsondata => {
        //     console.log("json",jsondata);

        //     this.bardata = [];
        //     let arrData = [];
        //     let arrvalue = [];
        //     Object.keys(jsondata).forEach((element) => {
        //       arrData = Object.keys(jsondata[element]);
        //       arrvalue = Object.values(jsondata[element]);
        //       arrData.forEach((key, value) => {
        //         this.bardata.push([key, arrvalue[value]]);
        //         console.log("bar",this.bardata);
        //         // debugger
        //       });
        //     });
        //     this.bartitle = '';
        //     this.bartype = 'Bar Chart';
        //     this.columnNames = ['existing', 'recommended'];
        //     this.baroptions = {
        //       legend: { position: 'top', maxLines: 3 },
        //       bar: { groupWidth: '75%' },
        //       isStacked: true
        //     };
        //   });

    }

    getLinePlotChart() {
        this.service.fundRecommendationLineChart(this.id).subscribe((jsondata: any) => {
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
                        if (mainObj[label]) {
                            mainObj[label] = mainObj[label] + ',' + element.series[k];
                        } else {
                            mainObj[label] = element.series[k];
                        }
                    }
                }
                for (let i = 0; i < tempArray.length; i++) {
                    const element = tempArray[i];
                    const values = (mainObj[element].split(',')).filter(Boolean);
                    if (values.length === 3) {
                        const valuesCollection = [];
                        valuesCollection.push(element);
                        for (const iterator of values) {
                            valuesCollection.push(parseFloat(iterator));
                        }
                        this.linedata.push(valuesCollection);
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
    
}
