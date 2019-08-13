import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';



@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
    chart;
    Highcharts = Highcharts;
    chartConstructor = 'chart';
    chartoptions = {
        xAxis: {
            type: 'datetime',
            categories: []
        },
        series: [],
        exporting: {
            enabled: true
        }
    };
    updateFlag = false;
    oneToOneFlag = true;
    runOutsideAngular = false;
    chartCallback;
    public graph = {
        data: [],
        layout: {
            height: 400,
            xaxis: {
                autorange: true,
                rangeslider: { range: [] },
                type: 'date',

            },
            yaxis: {
                autorange: true,
                type: 'linear'
            }
        },
    };

    constructor(private userservice: ServercommunicationService) {
        const self = this;
        this.chartCallback = chart => {
            self.chart = chart;
        };
    }

    ngOnInit() {
        this.getchart();
    }


    getchart() {
        this.userservice.get_lineplot_chart('INR').toPromise().then((jsondata: any) => {
            this.plotly(jsondata);
            this.highchart(jsondata);
        });
    }

    plotly(json) {
        if (json.length > 0) {
            let firstdate = json[0]['label'][0];
            let myseries = [];
            json.forEach(data1 => {
                let element = data1;
                let row = { x: element['label'], y: element['series'], type: 'scatter', mode: 'lines+points', name: element['portfolio'] }
                myseries.push(row);
            });
            this.graph.data = myseries;
            this.graph.layout.xaxis.rangeslider.range = [firstdate, new Date().toString()];
        }
    }


    highchart(json) {
        const self = this, chart = this.chart;
        chart.showLoading();
        let tempArray = [];
        let i = 0;
        let myseries = [];
        json.forEach(data1 => {
            let element = data1;
            let name = data1['portfolio'];
            let data = data1['series'];
            myseries.push({ name: name, data: data });
            i++;
            for (let k = 0; k < element['label'].length; k++) {
                const label = element['label'][k];
                if (tempArray.filter(x => x === label).length === 0) {
                    tempArray.push(moment(label).format('MMM YYYY'));
                }
            }
        });

        setTimeout(() => {
            chart.hideLoading();
            self.chartoptions.series = myseries;
            self.chartoptions.xAxis.categories = tempArray;
            self.updateFlag = true;
        }, 2000);
    }

}
