import { Component, OnInit, ViewChild } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-fund',
    templateUrl: './fund.component.html',
    styleUrls: ['./fund.component.css']
})
export class FundComponent implements OnInit {
    result: any = [];
    closeResult: string;
    _id: any;
    fund: any;

    constructor(private userService: ServercommunicationService, private modalService: NgbModal) { }

    ngOnInit() {
        this.getFunds();
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
                alert('Data Updated');
            });
    }

    delete_Portfolio(id) {
        this.userService.delete_Portfolio(id).subscribe(
            result => {
                this.getFunds();
            });
    }

}
