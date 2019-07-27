import { Component, OnInit, ViewChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { NgbModal, ModalDismissReasons, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { security } from '../security';
import * as $ from 'jquery';
import { DecimalPipe } from '@angular/common';
import { GetfileforuploadService } from '../getfileforupload.service';
import { apiresultfundlist } from '../apiresult_fundlist';
import { funds } from '../funds';
import { FundcreatesortService } from '../fundcreatesort.service';
import { SortEvent, SortableDirective } from '../sortable.directive';
import { securitylist } from '../securitylist';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
    newFile: File;
    maxdate: any;
    portfoliolist = [];
    portfolio1: any;
    comparision1: any;
    comparision2: any;
    selectedp: any;
    selectedDate: any;
    id: any;
    serchportfolio: any;

    @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;

    oneDriveApplicationId: 'f6820b1f-b4c5-454a-a050-e88b6e231fb5';

    constructor(
        private modalService: NgbModal,
        private fileupload: GetfileforuploadService,
        private userService: ServercommunicationService,
        private interconn: IntercomponentCommunicationService,
        public fundservice: FundcreatesortService,
        public route: Router,
        private toast: ToastrService,
        private calendar: NgbCalendar,
        private activatedRoute: ActivatedRoute,
    ) {
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.setcurrent_user();
                this.getUserPortfolios();
                this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
                    this.id = queryParams.params.id;
                    if (queryParams.params.id) {
                        this.getSelectedPortfolio();
                    } else {
                        this.getfunds();
                    }
                });
            });

        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.route.navigate(['/home']);
                this.resetfunds();
                this.portfoliolist.length = 0;
            });

        this.interconn.reloadmethodcalled$.subscribe(
            () => {
                this.getfunds();
            }
        );

        this.selectedDate = calendar.getToday();
        this.maxdate = calendar.getToday();
    }

    ngOnInit() {
        this.interconn.titleSettermethod("Create Fund");
        this.userService.get_security().subscribe(
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
            }
        );
        this.setcurrent_user();
        if (this.userService.currentuser) {
            apiresultfundlist.length = 0;
            this.getUserPortfolios();
            this.activatedRoute.queryParamMap.subscribe((queryParams: Params) => {
                this.id = queryParams.params.id;
                if (queryParams.params.id) {
                    this.getSelectedPortfolio();
                } else {
                    this.getfunds();
                }
            });
        }
    }

    setcurrent_user() {
        this.currentUser = this.userService.currentuser;
    }

    setfunds(data) {
        apiresultfundlist.length = 0;
        for (var i = 0; i < data['results'].length; i++) {
            var fund: funds = {
                id: -1,
                quantity: null,
                portfolio: 0,
                portfolio_name: '',
                security: 0,
                security_name: '',
                asset_type: '',
                isin: '',
                price: ''
            };
            fund.id = data['results'][i]['id'];
            fund.isin = data['results'][i]['isin'];
            fund.asset_type = data['results'][i]['asset_type'];
            fund.portfolio = data['results'][i]['portfolio'];
            fund.portfolio_name = this.portfoliolist.find(p => p.id === Number.parseInt(data['results'][i]['portfolio'])).name;
            fund.security = data['results'][i]['security'];
            fund.security_name = data['results'][i]['security_name'];
            fund.price = data['results'][i]['price'];
            fund.quantity = data['results'][i]['quantity'];
            apiresultfundlist.push(fund);
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

    getfunds() {
        this.userService.get_portfolio_fund().subscribe(
            data => {
                if (data['count'] > 0) {
                    this.setfunds(data);
                }
            });
    }

    onDateSelect($event) {
        var date;
        if (this.selectedDate.month < 10) {
            date = this.selectedDate.year + '-0' + this.selectedDate.month + '-' + this.selectedDate.day;
        } else {
            date = this.selectedDate.year + '-' + this.selectedDate.month + '-' + this.selectedDate.day;
        }
        this.userService.get_portfolio_fund_by_date(date, this.serchportfolio, this.id).subscribe(
            data => {
                if (data['count'] > 0) {
                    this.setfunds(data);
                }
            });
    }

    setrowdata(fund, i) {
        var opt = $('option[value="' + $('#security_' + i).val() + '"]');
        var secid = Number.parseInt(opt.attr('id'));
        var sec: security;
        try {
            sec = securitylist.find(x => x.id === secid);
            fund.security = sec.id;
            fund.asset_type = sec.asset_type;
            fund.isin = sec.isin;
            fund.security_name = sec.name;
        } catch {
            return null;
        }
    }

    updatefundquantity(item) {
        if (item.id === -1) {
            this.userService.add_portfolio_fund(
                item.quantity,
                item.portfolio,
                item.security,
                this.currentUser['id']).subscribe(
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
                    }
                );
        } else {
            this.userService.updateportfoliofund(
                item.id,
                item.quantity,
                item.portfolio,
                item.security,
                this.currentUser['id']).subscribe();
        }
    }

    getUserPortfolios() {
        this.userService.getUserPortfolio().subscribe(data => {
            this.portfoliolist.length = 0;
            for (let d in data['results']) {
                this.portfoliolist.push(data['results'][d]);
            }
        });
    }

    updateprice(fund) {
        if (this.selectedDate === undefined) {
            this.selectedDate = this.calendar.getToday();
        }
        var date;
        if (this.selectedDate.month < 10) {
            date = this.selectedDate.year + '-0' + this.selectedDate.month + '-' + this.selectedDate.day;
        } else {
            date = this.selectedDate.year + '-' + this.selectedDate.month + '-' + this.selectedDate.day;
        }
        this.userService.postPrice(fund.id, fund.price, date).subscribe();
    }

    addRow() {
        const singlefund: funds = {
            id: -1,
            quantity: null,
            portfolio: this.selectedp,
            portfolio_name: this.portfoliolist.find(p => p.id === Number.parseInt(this.selectedp)).name,
            security: 0,
            security_name: '',
            asset_type: '',
            isin: '',
            price: ''
        };
        apiresultfundlist.unshift(singlefund);
        this.securityinput[0] = '';
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
                portfolio_name: '',
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

    numberOnly(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 47 && charCode < 58) {

            return true;
        } else {
            return false;
        }
    }

    searchsecurity($event) {
        var securityList1 = [];
        if (this.securityinput.length > 1) {
            if ($event.timeStamp - this.lastkeydown1 > 200) {
                securityList1 = this.searchFromArray(securitylist, this.securityinput);
            }
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

    getportfoliobyportfolio() {
        var date;
        if (this.selectedDate.month < 10) {
            date = this.selectedDate.year + '-0' + this.selectedDate.month + '-' + this.selectedDate.day;
        } else {
            date = this.selectedDate.year + '-' + this.selectedDate.month + '-' + this.selectedDate.day;
        }
        this.userService.get_portfolio_fund_by_date(date, this.serchportfolio, this.id).subscribe(
            data => {
                this.setfunds(data);
            });
    }

    getSelectedPortfolio() {
        this.userService.get(`api/portfolio_fund/?portfolio_ids=${this.id}`).subscribe(
            data => {
                this.setfunds(data);
            });
    }

    resetpass_modal() {
        $(".forgot-password-wrap").addClass("show-forgot");
        $(".login-content").addClass("hide-login");
    }

    uploadFile(event) {
        for (let index = 0; index < event.length; index++) {
            const element = event[index];
            this.files.push(element.name);
            const formData = new FormData();
            formData.append('data_file', element);
            this.userService.uploadfile(formData).subscribe(
                res => {
                    this.getfunds();
                },
                error => { }
            );
            this.modalService.dismissAll('Log in Done');
        }
    }

    openmodal(modalid, str) {
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
        let url: any;
        var options: DropboxChooseOptions = {
            success: (files) => {
                let that = this;
                for (const file of files) {
                    const name = file.name;
                    url = file.link;
                    fetch(url).then(response => response.blob()).then(filedata => {
                        const formData = new FormData();
                        const blob = new Blob([filedata], { type: filedata.type });
                        const myfile = new File([blob], name, { type: filedata.type, lastModified: Date.now() });
                        formData.append('data_file', myfile);
                        that.userService.uploadfile(formData).subscribe(
                            resp => {
                                that.interconn.afterfileupload();
                                this.getfunds();
                                this.modalService.dismissAll('File uploaded');
                            }
                        );
                    }).catch(reason => { });
                }
            },
            cancel: () => {
                window.close();
            },
            linkType: 'direct',
            multiselect: false,
            extensions: ['.xlsx', '.xls', '.csv'],
        };
        Dropbox.choose(options);
    }

    launchOneDrivePicker() {
        return new Promise<OneDriveResult | null>((resolve, reject) => {
            var odOptions: OneDriveOpenOptions = {
                clientId: 'f6820b1f-b4c5-454a-a050-e88b6e231fb5',
                action: 'download',
                multiSelect: false,
                openInNewWindow: true,
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
        this.launchOneDrivePicker().then(
            (result) => {
                if (result) {
                    for (const file of result.value) {
                        const name = file.name;
                        const url = file["@microsoft.graph.downloadUrl"];
                        fetch(url)
                            .then(response => response.blob())
                            .then(blob => {
                                const formData = new FormData();
                                const myblob = new Blob([blob], { type: blob.type });
                                const myfile = new File([myblob], name, { type: blob.type, lastModified: Date.now() });
                                formData.append('data_file', myfile);
                                this.userService.uploadfile(formData).subscribe(
                                    resp => {
                                        this.interconn.afterfileupload();
                                        this.getfunds();
                                        this.modalService.dismissAll('File uploaded');
                                        this.toast.success('File uploaded sucessfuly', 'Success');
                                    },
                                    error => {
                                        this.toast.error('Improper file,Could not upload file', 'Error');
                                    });
                            });
                    }
                }
            }).catch(reason => { });
    }

    drive_fileupload() {
        this.fileupload.onApiLoad("Create Fund");
        this.modalService.dismissAll('File upload');
        this.getfunds();
    }

    onSort({ column, direction }: SortEvent) {
        this.headers.forEach(header => {
            if (header.sortable !== column) {
                header.direction = '';
            }
        });
        this.fundservice.sortColumn = column;
        this.fundservice.sortDirection = direction;
    }

    delete_Portfolio(id) {
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
                    this.userService.delete_PortfolioFund(id).subscribe(result => {
                        this.getfunds();
                    })
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

}