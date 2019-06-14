import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
declare const google: any;


@Injectable({
  providedIn: 'root'
})

export class GetfileforuploadService {

  client_id = "883505734730-7culcu4hmm1m13ocq1uhbkr3fc31gpnf.apps.googleusercontent.com";
  developerKey = 'AIzaSyA_1Y6HBXXhTvDVN0vM4OCYhCZzj1j6OA4';
  scope: ['https://www.googleapis.com/auth/drive'];
  pickerApiLoaded = false;
  oauthToken: any;

  constructor(private http: HttpClient) { }

  dropboxlogin(){
    this.http.
    https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&response_type=code
  }


  onApiLoad() {
    let self = this;
    gapi.load('auth', { callback: self.onAuthApiLoad.bind(this) });
    gapi.load('picker', { callback: self.onPickerApiLoad.bind(this) });
  }

  //   onPickerApiLoad() {
  //     this.pickerApiLoaded = true;
  //     this.createPicker(this.oauth);
  //   }


  onAuthApiLoad() {
    let self = this;
    (<any>window).gapi.auth.authorize(
      {
        client_id: this.client_id,
        scope: ['https://www.googleapis.com/auth/drive.file'],
        immediate: false
      },
      self.handleAuthResult);
  }



  //   handleAuthResult(authResult: any) {
  //     let that1 = this;
  //     if (authResult && !authResult.error) {
  //       console.log(authResult);
  //       const oauthToken = authResult.access_token;
  //       // that.oauth = authResult.access_token;
  //       that1.createPicker(oauthToken);
  //     }
  //   }

  //   createPicker(oauthToken) {
  //     let self = this;
  //     if (oauthToken) {
  //       var pickerBuilder = new google.picker.PickerBuilder();
  //       var picker = pickerBuilder
  //         .enableFeature(google.picker.Feature.NAV_HIDDEN)
  //         .setOAuthToken(oauthToken)
  //         .addView(google.picker.ViewId.DOCS_VIDEOS)
  //         .setDeveloperKey('AIzaSyA_1Y6HBXXhTvDVN0vM4OCYhCZzj1j6OA4')
  //         .setCallback(self.pickerCallback)
  //         .build();
  //       picker.setVisible(true);
  //     }
  //   }

  //   pickerCallback(data) {
  //     let self = this;
  //     if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
  //       var doc = data[google.picker.Response.DOCUMENTS][0];
  //       self.downloadGDriveFile(doc.id, doc.name);
  //     }
  //   }

  //   downloadGDriveFile(fileId, name) {
  //   }

  // }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
    this.createPicker();
  }

  handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        var pickerBuilder = new google.picker.PickerBuilder();
        var picker = pickerBuilder.
          enableFeature(google.picker.Feature.NAV_HIDDEN).
          setOAuthToken(authResult.access_token).
          addView(google.picker.ViewId.SPREADSHEETS).
          setDeveloperKey('AIzaSyA_1Y6HBXXhTvDVN0vM4OCYhCZzj1j6OA4').
          setCallback(function (e) {
            // var that = this;
            var url = 'nothing';
            var fileid = 'myid';
            console.log("in handle auth result" + url);
            if (e[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
              var doc = e[google.picker.Response.DOCUMENTS][0];
              url = doc[google.picker.Document.URL];
              fileid = doc[google.picker.Document.ID];
            }
            var message = 'You picked: ' + url;
            var message2 = 'fileid: ' + fileid;
            console.log(message + ' | ' + message2);
            if (url !== 'nothing') {
              this.http.get<Blob>('https://www.googleapis.com/drive/v2/files/' + fileid, {
                responseType: 'blob' as 'json',
                params: { alt: 'media' },
                headers: new HttpHeaders({
                  Authorization: `Bearer ${this.oauthToken}`,
                })
              }).subscribe(image: => {
                console.log(image);
              });
            }
          }).
          build();
        picker.setVisible(true);
      }
    }
  }

  createPicker() {
    if (this.pickerApiLoaded && this.oauthToken) {
      var picker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.SPREADSHEETS).
        setOAuthToken(this.oauthToken).
        setDeveloperKey(this.developerKey).
        setCallback(this.pickerCallback).
        build();
      picker.setVisible(true);
    }
  }

  pickerCallback(data) {

    var url = 'nothing';
    var fileid = 'myid';
    console.log(url);
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
      var doc = data[google.picker.Response.DOCUMENTS][0];
      url = doc[google.picker.Document.URL];
      fileid = doc[google.picker.Document.ID];
    }
    var message = 'You picked: ' + url;
    var message2 = 'fileid: ' + fileid;
    if (url !== 'nothing') {
      this.downloadFile(fileid).subscribe(image => {
        console.log(image);
      });
    }
    alert(message + message2);
  }

  downloadFile(fileid) {
    return this.http.get<Blob>('https://www.googleapis.com/drive/v2/files/' + fileid, {
      responseType: 'blob' as 'json',
      params: { alt: 'media' },
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.oauthToken}`,
        // 'Content-type': file.mimeType,
      })
    });
  }

}