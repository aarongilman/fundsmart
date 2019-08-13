import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { Router } from '@angular/router';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { ToastrService } from 'ngx-toastr';
import { portfolioidSelect } from '../fund/portfolioid_select';
import { NgxSpinnerService } from 'ngx-spinner';

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
    PlotFundRecommendation: any = [];
    fund: any = [];

    total4 = [];
    linedata = [];
    linetype = 'LineChart';
    linewidth = 650;
    lineheight = 300;
    linecolumnNames = [];
    lineoptions = {
        pointSize: 1,
        colors: [
            '#5ace9f', '#fca622', '#1395b9', '#0e3c54',
            '#cc0000', '#e65c00', '#ecaa39', '#eac843',
            '#a2b86d'
        ],
        curveType: 'function',
        tooltips: {
            mode: 'index'
        },
    };

    bartitle = 'Bar Chart';
    bardata = [];
    barwidth = 650;
    barheight = 300;
    bartype = 'ColumnChart';
    baroptions = {
        isStacked: true,
        colors: [
            '#5ace9f', '#fca622', '#1395b9', '#0e3c54',
            '#cc0000', '#e65c00', '#ecaa39', '#eac843',
            '#a2b86d'
        ],
    };
    barcolumnNames = [];

    constructor(
        private interconn: IntercomponentCommunicationService,
        private service: ServercommunicationService,
        private route: Router,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService
    ) {
        this.interconn.logoutcomponentMethodCalled$.subscribe(() => {
            this.route.navigate(['/home']);
        });
    }

    ngOnInit() {
        if (portfolioidSelect.length > 0) {
            this.interconn.titleSettermethod('Fund Recommendation');
            this.spinner.show();
            this.getHistoricalPerformance();
            this.getLinePlotChart();
            this.getPortfolioPerformance();
            this.getRecommendedPerformance();
            this.getPlotFundRecommendation();
            this.spinner.hide();
        } else {
            this.toastr.info('Please select portfolio id/ids from Fund page', 'Information');
            this.spinner.hide();
        }
    }

    getHistoricalPerformance() {
        this.service.getHoldingSummaryFundRec(portfolioidSelect).toPromise().then((historicalData: any) => {
            historicalData.forEach(historical => {
                const names = Object.keys(historical);
                names.forEach((key, value) => {
                    const historicalObj = {
                        name: names[value],
                        value: historical[names[value]]
                    };
                    this.historical.push(historicalObj);
                });
            });
        });
    }

    getPortfolioPerformance() {
        this.service.getPortfolioPerformance(portfolioidSelect).toPromise().then((historicalData: any) => {
            historicalData.forEach(historical => {
                this.PortfolioPerformance.push(historical);
            });
        });
    }

    getRecommendedPerformance() {
        this.service.getRecommendedPerformance(portfolioidSelect).toPromise().then((historicalData: any) => {
            historicalData.forEach(historical => {
                this.RecommendedPerformance.push(historical);
            });
        });
    }

    getLinePlotChart() {
        this.service.fundRecommendationLineChart(portfolioidSelect).toPromise().then((jsondata: any) => {
            let totalportfolios = jsondata.length + 1;
            this.linedata = [];
            this.linecolumnNames = ['label'];
            const tempArray = [];
            const mainObj = {};
            for (let i = 0; i < jsondata.length; i++) {
                const element = jsondata[i];
                if (element['label'].length > 0) {
                    this.linecolumnNames.push(element.portfolio);
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
            }
            for (let i = 0; i < tempArray.length; i++) {
                const element = tempArray[i];
                let values;
                const valuesCollection = [];
                valuesCollection.push(element.toString());
                if (typeof mainObj[element] === 'number') {
                    values = mainObj[element];
                    valuesCollection.push(parseFloat(values));
                } else {
                    values = (mainObj[element].split(',')).filter(Boolean);
                    for (const iterator of values) {
                        valuesCollection.push(parseFloat(iterator));
                    }
                }
                if (valuesCollection.length === totalportfolios) {
                    this.linedata.push(valuesCollection);
                }
            }
            this.spinner.hide();

        });
    }

    getPlotFundRecommendation() {
        this.service.getBarPlotPerformance(portfolioidSelect).toPromise().then((historicalData: any) => {
            historicalData.forEach(historical => {
                const name = Object.keys(historical);
                const obj = Object.values(historical);
                // tslint:disable-next-line: forin
                for (const n in name) {
                    let barobj = Object.values(obj[n]);
                    barobj.unshift(name[n]);
                    this.bardata.push(barobj);
                }
                // tslint:disable-next-line: forin
                for (let i in obj[1]) {
                    this.barcolumnNames.push(i);
                }
                this.barcolumnNames.unshift('Fund Types');
            });
        });
    }

}
