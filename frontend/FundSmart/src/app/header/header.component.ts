import { Component, OnInit } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { ServercommunicationService } from '../servercommunication.service';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import * as $ from 'jquery';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
    currentuser: any;
    username = 'login';
    socialuser: SocialUser;
    closeResult: string;
    oldpass = '';
    newpass = '';
    confirmpass = '';
    title = '';

    constructor(
        private modalService: NgbModal,
        private service: ServercommunicationService,
        private intercon: IntercomponentCommunicationService,
        private toastr: ToastrService
    ) {
        this.intercon.titlesettercalled$.subscribe(msg => this.title = msg);
        this.intercon.componentMethodCalled$.subscribe(() => {
            this.setcurrent_user();
        });
        this.intercon.logoutcomponentMethodCalled$.subscribe(() => {
            this.currentuser = undefined;
        });
    }

    ngOnInit() {
        this.service.checklogin();
    }

    setcurrent_user() {
        this.currentuser = this.service.currentuser;
        this.username = this.service.currentuser.username;
    }

    open_sidemenu() {
        $(".user-drop-down").addClass("open-user-sub-menu");
    }

    closeMenu() {
        $('.user-drop-down').removeClass("open-user-sub-menu");
    }

    header_modals(modalid) {
        this.modalService.open(modalid, {
            ariaLabelledBy: 'app-home',
            windowClass: 'long-pop sign-pop', centered: true
        }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    userlogout() {
        this.service.logout();
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

    changepassword() {
        if (this.newpass == this.confirmpass) {
            this.service.change_password(this.oldpass, this.newpass, this.confirmpass).toPromise().then(data => {
                this.toastr.success('success', 'Password has been changed successfully!')
                this.oldpass = '';
                this.newpass = '';
                this.confirmpass = '';
            }).catch(
                (error: any) => {
                    let errormsg = '';
                    for (let i = 0; i < error['error']['new_password2'].length; i++) {
                        errormsg += error['error']['new_password2'][i] + ' \n';
                    }
                    this.toastr.error(errormsg, 'Error');
                });
        }
        else {
            this.toastr.error('Error!', 'New password and Confirm password does not match!');
        }
    }

    resetpass_modal() {
        $(".forgot-password-wrap").addClass("show-forgot");
        $(".login-content").addClass("hide-login");
        $(".forgot-password-title").addClass("show-forgot");
        $(".login-title").addClass("d-none");
    }

    updateuserprofile() {
        this.service.update_User(this.currentuser).toPromise().then(data => {
            this.setcurrent_user();
            this.modalService.dismissAll();
            alert('Data Updated');
        }, error => { });
    }

}
