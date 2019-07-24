import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServercommunicationService } from './servercommunication.service';
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import * as XLSX from 'xlsx';
import { securitylist } from './securitylist';
import { portfoliofundlist } from './portfolio_fundlist';
import { portfolio_fund } from './portfolio_fund';
import Swal from 'sweetalert2';


declare const google: any;

@Injectable({
  providedIn: 'root'
})

export class GetfileforuploadService {

  // google picker
  client_id = "883505734730-7culcu4hmm1m13ocq1uhbkr3fc31gpnf.apps.googleusercontent.com";
  developerKey = 'AIzaSyA_1Y6HBXXhTvDVN0vM4OCYhCZzj1j6OA4';
  scope: ['https://www.googleapis.com/auth/drive'];
  pickerApiLoaded = false;
  oauthToken: any;
  page: string;
  // dropbox
  accessToken: any;
  folderHistory: any = [];
  arrayBuffer: any;
  // onedrive


  constructor(private http: HttpClient, private interconn: IntercomponentCommunicationService,
    private userservice: ServercommunicationService) { }





  // google get file

  onApiLoad(page: string) {
    this.page = page;
    let self = this;
    gapi.load('auth', { callback: self.onAuthApiLoad.bind(this) });
    gapi.load('picker', { callback: undefined });
  }

  onAuthApiLoad() {
    let self = this;
    (<any>window).gapi.auth.authorize(
      {
        client_id: this.client_id,
        scope: ['https://www.googleapis.com/auth/drive.file'],
        immediate: false
      },
      self.handleAuthResult.bind(this));
  }

  handleAuthResult(authResult: any) {
    let self = this;
    if (authResult && !authResult.error) {
      this.oauthToken = authResult.access_token;
      self.createPicker();
    }
  }

  createPicker() {
    let self = this;
    if (self.oauthToken) {
      var pickerBuilder = new google.picker.PickerBuilder();
      var picker = pickerBuilder
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setOAuthToken(self.oauthToken)
        .addView(google.picker.ViewId.SPREADSHEETS)
        .setDeveloperKey('AIzaSyA_1Y6HBXXhTvDVN0vM4OCYhCZzj1j6OA4')
        .setCallback(self.pickerCallback.bind(this))
        .build();
      picker.setVisible(true);
    }
  }

  pickerCallback(data) {
    let self = this;
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      var doc = data[google.picker.Response.DOCUMENTS][0];
      // console.log(doc.id, doc.name);
      self.downloadGDriveFile(doc.id).subscribe(
        filedata => {
          // console.log(filedata);

          const blob = new Blob([filedata], { type: doc.mimeType });
          const file = new File([blob], doc.name, { type: doc.mimeType, lastModified: Date.now() });

          if (self.page === 'Dashboard') {
            let fr = new FileReader;
            fr.onload = (e) => {
              // alert('In fole reader')
              this.arrayBuffer = fr.result;
              let data = new Uint8Array(this.arrayBuffer);
              let arr = new Array();
              for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
              let bstr = arr.join("");
              let workbook = XLSX.read(bstr, { type: "binary" });
              let first_sheet_name = workbook.SheetNames[0];
              let worksheet = workbook.Sheets[first_sheet_name];
              let sheetdata = XLSX.utils.sheet_to_json(worksheet, { raw: true });
              // console.log("sheet data", XLSX.utils.sheet_to_json(worksheet, { raw: true }));

              let localData = JSON.parse(localStorage.getItem('securityData'));
              if (localData === null) {
                localStorage.setItem('securityData', JSON.stringify([]));
                localData = JSON.parse(localStorage.getItem('securityData'));
              }
              let count = localData.length;
              // tslint:disable-next-line: forin
              for (let record in sheetdata) {
                // console.log(sheetdata[record]);
                // alert('in forloop');
                let port1, comp1, comp2;
                port1 = Number.parseInt(sheetdata[record]['portfolio1']);
                comp1 = Number.parseInt(sheetdata[record]['comparison1']);
                comp2 = Number.parseInt(sheetdata[record]['comparison2']);

                // console.log(sheetdata[record]['Security ISIN']);
                let security = securitylist.find(s => s.isin === sheetdata[record]['Security ISIN']);
                // console.log(security);
                if (security) {
                  try {
                    let portfilio = portfoliofundlist.findIndex(s => s.security === '');
                    portfoliofundlist[portfilio].security_id = security.id;
                    portfoliofundlist[portfilio].security = security.name;
                    portfoliofundlist[portfilio].yourPortfolio = port1;
                    portfoliofundlist[portfilio].comparision1 = comp1;
                    portfoliofundlist[portfilio].comparision2 = comp2;
                    portfoliofundlist[portfilio].p1record = localData.length;
                    let format = { 'recordId': localData.length, 'portfolio': port1, 'recid': null, 'COMPARISON1': comp1, 'COMPARISON2': comp2, 'securityId': security.id };
                    localData.push(format);
                  } catch {
                    let singlefund: portfolio_fund = {
                      security: security.name,
                      security_id: security.id,
                      p1record: localData.length,
                      p2record: null,
                      p3record: null,
                      yourPortfolio: port1,
                      comparision1: comp1,
                      comparision2: comp2
                    };
                    portfoliofundlist.push(singlefund);
                    let format = { 'recordId': localData.length, 'portfolio': port1, 'recid': null, 'COMPARISON1': comp1, 'COMPARISON2': comp2, 'securityId': security.id };
                    localData.push(format);
                  }
                }
                // this.interconn.Filuplodedsettable();
              }
              // console.log('two counts', count, localData.length);

              if (count === localData.length) {
                Swal.fire('File Upload', 'Your data is not in proper format', 'error');
              } else {
                localStorage.setItem('securityData', JSON.stringify(localData));
                this.interconn.Filuplodedsettable();
              }
            };
            fr.readAsArrayBuffer(file);
          } else {
            const formData = new FormData();
            formData.append('data_file', file);
            self.userservice.uploadfile(formData).subscribe(
              resp => {
                // console.log(resp);
                this.interconn.afterfileupload();
              },
              error => {
                // console.log(error);
              }
            );
          }
        },
        error => {
          self.exportGDrivefile(doc.id).subscribe(
            filedata => {
              // console.log(filedata);

              const blob = new Blob([filedata], { type: doc.mimeType });
              const file = new File([blob], doc.name, { type: doc.mimeType, lastModified: Date.now() });

              if (self.page === 'Dashboard') {
                let fr = new FileReader;
                fr.onload = (e) => {
                  // alert('In fole reader')
                  this.arrayBuffer = fr.result;
                  let data = new Uint8Array(this.arrayBuffer);
                  let arr = new Array();
                  for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                  let bstr = arr.join("");
                  let workbook = XLSX.read(bstr, { type: "binary" });
                  let first_sheet_name = workbook.SheetNames[0];
                  let worksheet = workbook.Sheets[first_sheet_name];
                  let sheetdata = XLSX.utils.sheet_to_json(worksheet, { raw: true });
                  // console.log("sheet data", XLSX.utils.sheet_to_json(worksheet, { raw: true }));

                  let localData = JSON.parse(localStorage.getItem('securityData'));
                  if (localData === null) {
                    localStorage.setItem('securityData', JSON.stringify([]));
                    localData = JSON.parse(localStorage.getItem('securityData'));
                  }
                  let count = localData.length;
                  // tslint:disable-next-line: forin
                  for (let record in sheetdata) {
                    // console.log(sheetdata[record]);
                    // alert('in forloop');
                    let port1, comp1, comp2;
                    port1 = Number.parseInt(sheetdata[record]['portfolio1']);
                    comp1 = Number.parseInt(sheetdata[record]['comparison1']);
                    comp2 = Number.parseInt(sheetdata[record]['comparison2']);

                    // console.log(sheetdata[record]['Security ISIN']);
                    let security = securitylist.find(s => s.isin === sheetdata[record]['Security ISIN']);
                    // console.log(security);
                    if (security) {
                      try {
                        let portfilio = portfoliofundlist.findIndex(s => s.security === '');
                        portfoliofundlist[portfilio].security_id = security.id;
                        portfoliofundlist[portfilio].security = security.name;
                        portfoliofundlist[portfilio].yourPortfolio = port1;
                        portfoliofundlist[portfilio].comparision1 = comp1;
                        portfoliofundlist[portfilio].comparision2 = comp2;
                        portfoliofundlist[portfilio].p1record = localData.length;
                        let format = { 'recordId': localData.length, 'portfolio': port1, 'recid': null, 'COMPARISON1': comp1, 'COMPARISON2': comp2, 'securityId': security.id };
                        localData.push(format);
                      } catch {
                        let singlefund: portfolio_fund = {
                          security: security.name,
                          security_id: security.id,
                          p1record: localData.length,
                          p2record: null,
                          p3record: null,
                          yourPortfolio: port1,
                          comparision1: comp1,
                          comparision2: comp2
                        };
                        portfoliofundlist.push(singlefund);
                        let format = { 'recordId': localData.length, 'portfolio': port1, 'recid': null, 'COMPARISON1': comp1, 'COMPARISON2': comp2, 'securityId': security.id };
                        localData.push(format);
                      }
                    }
                    // this.interconn.Filuplodedsettable();
                  }
                  // console.log('two counts', count, localData.length);

                  if (count === localData.length) {
                    Swal.fire('File Upload', 'Your data is not in proper format', 'error');
                  } else {
                    localStorage.setItem('securityData', JSON.stringify(localData));
                    this.interconn.Filuplodedsettable();
                  }
                };
                fr.readAsArrayBuffer(file);
              } else {
                const formData = new FormData();
                formData.append('data_file', file);
                self.userservice.uploadfile(formData).subscribe(
                  resp => {
                    // console.log(resp);
                    this.interconn.afterfileupload();
                  },
                  error => {
                    // console.log(error);
                  }
                );
              }
            },
            error => {
              // console.log(error);
            }
          );
          // console.log(error);
        }
      );
    }
  }


  exportGDrivefile(fileId) {
    return this.http.get<Blob>('https://www.googleapis.com/drive/v2/files/' + fileId + '/export', {
      responseType: 'blob' as 'json',
      params: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        alt: 'media'
      },
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.oauthToken}`
      })
    });
  }

  downloadGDriveFile(fileId) {

    return this.http.get<Blob>('https://www.googleapis.com/drive/v2/files/' + fileId, {
      responseType: 'blob' as 'json',
      params: { alt: 'media' },
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.oauthToken}`,
        // 'Content-type': file.mimeType,
      })
    });
  }

  // downloadFile(fileid) {
  //   return this.http.get<Blob>('https://www.googleapis.com/drive/v2/files/' + fileid, {
  //     responseType: 'blob' as 'json',
  //     params: { alt: 'media' },
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.oauthToken}`,
  //       // 'Content-type': file.mimeType,
  //     })
  //   });
  // }
  // google get file finish

}
