import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

    uid: any;
    token: any;
    password1 = '';
    password2 = '';

    constructor(
        private route: ActivatedRoute,
        private userservice: ServercommunicationService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.uid = params['uid'];
        });
        this.route.params.subscribe(params => {
            this.token = params['token'];
        });
    }

    resetpasswordreq() {
        if (this.password1 == this.password2) {
            this.userservice.resetpassword_req(this.uid, this.token, this.password1, this.password2).toPromise().then(
                data => {
                    this.toastr.success('success', 'Password has been succesfully reset!')
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
            this.toastr.error('error', 'Password and confirmation password does not match each other!')
        }
    }

}
