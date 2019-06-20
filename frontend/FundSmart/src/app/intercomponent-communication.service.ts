import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntercomponentCommunicationService {

  constructor() { }

  // Observable string sources
  private componentMethodCallSource = new Subject<any>();
  private logoutcomponentMethodCallSource = new Subject<any>();
  // Observable string streams
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();
  logoutcomponentMethodCalled$ = this.logoutcomponentMethodCallSource.asObservable();

  // Service message commands
  callComponentMethod() {
    this.componentMethodCallSource.next();
  }

  afterlogout() {
    this.logoutcomponentMethodCallSource.next();
  }

}
