import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user';
@Injectable({
  providedIn: 'root'
})
export class ServercommunicationService {
  reglink = 'http://127.0.0.1:8000/rest-auth/registration/';
  login_link = 'http://127.0.0.1:8000/rest-auth/login/';
  httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });
  constructor(private http: HttpClient) { }

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


}
