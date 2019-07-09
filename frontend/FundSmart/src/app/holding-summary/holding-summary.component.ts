import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ActivatedRoute, Params } from '@angular/router';
import { HistoricalData } from '../historicaldata';

@Component({
    selector: 'app-holding-summary',
    templateUrl: './holding-summary.component.html',
    styleUrls: ['./holding-summary.component.css']
})
export class HoldingSummaryComponent implements OnInit {

    id: any;
    result: any = [];
    historical: any = [];
    fund: any = [];
    country: any = [];
    industry: any = [];
    graph = [];
    linedata = [];
    linetype = 'LineChart';


    linecolumnNames = [];
    lineoptions;
    total = {};
    total1 = {};
    total2 = {};
    total3 = {};
    total4 = {};
    total5 = {};

    constructor(
        private service: ServercommunicationService,
        private activatedRoute: ActivatedRoute
    ) {
        this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
            this.id = queryParams.params.id;
        });
    }

    ngOnInit() {
        this.getAssets();
        this.getHistoricalPerformance();
        this.getFund();
        this.getCountry();
        this.getIndustry();
        this.getLineGraph();
    }

    getFund() {
        this.service.holding_summary_fund(this.id).subscribe((fundData: any) => {
            fundData.forEach(fund => {
                const names = Object.keys(fund);
                const FundObj = {
                    name: names[0],
                    value: fund[names[0]]
                }
                if (names[0] !== 'Total') {
                    this.fund.push(FundObj);
                } else {
                    this.total = FundObj;
                }
            });
        });
    }

    getAssets() {
        this.service.holding_summary_asset(this.id).subscribe((resultData: any) => {
            resultData.forEach(result => {
                const names = Object.keys(result);
                const ResultObj = {
                    name: names[0],
                    value: result[names[0]]
                }
                if (names[0] !== 'Total') {
                    this.result.push(ResultObj);
                } else {
                    this.total1 = ResultObj;
                }
            });
        });
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
        this.service.holding_summary_industry(this.id).subscribe((industryData: any) => {
            industryData.forEach(industry => {
                const names = Object.keys(industry);
                const industryObj = {
                    name: names[0],
                    value: industry[names[0]]
                }
                if (names[0] !== 'Total') {
                    this.industry.push(industryObj);
                } else {
                    this.total3 = industryObj;
                }
            });
        });
    }

    getHistoricalPerformance() {
        this.service.holding_summary_historicalPerformance(this.id).subscribe((historicalData: any) => {
            historicalData.forEach(historical => {
                const names = Object.keys(historical);
                const historicalObj = {
                    name: names[0],
                    value: historical[names[0]]
                }
                if (names[0] !== 'Total') {
                    this.historical.push(historicalObj);
                } else {
                    this.total4 = historicalObj;
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
                            // debugger
                            if (mainObj[label] || mainObj[label] === 0) {
                                mainObj[label] = mainObj[label] + ',' + ((element.series[k]) ? element.series[k] : 0);
                            } else {
                                mainObj[label] = (element.series[k]) ? element.series[k] : 0;
                            }
                        }
                    }
                    for (let i = 0; i < tempArray.length; i++) {
                        const element = tempArray[i]; // let me check
                        const values = (mainObj[element].split(',')).filter(Boolean);
                        // const values = (mainObj[element]);
                        const valuesCollection = [];
                        valuesCollection.push(element);
                        for (const iterator of values) {
                            valuesCollection.push(parseFloat(iterator));
                        }
                        this.linedata.push(valuesCollection);
                    }
                    // // debugger;
                    console.log("Line", this.linedata);

                }
                this.lineoptions = {
                    pointSize: 5,
                    curveType: 'function',
                };

            }
        )
    }
}
