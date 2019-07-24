import { Component, OnInit, NgModule, OnDestroy } from '@angular/core';
import { ServercommunicationService } from './servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import {
    NgcCookieConsentModule, NgcNoCookieLawEvent, NgcStatusChangeEvent,
    NgcInitializeEvent, NgcCookieConsentService
} from 'ngx-cookieconsent';
import { Subscription } from 'rxjs/Subscription';

@NgModule({
    imports: [NgcCookieConsentModule],
})

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
    // cookie consents
    private popupOpenSubscription: Subscription;
    private popupCloseSubscription: Subscription;
    private initializeSubscription: Subscription;
    private statusChangeSubscription: Subscription;
    private revokeChoiceSubscription: Subscription;
    private noCookieLawSubscription: Subscription;


    title = 'FundSmart';
    closeResult: string;
    showdetail_flag = false;
    currentuser;
    constructor(private modalService: NgbModal, private userservice: ServercommunicationService,
        private interconn: IntercomponentCommunicationService,
        private ccService: NgcCookieConsentService) {
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.currentuser = this.userservice.currentuser;
            }
        );
    }

    ngOnInit() {
        // subscribe to cookieconsent observables to react to main events
        this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
            () => {
                // you can use this.ccService.getConfig() to do stuff...
            });

        this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
            () => {
                // you can use this.ccService.getConfig() to do stuff...
            });

        this.initializeSubscription = this.ccService.initialize$.subscribe(
            (event: NgcInitializeEvent) => {
                // you can use this.ccService.getConfig() to do stuff...
            });

        this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
            (event: NgcStatusChangeEvent) => {
                // you can use this.ccService.getConfig() to do stuff...
            });

        this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
            () => {
                // you can use this.ccService.getConfig() to do stuff...
            });

        this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
            (event: NgcNoCookieLawEvent) => {
                // you can use this.ccService.getConfig() to do stuff...
            });

        this.currentuser = this.userservice.currentuser;

    }

    ngOnDestroy() {
        // unsubscribe to cookieconsent observables to prevent memory leaks
        this.popupOpenSubscription.unsubscribe();
        this.popupCloseSubscription.unsubscribe();
        this.initializeSubscription.unsubscribe();
        this.statusChangeSubscription.unsubscribe();
        this.revokeChoiceSubscription.unsubscribe();
        this.noCookieLawSubscription.unsubscribe();
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