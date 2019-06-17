import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../user';
import { portfolio_fund } from '../portfolio_fund';
import { security } from '../security';
import * as $ from 'jquery';
import { ServercommunicationService } from '../servercommunication.service';
import { AuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { GetfileforuploadService } from '../getfileforupload.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  securitylist: security[] = [];
  userFunds: portfolio_fund[] = [];
  reguser: User = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password1: '',
    password2: ''
  };
  files: any = [];
  currentUser: any;

  socialuser: SocialUser;
  loggedIn: boolean;

  closeResult: string;
  showdetail_flag = false;
  firstname = '';
  lastname = '';
  email = '';
  phone = '';
  pass1 = '';
  pass2 = '';
  username = '';


  constructor(private modalService: NgbModal, private interconn: IntercomponentCommunicationService,
    private userservice: ServercommunicationService,
    private fileupload: GetfileforuploadService,
    private authService: AuthService) {
    this.interconn.componentMethodCalled$.subscribe(
      () => {
        this.setcurrent_user();
      });
  }

  ngOnInit() {
    this.userservice.get_security().subscribe(
      securitylist => {
        // console.log(securitylist);
        // tslint:disable-next-line: forin
        for (var obj in securitylist) {
          var securityobj: security = {
            id: -1,
            isin: '',
            name: '',
            ticker: ''
          };
          securityobj.id = securitylist[obj]['id'];
          securityobj.isin = securitylist[obj]['isin'];
          securityobj.name = securitylist[obj]['name'];
          securityobj.ticker = securitylist[obj]['ticker'];
          this.securitylist.push(securityobj);
        }
      }
    );
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');
      this.userservice.get_portfolio_fund().subscribe(
        fundlist => {
          console.log(fundlist);
        },
        error => {
          console.log(error);
        }
      );
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');
      this.userservice.get_portfolio_fund().subscribe(
        fundlist => {
          console.log(fundlist);
        },
        error => {
          console.log(error);
        }
      );
    });
  }

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
          this.userservice.getUser(data['key']);
          this.userservice.get_portfolio_fund().subscribe(
            fundlist => {
              console.log(fundlist);
            },
            error => {
              console.log(error);
            }
          );
        },
          error => {
            alert('error occured');
          });
      } else {
        alert('Password doesnot match');
      }
    }
  }

  setfunds(fundlist) {

    var datalist, obj;

    // tslint:disable-next-line: forin
    // for (datalist in fundlist['results']) {
    //   console.log("datalist" + fundlist['results'][datalist]['security']);

    // console.log("Length of datalist ", datalist.length);

    for (obj = 0; obj < fundlist['results'].length; obj++) {
      var singlefund: portfolio_fund = {
        security: '',
        yourPortfolio: '',
        comparision1: '',
        comparision2: ''
      };
      // console.log(obj);
      // console.log(fundlist['results'][obj]['security']);

      singlefund.security = fundlist['results'][obj]['security'];
      singlefund.yourPortfolio = fundlist['results'][obj]['quantity'];
      obj++;

      if (singlefund.security == fundlist['results'][obj]['security']) {
        singlefund.comparision1 = fundlist['results'][obj]['quantity'];
        obj++;
      }



      if (singlefund.security == fundlist['results'][obj]['security']) {
        singlefund.comparision2 = fundlist['results'][obj]['quantity'];
      }
      console.log("Single fund", singlefund);
      this.userFunds.push(singlefund);
    }
    console.log("User funds array", this.userFunds);

    // }
  }

  userlogin() {
    this.userservice.doLogin(this.username, this.pass1).subscribe(
      data => {
        console.log(data['key']);
        this.userservice.getUser(data['key']);
        this.modalService.dismissAll('Login Done');
        this.username = '';
        this.pass1 = '';
        this.userservice.get_portfolio_fund().subscribe(
          fundlist => {
            // console.log(fundlist);
            this.setfunds(fundlist);


          },
          error => {
            console.log(error);
          }
        );
      },
      error => {
        alert('Wrong Credentials / Server Problem');
      }
    );
  }

  openmodal(modalid) {
    this.modalService.open(modalid, { ariaLabelledBy: 'app-home' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  resetpassword() {
    this.userservice.reset_pwd_sendemail(this.email).subscribe(data => {
      console.log(data);
    },
      error => {
        console.log(error);
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


  resetpass_modal() {
    // alert('click on forget password');
    $(".forgot-password-wrap").addClass("show-forgot");
    $(".login-content").addClass("hide-login");
  }



  uploadFile(event) {
    // alert('upload file event');
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element.name);
      console.log(element);

      const formData = new FormData();
      formData.append('data_file', element);
      this.userservice.uploadfile(formData).subscribe(
        res => {
          console.log(res);
        },
        error => {
          console.log(error);
        }
      );
      this.modalService.dismissAll('Log in Done');
    }
  }

  deleteAttachment(index) {
    this.files.splice(index, 1);
  }

  dropboxupload() {
    this.fileupload.getUserInfo();
  }

  onedrivefileupload() {

  }

  drive_fileupload() {
    // alert('abc');
    this.fileupload.onApiLoad();
    this.modalService.dismissAll('File upload');
  }

  setcurrent_user() {
    this.currentUser = this.userservice.currentuser;
  }
}
