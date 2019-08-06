import { Component, OnInit, NgModule, OnDestroy } from '@angular/core';
import { ServercommunicationService } from './servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import {
    NgcCookieConsentModule,
    NgcStatusChangeEvent,
    NgcInitializeEvent,
    NgcCookieConsentService
} from 'ngx-cookieconsent';
import { Subscription } from 'rxjs/Subscription';
import * as $ from 'jquery';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MustMatch } from './must-match.validator';
import Swal from 'sweetalert2';
import { FacebookLoginProvider, GoogleLoginProvider, AuthService } from 'angularx-social-login';

@NgModule({
    imports: [NgcCookieConsentModule],
})

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit, OnDestroy {
    private popupOpenSubscription: Subscription;
    private popupCloseSubscription: Subscription;
    private initializeSubscription: Subscription;
    private statusChangeSubscription: Subscription;
    private revokeChoiceSubscription: Subscription;
    private noCookieLawSubscription: Subscription;

    model: any = {};
    registeruserForm: FormGroup;
    submitted = false;
    title = 'FundSmart';
    closeResult: string;
    showdetail_flag = false;
    currentuser;
    islogin: boolean;
    constructor(
        private modalService: NgbModal,
        private userservice: ServercommunicationService,
        private interconn: IntercomponentCommunicationService,
        private ccService: NgcCookieConsentService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private toastrService: ToastrService) {
        if (sessionStorage.getItem('authkey')) {
            console.log('Has authkey');
            this.islogin = true;
        } else {
            console.log('no authkey');
            this.islogin = false;
        }
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.currentuser = this.userservice.currentuser;
                this.islogin = true;
                console.log('is login', this.islogin);

            }
        );
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.currentuser = undefined;
                this.islogin = false;
                console.log('is login', this.islogin);

            }
        );
    }

    ngOnInit() {
        this.registeruserForm = this.formBuilder.group(
            {
                username: new FormControl('', Validators.required),
                first_name: new FormControl('', Validators.required),
                last_name: new FormControl('', Validators.required),
                email: new FormControl('', Validators.compose([
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
                phone_number: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])),
                password1: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
                password2: new FormControl('', Validators.required),
            },
            {
                validator: MustMatch('password1', 'password2')
            });
        this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
            () => {
            });
        this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
            () => {
            });
        this.initializeSubscription = this.ccService.initialize$.subscribe(
            (event: NgcInitializeEvent) => {
            });
        this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
            (event: NgcStatusChangeEvent) => {
            });
        this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
            () => { });
        this.currentuser = this.userservice.currentuser;
    }

    ngOnDestroy() {
        this.popupOpenSubscription.unsubscribe();
        this.popupCloseSubscription.unsubscribe();
        this.initializeSubscription.unsubscribe();
        this.statusChangeSubscription.unsubscribe();
        this.revokeChoiceSubscription.unsubscribe();
        this.noCookieLawSubscription.unsubscribe();
    }

    openmodal(modalid, str) {
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
        this.model.username = '';
        this.model.password = '';
        this.registeruserForm.reset();
        this.showdetail_flag = false;
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    userlogin() {
        this.userservice.doLogin(this.model.username, this.model.password).toPromise().then(
            data => {
                localStorage.setItem('authkey', data['key']);
                this.userservice.getUser(data['key']);
                this.modalService.dismissAll('Login Done');
            },
            error => {
                this.toastrService.error('Invalid login credentials', 'Error');
            });
    }

    get f() { return this.registeruserForm.controls; }

    registerUser() {
        if (this.showdetail_flag === false) {
            $(".register-slide").slideDown("500");
            this.showdetail_flag = true;
        } else {
            this.submitted = true;
            if (this.registeruserForm.invalid) {
                return;
            }
            this.userservice.doRegistration(JSON.stringify(this.registeruserForm.value)).toPromise().then(data => {
                localStorage.setItem('authkey', data['key']);
                this.showdetail_flag = false;
                Swal.fire('Registration', 'Please verify your email from your mail box', 'success');
                this.modalService.dismissAll('Registration Done');
                this.registeruserForm.reset();
                this.submitted = false
            },
                error => {
                    this.toastrService.error('The user with this username/email already exist!', 'Error');

                });
        }
    }

    signInWithGoogle(): void {
        this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
            this.userservice.socialLogin(user);
            this.modalService.dismissAll('Log in Done');
        }).catch(
            reason => { });
    }

    signInWithFB(): void {
        this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
            this.userservice.socialLogin(user);
            this.modalService.dismissAll('Log in Done');
        });
    }

}
