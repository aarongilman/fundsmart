import { Component, OnInit } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { ServercommunicationService } from '../servercommunication.service';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import * as $ from 'jquery';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

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


  constructor(private modalService: NgbModal,
    private service: ServercommunicationService,
    private intercon: IntercomponentCommunicationService) {

    this.intercon.componentMethodCalled$.subscribe(
      () => {
        this.setcurrent_user();
      });

    this.intercon.logoutcomponentMethodCalled$.subscribe(
      () => {
        // this.setcurrent_user();
        this.currentuser = undefined;
        // alert('logout function');
      }
    );
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
    // alert("Hello");
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
      this.service.change_password(this.oldpass, this.newpass, this.confirmpass).subscribe(data => {
        console.log(data);
        alert(data['detail']);
        this.modalService.dismissAll('Change password done');
        this.oldpass = '';
        this.newpass = '';
        this.confirmpass = '';
      },
        error => {
          console.log(error);
          console.log(error['detail']);
        });
    }
    else {
      alert('New password and confirm password does not match');
    }
  }



  updateuserprofile() {
    this.service.update_User(this.currentuser).subscribe(
      data => {
        this.setcurrent_user();
        this.modalService.dismissAll();
        alert('Data Updated');
      },
      error => {
        console.log(error);
      }
    );
  }

}
