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
    _id: any;
    result: any = [];
    selectedIDs: any = [];
    searchText: string;
    name: any;
    description: any;
    owner_1: any;
    owner_2: any;
    type: any;
    marginal_tax_range: any;
    location: any;
    created_by: any;
    portfolioDetailList = portfolioList;

    updated_by: any;

    constructor(
        private userService: ServercommunicationService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private interconn: IntercomponentCommunicationService,
        private confirmationService: ConfirmationService,
        private router: Router,
        public sortlist: FundService,

    ) {
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.getFunds();
            });
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.router.navigate(['/home']);
                portfolioList.length = 0;
                this.sortlist.resetHoldingDetails();
                this.sortlist.hlist$.subscribe(f => {
                    this.portfolioDetailList = f;
                });
            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod("Funds");
        if (this.userService.currentuser) {
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
                    this.portfolioDetailList = f;
                });
            });
    }

    addPortfolioData() {
        this.userService.addPortfolioFund(
            this.name,
            this.description,
            this.owner_1,
            this.owner_2,
            this.type,
            this.marginal_tax_range,
            this.location).toPromise().then(result => {
                this.getFunds();
            });
        this.name = '';
        this.description = '';
        this.owner_1 = '';
        this.owner_2 = '';
        this.type = '';
        this.marginal_tax_range = '';
        this.location = '';
    }

    header_modals(modalid, fund?) {
        if (fund) {
            this.fund = fund;
            this.name = fund.name;
            this.description = fund.description;
            this.type = fund.type;
            this.marginal_tax_range = fund.marginal_tax_range;
            this.owner_1 = fund.owner_1;
            this.owner_2 = fund.owner_2;
            this.location = fund.location;
        }
        this.modalService.open(modalid, {
            ariaLabelledBy: 'app-fund',
            windowClass: 'long-pop sign-pop', centered: true
        }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    updatePortfolioData(_id) {
        let fundupdate = {
            name: this.name,
            description: this.description,
            owner_1: this.owner_1,
            owner_2: this.owner_2,
            type: this.type,
            marginal_tax_range: this.marginal_tax_range,
            location: this.location,
        };
        this.userService.update_One_Object(fundupdate, _id).toPromise().then(
            data => {
                let index = this.portfolioDetailList.findIndex(fund => fund['id'] === _id);
                this.portfolioDetailList[index].name = data['name'];
                this.portfolioDetailList[index].description = data['description'];
                this.toastr.success('Portfolio Updated!', 'Portfolio Updated!');
            });
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