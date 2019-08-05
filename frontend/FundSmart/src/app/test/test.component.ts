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
    this.setfunds(JSON.parse(localStorage.getItem('securityData')));
  }

  setfunds(fundlist, rerender = false) {
    this.userservice.get_security().toPromise().then(
      datasecuritylist => {
        securitylist.length = 0;
        // tslint:disable-next-line: forin
        for (var obj in datasecuritylist) {
          var securityobj: security = {
            id: -1,
            isin: '',
            name: '',
            ticker: '',
            asset_type: ''
          };
          securityobj.id = datasecuritylist[obj]['id'];
          securityobj.isin = datasecuritylist[obj]['isin'];
          securityobj.name = datasecuritylist[obj]['name'];
          securityobj.ticker = datasecuritylist[obj]['ticker'];
          securityobj.asset_type = datasecuritylist[obj]['asset_type'];
          securitylist.push(securityobj);
        }

        if (fundlist.length > 0) {
          this.funds$.length = 0;
        }
        fundlist.forEach(element => {
          let security = securitylist.find(s => s['id'] === element.securityId);
          console.log(security);
          let singlefund: portfolio_fund = {
            security: security.name,
            security_id: element['securityId'],
            p1record: element['recordId'],
            p2record: element['portfolio_id_2'],
            p3record: element['portfolio_id_3'],
            yourPortfolio: element['portfolio'],
            comparision1: element['COMPARISON1'],
            comparision2: element['COMPARISON2']

          };
          if (element['quantity1'] === null) {
            singlefund.yourPortfolio = '';
          }
          if (element['quantity2'] === null) {
            singlefund.comparision1 = '';
          }
          if (element['quantity3'] === null) {
            singlefund.comparision2 = '';
          }

          this.funds$.push(singlefund);
          // if (rerender) {
          //   this.rerender();
          // } else {
          //   this.dtTrigger.next();
          // }
        });
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
