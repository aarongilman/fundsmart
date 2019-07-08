import { Component, OnInit, ViewChild } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';

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


    constructor(
        private userService: ServercommunicationService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private router: Router
    ) { }

    ngOnInit() {
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
        this.userService.delete_Portfolio(id).subscribe(
            result => {
                this.getFunds();
            });
    }

    selectID(item) {
        if (this.SelectedIDs.find(x => x == item)) {
            this.SelectedIDs.splice(this.SelectedIDs.indexOf(item), 1);
            //console.log(this.SelectedIDs);
        } else {
            this.SelectedIDs.push(item)
           // console.log(this.SelectedIDs);
        }
    }

    onContextMenuAction1() {
        // this is query params 

        this.router.navigate(['/holding_summary'], { queryParams: { id: this.SelectedIDs } });

        // console.log('hiiiiii', this.SelectedIDs);

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