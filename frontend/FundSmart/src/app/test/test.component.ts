import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import { DataTableDirective } from 'angular-datatables';
import { portfolio_fund } from '../portfolio_fund';
import { securitylist } from '../securitylist';
import { security } from '../security';
import { ServercommunicationService } from '../servercommunication.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();
  securitylist = securitylist;
  linetitle = '';
  linedata = [];
  lineoptions;
  linewidth = 700;
  lineheight = 450;
  linetype = 'LineChart';
  linecolumnNames = [];

  funds$ = [{
    security: '',
    security_id: -1,
    p1record: null,
    p2record: null,
    p3record: null,
    yourPortfolio: '',
    comparision1: '',
    comparision2: ''
  }];
  constructor(private userservice: ServercommunicationService) {

  }

  ngOnInit() {
    // this.setfunds(JSON.parse(localStorage.getItem('securityData')));
    this.getline()
  }

  // setfunds(fundlist, rerender = false) {
  //   this.userservice.get_security().toPromise().then(
  //     datasecuritylist => {
  //       securitylist.length = 0;
  //       // tslint:disable-next-line: forin
  //       for (var obj in datasecuritylist) {
  //         var securityobj: security = {
  //           id: -1,
  //           isin: '',
  //           name: '',
  //           ticker: '',
  //           asset_type: ''
  //         };
  //         securityobj.id = datasecuritylist[obj]['id'];
  //         securityobj.isin = datasecuritylist[obj]['isin'];
  //         securityobj.name = datasecuritylist[obj]['name'];
  //         securityobj.ticker = datasecuritylist[obj]['ticker'];
  //         securityobj.asset_type = datasecuritylist[obj]['asset_type'];
  //         securitylist.push(securityobj);
  //       }

  //       if (fundlist.length > 0) {
  //         this.funds$.length = 0;
  //       }
  //       fundlist.forEach(element => {
  //         let security = securitylist.find(s => s['id'] === element.securityId);
  //         console.log(security);
  //         let singlefund: portfolio_fund = {
  //           security: security.name,
  //           security_id: element['securityId'],
  //           p1record: element['recordId'],
  //           p2record: element['portfolio_id_2'],
  //           p3record: element['portfolio_id_3'],
  //           yourPortfolio: element['portfolio'],
  //           comparision1: element['COMPARISON1'],
  //           comparision2: element['COMPARISON2']

  //         };
  //         if (element['quantity1'] === null) {
  //           singlefund.yourPortfolio = '';
  //         }
  //         if (element['quantity2'] === null) {
  //           singlefund.comparision1 = '';
  //         }
  //         if (element['quantity3'] === null) {
  //           singlefund.comparision2 = '';
  //         }

  //         this.funds$.push(singlefund);
  //         // if (rerender) {
  //         //   this.rerender();
  //         // } else {
  //         //   this.dtTrigger.next();
  //         // }
  //       });
  //     });
  // }

  getline() {
    this.userservice.get_lineplot_chart().subscribe((jsondata: any) => {
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
            if (mainObj[label]) {
              mainObj[label] = mainObj[label] + ',' + element.series[k];
            } else {
              mainObj[label] = element.series[k];
            }
          }
        }
        for (let i = 0; i < tempArray.length; i++) {
          const element = tempArray[i];
          const values = (mainObj[element].split(',')).filter(Boolean);
          const valuesCollection = [];
          valuesCollection.push(element.toString());
          for (const iterator of values) {
            valuesCollection.push(parseFloat(iterator));
          }
          this.linedata.push(valuesCollection);
        }
      }

      this.lineoptions = {
        pointSize: 1,
        curveType: 'function',
        tooltips: {
          mode: 'index'
        },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],
      };
    });
  }
  // rerender(): void {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     dtInstance.destroy();
  //     this.dtTrigger.next();
  //   });
  // }

  // ngOnDestroy(): void {
  //   // Do not forget to unsubscribe the event
  //   this.dtTrigger.unsubscribe();
  // }

}
