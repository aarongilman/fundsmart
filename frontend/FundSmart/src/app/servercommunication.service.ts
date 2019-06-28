import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  count = 0;
  constructor(private http: HttpClient, private authService: AuthService,
    private interconn: IntercomponentCommunicationService) { }
  userkey: string;

  doRegistration(body) {
    // // console.log(obj);
    return this.http.post(this.reglink, body, { headers: this.httpHeaders });

  }

  doLogin(body) {
    return this.http.post(this.login_link, body, { headers: this.httpHeaders });
  }

  socialLogin(user) {
    this.socialuser = user;
    const body = { access_token: user.authToken };
    this.http.post('http://127.0.0.1:8000/rest-auth/google/', body, { headers: this.httpHeaders }).subscribe(data => {
      // console.log(data);
      localStorage.setItem('authkey', data['key']);
      this.getUser(data['key']);
    });

  }

  getUser(key: string) {
    this.userkey = key;
    this.http.get('http://127.0.0.1:8000/rest-auth/user/', {
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
    return this.http.post('http://127.0.0.1:8000/api/import_portfolio_fund/', file, {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_portfolio_fund() {
    if (this.userkey) {
      return this.http.get('http://127.0.0.1:8000/api/portfolio_fund/?date=2019-05-23', {
        headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
      });
    }
  }

  get_security() {
    return this.http.get('http://127.0.0.1:8000/api/security/', { headers: this.httpHeaders });
  }

  get_home_pie_chart() {
    return this.http.get('http://127.0.0.1:8000/api/dashboard_pie_chart/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_deshboard_doughnut_chart() {
    return this.http.get('http://127.0.0.1:8000/api/dashboard_doughnut_chart/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_historical_perfomance() {
    return this.http.get('http://127.0.0.1:8000/api/historical_performance_difference/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }




  add_portfolio_fund(fquantity, userportfolio, selectedsecurity, createdby) {
    const body = { quantity: fquantity, portfolio: userportfolio, security: selectedsecurity, created_by: createdby };
    return this.http.post('http://127.0.0.1:8000/api/portfolio_fund/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  getUserPortfolio() {
    return this.http.get('http://127.0.0.1:8000/api/portfolio/', { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  checklogin() {
    var userkey = null;
    userkey = localStorage.getItem('authkey');
    // alert(userkey);
    if (userkey != null) {
      // alert('Came for login');
      this.getUser(userkey);
    }
  }

  logout() {
    localStorage.clear();
    this.http.post('http://127.0.0.1:8000/rest-auth/logout/',
      { headers: this.httpHeaders }).subscribe(
        data => {
          this.userkey = null;
          this.currentuser = undefined;
          this.interconn.afterlogout();
        }
      );
  }
  confirm_email(verificationkey) {
    const body = { key: verificationkey };
    return this.http.post('http://127.0.0.1:8000/rest-auth/registration/verify-email/', body, { headers: this.httpHeaders });

  }

  createportfolio(number) {
    var portfolioname = '';
    if (this.count < 4) {
      if (number === 1) {
        portfolioname = 'portfolio1';
        this.count++;
      }
      if (number === 2) {
        portfolioname = 'portfolio2';
        this.count++;
      }
      if (number === 3) {
        portfolioname = 'portfolio3';
        this.count++;
      }
    }

    const body = { name: portfolioname, created_by: this.currentuser.id };
    return this.http.post('http://127.0.0.1:8000/api/portfolio/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });

  }

  updateportfoliofund(recid, fquantity, userportfolio, selectedsecurity, updatedby) {
    const body = {
      id: recid, quantity: Number.parseFloat(fquantity), portfolio: userportfolio,
      security: selectedsecurity, updated_by: updatedby, created_by: this.currentuser.id
    };
    return this.http.put('http://127.0.0.1:8000/api/portfolio_fund/' + recid + '/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  get_lineplot_chart() {
    return this.http.get('http://127.0.0.1:8000/api/dashboard_line_graph/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }


  getHoldingDetails() {
    return this.http.get('http://127.0.0.1:8000/api/holding_detail/',
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }
  // production api ----->3.16.111.80

  // 3.16.111.80 server
}
