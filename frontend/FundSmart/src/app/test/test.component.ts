import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

    constructor(private userservice: ServercommunicationService) { }

    ngOnInit() {
        this.getchart();
    }
    public graph = {
        data: [],
        layout: { width: 1200, height: 400 },
        xaxis: {
          //  autorange: true,
        //    rangeslider: { range: ['2016-02-17', '2019-08-09'] },
            type: 'date',
        
        },
        yaxis: {
           // autorange: true,
            type: 'linear'
        }
    };

    getchart() {
        this.userservice.get_lineplot_chart('INR').toPromise().then((jsondata: any) => {
            this.linegraph(jsondata);
        });
    }

    linegraph(json) {
        // const self = this, chart = this.chart;
        // chart.showLoading();
        let tempArray = [];
        let i = 0;
        let myseries = [];
        json.forEach(data1 => {
            // console.log(data);
            let element = data1;
            // let name = data1['portfolio'];
            // let data = data1['series'];
            // let mtype = 'line';

            let row = { x: element['label'], y: element['series'], type: 'scatter', mode: 'lines+points', name: element['portfolio'] }
            myseries.push(row);
            console.log(row);

            // for (let k = 0; k < element['label'].length; k++) {
            //   const label = element['label'][k];
            //   if (tempArray.filter(x => x === label).length === 0) {
            //     // console.log('string datee',label.toDateString());
            //     tempArray.push(label);
            //   }
            // }
        });
        this.graph.data = myseries;
    }

}
