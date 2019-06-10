import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user';
import { AuthService, SocialUser } from "angularx-social-login";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ServercommunicationService {
  reglink = 'http://127.0.0.1:8000/rest-auth/registration/';
  login_link = 'http://127.0.0.1:8000/rest-auth/login/';
  socialuser: SocialUser;
  httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });
  constructor(private http: HttpClient, private authService: AuthService) { }

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
    this.authService.authState.subscribe((user) => {
      this.socialuser = user;
    });
    const body = { access_token: this.socialuser.authToken };
    return this.http.post('http://127.0.0.1:8000/rest-auth/google/', body, { headers: this.httpHeaders });
  }

  getUser(key: string): Observable<any> {
    const body = { 'Authorization': key };
    return this.http.get('http://localhost:8000/rest-auth/user', { headers: { 'Content-type': 'application/json'}, params: body });
  }

}
