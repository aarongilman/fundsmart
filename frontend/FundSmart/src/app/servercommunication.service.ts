import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService, SocialUser, GoogleLoginProvider } from "angularx-social-login";
import { IntercomponentCommunicationService } from './intercomponent-communication.service';

@Injectable({
  providedIn: 'root'
})
export class ServercommunicationService {
  api_link = 'http://3.16.111.80/';
  // api_link = 'http://localhost:8000/';
  // api_link = 'http://192.168.100.111:8000/';


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
    return this.http.post(this.api_link + 'rest-auth/registration/', body, { headers: this.httpHeaders });

  }

  doLogin(body) {
    return this.http.post(this.api_link + 'rest-auth/login/', body, { headers: this.httpHeaders });
  }

  socialLogin(user) {
    this.socialuser = user;
    const body = { access_token: user.authToken };
    this.http.post(this.api_link + 'rest-auth/google/', body, { headers: this.httpHeaders }).subscribe(data => {
      // console.log(data);
      localStorage.setItem('authkey', data['key']);
      this.getUser(data['key']);
    });

  }

  getUser(key: string) {
    this.userkey = key;
    this.http.get(this.api_link + 'rest-auth/user/', {
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
    return this.http.post(this.api_link + 'rest-auth/password/change/', body, {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  reset_pwd_sendemail(emailid: string) {
    const body = { email: emailid };
    return this.http.post(this.api_link + 'rest-auth/password/reset/', body, { headers: this.httpHeaders });
  }

  resetpassword_req(userid: string, usertoken: string, pass1: string, pass2: string) {
    const body = {
      uid: userid,
      token: usertoken,
      new_password1: pass1,
      new_password2: pass2
    };
    return this.http.post(this.api_link + 'rest-auth/password/reset/confirm/', body, { headers: this.httpHeaders });
  }

  update_User(user: any) {
    const body = {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number
    };
    return this.http.put(this.api_link + 'rest-auth/user/',
      body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }


  uploadfile(file) {

    // const body = { data_file: file };
    return this.http.post(this.api_link + 'api/import_portfolio_fund/', file, {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_portfolio_fund() {
    if (this.userkey) {
      return this.http.get(this.api_link + 'api/portfolio_fund/', {
        headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
      });
    }
  }


  get_portfolio_fund_by_date(date) {
    if (this.userkey) {
      return this.http.get(this.api_link + 'api/portfolio_fund/?date=' + date, {
        headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
      });
    }
  }

  get_security() {
    return this.http.get(this.api_link + 'api/security/', { headers: this.httpHeaders });
  }

  get_home_pie_chart() {
    return this.http.get(this.api_link + 'api/dashboard_pie_chart/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_deshboard_doughnut_chart() {
    return this.http.get(this.api_link + 'api/dashboard_doughnut_chart/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  get_historical_perfomance() {
    return this.http.get(this.api_link + 'api/historical_performance_difference/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }




  add_portfolio_fund(fquantity, userportfolio, selectedsecurity, createdby) {
    const body = { quantity: fquantity, portfolio: userportfolio, security: selectedsecurity, created_by: createdby };
    return this.http.post(this.api_link + 'api/portfolio_fund/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  getUserPortfolio() {
    return this.http.get(this.api_link + 'api/portfolio/', { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
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
    this.http.post(this.api_link + 'rest-auth/logout/',
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
    return this.http.post(this.api_link + 'rest-auth/registration/verify-email/', body, { headers: this.httpHeaders });

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
    return this.http.post(this.api_link + 'api/portfolio/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });

  }

  updateportfoliofund(recid, fquantity, userportfolio, selectedsecurity, updatedby) {
    const body = {
      id: recid, quantity: Number.parseFloat(fquantity), portfolio: userportfolio,
      security: selectedsecurity, updated_by: updatedby, created_by: this.currentuser.id
    };
    return this.http.put(this.api_link + 'api/portfolio_fund/' + recid + '/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  get_lineplot_chart() {
    return this.http.get(this.api_link + 'api/dashboard_line_graph/', {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }

  postPrice(fundid, fundprice) {
    const body = { id: fundid, price: fundprice };
    return this.http.post(this.api_link + 'api/holding_detail/', body, {
      headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
    });
  }



  getHoldingDetails() {
    return this.http.get(this.api_link + 'api/holding_detail/',
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  update_One_Object(user: any, id) {
    const body = {
      id: user.id,
      name: user.name,
      description: user.description,
      owner_1: user.owner_1,
      owner_2: user.owner_2,
      marginal_tax_range: user.marginal_tax_range,
      location: user.location,
      created_at: user.created_at,
      created_by: user.created_by,
    };
    return this.http.put(this.api_link + 'api/portfolio/' + id + '/',
      body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }



  get_Fund() {

    if (this.userkey) {
      return this.http.get(this.api_link + 'api/portfolio/', {
        headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
      });
    }
  }

  get_One_Object(id) {
    if (this.userkey) {
      return this.http.get(this.api_link + 'api/portfolio/?id=' + id, {
        headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
      });
    }
  }

  post_create_fund() {
    const body = { created_by: this.currentuser.id };
    return this.http.post(this.api_link + 'api/portfolio/', body,
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }

  delete_Portfolio(id) {
    return this.http.delete(this.api_link + 'api/portfolio/' + id + '/',
      { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
  }


  // production api ----->3.16.111.80

  // 3.16.111.80 server
}
