import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
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

declare var Dropbox: Dropbox;

interface Dropbox {
    choose(options: DropboxChooseOptions): void;
}

interface DropboxChooseOptions {
    success(files: DropboxFile[]);
    cancel?(): void;
    // linkType: "direct";
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
    // "@microsoft.graph.downloadUrl": string;
    // "thumbnails@odata.context": string;
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
    action: "download" | "share" | "query";
    multiSelect: boolean;
    openInNewWindow: boolean;
    advanced: {
        filter?: string;
    }
    success(files: OneDriveResult): void;
    cancel(): void;
}

interface OneDrive {
    open(options: OneDriveOpenOptions);
}

declare var OneDrive: OneDrive;
// interface OneDriveResult {
//     value: OneDriveFile[];
//     webUrl: string | null;
// }
// interface OneDriveFile {
//     "@microsoft.graph.downloadUrl": string;
//     "thumbnails@odata.context": string;
//     id: string;
//     name: string;
//     size: number;
//     thumbnails: Thumbnails[];
//     webUrl: string;
// }
// interface Thumbnails {
//     id: string;
//     large: Thumbnail;
//     medium: Thumbnail;
//     small: Thumbnail;
// }

// interface Thumbnail {
//     height: number;
//     width: number;
//     url: string;
// }

interface DropboxFile {
    name: string;
    link: string;
    bytes: number;
    icon: string;
    thumbnailLink?: string;
    isDir: boolean;
}

// declare var OneDrive: OneDrive;

// interface OneDrive {
//     open(options: OneDriveChooseOptions): void;
// }

// interface OneDriveChooseOptions {
//     clientId: "f6820b1f-b4c5-454a-a050-e88b6e231fb5",
//     success(files);
//     cancel?(): void;
//     action: "download",
//     openInNewWindow: true,
//     viewType: 'files',
//     advanced: {
//         filter: "folder,.xlsx"
//     },
//     multiselect: true,
// }

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
    // maxdate = (date:NgbDate, current: {month:number})
    portfoliolist = [];
    portfolio1: any;
    comparision1: any;
    comparision2: any;
    selectedp: any;
    selectedDate: any;

    @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
    // private spread: GC.Spread.Sheets.Workbook;
    private excelIO;
    constructor(
        private modalService: NgbModal,
        private fileupload: GetfileforuploadService,
        private userservice: ServercommunicationService,
        private interconn: IntercomponentCommunicationService,
        public fundservice: FundcreatesortService,
        private calendar: NgbCalendar,
    ) {
        // this.excelIO = new Excel.IO();
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.setcurrent_user();
                this.getUserPortfolios();
                // this.getfunds();
            });
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.resetfunds();
                this.portfoliolist.length = 0;
            });

        this.selectedDate = calendar.getToday();
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
        this.userservice.get_portfolio_fund().subscribe(
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
        this.userservice.get_portfolio_fund_by_date(date).subscribe(
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
            // fund.security = name;
        } catch {
            return null;
        }
    }

    updatefundquantity(item) {
        if (item.id === -1) {
            this.userservice.add_portfolio_fund(
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
            this.userservice.updateportfoliofund(
                item.id,
                item.quantity,
                item.portfolio,
                item.security,
                this.currentUser['id']).subscribe();
        }
    }

    getUserPortfolios() {
        this.userservice.getUserPortfolio().subscribe(data => {
            this.portfoliolist.length = 0;
            // tslint:disable-next-line: forin
            for (let d in data['results']) {
                this.portfoliolist.push(data['results'][d]);
            }
            // this.portfolio1 = data['results']['0'];
            // this.comparision1 = data['results']['1'];
            // this.comparision2 = data['results']['2'];
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
        this.userservice.postPrice(fund.id, fund.price, date).subscribe(data => {
            let resfund = this.fundlist.find(x => x === fund);
            let index = this.fundlist.indexOf(resfund);
            apiresultfundlist[index]['price'] = data['current_price'];
        });
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

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;

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
            this.userservice.uploadfile(formData).subscribe(
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
                    console.log(typeof (file), "type of fie", file);
                    url = file.link;
                    fetch(url).then(response => response.blob()).then(filedata => {
                        console.log("hjs", filedata);

                        const formData = new FormData();
                        const blob = new Blob([filedata], { type: filedata.type });
                        const myfile = new File([blob], name, { type: filedata.type, lastModified: Date.now() });
                        formData.append('data_file', myfile);
                        that.userservice.uploadfile(formData).subscribe(
                            resp => {
                                console.log(resp);
                                that.interconn.afterfileupload();
                                this.getfunds();
                                this.modalService.dismissAll('File uploaded');
                            }
                        );
                    }).catch(reason => {
                        console.error(reason);
                    });
                }
            },
            cancel: () => {
            },
            // linkType: "direct",
            multiselect: false,
            extensions: ['.xlsx', '.xls', '.csv'],
        };
        Dropbox.choose(options);
    }


    s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    onedrivefileupload() {
        let url: any;
        document.getElementById("OpenDropboxFilePicker").addEventListener("click", e => {
            var options: OneDriveOpenOptions = {
                success: (files) => {
                    let that = this;
                    for (const file of files.value) {
                        const name = file.name;
                        url = file.link;
                        fetch(url).then(response => response.blob()).then(filedata => {
                            console.log(filedata);
                            var url = URL.createObjectURL(new Blob([filedata], { type: 'application/octet-stream' }));
                            console.log(url);
                            const formData = new FormData();
                            //   const blob = new Blob([filedata], { type: filedata.type });
                            const blob = new Blob([filedata], { type: 'application/vnd.ms-excel' });
                            //  const myfile = new File([blob], name, { type: filedata.type, lastModified: Date.now() });
                            const myfile = new File([blob], name, { type: 'application/vnd.ms-excel', lastModified: Date.now() });
                            formData.append('data_file', myfile);
                            that.userservice.uploadfile(formData).subscribe(
                                resp => {
                                    that.interconn.afterfileupload();
                                    this.modalService.dismissAll('File uploaded');
                                }
                            );
                        });
                    }
                },
                clientId: 'f6820b1f-b4c5-454a-a050-e88b6e231fb5',
                action: "download",
                multiSelect: true,
                openInNewWindow: true,
                advanced: {
                    //filter: "folder,.png" /* display folder and files with extension '.png' only */
                    filter: "folder,.xlsx"
                },
                cancel: () => {
                },
            };
            OneDrive.open(options);
        });
    }

    // onedrivefileupload() {
    //     let url: any;
    //     return new Promise<OneDriveResult | null>((resolve, reject) => {
    //     var options: OneDriveChooseOptions = {
    //         clientId: "f6820b1f-b4c5-454a-a050-e88b6e231fb5",
    //         success: (files) => {
    //             let that = this;
    //             for (const file of files.value) {
    //                 const name = file.name;
    //                 console.log(typeof (file), "type of fie", file);
    //                 url = file.link;
    //                 fetch(url).then(response => response.blob()).then(filedata => {
    //                     const formData = new FormData();
    //                     const blob = new Blob([filedata], { type: filedata.type });
    //                     const myfile = new File([blob], name, { type: filedata.type, lastModified: Date.now() });
    //                     formData.append('data_file', myfile);
    //                     resolve(files);
    //                     that.userservice.uploadfile(formData).subscribe(
    //                         resp => {
    //                             console.log(resp);
    //                             that.interconn.afterfileupload();
    //                             this.getfunds();
    //                             this.modalService.dismissAll('File uploaded');
    //                         }
    //                     );
    //                 });
    //             }

    //         },

    //         cancel: () => {
    //         },
    //         openInNewWindow: true,
    //         multiselect: true,
    //         action: "download",
    //         viewType: 'files',
    //         advanced: {
    //             filter: "folder,.xlsx"
    //         }
    //         // fileName: "PortfoliofundsFileupload.xlsx",

    //     };

    //     OneDrive.open(options);
    //      })
    //   }

    drive_fileupload() {
        this.fileupload.onApiLoad();
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

}