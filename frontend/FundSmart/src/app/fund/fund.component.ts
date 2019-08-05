import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { ConfirmationService } from 'primeng/api';
import { SortableDirective, SortEvent } from '../sortable.directive';
import { FundService } from './fund.service';
import { portfolioList } from './portfolioList';
import { portfolioidSelect } from './portfolioid_select';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-fund',
    templateUrl: './fund.component.html',
    styleUrls: ['./fund.component.css']
})

export class FundComponent implements OnInit {
    @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;
    contextMenuPosition = { x: '0px', y: '0px' };
    closeResult: string;
    fund: any;
    result: any = [];
    selectedIDs: any = [];
    searchText: string;
    portfolioDetailList = portfolioList;
    submitted = false;
    portfolioFormGroup: FormGroup;
    update: boolean;
    updatefund_id: number;

    constructor(
        private userService: ServercommunicationService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private interconn: IntercomponentCommunicationService,
        private confirmationService: ConfirmationService,
        private router: Router,
        public sortlist: FundService,
        private formBuilder: FormBuilder,
        private spinner: NgxSpinnerService
    ) {
        this.portfolioFormGroup = this.formBuilder.group(
            {
                name: new FormControl('', Validators.required),
                description: new FormControl(''),
                owner_1: new FormControl(''),
                owner_2: new FormControl(''),
                type: new FormControl(''),
                marginal_tax_range: new FormControl(null),
                location: new FormControl(''),
            });
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.spinner.show();
                this.getFunds();
            });
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.router.navigate(['/home']);
                portfolioList.length = 0;

            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod("Funds");
        if (this.userService.currentuser) {
            this.spinner.show();
            this.getFunds();
        }
    }

    onContextMenu(event: MouseEvent, item: Item) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'item': item };
        this.contextMenu.openMenu();
    }

    getFunds() {
        this.userService.getUserPortfolio().toPromise().then(
            fundlist => {
                portfolioList.length = 0;
                fundlist['results'].forEach(element => {
                    element['ischecked'] = false;
                    if (portfolioidSelect.length > 0) {
                        portfolioidSelect.forEach(id => {
                            if (element['id'] === Number.parseInt(id)) {
                                element['ischecked'] = true;
                            }
                        });
                    }
                    portfolioList.push(element);
                });
                this.sortlist.resetHoldingDetails();
                this.sortlist.hlist$.subscribe(f => {
                    this.portfolioDetailList = JSON.parse(JSON.stringify(f));
                    this.spinner.hide();
                });
            });
    }

    header_modals(modalid, fund?) {
        if (this.userService.currentuser === undefined) {
            this.toastr.info('Please Log in first');
        } else {
            if (fund) {
                this.updatefund_id = fund.id;
                this.update = true;
                this.portfolioFormGroup.setValue({
                    name: fund.name,
                    description: fund.description,
                    owner_1: fund.owner_1,
                    owner_2: fund.owner_2,
                    type: fund.type,
                    marginal_tax_range: fund.marginal_tax_range,
                    location: fund.location
                });
            } else {
                this.update = false;
            }
            this.modalService.open(modalid, {
                windowClass: 'long-pop sign-pop', centered: true
            }).result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        }
    }

    private getDismissReason(reason: any): string {
        this.portfolioFormGroup.reset();
        this.submitted = false;
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    get f() { return this.portfolioFormGroup.controls; }

    updatePortfolioData() {
        this.submitted = true;
        if (this.portfolioFormGroup.invalid) {
            return;
        }
        if (this.updatefund_id === undefined || this.updatefund_id === null) {
            this.userService.addPortfolioFund(JSON.parse(JSON.stringify(this.portfolioFormGroup.value))).toPromise().then(result => {
                this.getFunds();
                this.modalService.dismissAll('Added Portfolio');
                this.submitted = false;
            });
        } else {
            this.userService.update_One_Object(JSON.parse(JSON.stringify(this.portfolioFormGroup.value)), this.updatefund_id).toPromise().then(
                data => {
                    let index = this.portfolioDetailList.findIndex(fund => fund['id'] === this.updatefund_id);
                    this.portfolioDetailList[index].name = data['name'];
                    this.portfolioDetailList[index].description = data['description'];
                    this.modalService.dismissAll('Portfolio Updated!');
                    this.toastr.success('Portfolio Updated!', 'Portfolio Updated!');
                    this.updatefund_id = undefined;
                    this.submitted = false;
                    this.update = false;
                });
        }
    }

    delete_Portfolio(id) {
        this.confirmationService.confirm({
            message: 'Do you want to delete this Portfolio?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            accept: () => {
                this.userService.delete_Portfolio(id).toPromise().then(result => {
                    if (portfolioidSelect.find(xid => xid === id)) {
                        portfolioidSelect.splice(portfolioidSelect.indexOf(id), 1);
                    }
                    this.getFunds();
                    this.toastr.success('Portfolio Deleted Successfully', 'Success');
                });
            },
            reject: () => {
                this.toastr.error('', 'Request Rejected For Deletion');
            }
        });
    }

    selectID(item) {
        // if (this.selectedIDs.find(x => x == item)) {
        //     this.selectedIDs.splice(this.selectedIDs.indexOf(item), 1);
        // } else {
        //     this.selectedIDs.push(item);
        // }
        let index = portfolioList.findIndex(p => p['id'] === item);
        if (portfolioList[index]['ischecked'] === true) {
            portfolioList[index]['ischecked'] = false;
        } else {
            portfolioList[index]['ischecked'] = true;
        }
        if (portfolioidSelect.find(x => x === item)) {
            portfolioidSelect.splice(portfolioidSelect.indexOf(item), 1);
        } else {
            portfolioidSelect.push(item);
        }
    }

    onContextMenuAction1() {
        this.router.navigate(['/holding_summary']);
    }

    onContextMenuAction2() {
        this.router.navigate(['/create_fund']);
    }

    onContextMenuAction3() {
        this.router.navigate(['/holding_details']);
    }

    onContextMenuAction4() {
        this.router.navigate(['/fund_recommendation']);
    }

    onContextMenuAction5() {
        this.router.navigate(['/allocation_recommendation']);
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

}

export interface Item { }