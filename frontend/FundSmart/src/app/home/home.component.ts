import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../user';
import * as $ from 'jquery';
import { ServercommunicationService } from '../servercommunication.service';
import { addToViewTree } from '@angular/core/src/render3/instructions';
import { AuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  reguser: User = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password1: '',
    password2: ''
  };
  currentUser: User;
  closeResult: string;
  showdetail_flag = false;
  firstname = '';
  lastname = '';
  email = '';
  phone = '';
  pass1 = '';
  pass2 = '';
  username = '';

  constructor(private modalService: NgbModal, private userservice: ServercommunicationService, private authService: AuthService) { }

  ngOnInit() {
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  // signInWithFB(): void {
  //   this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  // }

  signOut(): void {
    this.authService.signOut();
  }

  login() {

  }

  registerUser() {
    if (this.showdetail_flag === false) {
      $(".register-slide").slideDown("500");
      this.showdetail_flag = true;
    } else {
      if (this.pass1 == this.pass2) {
        this.reguser.firstname = this.firstname;
        this.reguser.lastname = this.lastname;
        this.reguser.email = this.email;
        this.reguser.phone = this.phone;
        this.reguser.password1 = this.pass1;
        this.reguser.password2 = this.pass2;
        this.reguser.username = this.username;
        this.userservice.doRegistration(this.reguser).subscribe(data => {
          alert('registration successful');
          this.firstname = '';
          this.lastname = '';
          this.email = '';
          this.phone = '';
          this.pass1 = '';
          this.pass2 = '';
          this.username = '';
          this.showdetail_flag = false;
          this.modalService.dismissAll('Registration Done');
        },
          error => {
            alert('error occured');
          });
      } else {
        alert('Password doesnot match');
      }
    }
  }

  userlogin() {
    this.userservice.doLogin(this.username, this.pass1).subscribe(
      data => {
        this.modalService.dismissAll('Login Done');
      },
      error => {
        alert('Wrong Credentials / Server Problem');
      }
    );
  }

  openmodal(modalid) {
    this.modalService.open(modalid, { centered: true, ariaLabelledBy: 'app-home' }).result.then((result) => {
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
}


