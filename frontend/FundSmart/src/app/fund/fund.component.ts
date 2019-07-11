import { Component, OnInit, ViewChild } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-fund',
    templateUrl: './fund.component.html',
    styleUrls: ['./fund.component.css']
})

export class FundComponent implements OnInit {
    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;
    result: any = [];
    closeResult: string;
    _id: any;
    fund: any;
    SelectedIDs: any = [];
    searchText: string;
    contextMenuPosition = { x: '0px', y: '0px' };
    name: any;
    description: any;
    owner_1: any;
    owner_2: any;
    type: any;
    marginal_tax_range: any;
    location:any;
    created_by: any;
    updated_by: any;

    constructor(
        private userService: ServercommunicationService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private interconn: IntercomponentCommunicationService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) { }

    ngOnInit() {
        this.interconn.titleSettermethod("Funds");
        this.getFunds();
    }

    onContextMenu(event: MouseEvent, item: Item) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'item': item };
        this.contextMenu.openMenu();
    }

    getFunds() {
        this.userService.getUserPortfolio().subscribe(
            fundlist => {
                this.result = fundlist;
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
            this.created_by).subscribe(result => {
            this.getFunds();
        });
    }

    header_modals(modalid, fund?) {
        this.fund = fund;
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
        this.userService.update_One_Object(this.fund, _id).subscribe(
            data => {
                this.toastr.success('Portfolio Updated!', 'Portfolio Updated!');
            });
    }

    delete_Portfolio(id) {
        this.confirmationService.confirm({
            message: 'Do you want to delete this Portfolio?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            accept: () => {
                this.userService.delete_Portfolio(id).subscribe(result => {
                    this.getFunds();
                    this.toastr.success('Success', 'Portfolio Deleted Successfully');
                });
            },
            reject: () => {
                this.toastr.error('', 'Request Rejected For Deletion');
            }
        });
    }

    selectID(item) {
        if (this.SelectedIDs.find(x => x == item)) {
            this.SelectedIDs.splice(this.SelectedIDs.indexOf(item), 1);
        } else {
            this.SelectedIDs.push(item);
        }
    }

    onContextMenuAction1() {
        this.router.navigate(['/holding_summary'], { queryParams: { id: this.SelectedIDs } });
    }

    onContextMenuAction2() {
        this.router.navigate(['/holding_details']);
    }

    onContextMenuAction3() {
        this.router.navigate(['/fund_reccommendation']);
    }

    onContextMenuAction4() {
        this.router.navigate(['/allocation_recommendation']);
    }

}

export interface Item { }