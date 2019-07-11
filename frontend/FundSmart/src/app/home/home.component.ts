import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable, merge } from 'rxjs';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { portfolio_fund } from '../portfolio_fund';
import { portfoliofundlist } from '../portfolio_fundlist';
import { PortfoliofundhelperService } from '../portfoliofundhelper.service';
import { SortableDirective, SortEvent } from '../sortable.directive';
import { security } from '../security';
import * as $ from 'jquery';
import { ServercommunicationService } from '../servercommunication.service';
import { AuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { GetfileforuploadService } from '../getfileforupload.service';
import { from } from 'rxjs/observable/from';
import { groupBy, mergeAll, mergeMap, toArray } from 'rxjs/operators';
import { HistoricalData } from '../historicaldata';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { MustMatch } from '../must-match.validator';
import { securitylist } from '../securitylist';
import { element } from '@angular/core/src/render3';
import { Dropbox } from 'dropbox';
@Component({

  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [PortfoliofundhelperService, DecimalPipe]
})

export class HomeComponent implements OnInit {
  // Form conversion

  registeruserForm: FormGroup;
  submitted = false;

  loginForm: FormGroup;
  loginformSubmitted = false;

  comparision1Form: FormGroup;
  comparision2Form: FormGroup;
  fundrowForm: FormGroup;

  clickedSecurity: any;

  // end form conversion

  funds$: portfolio_fund[];
  total$;
  @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;

  existing: HistoricalData = {
    annualexpense: 0,
    oneyear: 0,
    threeyear: 0,
    fiveyear: 0
  };
  recommended: HistoricalData = {
    annualexpense: 0,
    oneyear: 0,
    threeyear: 0,
    fiveyear: 0
  };
  diffrence: HistoricalData = {
    annualexpense: 0,
    oneyear: 0,
    threeyear: 0,
    fiveyear: 0
  };

  userFunds = portfoliofundlist;
  files: any = [];
  currentUser: any;

  socialuser: SocialUser;
  loggedIn: boolean;

  closeResult: string;
  showdetail_flag = false;
  email2: string;

  securityinput: string[] = [];
  portfolioinput: string[] = [];
  comp1input: string[] = [];
  comp2input: string[] = [];
  lastkeydown1: number = 0;

  portfolio1: any;
  comparision1: any;
  comparision2: any;

  pietype = 'PieChart';
  pietitle = '';
  piedata = [];
  pieoptions;
  columnNames = [];
  pieheight = 400;
  piewidth = 500;

  donutitle = '';
  donutdata = [];
  donutwidth = 550;
  donutheight = 400;
  donuttype = 'PieChart';
  donutoptions;

  linetitle = '';
  linedata = [];
  lineoptions;
  linewidth = 550;
  lineheight = 400;
  linetype = 'LineChart';
  linecolumnNames = [];
  securitylist = securitylist;

  constructor(private modalService: NgbModal, private interconn: IntercomponentCommunicationService,
    private userservice: ServercommunicationService,
    private fileupload: GetfileforuploadService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public portfolioservice: PortfoliofundhelperService) {

    this.portfolioservice.funds$.subscribe(f => {
      this.funds$ = f;
    });
    this.portfolioservice.total$.subscribe(total => {
      this.total$ = total;
    });

    this.interconn.reloadmethodcalled$.subscribe(
      () => {
        this.createFundlist();
        this.setdataindeshboard();
        this.portfolioservice.funds$.subscribe(f => {
          this.funds$ = f;
        });
        this.portfolioservice.total$.subscribe(total => {
          this.total$ = total;
        });
      }
    );

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        // alert('logout function');
        this.currentUser = undefined;
        portfoliofundlist.length = 0;
        this.resetfundlist();
        this.portfolioservice.resetfunds();
        this.portfolioservice.funds$.subscribe(f => {
          this.funds$ = f;
        });
        // this.portfolioservice.total$.subscribe(total => {
        //   this.total$ = total;
        //   // console.log(this.total$);
        this.total$ = 0;
        this.piedata = [];
        this.donutdata = [];
        this.linedata = [];
        // });
      }
    );


    this.interconn.componentMethodCalled$.subscribe(
      () => {
        // alert("In first method");
        this.setcurrent_user();
        this.userservice.getUserPortfolio().subscribe(
          data => {
            // alert("portfolio data came");
            // console.log(data);
            this.portfolio1 = data['results']['0'];
            this.comparision1 = data['results']['1'];
            this.comparision2 = data['results']['2'];
            // console.log("Portfolios", this.portfolio1, this.comparision1, this.comparision2);

            portfoliofundlist.forEach(element => {
              // console.log(element);
              if (element.security !== '') {
                if (element.yourPortfolio !== '') {
                  this.addportfolioFund('portfolio', element);
                }
                if (element.comparision1 !== '') {
                  this.addportfolioFund('comp1', element);
                }
                if (element.comparision2 !== '') {
                  this.addportfolioFund('comp2', element);
                }
              }
            });
            this.createFundlist();
            this.setdataindeshboard();
            this.portfolioservice.funds$.subscribe(f => {
              this.funds$ = f;
            });
            this.portfolioservice.total$.subscribe(total => {
              this.total$ = total;
            });
          }
        );

        this.createFundlist();
        this.setdataindeshboard();
        this.portfolioservice.funds$.subscribe(f => {
          this.funds$ = f;
        });
        this.portfolioservice.total$.subscribe(total => {
          this.total$ = total;
        });
        // alert(this.currentUser.name);
      });
  }

  ngOnInit() {

    this.interconn.titleSettermethod("Multi Portfolio Analyzer");

    if (this.userservice.currentuser) {
      this.setcurrent_user();
      // this.resetfundlist();
      this.createFundlist();
      this.setdataindeshboard();
    }


    // this.fundrowForm = this.formBuilder.group({
    // })

    this.loginForm = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)]))
    });


    this.registeruserForm = this.formBuilder.group(
      {
        username: new FormControl('', Validators.required),
        first_name: new FormControl('', Validators.required),
        last_name: new FormControl('', Validators.required),
        email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
        phone_number: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])),
        password1: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
        password2: new FormControl('', Validators.required),
      },
      {
        validator: MustMatch('password1', 'password2')
      });

    this.userservice.get_security().subscribe(
      datasecuritylist => {
        // // console.log(securitylist);
        // tslint:disable-next-line: forin
        for (var obj in datasecuritylist) {
          var securityobj: security = {
            id: -1,
            isin: '',
            name: '',
            ticker: '',
            asset_type: ''
          };
          securityobj.id = datasecuritylist[obj]['id'];
          securityobj.isin = datasecuritylist[obj]['isin'];
          securityobj.name = datasecuritylist[obj]['name'];
          securityobj.ticker = datasecuritylist[obj]['ticker'];
          securityobj.asset_type = datasecuritylist[obj]['asset_type'];
          securitylist.push(securityobj);
        }
      }
    );
    // this.userservice.checklogin();
  }


  resetfundlist() {
    portfoliofundlist.length = 0;
    for (var i = 0; i < 10; i++) {
      let singlefund: portfolio_fund = {
        security: '',
        security_id: -1,
        p1record: null,
        p2record: null,
        p3record: null,
        yourPortfolio: '',
        comparision1: '',
        comparision2: ''
      };
      portfoliofundlist.push(singlefund);
    }
  }

  createFundlist() {
    this.userservice.dashboardDataTable().subscribe(
      fundlist => {
        // console.log(fundlist);
        this.setfunds(fundlist);

      });
  }

  serAttribute(item, i) {
    var opt = $('option[value="' + $('#security_' + i).val() + '"]');
    item.security_id = Number.parseInt(opt.attr('id'));
    try {
      item.security = securitylist.find(s => s.id === item.security_id).name;
    } catch {
      return null;
    }

  }

  setdataindeshboard() {
    this.userservice.get_historical_perfomance().subscribe(
      result => {
        // // console.log(result);
        this.existing = {
          annualexpense: 0,
          oneyear: 0,
          threeyear: 0,
          fiveyear: 0
        };
        this.recommended = {
          annualexpense: 0,
          oneyear: 0,
          threeyear: 0,
          fiveyear: 0
        };
        this.diffrence = {
          annualexpense: 0,
          oneyear: 0,
          threeyear: 0,
          fiveyear: 0
        };
        if (result[0]) {
          this.existing.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['existing']['annual_expense']).toFixed(2));
          this.existing.oneyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['1-year']).toFixed(2));
          this.existing.threeyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['3-year']).toFixed(2));
          this.existing.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['existing']['5-year']).toFixed(2));

          // console.log("Existing", result[0]['existing']['annual_expense'], result[0]['existing']['1-year'],
          //  result[0]['existing']['3-year'],
          //   result[0]['existing']['5-year']);

          this.recommended.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['recommended']['annual_expense']).toFixed(2));
          this.recommended.oneyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['1-year']).toFixed(2));
          this.recommended.threeyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['3-year']).toFixed(2));
          this.recommended.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['5-year']).toFixed(2));
          // console.log("recommended", result[0]['recommended']['annual_expense'], result[0]['recommended']['1-year'],
          //   result[0]['recommended']['3-year'], result[0]['recommended']['5-year']);

          this.diffrence.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['difference']['annual_expense']).toFixed(2));
          this.diffrence.oneyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['1-year']).toFixed(2));
          this.diffrence.threeyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['3-year']).toFixed(2));
          this.diffrence.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['5-year']).toFixed(2));
          // console.log("difference", result[0]['difference']['annual_expense'], result[0]['difference']['1-year'],
          //   result[0]['difference']['3-year'], result[0]['difference']['5-year']);

        }
      });
    this.userservice.get_home_pie_chart().subscribe(
      jsondata => {
        this.piedata = [];
        // tslint:disable-next-line: forin
        for (var data in jsondata) {
          var lable, series;
          lable = jsondata[data]['security__asset_type'];
          series = jsondata[data]['total'];
          this.piedata.push([lable, series]);
        }
        this.pietitle = '';
        this.pietype = 'PieChart';
        this.columnNames = ['Security Industry', 'Total'];
        this.pieoptions = {
          animation: {
            duration: 1000,
            easing: 'out',
          },
          pieSliceText: 'label',
          legend: 'none',
        };
      });
    this.userservice.get_deshboard_doughnut_chart().subscribe(
      jsondata => {
        this.donutdata = [];
        //  console.log(jsondata);
        for (var data in jsondata) {
          if (jsondata[data]['security__industry'] !== null && jsondata[data]['total'] !== 0) {
            this.donutdata.push([jsondata[data]['security__industry'], jsondata[data]['total']]);
          }
        }
        this.donutoptions = {
          pieHole: 0.8,
          pieSliceText: 'none',
        };
      });
    this.userservice.get_lineplot_chart().subscribe(
      (jsondata: any) => {
        this.linedata = [];
        this.linecolumnNames = ['label'];
        const tempArray = [];
        const mainObj = {};
        if (this.linedata == []) {
          this.linedata.push(['No data copy', 0, 0]);
        } else {
          for (let i = 0; i < jsondata.length; i++) {
            const element = jsondata[i];
            if (this.linedata !== null) {
              this.linecolumnNames.push(element.portfolio);
            }
            for (let k = 0; k < element['label'].length; k++) {
              const label = element['label'][k];
              if (tempArray.filter(x => x === label).length === 0) {
                tempArray.push(label);

              }
              if (mainObj[label]) {
                mainObj[label] = mainObj[label] + ',' + element.series[k];
              } else {
                mainObj[label] = element.series[k];
              }
            }
          }
          for (let i = 0; i < tempArray.length; i++) {
            const element = tempArray[i];
            const values = (mainObj[element].split(',')).filter(Boolean);
            const valuesCollection = [];
            valuesCollection.push(element.toString());
            for (const iterator of values) {
              valuesCollection.push(parseFloat(iterator));
            }
            this.linedata.push(valuesCollection);
          }
        }
        this.lineoptions = {
          pointSize: 5,
          curveType: 'function',
        };

      }
    );
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');

      // this.setdataindeshboard();
      // this.createFundlist();
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');
      // this.setdataindeshboard();
      // this.createFundlist();
    });
  }

  signOut(): void {
    this.authService.signOut();
  }


  addRow() {
    // debugger

    let singlefund: portfolio_fund = {
      security: '',
      security_id: -1,
      p1record: null,
      p2record: null,
      p3record: null,
      yourPortfolio: '',
      comparision1: '',
      comparision2: ''
    };
    portfoliofundlist.push(singlefund);
    // portfoliofundlist.unshift(singlefund);
    this.portfolioservice.resetfunds();
    this.portfolioservice.funds$.subscribe(f => {
      this.funds$ = f;
    });
    this.portfolioservice.total$.subscribe(total => {
      // alert('came here to set new row');
      this.total$ = total;
      const pageno = Math.ceil(this.total$ / this.portfolioservice.pageSize) + 1;
      this.portfolioservice.page = pageno;
    });
    // portfoliofundlist.push(singlefund);

  }


  get f() { return this.registeruserForm.controls; }


  registerUser() {
    if (this.showdetail_flag === false) {
      $(".register-slide").slideDown("500");
      this.showdetail_flag = true;
    } else {
      this.submitted = true;

      // stop here if form is invalid
      if (this.registeruserForm.invalid) {
        return;
      }

      // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registeruserForm.value));
      this.userservice.doRegistration(JSON.stringify(this.registeruserForm.value)).subscribe(data => {
        localStorage.setItem('authkey', data['key']);
        // console.log("Key is", data['key']);
        // alert('registration successful. Plese confirm email');
        this.showdetail_flag = false;
        this.modalService.dismissAll('Registration Done');
        this.registeruserForm.reset();

        portfoliofundlist.forEach(element => {
          if (element.security !== '') {
            if (element.yourPortfolio !== '') {
              this.addportfolioFund('portfolio', element);
            }
            if (element.comparision1 !== '') {
              this.addportfolioFund('comp1', element);
            }
            if (element.comparision2 !== '') {
              this.addportfolioFund('comp2', element);
            }
          }
        });

      },
        error => {
          // alert('error occured');
          // console.log(error);
        });
    }
  }

  setfunds(fundlist) {
    portfoliofundlist.length = 0;
    // this.portfolioservice.resetfunds();
    // this.portfolioservice.funds$.subscribe(f => {
    //   this.funds$ = f;
    // });
    // this.portfolioservice.total$.subscribe(total => {
    //   this.total$ = total;
    // });

    fundlist.forEach(element => {
      // console.log(element);
      let singlefund: portfolio_fund = {
        // created_by: 0
        security: element['security_name'],
        security_id: element['security_id'],
        p1record: element['portfolio_id_1'],
        p2record: element['portfolio_id_2'],
        p3record: element['portfolio_id_3'],
        yourPortfolio: element['quantity1'],
        comparision1: element['quantity2'],
        comparision2: element['quantity3']
      };
      if (element['quantity1'] === null) {
        singlefund.yourPortfolio = '';
      }
      if (element['quantity2'] === null) {
        singlefund.comparision1 = '';
      }
      if (element['quantity3'] === null) {
        singlefund.comparision2 = '';
      }
      portfoliofundlist.push(singlefund);
    });
    this.portfolioservice.resetfunds();
    this.portfolioservice.funds$.subscribe(f => {
      this.funds$ = f;
    });
    this.portfolioservice.total$.subscribe(total => {
      this.total$ = total;
    });



  }

  get loginf() { return this.loginForm.controls; }
  userlogin() {
    this.loginformSubmitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.userservice.doLogin(JSON.stringify(this.loginForm.value)).subscribe(
      data => {
        localStorage.setItem('authkey', data['key']);
        // console.log(data);
        this.userservice.getUser(data['key']);
        this.modalService.dismissAll('Login Done');
        this.loginForm.reset();
        $('#Loginerror').addClass('hidden');

      },
      error => {

        // console.log(error);
        $('#Loginerror').removeClass('hidden');
        // alert('Wrong Credentials / Server Problem');
      }
    );
  }

  openmodal(modalid, str) {
    // alert("type of modal is" + typeof(modalid));
    var addclass = '';
    if (str == 'login' || str == 'register') {
      addclass = 'long-pop sign-pop';
    }
    this.modalService.open(modalid, { centered: true, windowClass: addclass }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  resetpassword() {
    this.userservice.reset_pwd_sendemail(this.email2).subscribe(data => {
      // console.log(data);
    },
      error => {
        // console.log(error);
      });
  }

  getDismissReason(reason: any): string {
    this.showdetail_flag = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  resetpass_modal() {
    // alert('click on forget password');
    $(".forgot-password-wrap").addClass("show-forgot");
    $(".login-content").addClass("hide-login");
    $(".forgot-password-title").addClass("show-forgot");
    $(".login-title").addClass("d-none");
  }



  uploadFile(event) {
    // alert('upload file event');
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element.name);
      // console.log(element);

      const formData = new FormData();
      formData.append('data_file', element);
      this.userservice.uploadfile(formData).subscribe(
        res => {
          // console.log(res);
          this.createFundlist();
          this.setdataindeshboard();

        },
        error => {
          // console.log(error);
        }
      );
      this.modalService.dismissAll('Log in Done');
    }
  }

  searchsecurity() {
    // // console.log(this.securityinput);
    var securityList1 = [];
    if (this.securityinput.length > 1) {
      // if ($event.timeStamp - this.lastkeydown1 > 200) {
      securityList1 = this.searchFromArray(securitylist, this.securityinput);

      // }
      // // console.log(securityList1);
    }
  }

  searchFromArray(arr, regex) {
    let matches = [];
    let i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].name.match(regex)) {
        matches.push(arr[i]);
      }
      if (arr[i].isin.match(regex)) {
        matches.push(arr[i]);
      }
      if (arr[i].ticker != null) {
        if (arr[i].ticker.match(regex)) {
          matches.push(arr[i]);
        }
      }
    }
    // // console.log(matches);
    return matches;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  addportfolioFund(string1, item) {
    // alert(item.security);
    if (!this.currentUser) {
      return false;
      // alert('Please login First');
    } else if (this.securityinput === undefined || item.security === '') {
      // alert('Plese select security first');
      return false;
    } else {
      var portfolio;
      var quantity;
      const Tempportfoliofundlist = JSON.parse(JSON.stringify(portfoliofundlist));
      if (string1.match('portfolio')) {
        // alert(this.portfolio1);
        if (this.portfolio1 === undefined) {
          // alert('create portfolio1 called');
          this.userservice.createportfolio(1).subscribe(
            data => {
              this.portfolio1 = data;
              console.log("DATA", this.portfolio1);
              portfolio = data['id'];
              quantity = Tempportfoliofundlist.find(x => x.yourPortfolio = item.yourPortfolio).yourPortfolio;
              this.createportfoliofundmethod(portfolio, quantity, item, 'p1');
              // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
            }, error => {
              // console.log(error);
              this.userservice.count--;
            }
          );
        } else {
          portfolio = this.portfolio1.id;
          quantity = Tempportfoliofundlist.find(x => x.yourPortfolio = item.yourPortfolio).yourPortfolio;

          this.createportfoliofundmethod(portfolio, quantity, item, 'p1');
          // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
        }

      } else if (string1.match('comp1')) {
        // alert(this.comparision1);
        if (this.comparision1 === undefined) {
          // alert('create portfolio2');

          this.userservice.createportfolio(2).subscribe(
            data => {
              // console.log(data);
              this.comparision1 = data;
              portfolio = data['id'];
              quantity = Tempportfoliofundlist.find(x => x.comparision1 = item.comparision1).comparision1;
              this.createportfoliofundmethod(portfolio, quantity, item, 'p2');

              // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
            }, error => {
              // console.log(error);
              this.userservice.count--;
            }
          );
        } else {
          portfolio = this.comparision1.id;
          quantity = Tempportfoliofundlist.find(x => x.comparision1 = item.comparision1).comparision1;
          this.createportfoliofundmethod(portfolio, quantity, item, 'p2');

          // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
        }
      } else if (string1.match('comp2')) {
        // alert(this.comparision2);
        if (this.comparision2 === undefined) {
          // alert('create portfolio3');
          this.userservice.createportfolio(3).subscribe(
            data => {
              // console.log(data);
              // alert(data['id']);
              this.comparision2 = data;
              portfolio = data['id'];
              quantity = Tempportfoliofundlist.find(x => x.comparision2 = item.comparision2).comparision2;
              this.createportfoliofundmethod(portfolio, quantity, item, 'p3');

              // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);

            }, error => {
              // console.log(error);
              this.userservice.count--;
            }
          );
        } else {
          portfolio = this.comparision2.id;

          quantity = Tempportfoliofundlist.find(x => x.comparision2 = item.comparision2).comparision2;
          this.createportfoliofundmethod(portfolio, quantity, item, 'p3');

          // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
        }
      }
      // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);

    }
  }

  createportfoliofundmethod(portfolio, quantity, item: portfolio_fund, recordid) {
    // alert('came in create portfolio fund');
    // console.log(item.security_id);

    // var security = securitylist.find(x => x.id === item.security_id);
    // console.log(security, portfolio, quantity);

    // name = this.securityinput);
    var recid;
    if (recordid === 'p1') {
      recid = item.p1record;
    } else if (recordid === 'p2') {
      recid = item.p2record;
    } else if (recordid === 'p3') {
      recid = item.p3record;
    }

    if (item.security_id === undefined) {
      // alert("Please select valid security");
      return null;
    } else {
      console.log(item.security_id);

      if (recid === null) {
        // alert('post method');
        this.userservice.add_portfolio_fund(quantity, portfolio, item.security_id, this.currentUser['id']).subscribe();
      } else {
        // alert('put method');
        this.userservice.updateportfoliofund(recid, quantity, portfolio, item.security_id, this.currentUser['id']).subscribe();
      }
      this.setdataindeshboard();
    }
  }


  dropboxupload() {
    const options = {

      // Required. Called when a user selects an item in the Chooser.
      success: function (files) {
        alert("Here's the file link: " + files[0].link)
      },

      // Optional. Called when the user closes the dialog without selecting a file
      // and does not include any parameters.
      cancel: function () {

      },

      // Optional. "preview" (default) is a preview link to the document for sharing,
      // "direct" is an expiring link to download the contents of the file. For more
      // information about link types, see Link types below.
      linkType: "direct", // or "direct"

      // Optional. A value of false (default) limits selection to a single file, while
      // true enables multiple file selection.
      multiselect: false, // or true

      // Optional. This is a list of file extensions. If specified, the user will
      // only be able to select files with these extensions. You may also specify
      // file types, such as "video" or "images" in the list. For more information,
      // see File types below. By default, all extensions are allowed.
      extensions: ['.csv', '.xlsx', '.xls'],

      // Optional. A value of false (default) limits selection to files,
      // while true allows the user to select both folders and files.
      // You cannot specify `linkType: "direct"` when using `folderselect: true`.
      folderselect: false, // or true

      // Optional. A limit on the size of each file that may be selected, in bytes.
      // If specified, the user will only be able to select files with size
      // less than or equal to this limit.
      // For the purposes of this option, folders have size zero.
      sizeLimit: 1024, // or any positive number
    };

    // let dropboxapi = Dropbox(options);

    // this.fileupload.dropboxlogin();
  }

  onedrivefileupload() {
  }

  drive_fileupload() {
    // alert('abc');
    this.fileupload.onApiLoad();
    this.modalService.dismissAll('File upload');
  }

  setcurrent_user() {
    this.currentUser = this.userservice.currentuser;
  }



  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.portfolioservice.sortColumn = column;
    this.portfolioservice.sortDirection = direction;
  }
}





