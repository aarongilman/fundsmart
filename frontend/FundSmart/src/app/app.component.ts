import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from './servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IntercomponentCommunicationService } from './intercomponent-communication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'FundSmart';
    closeResult: string;
    showdetail_flag = false;
    currentuser;
    constructor(private modalService: NgbModal, private userservice: ServercommunicationService,
        private interconn: IntercomponentCommunicationService) {
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.currentuser = this.userservice.currentuser;
            }
        );
    }

    ngOnInit() {
        this.currentuser = this.userservice.currentuser;
        console.log(this.userservice.currentuser);
    }

    openmodal(modalid, str) {
        // alert("type of modal is" + typeof(modalid));
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
}