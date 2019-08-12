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
        },
        colors: [
            '#5ace9f', '#fca622', '#1395b9', '#0e3c54',
            '#cc0000', '#e65c00', '#ecaa39', '#eac843',
            '#a2b86d', '#922b21', '#e74c3c', '#633974',
            '#8e44ad', '#1a5276', '#3498db', '#0e6655',
            '#52be80', '#f4d03f', '#dc7633', '#717d7e',
            '#212f3c'
        ]
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
