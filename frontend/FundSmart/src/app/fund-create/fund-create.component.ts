import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { NgbModal, ModalDismissReasons, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { security } from '../security';
import * as $ from 'jquery';
import { DecimalPipe } from '@angular/common';
import { GetfileforuploadService } from '../getfileforupload.service';
import { apiresultfundlist } from '../apiresult_fundlist';
import { funds } from '../funds';
import { FundcreatesortService } from '../fundcreatesort.service';
import { SortEvent, SortableDirective } from '../sortable.directive';
import { securitylist } from '../securitylist';
@Component({
  selector: 'app-fund-create',
  templateUrl: './fund-create.component.html',
  styleUrls: ['./fund-create.component.css'],
  providers: [FundcreatesortService, DecimalPipe]
})
export class FundCreateComponent implements OnInit {
  currentUser: any;
  fundlist = [];
  total = 0;
  securitylist = securitylist;
  securityinput: string[] = [];
  lastkeydown1: number = 0;
  closeResult: string;
  showdetail_flag = false;
  files: any = [];
  // maxdate = (date:NgbDate, current: {month:number})

  portfolio1: any;
  comparision1: any;
  comparision2: any;
  selectedp: any;
  selectedDate: any;

  @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
  constructor(private modalService: NgbModal, private fileupload: GetfileforuploadService,
    private userservice: ServercommunicationService,
    private interconn: IntercomponentCommunicationService,
    public fundservice: FundcreatesortService) {

    this.interconn.componentMethodCalled$.subscribe(
      () => {
        // alert("In first method");
        this.setcurrent_user();
        this.getUserPortfolios();
        // this.getfunds();
      });
    // alert(this.currentUser.name);

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        this.resetfunds();
        this.portfolio1 = undefined;
        this.comparision1 = undefined;
        this.comparision2 = undefined;
      });
  }

  ngOnInit() {
    this.interconn.titleSettermethod("Create Fund");
    this.getUserPortfolios();
    this.userservice.get_security().subscribe(
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
        // console.log(securitylist);
      }
    );

    this.setcurrent_user();
    if (this.userservice.currentuser !== null) {
      apiresultfundlist.length = 0;
      this.getfunds();

    }
  }

  setcurrent_user() {
    this.currentUser = this.userservice.currentuser;
  }

  setfunds(data) {
    apiresultfundlist.length = 0;
    // console.log(data['results']);
    for (var i = 0; i < data['results'].length; i++) {
      // console.log(data['results'][i]);
      var fund: funds = {
        id: -1,
        quantity: null,
        portfolio: 0,
        security: 0,
        security_name: '',
        asset_type: '',
        isin: '',
        price: ''
      };
      fund = data['results'][i];
      apiresultfundlist.push(fund);
    }
    // console.log(apiresultfundlist);
    this.fundservice.resetfunds();
    this.fundservice.funds$.subscribe(
      fundlist => {
        this.fundlist = fundlist;
      });
    this.fundservice.total$.subscribe(
      total => {
        this.total = total;
      });

  }

  getfunds() {
    this.userservice.get_portfolio_fund().subscribe(
      data => {
        if (data['count'] > 0) {
          this.setfunds(data);
        }
      });
  }

  onDateSelect($event) {
    var date;
    // console.log("type of month is ", typeof(this.selectedDate.month));
    if (this.selectedDate.month < 10) {
      date = this.selectedDate.year + '-0' + this.selectedDate.month + '-' + this.selectedDate.day;
    } else {
      date = this.selectedDate.year + '-' + this.selectedDate.month + '-' + this.selectedDate.day;
    }
    // console.log(this.selectedDate, date);
    this.userservice.get_portfolio_fund_by_date(date).subscribe(
      data => {
        if (data['count'] > 0) {
          console.log(data);
          
          this.setfunds(data);
        }
      });
  }

  setrowdata(fund, name) {
    // console.log(name);
    var sec: security;
    sec = securitylist.find(x => x.name === name);
    // console.log("Security is", sec);
    // console.log(sec.id);

    fund.security = sec.id;
    fund.asset_type = sec.asset_type;
    fund.isin = sec.isin;
    fund.security_name = sec.name;
    // fund.security = name;

  }


  updatefundquantity(item) {
    if (item.id === -1) {
      this.userservice.add_portfolio_fund(item.quantity, item.portfolio, item.security, this.currentUser['id']).subscribe(
        data => {
          let resfund = this.fundlist.find(x => x === item);
          let index = this.fundlist.indexOf(resfund);
          apiresultfundlist[index]['id'] = data['id'];
          apiresultfundlist[index]['quantity'] = data['quantity'];
          apiresultfundlist[index]['portfolio'] = data['portfolio'];
          apiresultfundlist[index]['security'] = data['security'];
          apiresultfundlist[index]['security_name'] = data['security_name'];
          apiresultfundlist[index]['asset_type'] = data['asset_type'];
          apiresultfundlist[index]['isin'] = data['isin'];
          apiresultfundlist[index]['price'] = data['price'];

          console.log("After setting data", apiresultfundlist[index]);
        }
      );
    } else {
      this.userservice.updateportfoliofund(item.id, item.quantity, item.portfolio, item.security, this.currentUser['id']).subscribe();
    }
  }

  getUserPortfolios() {
    this.userservice.getUserPortfolio().subscribe(
      data => {
        this.portfolio1 = data['results']['0'];
        this.comparision1 = data['results']['1'];
        this.comparision2 = data['results']['2'];
      });
  }

  updateprice(fund) {
    // console.log(fund);
    this.userservice.postPrice(fund.id, fund.price).subscribe(data => {
      // console.log("Update price",data);
      let resfund = this.fundlist.find(x => x === fund);
      let index = this.fundlist.indexOf(resfund);

      apiresultfundlist[index]['price'] = data['current_price'];

      // console.log("After setting data", apiresultfundlist[index]);

    });
  }

  addRow() {
    // alert(this.selectedp);
    const singlefund: funds = {
      id: -1,
      quantity: null,
      portfolio: this.selectedp,
      security: 0,
      security_name: '',
      asset_type: '',
      isin: '',
      price: ''
    };
    apiresultfundlist.unshift(singlefund);
    this.fundservice.resetfunds();
    this.fundservice.funds$.subscribe(list => {
      this.fundlist = list;
    });
    this.fundservice.total$.subscribe(total => {
      this.total = total;
    });

  }


  resetfunds() {
    apiresultfundlist.length = 0;
    for (var i = 0; i < 10; i++) {
      apiresultfundlist.push({
        id: -1,
        quantity: 0,
        portfolio: -1,
        security: -1,
        security_name: '',
        asset_type: '',
        isin: '',
        price: ''
      });
    }
    this.fundservice.resetfunds();
    this.fundservice.funds$.subscribe(
      fundlist => {
        this.fundlist = fundlist;
      });
    this.fundservice.total$.subscribe(
      total => {
        this.total = total;
      });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  searchsecurity($event) {
    // console.log(securitylist);
    // console.log(this.securityinput);
    var securityList1 = [];
    if (this.securityinput.length > 1) {
      if ($event.timeStamp - this.lastkeydown1 > 200) {
        securityList1 = this.searchFromArray(securitylist, this.securityinput);

      }
      // // console.log(securityList1);
    }
  }

  searchFromArray(arr, regex) {
    let matches = [];
    let i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].name.match(regex)) {
        matches.push(arr[i]);
      }
      if (arr[i].isin.match(regex)) {
        matches.push(arr[i]);
      }
      if (arr[i].asset_type.match(regex)) {
        matches.push(arr[i]);
      }
      if (arr[i].ticker != null) {
        if (arr[i].ticker.match(regex)) {
          matches.push(arr[i]);
        }
      }
    }
    // console.log(matches);
    return matches;
  }


  getDismissReason(reason: any): string {
    this.showdetail_flag = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  resetpass_modal() {
    // alert('click on forget password');
    $(".forgot-password-wrap").addClass("show-forgot");
    $(".login-content").addClass("hide-login");
  }



  uploadFile(event) {
    // alert('upload file event');
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element.name);
      // console.log(element);

      const formData = new FormData();
      formData.append('data_file', element);
      this.userservice.uploadfile(formData).subscribe(
        res => {
          // console.log(res);
          this.getfunds();
        },
        error => {
          // console.log(error);
        }
      );
      this.modalService.dismissAll('Log in Done');
    }
  }

  openmodal(modalid, str) {
    // alert("type of modal is" + typeof(modalid));
    var addclass = '';
    if (str == 'select portfolio' || str == 'register') {
      addclass = 'long-pop sign-pop';
    }
    this.modalService.open(modalid, { centered: true, windowClass: addclass }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  dropboxupload() {
    this.fileupload.getUserInfo();
  }

  onedrivefileupload() {
  }

  drive_fileupload() {
    // alert('abc');
    this.fileupload.onApiLoad();
    this.modalService.dismissAll('File upload');
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.fundservice.sortColumn = column;
    this.fundservice.sortDirection = direction;
  }

}
