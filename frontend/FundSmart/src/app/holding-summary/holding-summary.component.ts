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
    data: any;
    linecolumnNames = [];
    lineoptions;
    final = [];

    Portfolio23: HistoricalData = {
        annualexpense: 0,
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    Portfolio256: HistoricalData = {
        annualexpense: 0,
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    total: HistoricalData = {
        annualexpense: 0,
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };

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

    getAssets() {
        this.service.holding_summary_asset(this.id).subscribe(
            (result: any) => {
                for (let i = 0; i < result.length; i++) {
                    const element = result[i];
                    const value = Object.values(element);
                    const name = Object.keys(element);
                    this.result.push({
                        name: name[0],
                        value: value[0]
                    });
                }
            });
    }

    getCountry() {
        this.service.holding_summary_country(this.id).subscribe(
            (country: any) => {
                for (let i = 0; i < country.length; i++) {
                    const element = country[i];
                    const value = Object.values(element);
                    const name = Object.keys(element);
                    this.country.push({
                        name: name[0],
                        value: value[0]
                    })
                }
            });
    }

    getFund() {
        this.service.holding_summary_fund(this.id).subscribe(
            (fund: any) => {
                for (let i = 0; i < fund.length; i++) {
                    const element = fund[i];
                    const value = Object.values(element);
                    const name = Object.keys(element);
                    this.fund.push({
                        name: name[0],
                        value: value[0]
                    })
                }
            });
    }

    getIndustry() {
        this.service.holding_summary_industry(this.id).subscribe(
            (industry: any) => {
                for (let i = 0; i < industry.length; i++) {
                    const element = industry[i];
                    const value = Object.values(element);
                    const name = Object.keys(element);
                    this.industry.push({
                        name: name[0],
                        value: value[0]
                    });
                }
                //  console.log("Indsutr", this.industry);
            });
    }

    getHistoricalPerformance() {
        this.service.holding_summary_historicalPerformance(this.id).subscribe(
            (historical: any) => {
                for (let i = 0; i < historical.length; i++) {

                    const element = historical[i];
                    //        const final = historical.pop();
                    // this.final = final;
                    //      console.log("final@@@",final);
                    //    console.log("historical", this.historical);
                    const value = Object.values(element);
                    const name = Object.keys(element);
                    // console.log("element", element);
                    this.historical.push({
                        name: name[0],
                        value: value[0]
                    });
                }

            });
    }

    getLineGraph() {
        //     this.service.holding_summary_lineGraph(this.id).subscribe(
        //         (jsondata: any) => {
        //             const tempArray = [];
        //             const mainObj = {};
        //             for (let i = 0; i < jsondata.length; i++) {
        //                 const element = jsondata[i];
        //                 for (let k = 0; k < element['label'].length; k++) {
        //                     const label = element['label'];
        //                     if (tempArray.filter(x => x === label).length === 0) {
        //                         tempArray.push(label);
        //                     }
        //                     if (mainObj[label]) {
        //                         mainObj[label] = mainObj[label] + ',' + element.series[k];
        //                     } else {
        //                         mainObj[label] = element.series[k];
        //                     }
        //                 }
        //             }
        //             console.log(tempArray);
        //             for (let i = 0; i < tempArray.length; i++) {
        //                 const element = tempArray[i];
        //                 const values = (mainObj[element]);
        //                 const valuesCollection = [];
        //                 valuesCollection.push(element.toString());
        //                 for (const iterator of values) {
        //                     if (iterator && iterator !== NaN) {
        //                         valuesCollection.push(parseFloat(iterator));
        //                     } else {
        //                         valuesCollection.push(0);
        //                     }
        //                 }
        //                 this.graph.push(valuesCollection);
        //             }
        //             // this.graph = graph;
        //             console.log("Line", this.graph);

        //         });
    }

}
