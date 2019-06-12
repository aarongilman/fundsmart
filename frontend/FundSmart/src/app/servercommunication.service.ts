import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user';
import { AuthService, SocialUser, GoogleLoginProvider } from "angularx-social-login";
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import { $ } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class ServercommunicationService {
  reglink = 'http://127.0.0.1:8000/rest-auth/registration/';
  login_link = 'http://127.0.0.1:8000/rest-auth/login/';
  socialuser: SocialUser;
  currentuser: any;
  httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });
  getHttpheader = new HttpHeaders({ 'Content-type': 'application/json' });
  constructor(private http: HttpClient, private authService: AuthService,
    private interconn: IntercomponentCommunicationService) { }
  userkey: string;
  doRegistration(obj: User) {
    // console.log(obj);
    const body = {
      username: obj.username, email: obj.email,
      password1: obj.password1, first_name: obj.firstname,
      last_name: obj.lastname, password2: obj.password2, phone_number: obj.phone
    };
    return this.http.post(this.reglink, body, { headers: this.httpHeaders });

  }

  doLogin(username: string, password: string) {
    const body = { username: username, password: password };
    return this.http.post(this.login_link, body, { headers: this.httpHeaders });
  }

  socialLogin() {
    if (this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)) {
      this.authService.authState.subscribe((user) => {
        this.socialuser = user;
      });
      if (this.socialuser != null) {
        const body = { access_token: this.socialuser.authToken };
        return this.http.post('http://127.0.0.1:8000/rest-auth/google/', body, { headers: this.httpHeaders });
      }
    }
  }

  getUser(key: string) {
    this.userkey = key;
    this.http.get('http://localhost:8000/rest-auth/user/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + key })
    }).subscribe(userdata => {
      this.currentuser = userdata;
      this.interconn.callComponentMethod();
    });
  }

  change_password(oldpass: string, newpass: string, confirmpass: string) {
    const body = {
      old_password: oldpass,
      new_password1: newpass,
      new_password2: confirmpass
    };
    return this.http.post('http://127.0.0.1:8000/rest-auth/password/change/', body, {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  reset_pwd_sendemail(emailid: string) {
    const body = { email: emailid };
    return this.http.post('http://127.0.0.1:8000/rest-auth/password/reset/', body, { headers: this.httpHeaders });
  }

  resetpassword_req(userid: string, usertoken: string, pass1: string, pass2: string) {
    const body = {
      uid: userid,
      token: usertoken,
      new_password1: pass1,
      new_password2: pass2
    };
    return this.http.post('http://127.0.0.1:8000/rest-auth/password/reset/confirm/', body, { headers: this.httpHeaders });
  }

  update_User(user: any) {
    const body = {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number
    };
    return this.http.put('http://127.0.0.1:8000/rest-auth/user/',
    body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })});
  }



}
