import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { Router } from '@angular/router';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { ToastrService } from 'ngx-toastr';
import { portfolioidSelect } from '../fund/portfolioid_select';

@Component({
    selector: 'app-holding-summary',
    templateUrl: './holding-summary.component.html',
    styleUrls: ['./holding-summary.component.css']
})
export class HoldingSummaryComponent implements OnInit {

    id = [];
    result: any = [];
    historical: any = [];
    fund: any = [];
    country: any = [];
    industry: any = [];
    graph = [];
    linedata = [];
    linetype = 'LineChart';
    linetitle = '';
    linewidth = 450;
    lineheight = 300;
    linecolumnNames = [];
    lineoptions = {
        pointSize: 5,
        curveType: 'function',
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],
    };
    total = {};
    total1 = {};
    total2 = {};
    total3 = {};
    total4 = [];
    colors = ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'];

    bartitle_fund = 'Bar Chart';
    bardata_fund = [];
    barwidth_fund = 600;
    barheight_fund = 400;
    bartype_fund = 'BarChart';
    baroptions_fund = {
        legend: { position: "none" },
        bar: { groupWidth: '25%' },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],
        enableInteractivity: true,
    };
    barcolumnname = [];

    industry_bartitle_fund = 'Bar Chart';
    industry_bardata_fund = [];
    industry_barwidth_fund = 600;
    industry_barheight_fund = 400;
    industry_bartype_fund = 'BarChart';
    industry_baroptions_fund = {
        legend: { position: "none" },
        bar: { groupWidth: '25%' },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],
        enableInteractivity: true,
    };
    industryColumns = [];

    assets_bartitle_fund = 'Bar Chart';
    assets_bardata_fund = [];
    assets_barwidth_fund = 600;
    assets_barheight_fund = 400;
    assets_bartype_fund = 'BarChart';
    assets_columnNames = [];
    assets_baroptions_fund = {
        legend: { position: "none" },
        bar: { groupWidth: '25%' },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],
        interpolateNulls: true,
        enableInteractivity: true,
    };

    country_data = [];
    country_type = 'GeoChart';
    country_columnNames = [];

    country_options = {
        legend: 'none',
        // datalessRegionColor: '#898989',
        colorAxis: { colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'] },

    };
    constructor(
        private interconn: IntercomponentCommunicationService,
        private service: ServercommunicationService,
        private route: Router,
        private toastr: ToastrService
    ) {
        this.interconn.componentMethodCalled$.toPromise().then(
            () => {
                if (portfolioidSelect.length > 0) {
                    this.getHistoricalPerformance();
                    this.getFund();
                    // this.getCountry();
                    this.getLineGraph();
                } else {
                    this.toastr.info('Please select portfolio id/ids from Fund page', 'Information');
                }
            });
        this.interconn.logoutcomponentMethodCalled$.toPromise().then(
            () => {
                this.route.navigate(['/home']);
            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod("Holding Summary");
        if (this.service.currentuser && this.bardata_fund.length === 0) {
            if (portfolioidSelect.length > 0) {
                this.getHistoricalPerformance();
                this.getFund();
                // this.getCountry();
                this.getLineGraph();
            } else {
                this.toastr.info('Please select portfolio id/ids from Fund page', 'Information');
            }
        }
    }

    getFund() {
        if (portfolioidSelect.length > 0) {
            if (this.bardata_fund.length === 0) {
                this.service.holding_summary_fund(portfolioidSelect).toPromise().then((fundData: any) => {
                    let i = 0;
                    let names: any;
                    fundData.forEach(fund => {
                        names = Object.keys(fund);
                        const FundObj = {
                            name: names[0],
                            value: fund[names[0]]
                        }
                        if (names[0] !== 'Total') {
                            this.bardata_fund.push([names[0], fund[names[0]], `color:${this.colors[i]}`]);
                            this.fund.push(FundObj);
                            i++;
                        } else {
                            this.total = FundObj;
                        }
                    });
                    this.barcolumnname = ['Fund', 'value', { role: 'style' }];
                });
            }
        }
    }

    getAssets() {
        if (portfolioidSelect.length > 0) {

            if (this.assets_bardata_fund.length === 0) {
                this.service.holding_summary_asset(portfolioidSelect).toPromise().then((resultData: any) => {
                    let i = 0;
                    resultData.forEach(result => {
                        const names = Object.keys(result);
                        const ResultObj = {
                            name: names[0],
                            value: result[names[0]]
                        };
                        if (names[0] !== 'Total') {
                            this.assets_bardata_fund.push([names[0], result[names[0]], `color:${this.colors[i]}`]);
                            this.result.push(ResultObj);
                            i++;
                        } else {
                            this.total1 = ResultObj;
                        }
                    });
                });
                this.assets_columnNames = ['Fund', 'value', { role: 'style' }];
            }
        }
    }

    getCountry() {
        if (portfolioidSelect.length > 0) {
            if (this.country_data.length === 0) {
                this.service.holding_summary_country(portfolioidSelect).toPromise().then((countryData: any) => {
                    countryData.forEach(country => {
                        const names = Object.keys(country);
                        const CountryObj = {
                            name: names[0],
                            value: country[names[0]]
                        }
                        if (names[0] !== 'Total') {
                            this.country_data.push([names[0], country[names[0]]]);
                        } else {
                            this.total2 = CountryObj;
                        }
                    });
                });
                this.country_columnNames = ['Country', 'Market Value'];
            }
        }
    }

    getIndustry() {
        if (portfolioidSelect.length > 0) {

            if (this.industry_bardata_fund.length === 0) {
                this.service.holding_summary_industry(portfolioidSelect).toPromise().then((industryData: any) => {
                    let i = 0;
                    industryData.forEach(industry => {
                        const names = Object.keys(industry);
                        const industryObj = {
                            name: names[0],
                            value: industry[names[0]]
                        };
                        if (names[0] !== 'Total') {
                            this.industry_bardata_fund.push([names[0], industry[names[0]], `color:${this.colors[i]}`]);
                            this.industry.push(industryObj);
                            i++;
                        } else {
                            this.total3 = industryObj;
                        }
                    });
                    this.industryColumns = ['Type', 'Total', { role: 'style' }];
                });
            }
        }
    }

    getHistoricalPerformance() {
        this.service.holding_summary_historicalPerformance(portfolioidSelect).toPromise().then((historicalData: any) => {
            historicalData.forEach(historical => {
                const names = Object.keys(historical);
                for (let a in historical[names[0]]) {
                    if (historical[names[0]][a] !== null) {
                        historical[names[0]][a] = Number.parseFloat(historical[names[0]][a]).toFixed(4) + '%';
                    }
                }
                const historicalObj = {
                    name: names[0],
                    value: historical[names[0]]
                };
                if (names[0] !== 'Total') {
                    this.historical.push(historicalObj);
                } else {
                    this.total4.push(historicalObj);
                }
            });
        });
    }

    getLineGraph() {
        this.service.holding_summary_lineGraph(portfolioidSelect).toPromise().then(
            (jsondata: any) => {
                this.linedata = [];
                this.linecolumnNames = ['label'];
                const tempArray = [];
                const mainObj = {};
                if (this.linedata == []) {
                    this.linedata.push(['No data copy', 0, 0]);
                } else {
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
                    }
                    for (let i = 0; i < tempArray.length; i++) {
                        const element = tempArray[i];
                        const values = (mainObj[element].split(',')).filter(Boolean);
                        const valuesCollection = [];
                        valuesCollection.push(element);
                        for (const iterator of values) {
                            valuesCollection.push(parseFloat(iterator));
                        }
                        this.linedata.push(valuesCollection);
                    }
                }
            });
    }

}
