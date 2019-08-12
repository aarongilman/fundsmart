import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { holdindDetail } from './holdingDetail';
import { holdingList } from './holdingList';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { HoldingdetailsSortService } from './holdingdetails-sort.service';
import { DecimalPipe } from '@angular/common';
import { SortableDirective, SortEvent } from '../sortable.directive';
import { ModalDismissReasons, NgbModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { securitylist } from '../securitylist';
import { security } from '../security';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import { ToastrService } from 'ngx-toastr';
import { portfolioidSelect } from '../fund/portfolioid_select';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-holding-details',
    templateUrl: './holding-details.component.html',
    styleUrls: ['./holding-details.component.css'],
    providers: [HoldingdetailsSortService, DecimalPipe]
})

export class HoldingDetailsComponent implements OnInit {

    @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
    securitylist = securitylist;
    HoldingDetailList = holdingList;
    total;
    portfolio1: any;
    inputBasicPrice: number;
    inputCurrentPrice: number;
    portfoliolist = [];
    option = {
        fieldSeparator: ' ',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: true,
        title: 'Holding Summery',
        useBom: true,
        noDownload: false,
        headers: [
            'Fund', 'Portfolio', 'Security', 'ISIN', 'Quantity',
            'Ticker', 'Price', 'Market_Value',
            'Basic_Price', 'Basis', 'Country', 'Currency',
            'Asset_Class', 'Industry', 'Rating'
        ],
        nullToEmptyString: true,
    };
    closeResult: string;
    showdetail_flag = false;
    selectboxsecurityid: number;
    fundForm: FormGroup;
    submitted = false;

    currentprice = [];
    basicprice = [];
    currency = [];
    country = [];
    industry = [];
    rating = [];
    serchportfolio = 'All';

    constructor(
        private userservice: ServercommunicationService,
        public sortlist: HoldingdetailsSortService,
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private router: Router,
        private toastr: ToastrService,
        private interconn: IntercomponentCommunicationService,
        private calendar: NgbCalendar,
        private spinner: NgxSpinnerService
    ) {
        holdingList.length = 0;
        this.interconn.componentMethodCalled$.subscribe(() => {
            holdingList.length = 0;
            this.spinner.show();
            this.getHoldingdetail();
            this.userservice.getUserPortfolio().toPromise().then(data => {
                this.portfoliolist.length = 0;
                portfolioidSelect.forEach(element => {
                    let portfolio = data['results'].find(portfolio => portfolio.id === Number.parseInt(element));
                    this.portfoliolist.push(portfolio);
                });
            });
        });
        this.fundForm = this.formBuilder.group({
            selectedPortfolio: new FormControl('', Validators.required),
            selectedSecurity: new FormControl('', Validators.required),
            quantity: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]+$')]))
        });

        this.interconn.logoutcomponentMethodCalled$.toPromise().then(() => {
            this.router.navigate(['/home']);
            holdingList.length = 0;
        });
    }

    ngOnInit() {
        this.fundForm = this.formBuilder.group({
            selectedPortfolio: new FormControl('', Validators.required),
            selectedSecurity: new FormControl('', Validators.required),
            quantity: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]+$')]))
        });
        this.interconn.titleSettermethod('Holding Details');
        if (securitylist.length === 0) {
            this.userservice.getSecurity().toPromise().then(datasecuritylist => {
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
                this.securitylist = securitylist;
            });
        }

        if (this.userservice.currentuser) {
            this.spinner.show();
            this.userservice.getUserPortfolio().toPromise().then(data => {
                this.portfoliolist.length = 0;
                portfolioidSelect.forEach(element => {
                    let portfolio = data['results'].find(portfolio => portfolio.id === Number.parseInt(element));
                    this.portfoliolist.push(portfolio);
                });
            });
            this.getHoldingdetail();
        }
    }

    getHoldingdetail() {
        if (portfolioidSelect.length === 0) {
            this.toastr.info('Please select portfolio id/ids from Fund page', 'Information');
            this.spinner.hide();
        } else {
            this.userservice.getHoldingDetails(portfolioidSelect).toPromise().then(mtdata => {
                holdingList.length = 0;
                // tslint:disable-next-line: forin
                for (var obj in mtdata) {
                    holdingList.push(mtdata[obj]);
                }
                this.sortlist.resetHoldingDetails();
                this.sortlist.hlist$.subscribe(f => {
                    this.HoldingDetailList = JSON.parse(JSON.stringify(f));
                });
                this.sortlist.total$.subscribe(total => {
                    this.total = total;
                    this.spinner.hide();
                });
            }).catch(error => {
                console.log(error);
                this.toastr.error('There was an error fetching data, Try after some time', 'Error');
                this.spinner.hide();
            });
        };
    }

    setSecurity() {
        var opt = $('option[value="' + $('#secinput').val() + '"]');
        this.selectboxsecurityid = Number.parseInt(opt.attr('id'));
        try {
            this.fundForm.controls['selectedSecurity'].setValue(securitylist.find(s => s.id === this.selectboxsecurityid).name);
        } catch {
            return null;
        }
    }

    downloadData() {
        new ngxCsv(holdingList, "Holding_Summary", this.option);
    }

    get f() { return this.fundForm.controls; }

    addDetail() {
        this.submitted = true;
        if (this.fundForm.invalid) {
            return;
        }
        let today = this.calendar.getToday();
        var date;
        if (today.month < 10) {
            date = today.year + '-0' + today.month + '-' + today.day;
        } else {
            date = today.year + '-' + today.month + '-' + today.day;
        }
        let portfolioid = this.portfoliolist.find(p => p.name === this.fundForm.controls['selectedPortfolio'].value).id;
        this.userservice.add_portfolio_fund(this.fundForm.controls['quantity'].value,
            portfolioid,
            this.selectboxsecurityid, this.userservice.currentuser.id, date).toPromise().then(
                res => {
                    let mysecurity: security;
                    mysecurity = securitylist.find(x => x.id === res['security']);
                    var holding: holdindDetail = {
                        fund_id: res['id'],
                        portfolio: res['portfolio'],
                        security: mysecurity.name,
                        isin: mysecurity.isin,
                        quantity: res['quantity'],
                        ticker: mysecurity.ticker,
                        basic_price: this.inputBasicPrice,
                        basis: null,
                        current_price: this.inputCurrentPrice,
                        market_value: null,
                        asset_class: null,
                        currency: null,
                        country: null,
                        industry: null,
                        rating: null
                    };
                    this.selectboxsecurityid = undefined;
                    this.userservice.UpdateHoldingDetails(holding).toPromise().then(sucess => {
                        var successdata: holdindDetail = {
                            fund_id: sucess['fund_id'],
                            portfolio: sucess['portfolio'],
                            security: sucess['security'],
                            isin: sucess['isin'],
                            quantity: sucess['quantity'],
                            ticker: sucess['ticker'],
                            basic_price: sucess['basic_price'],
                            basis: sucess['basis'],
                            current_price: sucess['current_price'],
                            market_value: sucess['market_value'],
                            asset_class: sucess['asset_class'],
                            currency: sucess['currency'],
                            country: sucess['country'],
                            industry: sucess['industry'],
                            rating: sucess['rating']
                        };

                        holdingList.unshift(successdata);
                        this.sortlist.resetHoldingDetails();
                        this.modalService.dismissAll('Record Inserted');
                        this.fundForm.reset();
                        this.submitted = false;
                        this.inputBasicPrice = null;
                        this.inputCurrentPrice = null;
                    },
                        error => { });
                });
    }

    UpdateHoldingDetails(item, i) {
        this.userservice.UpdateHoldingDetails(item).toPromise().then(res => {
            this.currentprice[i] = null;
            this.basicprice[i] = null;
            this.currency[i] = null;
            this.country[i] = null;
            this.industry[i] = null;
            this.rating[i] = null;
            let toUpdate = this.HoldingDetailList.find(x => x.fund_id === res['fund_id']);
            let index = this.HoldingDetailList.indexOf(toUpdate);
            this.HoldingDetailList[index].currency = res['currency'];
            this.HoldingDetailList[index].basic_price = res['basic_price'];
            this.HoldingDetailList[index].basis = res['basis'];
            this.HoldingDetailList[index].current_price = res['current_price'];
            this.HoldingDetailList[index].market_value = res['market_value'];
            this.HoldingDetailList[index].rating = res['rating'];
            this.HoldingDetailList[index].industry = res['industry'];
        },
            error => { });
    }

    onSort({ column, direction }: SortEvent) {
        this.headers.forEach(header => {
            if (header.sortable !== column) {
                header.direction = '';
            }
        });
        this.sortlist.sortColumn = column;
        this.sortlist.sortDirection = direction;
    }

    openModal(modalid) {
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
        var securityList1 = [];
        if (this.fundForm.controls['selectedSecurity'].value.length > 1) {
            securityList1 = this.searchFromArray(securitylist, this.fundForm.controls['selectedSecurity'].value);
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
        return matches;
    }

    getPortfolioByPortfolio() {
        if (this.serchportfolio === 'All') {
            this.getHoldingdetail();
        } else {
            this.userservice.getHoldingDetails(this.serchportfolio).toPromise().then(mtdata => {
                holdingList.length = 0;
                // tslint:disable-next-line: forin
                for (var obj in mtdata) {

                    holdingList.push(mtdata[obj]);
                }
                this.sortlist.resetHoldingDetails();
                this.sortlist.hlist$.subscribe(f => {
                    this.HoldingDetailList = JSON.parse(JSON.stringify(f));
                });
                this.sortlist.total$.subscribe(total => {
                    this.total = total;
                });
            });
        }
    }

}
