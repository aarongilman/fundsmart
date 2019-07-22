import { Component, OnInit } from '@angular/core';
import { Data, ActivatedRoute } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import Swal from 'sweetalert2';

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
  constructor(private route: ActivatedRoute, private userservice: ServercommunicationService) {

  }

  ngOnInit() {
    // this.route.queryParams.forEach((data: Data) => {
    //   this.uid = data['uid'];
    //   this.token = data['token'];



    // });
    // console.log(this.uid);
    // console.log(this.token);

    this.route.params.subscribe(params => {
      this.uid = params['uid'];
      // console.log(params['uid']);
    });
    this.route.params.subscribe(params => {
      this.token = params['token'];
      // console.log(params['token']);
    });

  }

  resetpasswordreq() {
    if (this.password1 == this.password2) {
      this.userservice.resetpassword_req(this.uid, this.token, this.password1, this.password2).subscribe(
        data => {
          // console.log(data);
          Swal.fire("Reset Password", data['detail'], 'success');
          // alert(data['detail']);
        },
        error => {
          Swal.fire("Reset Password", error, 'error');
        }
      );
    }
    else {
      Swal.fire("Reset Password", ' Password and confirmation password does not match each other', 'error');
    }
  }
}
