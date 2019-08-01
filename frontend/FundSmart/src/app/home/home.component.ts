import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { portfolio_fund } from '../portfolio_fund';
import { portfoliofundlist } from '../portfolio_fundlist';
import { PortfoliofundhelperService } from '../portfoliofundhelper.service';
import { SortableDirective, SortEvent } from '../sortable.directive';
import { security } from '../security';
import * as $ from 'jquery';
import { ServercommunicationService } from '../servercommunication.service';
import { AuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { GetfileforuploadService } from '../getfileforupload.service';
import { HistoricalData } from '../historicaldata';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { MustMatch } from '../must-match.validator';
import { securitylist } from '../securitylist';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

declare var Dropbox: Dropbox;

interface Dropbox {
    choose(options: DropboxChooseOptions): void;
}

interface DropboxChooseOptions {
    success(files: DropboxFile[]);
    cancel?(): void;
    linkType: "direct";
    multiselect: boolean;
    extensions?: string[];
}

interface DropboxFile {
    name: string;
    link: string;
    bytes: number;
    icon: string;
    thumbnailLink?: string;
    isDir: boolean;
}

interface OneDriveResult {
    value: OneDriveFile[];
    webUrl: string | null;
}


interface OneDriveFile {
    id: string;
    name: string;
    link: any;
    size: number;
    thumbnails: Thumbnails[];
    webUrl: string;
}

interface Thumbnails {
    id: string;
    large: Thumbnail;
    medium: Thumbnail;
    small: Thumbnail;
}

interface Thumbnail {
    height: number;
    width: number;
    url: string;
}

interface OneDriveOpenOptions {
    clientId: 'f6820b1f-b4c5-454a-a050-e88b6e231fb5';
    action: "save" | "download" | "share" | "query";
    multiSelect: boolean;
    openInNewWindow: boolean;
    advanced: {
        filter?: string;
    };
    success(files: OneDriveResult): void;
    cancel(): void;
    error(e: any): void;

}

interface OneDrive {
    open(options: OneDriveOpenOptions);
}

declare var OneDrive: OneDrive;
interface DropboxFile {
    name: string;
    link: string;
    bytes: number;
    icon: string;
    thumbnailLink?: string;
    isDir: boolean;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [PortfoliofundhelperService, DecimalPipe]
})

export class HomeComponent implements OnInit {

    @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
    registeruserForm: FormGroup;
    submitted = false;

    loginForm: FormGroup;
    loginformSubmitted = false;

    comparision1Form: FormGroup;
    comparision2Form: FormGroup;
    fundrowForm: FormGroup;

    funds$: portfolio_fund[];
    total$;
    model: any = {};

    tableData: any = [];

    existing: HistoricalData = {
        annualexpense: 0,
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    recommended: HistoricalData = {
        annualexpense: 0,
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    diffrence: HistoricalData = {
        annualexpense: 0,
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };

    userFunds = portfoliofundlist;
    files: any = [];
    currentUser: any;

    socialuser: SocialUser;
    loggedIn: boolean;

    closeResult: string;
    showdetail_flag = false;
    email2: string;

    portfolioinput: string[] = [];
    comp1input: string[] = [];
    comp2input: string[] = [];
    lastkeydown1: number = 0;

    portfolio1: any;
    comparision1: any;
    comparision2: any;

    pietype = 'PieChart';
    piedata = [];
    pieoptions;
    columnNames = [];
    pieheight = 350;
    piewidth = 500;

    donutdata = [];
    donutwidth = 500;
    donutheight = 350;
    donuttype = 'PieChart';
    donutoptions;

    linetitle = '';
    linedata = [];
    lineoptions;
    linewidth = 700;
    lineheight = 450;
    linetype = 'LineChart';
    linecolumnNames = [];
    securitylist = securitylist;
    arrayBuffer: any;
    DynamicDisable = [];

    constructor(
        private modalService: NgbModal,
        private interconn: IntercomponentCommunicationService,
        private userservice: ServercommunicationService,
        private fileupload: GetfileforuploadService,
        private authService: AuthService,
        private formBuilder: FormBuilder,
        private toastrService: ToastrService,
        public portfolioservice: PortfoliofundhelperService,
        private spinner: NgxSpinnerService
    ) {
        this.portfolioservice.funds$.subscribe(f => {
            this.funds$ = JSON.parse(JSON.stringify(f))
        });
        this.portfolioservice.total$.subscribe(total => {
            this.total$ = total;
        });
        this.interconn.googledriveuploadcalled$.subscribe(
            () => {
                this.setdataindeshboard();
                this.portfolioservice.resetfunds();
                this.portfolioservice.funds$.subscribe(f => {
                    this.funds$ = JSON.parse(JSON.stringify(f))
                });
                this.portfolioservice.total$.subscribe(f => {
                    this.total$ = f;
                });
                const pageno = Math.ceil(this.total$ / this.portfolioservice.pageSize);
                this.portfolioservice.page = pageno;
                this.spinner.hide();
            });
        this.interconn.reloadmethodcalled$.subscribe(
            () => { }
        );
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.currentUser = undefined;
            });
        this.tableData = JSON.parse(localStorage.getItem('securityData'));
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
                if (this.tableData) {
                    this.setfunds(this.tableData);
                    this.setdataindeshboard();
                }
            });
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.setcurrent_user();
            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod("Multi Portfolio Analyzer");
        this.setdataindeshboard();
        this.DynamicDisable[0] = false;
        this.userservice.get_historical_perfomance().toPromise().then(
            result => {
                this.existing = {
                    annualexpense: 0,
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                this.recommended = {
                    annualexpense: 0,
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                this.diffrence = {
                    annualexpense: 0,
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                if (result[0]) {
                    this.existing.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['existing']['annual_expense']).toFixed(2));
                    this.existing.oneyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['1-year']).toFixed(2));
                    this.existing.threeyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['3-year']).toFixed(2));
                    this.existing.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['5-year']).toFixed(2));

                    this.recommended.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['recommended']['annual_expense']).toFixed(2));
                    this.recommended.oneyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['1-year']).toFixed(2));
                    this.recommended.threeyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['3-year']).toFixed(2));
                    this.recommended.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['5-year']).toFixed(2));

                    this.diffrence.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['difference']['annual_expense']).toFixed(2));
                    this.diffrence.oneyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['1-year']).toFixed(2));
                    this.diffrence.threeyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['3-year']).toFixed(2));
                    this.diffrence.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['5-year']).toFixed(2));
                }
            });
        if (this.userservice.currentuser) {
            this.setcurrent_user();
        }
        this.registeruserForm = this.formBuilder.group(
            {
                username: new FormControl('', Validators.required),
                first_name: new FormControl('', Validators.required),
                last_name: new FormControl('', Validators.required),
                email: new FormControl('', Validators.compose([
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
                phone_number: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])),
                password1: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
                password2: new FormControl('', Validators.required),
            },
            {
                validator: MustMatch('password1', 'password2')
            });
    }

    resetfundlist() {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this data',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.value) {
                localStorage.setItem('securityData', JSON.stringify([]));
                portfoliofundlist.length = 0;
                let singlefund: portfolio_fund = {
                    security: '',
                    security_id: -1,
                    p1record: null,
                    p2record: null,
                    p3record: null,
                    yourPortfolio: '',
                    comparision1: '',
                    comparision2: ''
                };
                portfoliofundlist.push(singlefund);
                this.portfolioservice.resetfunds();
                this.setdataindeshboard();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire(
                    'Cancelled',
                    'Your data is safe :)',
                    'error'
                );
            }
        });

    }

    createFundlist() {
        this.userservice.dashboardDataTable().toPromise().then(
            fundlist => {
                this.setfunds(fundlist);
            });
    }

    serAttribute(item, i) {
        var opt = $('option[value="' + $('#security_' + i).val() + '"]');
        item.security_id = Number.parseInt(opt.attr('id'));
        if (isNaN(item.security_id)) {
            item.security_id = -1;
        }
        try {
            item.security = securitylist.find(s => s.id === item.security_id).name;
            let localData = JSON.parse(localStorage.getItem('securityData'));
            let index = localData.findIndex(data => data.recordId === item.p1record);
            localData[index].securityId = item.security_id;
            localStorage.setItem('securityData', JSON.stringify(localData));
            this.setdataindeshboard();
        } catch {
            return null;
        }
    }

    setdataindeshboard() {
        this.userservice.get_historical_perfomance().toPromise().then(
            result => {
                this.existing = {
                    annualexpense: 0,
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                this.recommended = {
                    annualexpense: 0,
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                this.diffrence = {
                    annualexpense: 0,
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                if (result[0]) {
                    this.existing.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['existing']['annual_expense']).toFixed(2));
                    this.existing.oneyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['1-year']).toFixed(2));
                    this.existing.threeyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['3-year']).toFixed(2));
                    this.existing.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['5-year']).toFixed(2));

                    this.recommended.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['recommended']['annual_expense']).toFixed(2));
                    this.recommended.oneyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['1-year']).toFixed(2));
                    this.recommended.threeyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['3-year']).toFixed(2));
                    this.recommended.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['5-year']).toFixed(2));

                    this.diffrence.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['difference']['annual_expense']).toFixed(2));
                    this.diffrence.oneyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['1-year']).toFixed(2));
                    this.diffrence.threeyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['3-year']).toFixed(2));
                    this.diffrence.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['5-year']).toFixed(2));
                }
            });

        this.userservice.get_home_pie_chart().toPromise().then(
            jsondata => {
                this.piedata = [];
                let arrData = [];
                let arrvalue = [];
                Object.keys(jsondata).forEach((element) => {
                    arrData = Object.keys(jsondata[element]);
                    arrvalue = Object.values(jsondata[element]);
                    arrData.forEach((key, value) => {
                        this.piedata.push([key, arrvalue[value]]);
                    });
                });
                this.pietype = 'PieChart';
                this.columnNames = ['Security Industry', 'Total'];
                this.pieoptions = {
                    animation: {
                        duration: 1000,
                        easing: 'out',
                    },
                    pieSliceText: 'label',
                    legend: 'none',
                    colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],

                };
            });

        this.userservice.get_deshboard_doughnut_chart().toPromise().then(
            jsondata => {
                this.donutdata = [];
                let arrData = [];
                let arrvalue = [];
                Object.keys(jsondata).forEach((element) => {
                    arrData = Object.keys(jsondata[element]);
                    arrvalue = Object.values(jsondata[element]);
                    arrData.forEach((key, value) => {
                        this.donutdata.push([key, arrvalue[value]]);
                    });
                });

                this.donutoptions = {
                    pieHole: 0.8,
                    legend: { position: 'top', alignment: 'start', maxLines: 10 },
                    pieSliceText: 'none',
                    colors: ['#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', '#5ace9f', '#fca622', '#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', ' #922b21', ' #e74c3c', ' #633974', ' #8e44ad', ' #1a5276', ' #3498db', ' #0e6655', ' #52be80', ' #f4d03f', ' #dc7633', ' #717d7e', ' #212f3c'],
                };
            });

        this.userservice.get_lineplot_chart().toPromise().then(
            (jsondata: any) => {
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

    signInWithGoogle(): void {
        this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
            this.userservice.socialLogin(user);
            this.setcurrent_user();
            this.modalService.dismissAll('Log in Done');
        });
    }

    signInWithFB(): void {
        this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
            this.userservice.socialLogin(user);
            this.setcurrent_user();
            this.modalService.dismissAll('Log in Done');
        });
    }

    addRow() {
        let singlefund: portfolio_fund = {
            security: '',
            security_id: -1,
            p1record: null,
            p2record: null,
            p3record: null,
            yourPortfolio: '',
            comparision1: '',
            comparision2: ''
        };
        portfoliofundlist.push(singlefund)
        this.portfolioservice.resetfunds();
        this.portfolioservice.funds$.subscribe(f => { this.funds$ = JSON.parse(JSON.stringify(f)) });
        this.portfolioservice.total$.subscribe(total => {
            this.total$ = total;
        });
        let pageno = Math.ceil(this.total$ / this.portfolioservice.pageSize);
        this.portfolioservice.page = pageno;
    }

    removeRow(p1record, id) {
        if (id >= 0) {
            Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover this data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.value) {
                    if (portfoliofundlist[id].security !== '') {
                        this.userservice.removedata(p1record);
                    }
                    let pid = portfoliofundlist.findIndex(fund => fund.p1record === p1record);
                    portfoliofundlist.splice(pid, 1);
                    if (portfoliofundlist.length === 0) {
                        let singlefund: portfolio_fund = {
                            security: '',
                            security_id: -1,
                            p1record: null,
                            p2record: null,
                            p3record: null,
                            yourPortfolio: '',
                            comparision1: '',
                            comparision2: ''
                        };
                        portfoliofundlist.push(singlefund);
                    }
                    this.portfolioservice.resetfunds();
                    this.portfolioservice.funds$.subscribe(f => { this.funds$ = JSON.parse(JSON.stringify(f)) });
                    this.portfolioservice.total$.subscribe(total => {
                        this.total$ = total;
                    });
                    this.setdataindeshboard();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire(
                        'Cancelled',
                        'Your data is safe :)',
                        'error'
                    );
                }
            });
        }
    }

    get f() { return this.registeruserForm.controls; }

    registerUser() {
        if (this.showdetail_flag === false) {
            $(".register-slide").slideDown("500");
            this.showdetail_flag = true;
        } else {
            this.submitted = true;
            if (this.registeruserForm.invalid) {
                return;
            }
            this.userservice.doRegistration(JSON.stringify(this.registeruserForm.value)).toPromise().then(data => {
                localStorage.setItem('authkey', data['key']);;
                this.showdetail_flag = false;
                Swal.fire('Registration', 'Please verify your email from your mail box', 'success');
                this.modalService.dismissAll('Registration Done');
                this.registeruserForm.reset();
                this.submitted = false
            },
                error => {
                    this.toastrService.error('The user with this username/email already exist!', 'Error');
                });
        }
    }

    setfunds(fundlist) {
        if (fundlist.length > 0) {
            portfoliofundlist.length = 0;
        }
        fundlist.forEach(element => {
            let security = this.securitylist.find(s => s['id'] === element.securityId);
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
            portfoliofundlist.push(singlefund);
        });
        this.portfolioservice.resetfunds();
        this.portfolioservice.funds$.subscribe(f => {
            this.funds$ = JSON.parse(JSON.stringify(f))
        });
        this.portfolioservice.total$.subscribe(total => {
            this.total$ = total;
        });
    }

    userlogin() {
        this.userservice.doLogin(this.model.username, this.model.password).toPromise().then(
            data => {
                localStorage.setItem('authkey', data['key']);
                this.userservice.getUser(data['key']);
                this.modalService.dismissAll('Login Done');
            },
            error => {
                this.toastrService.error('Invalid Credentials', 'Error');
            });
    }

    openmodal(modalid, str) {
        var addclass = '';
        if (str === 'login' || str === 'register') {
            addclass = 'long-pop sign-pop';
        }
        this.modalService.open(modalid, { centered: true, windowClass: addclass }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

    }

    resetpassword() {
        this.userservice.reset_pwd_sendemail(this.email2).toPromise().then(data => {
            this.email2 = undefined;
            this.modalService.dismissAll('Email sent.');
            Swal.fire({
                title: 'Reset Password',
                text: 'Token has been sent to your email address.',
                type: "success",
            });
        },
            error => {
                this.toastrService.error('Some error Occured', 'Error');
            });
    }

    getDismissReason(reason: any): string {
        this.showdetail_flag = false;
        this.model.username = '';
        this.model.password = '';
        this.registeruserForm.reset();
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    resetpass_modal() {
        $(".forgot-password-wrap").addClass("show-forgot");
        $(".login-content").addClass("hide-login");
        $(".forgot-password-title").addClass("show-forgot");
        $(".login-title").addClass("d-none");
    }

    uploadFile(event) {
        for (let index = 0; index < event.length; index++) {
            const element = event[index];
            if (element.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                this.files.push(element.name);
                let fr = new FileReader;
                fr.onload = (e) => {
                    this.arrayBuffer = fr.result;
                    let data = new Uint8Array(this.arrayBuffer);
                    let arr = new Array();
                    for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                    let bstr = arr.join("");
                    let workbook = XLSX.read(bstr, { type: "binary" });
                    let first_sheet_name = workbook.SheetNames[0];
                    let worksheet = workbook.Sheets[first_sheet_name];
                    let sheetdata = XLSX.utils.sheet_to_json(worksheet, { raw: true });
                    let localData = JSON.parse(localStorage.getItem('securityData'));
                    if (localData === null) {
                        localStorage.setItem('securityData', JSON.stringify([]));
                        localData = JSON.parse(localStorage.getItem('securityData'));
                    }
                    let count = localData.length;
                    // tslint:disable-next-line: forin
                    for (let record in sheetdata) {
                        let port1, comp1, comp2;
                        port1 = sheetdata[record]['portfolio1'];
                        comp1 = sheetdata[record]['comparison1'];
                        comp2 = sheetdata[record]['comparison2'];
                        let security = securitylist.find(s => s.isin === sheetdata[record]['Security ISIN']);
                        if (security) {
                            try {
                                let portfilio = portfoliofundlist.findIndex(s => s.security === '');
                                portfoliofundlist[portfilio].security_id = security.id;
                                portfoliofundlist[portfilio].security = security.name;
                                portfoliofundlist[portfilio].yourPortfolio = port1;
                                portfoliofundlist[portfilio].comparision1 = comp1;
                                portfoliofundlist[portfilio].comparision2 = comp2;
                                portfoliofundlist[portfilio].p1record = localData.length;
                                let format = { 'recordId': localData.length, 'portfolio': port1.toString(), 'recid': null, 'COMPARISON1': comp1.toString(), 'COMPARISON2': comp2.toString(), 'securityId': security.id };
                                localData.push(format);
                            } catch {
                                let singlefund: portfolio_fund = {
                                    security: security.name,
                                    security_id: security.id,
                                    p1record: localData.length,
                                    p2record: null,
                                    p3record: null,
                                    yourPortfolio: port1,
                                    comparision1: comp1,
                                    comparision2: comp2
                                };
                                portfoliofundlist.push(singlefund);
                                let format = { 'recordId': localData.length, 'portfolio': port1.toString(), 'recid': null, 'COMPARISON1': comp1.toString(), 'COMPARISON2': comp2.toString(), 'securityId': security.id };
                                localData.push(format);
                            }
                        }
                    }
                    if (count === localData.length) {
                        Swal.fire('File Upload', 'Your data is not in proper format', 'error');
                    } else {
                        localStorage.setItem('securityData', JSON.stringify(localData));
                        let pageno;
                        this.portfolioservice.resetfunds();
                        this.portfolioservice.funds$.subscribe(f => { this.funds$ = JSON.parse(JSON.stringify(f)) });
                        this.portfolioservice.total$.subscribe(f => {
                            this.total$ = f;
                        });
                        this.setdataindeshboard();
                        pageno = Math.ceil(this.total$ / this.portfolioservice.pageSize);
                        this.portfolioservice.page = pageno;
                    }
                    this.modalService.dismissAll('Upload Done');
                };
                fr.readAsArrayBuffer(element);
            } else {
                Swal.fire('File Upload', 'Please upload exel or csv files', 'error');
            }
        }
    }

    searchsecurity(event, secinput, item) {
        const charCode = (event.which) ? event.which : event.keyCode;
        const newsec = this.securitylist.find(sec => sec.id === item.security_id);
        if (newsec !== undefined) {
            if (charCode === 127 || charCode === 8) {
                if (secinput !== newsec.name) {
                    item.security_id = -1;
                } else {
                    item.security_id = newsec.id;
                }
            }
        }
        var securityList1 = [];
        if (secinput.length >= 1) {
            securityList1 = this.searchFromArray(securitylist, secinput);
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

    numberOnly(event, value) {
        const charCode = (event.which) ? event.which : event.keyCode;

        if (value !== null) {
            if (value.includes('%')) {
                return false;
            }
        }
        if ((charCode > 47 && charCode < 58) || charCode === 37) {
            if (charCode === 37 && Number.parseInt(value) > 100) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    addportfolioFund(string1, item, i) {
        if (item.security_id === -1) {
            return false;
        } else {
            var quantity;
            const Tempportfoliofundlist = JSON.parse(JSON.stringify(portfoliofundlist));
            if (string1.match('portfolio')) {
                if (item.yourPortfolio) {
                    quantity = Tempportfoliofundlist.find(x => x.yourPortfolio = item.yourPortfolio).yourPortfolio;
                } else {
                    item.yourPortfolio = null;
                    quantity = null;
                }
                this.createportfoliofundmethod(quantity, item, 'p1', i);
            } else if (string1.match('comp1')) {
                if (item.comparision1) {
                    quantity = Tempportfoliofundlist.find(x => x.comparision1 = item.comparision1).comparision1;
                    this.createportfoliofundmethod(quantity, item, 'p2', i);
                } else {
                    item.comparision1 = null;
                    quantity = null;
                    this.createportfoliofundmethod(quantity, item, 'p2', i);
                }
            } else if (string1.match('comp2')) {
                if (item.comparision2) {
                    quantity = Tempportfoliofundlist.find(x => x.comparision2 = item.comparision2).comparision2;
                } else {
                    quantity = null;
                    item.comparision2 = null;
                }
                this.createportfoliofundmethod(quantity, item, 'p3', i);
            }
        }
    }

    createportfoliofundmethod(quantity, item: portfolio_fund, recordid, i) {

        let localData = JSON.parse(localStorage.getItem('securityData'));
        if (localData === null) {
            localStorage.setItem('securityData', JSON.stringify([]));
            localData = JSON.parse(localStorage.getItem('securityData'));
        }
        var security = securitylist.find(x => x.name === item.security);
        var recid;
        if (recordid === 'p1') {
            recid = item.p1record;
        } else if (recordid === 'p2') {
            recid = item.p2record;
        } else if (recordid === 'p3') {
            recid = item.p3record;
        }
        if (item.p1record === null) {
            item.p1record = localData.length;
        }
        if (security === undefined) {
            return null;
        } else {
            this.userservice.storedata({
                'recordId': item.p1record, "key": recordid,
                "quantity": quantity, "recid": recid, "securityId": item.security_id
            });
            let undefsec = this.funds$.filter(fund => fund.security_id === -1);
            if (undefsec.length === 0) {
                this.setdataindeshboard();
            } else {
                this.toastrService.error('Please select porper Security', 'Error');
            }
        }
    }

    dropboxupload() {
        let url: any;
        var options: DropboxChooseOptions = {
            success: (files) => {
                this.spinner.show();
                for (const file of files) {
                    const name = file.name;
                    url = file.link;
                    fetch(url).then(response => response.blob()).then(filedata => {
                        const blob = new Blob([filedata], { type: filedata.type });
                        const myfile = new File([blob], name, { type: filedata.type, lastModified: Date.now() });
                        let fr = new FileReader;
                        fr.onload = (e) => {
                            this.arrayBuffer = fr.result;
                            let data = new Uint8Array(this.arrayBuffer);
                            let arr = new Array();
                            for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                            let bstr = arr.join("");
                            let workbook = XLSX.read(bstr, { type: "binary" });
                            let first_sheet_name = workbook.SheetNames[0];
                            let worksheet = workbook.Sheets[first_sheet_name];
                            let sheetdata = XLSX.utils.sheet_to_json(worksheet, { raw: true });
                            let localData = JSON.parse(localStorage.getItem('securityData'));
                            if (localData === null) {
                                localStorage.setItem('securityData', JSON.stringify([]));
                                localData = JSON.parse(localStorage.getItem('securityData'));
                            }
                            let count = localData.length;
                            // tslint:disable-next-line: forin
                            for (let record in sheetdata) {
                                let port1, comp1, comp2;
                                port1 = sheetdata[record]['portfolio1'];
                                comp1 = sheetdata[record]['comparison1'];
                                comp2 = sheetdata[record]['comparison2'];
                                let security = securitylist.find(s => s.isin === sheetdata[record]['Security ISIN']);
                                if (security) {
                                    try {
                                        let portfilio = portfoliofundlist.findIndex(s => s.security === '');
                                        portfoliofundlist[portfilio].security_id = security.id;
                                        portfoliofundlist[portfilio].security = security.name;
                                        portfoliofundlist[portfilio].yourPortfolio = port1;
                                        portfoliofundlist[portfilio].comparision1 = comp1;
                                        portfoliofundlist[portfilio].comparision2 = comp2;
                                        portfoliofundlist[portfilio].p1record = localData.length;
                                        let format = { 'recordId': localData.length, 'portfolio': port1.toString(), 'recid': null, 'COMPARISON1': comp1.toString(), 'COMPARISON2': comp2.toString(), 'securityId': security.id };
                                        localData.push(format);
                                    } catch {
                                        let singlefund: portfolio_fund = {
                                            security: security.name,
                                            security_id: security.id,
                                            p1record: localData.length,
                                            p2record: null,
                                            p3record: null,
                                            yourPortfolio: port1,
                                            comparision1: comp1,
                                            comparision2: comp2
                                        };
                                        portfoliofundlist.push(singlefund);
                                        let format = { 'recordId': localData.length, 'portfolio': port1.toString(), 'recid': null, 'COMPARISON1': comp1.toString(), 'COMPARISON2': comp2.toString(), 'securityId': security.id };
                                        localData.push(format);
                                    }
                                }
                            }
                            if (count === localData.length) {
                                Swal.fire('File Upload', 'Your data is not in proper format', 'error');
                            } else {
                                localStorage.setItem('securityData', JSON.stringify(localData));
                                this.portfolioservice.resetfunds();
                                this.portfolioservice.funds$.subscribe(f => { this.funds$ = JSON.parse(JSON.stringify(f)) });
                                this.portfolioservice.total$.subscribe(f => {
                                    this.total$ = f;
                                });
                                const pageno = Math.ceil(this.total$ / this.portfolioservice.pageSize);
                                this.portfolioservice.page = pageno;
                                this.setdataindeshboard();
                            }
                            this.modalService.dismissAll('File uploaded');
                            this.spinner.hide();
                        };
                        fr.readAsArrayBuffer(myfile);
                    });
                }
            },
            cancel: () => {
                this.modalService.dismissAll('File not upload');
            },
            linkType: "direct",
            multiselect: false,
            extensions: ['.xlsx', '.xls', '.csv'],
        };
        Dropbox.choose(options);
    }

    setcurrent_user() {
        this.currentUser = this.userservice.currentuser;
    }

    openOneDrivePicker() {
        return new Promise<OneDriveResult | null>((resolve, reject) => {
            var odOptions: OneDriveOpenOptions = {
                clientId: 'f6820b1f-b4c5-454a-a050-e88b6e231fb5',
                action: 'download',
                multiSelect: false,
                openInNewWindow: false,
                advanced: {
                    filter: "folder,.xlsx"
                },
                success: (files) => {
                    resolve(files);
                },
                cancel: () => { resolve(null); },
                error: (e) => { reject(e); }
            };
            OneDrive.open(odOptions);
        });
    }

    onedrivefileupload() {
        this.openOneDrivePicker().then(
            (result) => {
                this.spinner.show();
                if (result) {
                    for (const file of result.value) {
                        const name = file.name;
                        const url = file["@microsoft.graph.downloadUrl"];
                        fetch(url)
                            .then(response => response.blob())
                            .then(blob => {
                                const myblob = new Blob([blob], { type: blob.type });
                                const myfile = new File([myblob], name, { type: blob.type, lastModified: Date.now() });
                                let fr = new FileReader;
                                fr.onload = (e) => {
                                    this.arrayBuffer = fr.result;
                                    let data = new Uint8Array(this.arrayBuffer);
                                    let arr = new Array();
                                    for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                                    let bstr = arr.join("");
                                    let workbook = XLSX.read(bstr, { type: "binary" });
                                    let first_sheet_name = workbook.SheetNames[0];
                                    let worksheet = workbook.Sheets[first_sheet_name];
                                    let sheetdata = XLSX.utils.sheet_to_json(worksheet, { raw: true });
                                    let localData = JSON.parse(localStorage.getItem('securityData'));
                                    if (localData === null) {
                                        localStorage.setItem('securityData', JSON.stringify([]));
                                        localData = JSON.parse(localStorage.getItem('securityData'));
                                    }
                                    let count = localData.length;
                                    // tslint:disable-next-line: forin
                                    for (let record in sheetdata) {
                                        let port1, comp1, comp2;
                                        port1 = sheetdata[record]['portfolio1'];
                                        comp1 = sheetdata[record]['comparison1'];
                                        comp2 = sheetdata[record]['comparison2'];
                                        let security = securitylist.find(s => s.isin === sheetdata[record]['Security ISIN']);
                                        if (security) {
                                            try {
                                                let portfilio = portfoliofundlist.findIndex(s => s.security === '');
                                                portfoliofundlist[portfilio].security_id = security.id;
                                                portfoliofundlist[portfilio].security = security.name;
                                                portfoliofundlist[portfilio].yourPortfolio = port1;
                                                portfoliofundlist[portfilio].comparision1 = comp1;
                                                portfoliofundlist[portfilio].comparision2 = comp2;
                                                portfoliofundlist[portfilio].p1record = localData.length;
                                                let format = { 'recordId': localData.length, 'portfolio': port1.toString(), 'recid': null, 'COMPARISON1': comp1.toString(), 'COMPARISON2': comp2.toString(), 'securityId': security.id };
                                                localData.push(format);

                                            } catch {
                                                let singlefund: portfolio_fund = {
                                                    security: security.name,
                                                    security_id: security.id,
                                                    p1record: localData.length,
                                                    p2record: null,
                                                    p3record: null,
                                                    yourPortfolio: port1,
                                                    comparision1: comp1,
                                                    comparision2: comp2
                                                };
                                                portfoliofundlist.push(singlefund);

                                                let format = { 'recordId': localData.length, 'portfolio': port1.toString(), 'recid': null, 'COMPARISON1': comp1.toString(), 'COMPARISON2': comp2.toString(), 'securityId': security.id };

                                                localData.push(format);
                                            }
                                        }
                                    }
                                    if (count === localData.length) {
                                        Swal.fire('File Upload', 'Your data is not in proper format', 'error');
                                    } else {
                                        localStorage.setItem('securityData', JSON.stringify(localData));
                                        this.portfolioservice.resetfunds();
                                        this.portfolioservice.funds$.subscribe(f => { this.funds$ = JSON.parse(JSON.stringify(f)) });
                                        this.portfolioservice.total$.subscribe(f => {
                                            this.total$ = f;
                                        });
                                        const pageno = Math.ceil(this.total$ / this.portfolioservice.pageSize);
                                        this.portfolioservice.page = pageno;
                                        this.setdataindeshboard();
                                    }

                                    this.modalService.dismissAll('File uploaded');
                                    this.spinner.hide();
                                };
                                fr.readAsArrayBuffer(myfile);
                            });
                    }
                }
            }).catch(reason => { });
    }

    drive_fileupload() {
        this.fileupload.onApiLoad("Dashboard");
        this.modalService.dismissAll('File uploaded');
    }

    onSort({ column, direction }: SortEvent) {
        this.headers.forEach(header => {
            if (header.sortable !== column) {
                header.direction = '';
            }
        });

        this.portfolioservice.sortColumn = column;
        this.portfolioservice.sortDirection = direction;
    }

}

