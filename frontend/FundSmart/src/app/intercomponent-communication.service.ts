import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntercomponentCommunicationService {

  constructor() { }

  // Observable string sources
  private componentMethodCallSource = new Subject<any>();
  private logoutcomponentMethodCallSource = new Subject<any>();
  private reloadAfterfileuploadSource = new Subject<any>();
  private setdataAftergoogledriveuploadSource = new Subject<any>();
  private titlesetterSource = new BehaviorSubject('Multi Portfolio Analyzer');
  // Observable string streams
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();
  logoutcomponentMethodCalled$ = this.logoutcomponentMethodCallSource.asObservable();
  reloadmethodcalled$ = this.reloadAfterfileuploadSource.asObservable();
  titlesettercalled$ = this.titlesetterSource.asObservable();
  googledriveuploadcalled$ = this.setdataAftergoogledriveuploadSource.asObservable();
  // Service message commands
  callComponentMethod() {
    this.componentMethodCallSource.next();
  }

  Filuplodedsettable() {
    this.setdataAftergoogledriveuploadSource.next();
  }


  titleSettermethod(message: string) {
    this.titlesetterSource.next(message);
  }

  afterfileupload() {
    this.reloadAfterfileuploadSource.next();
  }


  afterlogout() {
    this.logoutcomponentMethodCallSource.next();
  }

}
