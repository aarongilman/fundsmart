import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HistoricalData } from '../historicaldata';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';

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
    // linetitle = 'Portfolio value over time';
    linewidth = 450;
    lineheight = 300;
    linecolumnNames = [];
    lineoptions;
    total = {};
    total1 = {};
    total2 = {};
    total3 = {};
    total4 = [];
    colors = ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'];

    // holding type
    bartitle_fund = 'Bar Chart';
    bardata_fund = [];
    barwidth_fund = 600;
    barheight_fund = 400;
    bartype_fund = 'BarChart';
    baroptions_fund = {
        legend: { position: "none" },
        bar: { groupWidth: '25%' },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'],
        // animation: {
        //     duration: 10000,
        //     easing: 'out'
        // },
        enableInteractivity: true,
    };
    barcolumnname = [];

    // industry graph
    industry_bartitle_fund = 'Bar Chart';
    industry_bardata_fund = [];
    industry_barwidth_fund = 600;
    industry_barheight_fund = 400;
    industry_bartype_fund = 'BarChart';
    industry_baroptions_fund = {
        legend: { position: "none" },
        bar: { groupWidth: '25%' },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'],
        // animation: {
        //     duration: 10000,
        //     easing: 'out'
        // },
        enableInteractivity: true,
    };
    industryColumns = [];


    // Assets classes
    assets_bartitle_fund = 'Bar Chart';
    assets_bardata_fund = [];
    assets_barwidth_fund = 600;
    assets_barheight_fund = 400;
    assets_bartype_fund = 'BarChart';
    assets_columnNames = [];
    assets_baroptions_fund = {
        legend: { position: "none" },
        bar: { groupWidth: '25%' },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'],
        // animation: {
        //     duration: 10000,
        //     easing: 'out'
        // },
        interpolateNulls: true,
        enableInteractivity: true,
    };


    constructor(
        private interconn: IntercomponentCommunicationService,
        private service: ServercommunicationService,
        private activatedRoute: ActivatedRoute,
        private route: Router
    ) {
        this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
            this.id = queryParams.params.id;
        });

        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
                    if (queryParams.params.id) {
                        this.getHistoricalPerformance();
                        this.getFund();
                        this.getCountry();
                        this.getLineGraph();
                    } else {
                        this.getHistoricalPerformancewithoutpid();
                        this.getCountrywithoutpid();
                        this.getfundswithoutpid();
                        this.getLineGraphwithoutpid();

                    }

                });
            }
        );
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.route.navigate(['/home']);
            }
        );

    }

    ngOnInit() {
        this.interconn.titleSettermethod("Holding Summary");
        if (this.service.currentuser && this.bardata_fund.length === 0) {
            if (this.id) {
                this.getHistoricalPerformance();
                this.getFund();
                this.getCountry();
                this.getLineGraph();
            } else {
                this.getHistoricalPerformancewithoutpid();
                this.getCountrywithoutpid();
                this.getfundswithoutpid();
                this.getLineGraphwithoutpid();
            }
        }
    }



    getFund() {
        if (this.bardata_fund.length === 0) {
            console.log(this.bardata_fund);
            this.service.holding_summary_fund(this.id).subscribe((fundData: any) => {
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
                    // console.log(this.bardata_fund);

                });

                this.barcolumnname = ['Fund', 'value', { role: 'style' }];
            });
        }
    }

    getAssets() {
        if (this.assets_bardata_fund.length === 0) {
            this.service.holding_summary_asset(this.id).subscribe((resultData: any) => {
                // console.log(resultData);
                let i = 0;
                resultData.forEach(result => {
                    // console.log("result", result);

                    const names = Object.keys(result);
                    const ResultObj = {
                        name: names[0],
                        value: result[names[0]]
                    };
                    // console.log(names[0]);
                    if (names[0] !== 'Total') {
                        this.assets_bardata_fund.push([names[0], result[names[0]], `color:${this.colors[i]}`]);
                        this.result.push(ResultObj);
                        // console.log();

                        i++;
                    } else {
                        this.total1 = ResultObj;
                    }

                });
            });
            // console.log("assets data", this.assets_bardata_fund);
            this.assets_columnNames = ['Fund', 'value', { role: 'style' }];
        }
    }

    getCountry() {
        this.service.holding_summary_country(this.id).subscribe((countryData: any) => {
            countryData.forEach(country => {
                const names = Object.keys(country);
                const CountryObj = {
                    name: names[0],
                    value: country[names[0]]
                }
                if (names[0] !== 'Total') {
                    this.country.push(CountryObj);
                } else {
                    this.total2 = CountryObj;
                }
            });
        });
    }

    getIndustry() {
        if (this.industry_bardata_fund.length === 0) {
            this.service.holding_summary_industry(this.id).subscribe((industryData: any) => {
                let i = 0;
                industryData.forEach(industry => {
                    const names = Object.keys(industry);
                    const industryObj = {
                        name: names[0],
                        value: industry[names[0]]
                    };
                    // console.log(names[0]);

                    if (names[0] !== 'Total') {
                        this.industry_bardata_fund.push([names[0], industry[names[0]], `color:${this.colors[i]}`]);
                        this.industry.push(industryObj);
                        i++;
                    } else {
                        this.total3 = industryObj;
                    }

                });
                console.log(this.industry_bardata_fund);

                this.industryColumns = ['Type', 'Total', { role: 'style' }];
            });

        }
    }

    getHistoricalPerformance() {
        this.service.holding_summary_historicalPerformance(this.id).subscribe((historicalData: any) => {
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
        this.service.holding_summary_lineGraph(this.id).subscribe(
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
                this.lineoptions = {
                    pointSize: 5,
                    curveType: 'function',
                    colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'],

                };
            });
    }



    getHistoricalPerformancewithoutpid() {
        this.service.get('api/historical_performance_holding_summary/').subscribe((historicalData: any) => {
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
                    // console.log("historical perfomance", historicalObj);

                    this.historical.push(historicalObj);
                } else {
                    this.total4.push(historicalObj);
                }
            });
        });
    }

    getfundswithoutpid() {
        if (this.bardata_fund.length === 0) {
            this.service.get('api/fund_holding_summary/').subscribe((fundData: any) => {
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
                    // console.log(this.bardata_fund);

                });

                this.barcolumnname = ['Fund', 'value', { role: 'style' }];
            });
        }
    }

    getAssetswithoutpid() {
        if (this.assets_bardata_fund.length === 0) {
            this.service.get('api/asset_class_holding_summary/').subscribe((resultData: any) => {
                // console.log(resultData);
                let i = 0;
                resultData.forEach(result => {
                    // console.log("result", result);

                    const names = Object.keys(result);
                    const ResultObj = {
                        name: names[0],
                        value: result[names[0]]
                    };
                    // console.log(names[0]);
                    if (names[0] !== 'Total') {
                        this.assets_bardata_fund.push([names[0], result[names[0]], `color:${this.colors[i]}`]);
                        this.result.push(ResultObj);
                        // console.log();

                        i++;
                    } else {
                        this.total1 = ResultObj;
                    }

                });
            });
            // console.log("assets data", this.assets_bardata_fund);
            this.assets_columnNames = ['Fund', 'value', { role: 'style' }];
        }
    }

    getIndustrywithoutpid() {
        if (this.industry_bardata_fund.length === 0) {
            this.service.get('api/industry_holding_summary/').subscribe((industryData: any) => {
                let i = 0;
                industryData.forEach(industry => {
                    const names = Object.keys(industry);
                    const industryObj = {
                        name: names[0],
                        value: industry[names[0]]
                    };
                    // console.log(names[0]);

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

    getLineGraphwithoutpid() {
        this.service.get('api/line_graph_holding_summary/').subscribe(
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
                this.lineoptions = {
                    pointSize: 5,
                    curveType: 'function',
                    colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'],

                };
            });
    }

    getCountrywithoutpid() {
        this.service.get('api/country_holding_summary/').subscribe((countryData: any) => {
            countryData.forEach(country => {
                const names = Object.keys(country);
                const CountryObj = {
                    name: names[0],
                    value: country[names[0]]
                }
                if (names[0] !== 'Total') {
                    this.country.push(CountryObj);
                } else {
                    this.total2 = CountryObj;
                }
            });
        });
    }

}
