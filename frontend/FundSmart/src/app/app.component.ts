import { Component, OnInit, NgModule, OnDestroy } from '@angular/core';
import { ServercommunicationService } from './servercommunication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import {
    NgcCookieConsentModule, NgcNoCookieLawEvent, NgcStatusChangeEvent,
    NgcInitializeEvent, NgcCookieConsentService
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
    // cookie consents
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

    constructor(private modalService: NgbModal, private userservice: ServercommunicationService,
        private interconn: IntercomponentCommunicationService,
        private ccService: NgcCookieConsentService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private toastrService: ToastrService) {
        this.interconn.componentMethodCalled$.subscribe(
            () => {
                this.currentuser = this.userservice.currentuser;
            }
        );
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.currentuser = undefined;
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

        // this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
        //     (event: NgcNoCookieLawEvent) => {
        //         // you can use this.ccService.getConfig() to do stuff...
        //     });

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
        // alert(this.loginerror);
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
        this.userservice.doLogin(this.model.username, this.model.password).subscribe(
            data => {
                localStorage.setItem('authkey', data['key']);
                this.userservice.getUser(data['key']);
                this.modalService.dismissAll('Login Done');
                // this.loginForm.reset();
                // $('#Loginerror').addClass('hidden');
            },
            error => {
                this.toastrService.error('Invalid login credentials', 'Error');
                // this.loginerror = 'Invalid Login Credentials';
                // $('#Loginerror').removeClass('hidden');
                // alert('Wrong Credentials / Server Problem');
            }
        );
    }
    get f() { return this.registeruserForm.controls; }


    registerUser() {
        if (this.showdetail_flag === false) {
            $(".register-slide").slideDown("500");
            this.showdetail_flag = true;
        } else {
            this.submitted = true;

            // stop here if form is invalid
            if (this.registeruserForm.invalid) {
                return;
            }

            // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registeruserForm.value));
            this.userservice.doRegistration(JSON.stringify(this.registeruserForm.value)).subscribe(data => {
                localStorage.setItem('authkey', data['key']);
                // console.log("Key is", data['key']);
                // alert('registration successful. Plese confirm email');
                this.showdetail_flag = false;
                Swal.fire('Registration', 'Please verify your email from your mail box', 'success');
                this.modalService.dismissAll('Registration Done');
                this.registeruserForm.reset();
                this.submitted = false
            },
                error => {
                    // alert('error occured');
                    // console.log(error);


                    this.toastrService.error('The user with this username/email already exist!', 'Error');

                });
        }
    }
    signInWithGoogle(): void {
        this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
            this.userservice.socialLogin(user);
            // this.setcurrent_user();
            this.modalService.dismissAll('Log in Done');

            // this.setdataindeshboard();
            // this.createFundlist();
        }).catch(
            reason => {

            }
        );
    }

    signInWithFB(): void {
        this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
            this.userservice.socialLogin(user);
            // this.setcurrent_user();
            this.modalService.dismissAll('Log in Done');
            // this.setdataindeshboard();
            // this.createFundlist();
        });
    }
}