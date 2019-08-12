import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import * as Highcharts from 'highcharts';


@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
    chart;
    Highcharts = Highcharts; // required
    chartConstructor = 'chart'; // optional string, defaults to 'chart'
    chartoptions = {
        xAxis: {
            categories: []
        },
        series: [],
        exporting: {
            enabled: true
        }
    };
    updateFlag = false; // optional boolean
    oneToOneFlag = true; // optional boolean, defaults to false
    runOutsideAngular = false;
    chartCallback;
    public graph = {
        data: [],
        layout: {
            width: 1200,
            height: 400,
            xaxis: {
                autorange: true,
                // range: ['2016-02-17', '2019-08-09'],
                //  autorange: true,
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
            this.linegraph(jsondata);
            this.linegraph2(jsondata);
        });
    }

    linegraph(json) {
        // const self = this, chart = this.chart;
        // chart.showLoading();
        if (json.length > 0) {
            let firstdate = json[0]['label'][0];
            // let tempArray = [];
            // let i = 0;
            let myseries = [];
            json.forEach(data1 => {
                // console.log(data);
                let element = data1;
                // let name = data1['portfolio'];
                // let data = data1['series'];
                // let mtype = 'line';


                let row = { x: element['label'], y: element['series'], type: 'scatter', mode: 'lines+points', name: element['portfolio'] }
                myseries.push(row);
                // console.log(row);

                // for (let k = 0; k < element['label'].length; k++) {
                //   const label = element['label'][k];
                //   if (tempArray.filter(x => x === label).length === 0) {
                //     // console.log('string datee',label.toDateString());
                //     tempArray.push(label);
                //   }
                // }
            });
            this.graph.data = myseries;
            this.graph.layout.xaxis.rangeslider.range = [firstdate, new Date().toString()];
        }
    }


    linegraph2(json) {
        const self = this, chart = this.chart;
        chart.showLoading();
        let tempArray = [];
        let i = 0;
        let myseries = [];
        json.forEach(data1 => {
            // console.log(data);
            let element = data1;
            let name = data1['portfolio'];
            let data = data1['series'];
            let mtype = 'line';
            myseries.push({ name: name, data: data, type: mtype });
            i++;
            for (let k = 0; k < element['label'].length; k++) {
                const label = element['label'][k];
                if (tempArray.filter(x => x === label).length === 0) {
                    // console.log('string datee',label.toDateString());

                    // console.log('date', new Date(label).getMonth())

                    tempArray.push(label);
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
