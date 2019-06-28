import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { security } from '../security';
import * as $ from 'jquery';
import { DecimalPipe } from '@angular/common';
import { GetfileforuploadService } from '../getfileforupload.service';
import { apiresultfundlist } from '../apiresult_fundlist';
import { funds } from '../funds';
import { FundcreatesortService } from '../fundcreatesort.service';
import { SortEvent, SortableDirective } from '../sortable.directive';
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
  securitylist: security[] = [];
  securityinput: string[] = [];
  lastkeydown1: number = 0;
  closeResult: string;
  showdetail_flag = false;
  files: any = [];

  @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
  constructor(private modalService: NgbModal, private fileupload: GetfileforuploadService,
    private userservice: ServercommunicationService,
    private interconn: IntercomponentCommunicationService,
    private fundservice: FundcreatesortService) {

    this.interconn.componentMethodCalled$.subscribe(
      () => {
        // alert("In first method");
        this.setcurrent_user();
        // this.getfunds();
      });
    // alert(this.currentUser.name);

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        this.resetfunds();
      });
  }

  ngOnInit() {

    this.setcurrent_user();
    if (this.userservice.currentuser !== null) {
      this.getfunds();
    }
  }

  setcurrent_user() {
    this.currentUser = this.userservice.currentuser;
  }

  getfunds() {
    this.userservice.get_portfolio_fund().subscribe(
      data => {
        if (data['count'] > 0) {
          apiresultfundlist.length = 0;
          // console.log(data['results']);
          for (var i = 0; i < data['results'].length; i++) {
            // console.log(data['results'][i]);
            var fund: funds = {
              id: -1,
              quantity: -1,
              portfolio: -1,
              security: -1,
              security_name: '',
              asset_type: '',
              isin: ''
            };
            fund = data['results'][i];
            apiresultfundlist.push(fund);
          }
          // console.log(apiresultfundlist);
          this.fundservice.resetfunds();
          this.fundservice.funds$.subscribe(
            fundlist => {
              this.fundlist = fundlist;
              console.log(fundlist);
            });
          this.fundservice.total$.subscribe(
            total => {
              this.total = total;
            });
        }
      });
  }

  updatefundquantity(item) {
    this.userservice.updateportfoliofund(item.id, item.quantity, item.portfolio, item.security, this.currentUser['id']).subscribe();
    // update list
    // data => {
    //   var y = this.fundlist.find(x => x.id === item.id);
    //   y = data;
    //   console.log(this.fundlist.find(x => x.id === item.id));
    //   });
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
        isin: ''
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
    // // console.log(this.securityinput);
    var securityList1 = [];
    if (this.securityinput.length > 1) {
      if ($event.timeStamp - this.lastkeydown1 > 200) {
        securityList1 = this.searchFromArray(this.securitylist, this.securityinput);

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
      if (arr[i].ticker != null) {
        if (arr[i].ticker.match(regex)) {
          matches.push(arr[i]);
        }
      }
    }
    // // console.log(matches);
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
    if (str == 'login' || str == 'register') {
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
