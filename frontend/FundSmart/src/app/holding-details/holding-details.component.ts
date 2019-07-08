import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { holdindDetail } from './holdingDetail';
import { holdingList } from './holdingList';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { HoldingdetailsSortService } from './holdingdetails-sort.service';
import { DecimalPipe } from '@angular/common';
import { SortableDirective, SortEvent } from '../sortable.directive';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { securitylist } from '../securitylist';
import { security } from '../security';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';

@Component({
  selector: 'app-holding-details',
  templateUrl: './holding-details.component.html',
  styleUrls: ['./holding-details.component.css'],
  providers: [HoldingdetailsSortService, DecimalPipe]
})
export class HoldingDetailsComponent implements OnInit {
  securitylist = securitylist;
  HoldingDetailList = holdingList;
  total;
  @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
  portfolio1: any;
  comparision1: any;
  comparision2: any;
  option = {
    fieldSeparator: ' ',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Holding Summery',
    useBom: true,
    noDownload: false,
    headers: ["Fund", "Security", "ISIN", "Ticker", "Quantity", "Price", "Mkt Value",
      "Basic Price", "Basis", "Country", "Currency", "Asset Class", "Industry", "Rating"],
    nullToEmptyString: true,
  };
  closeResult: string;
  showdetail_flag = false;
  securityinput: string;
  lastkeydown1: number = 0;

  fundForm: FormGroup;
  HoldingDetailForm: FormGroup;
  submitted = false;



  constructor(private userservice: ServercommunicationService,
    public sortlist: HoldingdetailsSortService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private interconn: IntercomponentCommunicationService) {

    // this.sortlist.hlist$.subscribe(f => {
    //   this.HoldingDetailList = f;
    // });
    // this.sortlist.total$.subscribe(total => {
    //   this.total = total;
    // });

    this.interconn.componentMethodCalled$.subscribe(
      () => {
        holdingList.length = 0;
        this.getHoldingdetail();
        this.userservice.getUserPortfolio().subscribe(
          data => {
            // alert("portfolio data came");
            // console.log(data);
            this.portfolio1 = data['results']['0'];
            this.comparision1 = data['results']['1'];
            this.comparision2 = data['results']['2'];
          });
      }
    );

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        holdingList.length = 0;
        this.sortlist.resetHoldingDetails();
        this.sortlist.hlist$.subscribe(f => {
          this.HoldingDetailList = f;
        });
        this.sortlist.total$.subscribe(total => {
          this.total = total;
        });
      }
    );
  }

  ngOnInit() {
    if (securitylist.length === 0) {
      this.userservice.get_security().subscribe(
        datasecuritylist => {
          // // console.log(securitylist);
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
        }
      );
    }
    if (this.userservice.currentuser) {
      this.getHoldingdetail();
    }



    this.fundForm = this.formBuilder.group({
      selectedPortfolio: new FormControl('', Validators.required),
      selectedSecurity: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]+$')]))
    });

  }


  getHoldingdetail() {
    var res = this.userservice.getHoldings().toPromise().then(
      mtdata => {
        holdingList.length = 0;
        // tslint:disable-next-line: forin
        for (var obj in mtdata) {
          // console.log("Record", mtdata[obj]);
          holdingList.push(mtdata[obj]);
        }
        this.sortlist.resetHoldingDetails();
        this.sortlist.hlist$.subscribe(f => {
          this.HoldingDetailList = f;
        });
        this.sortlist.total$.subscribe(total => {
          this.total = total;
        });
      }
    );
  }

  downloadData() {

    // tslint:disable-next-line: no-unused-expression
    new ngxCsv(holdingList, "Holding_Summary", this.option);
  }

  get f() { return this.HoldingDetailForm.controls; }

  AddDetail() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.fundForm.invalid) {
      return;
    }

    // console.log(this.fundForm.value);
    // console.log("Portfolio", this.fundForm.controls['selectedPortfolio'].value);
    // console.log("Security", this.fundForm.controls['selectedSecurity'].value);

    // let portfolio: number;
    // if (this.fundForm.controls['selectedPortfolio'].value === this.portfolio1['name']) {
    //   portfolio = this.fundForm.controls['selectedPortfolio'].value;
    // } else if (this.fundForm.controls['selectedPortfolio'].value === this.comparision1['name']) {
    //   portfolio = this.fundForm.controls['selectedPortfolio'].value;
    // } else if (this.fundForm.controls['selectedPortfolio'].value === this.comparision2['name']) {
    //   portfolio = this.fundForm.controls['selectedPortfolio'].value;
    // }

    // this.HoldingDetailForm = this.formBuilder.group(
    //   {
    //     portfolio: new FormControl(this.fundForm.controls['selectedPortfolio'].value),
    //     security: new FormControl(this.fundForm.controls['selectedSecurity'].value),
    //     quantity: new FormControl(this.fundForm.controls['quantity'].value),
    //   });
    // console.log(this.HoldingDetailForm.value);
    this.userservice.add_portfolio_fund(this.fundForm.controls['quantity'].value,
      this.fundForm.controls['selectedPortfolio'].value,
      this.fundForm.controls['selectedSecurity'].value, this.userservice.currentuser.id).subscribe(
        res => {
          console.log(res);
          let mysecurity: security;
          mysecurity = securitylist.find(x => x.id === res['security']);

          var holding: holdindDetail = {
            fund_id: res['id'],
            portfolio: res['portfolio'],
            security: mysecurity.name,
            isin: mysecurity.isin,
            quantity: res['quantity'],
            ticker: mysecurity.ticker,
            basic_price: null,
            basis: null,
            current_price: null,
            market_value: null,
            asset_class: '',
            currency: '',
            country: '',
            industry: '',
            rating: ''
          };
          this.userservice.UpdateHoldingDetails(holding).subscribe(
            sucess => {
              console.log(sucess);
            },
            error => {
              console.log(error);

            }
          );
        }
      );




    //   var holding: holdindDetail = {
    //     fund_id: null,
    //     portfolio: '',
    //     security: '',
    //     isin: '',
    //     quantity: '',
    //     ticker: '',
    //     basic_price: null,
    //     basis: null,
    //     current_price: null,
    //     market_value: null,
    //     asset_class: '',
    //     currency: '',
    //     country: '',
    //     industry: '',
    //     rating: ''
    //   };
    //   holdingList.unshift(holding);
    //   this.sortlist.resetHoldingDetails();
    //   this.sortlist.hlist$.subscribe(f => {
    //     this.HoldingDetailList = f;
    //   });
    //   this.sortlist.total$.subscribe(total => {
    //     this.total = total;
    //   });
    // }
    // UpdateHoldingDetails(item) {
    //   this.userservice.UpdateHoldingDetails(item).subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     error => {
    //       console.log(error);

    //     }
    //   );
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.sortlist.sortColumn = column;
    this.sortlist.sortDirection = direction;
  }

  openModal(modalid) {
    // alert("type of modal is" + typeof(modalid));
    var addclass = '';

    addclass = 'long-pop sign-pop custom-dialog-container';

    this.modalService.open(modalid, { centered: true, windowClass: addclass }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  searchsecurity() {
    // // console.log(this.securityinput);
    var securityList1 = [];

    if (this.fundForm.controls['selectedSecurity'].value.length > 1) {
      // if ($event.timeStamp - this.lastkeydown1 > 200) {
      securityList1 = this.searchFromArray(securitylist, this.fundForm.controls['selectedSecurity'].value);

      // }
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

  numberOnly(event): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  // openNgSelectDialog() {

  //   const dialogRef = this.dialog.open(this.dialogNgSelect, {
  //     maxHeight: '500px', width: '800px', panelClass: 'custom-dialog-container'
  //   });
  // }

}
