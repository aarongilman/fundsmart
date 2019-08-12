import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'app-pietest',
    templateUrl: './pietest.component.html',
    styleUrls: ['./pietest.component.css']
})
export class PietestComponent implements OnInit {
    chart;
    Highcharts = Highcharts;
    chartConstructor = 'chart';
    currency = "INR";
    chartCallback;
    oneToOneFlag = true;
    donutdata = [];
    updateFlag = false;
    jsondata;

    chartoptions = {
        series: [],
        exporting: {
            enabled: true
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                innerSize: '50%',
                dataLabels: {
                    enabled: true,
                }
            }
        },
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
        }
    };

    constructor(
        private userservice: ServercommunicationService,
    ) {
        const self = this;
        this.chartCallback = chart => {
            self.chart = chart;
        };
    }

    ngOnInit() {
        this.jsondata1();
    }

    jsondata1() {
        this.userservice.get_deshboard_doughnut_chart('INR').toPromise().then((jsondata: any) => {
            this.donutdataDetails(jsondata);
        });
    }

    donutdataDetails(json) {
        const self = this, chart = this.chart;
        chart.showLoading();
        let arrData = [];
        let arrvalue = [];

        Object.keys(json).forEach((element) => {
            arrData = Object.keys(json[element]);
            arrvalue = Object.values(json[element]);
            arrData.forEach((key, value) => {
                this.donutdata.push([key, arrvalue[value]]);
            });
        });

        setTimeout(() => {
            let series = [{
                type: 'pie',
                name: 'Market Value',
                colorByPoint: true,
                data: this.donutdata
            }]
            chart.hideLoading();
            self.chartoptions.series = series;
            self.updateFlag = true;
        }, 2000);
    }

}
