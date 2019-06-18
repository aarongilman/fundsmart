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

  socialLogin(user) {
    this.socialuser = user;
    const body = { access_token: user.authToken };
    this.http.post('http://127.0.0.1:8000/rest-auth/google/', body, { headers: this.httpHeaders }).subscribe(data => {
      console.log(data);
      this.getUser(data['key']);
    });

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
      body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  uploadfile(file) {

    // const body = { data_file: file };
    return this.http.post('http://localhost:8000/api/import_portfolio_fund/', file, {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_portfolio_fund() {
    return this.http.get('http://localhost:8000/api/portfolio_fund/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_security() {
    return this.http.get(' http://localhost:8000/api/security/', { headers: this.httpHeaders });
  }

  get_home_pie_chart() {
    return this.http.get('http://localhost:8000/api/dashboard_pie_chart/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_deshboard_doughnut_chart() {
    return this.http.get('http://localhost:8000/api/dashboard_doughnut_chart/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_historical_perfomance() {
    return this.http.get('http://localhost:8000/api/historical_performance_difference/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

}
