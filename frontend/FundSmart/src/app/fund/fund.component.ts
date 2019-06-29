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
    total = 0;
    closeResult: string;
    portfolio: any;

    constructor(private userService: ServercommunicationService, private modalService: NgbModal
    ) { }

    ngOnInit() {
        this.getFunds();
    }



    getFunds() {
        this.userService.getUserPortfolio().subscribe(
            fundlist => {
                this.result = fundlist;
                console.log("result", this.result);
            })
    }

    header_modals(modalid) {
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

    updatePortfolio() {
        this.userService.update_One_Object(this.portfolio).subscribe(
            data => {
                console.log("data", data);
                alert('Data Updated');
            }
        )
    }
}
