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

  portfolio1Form: FormGroup;
  comparision1Form: FormGroup;
  comparision2Form: FormGroup;
  fundrowForm: FormGroup;



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
  portfolioinput: string;
  comp1input: string;
  comp2input: string;
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

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        // alert('logout function');
        this.currentUser = undefined;

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
        // });
      }
    );


    this.interconn.componentMethodCalled$.subscribe(
      () => {
        // alert("In first method");
        this.setcurrent_user();
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
    this.setcurrent_user();
    // this.resetfundlist();
    this.setdataindeshboard();

    this.portfolio1Form = this.formBuilder.group({
      quantity: new FormControl('', Validators.required),
      security: new FormControl('', Validators.required),
      portfolio: new FormControl('', Validators.required)
    });

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
        p1record: -1,
        p2record: -1,
        p3record: -1,
        yourPortfolio: '0',
        comparision1: '0',
        comparision2: '0'
      };
      portfoliofundlist.push(singlefund);
    }
  }

  setdataindeshboard() {

    this.userservice.getUserPortfolio().subscribe(
      data => {
        // alert("portfolio data came");
        // console.log(data);

        this.portfolio1 = data['results']['0'];
        this.comparision1 = data['results']['1'];
        this.comparision2 = data['results']['2'];
        this.userservice.get_portfolio_fund().subscribe(
          fundlist => {
            var datalist = [];
            if (fundlist['count'] !== 0) {
              const fundlist2 = fundlist['results'];
              const source = from(fundlist2);
              const result = source.pipe(groupBy(fundlist2 => fundlist2['security']),
                // mergeAll());
                mergeMap(group => group.pipe(toArray())));
              result.subscribe(
                x => {
                  let item: any;
                  // tslint:disable-next-line: forin
                  for (item in x) {
                    datalist.push(x[item]);
                  }
                }
              );
              // console.log("Data list is", datalist);
              this.setfunds(datalist, data['results']['0'], data['results']['1'], data['results']['2']);

            }
          },
          error => {
            // console.log(error);
          }
        );
      },
      error => {
        // alert('Portfolio fetch failed');
        // console.log(error);
      });

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


          this.recommended.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['recommended']['annual_expense']).toFixed(2));
          this.recommended.oneyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['1-year']).toFixed(2));
          this.recommended.threeyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['3-year']).toFixed(2));
          this.recommended.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['recommended']['5-year']).toFixed(2));

          this.diffrence.annualexpense = Number.parseFloat(Number.parseFloat(result[0]['difference']['annual_expense']).toFixed(2));
          this.diffrence.oneyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['1-year']).toFixed(2));
          this.diffrence.threeyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['3-year']).toFixed(2));
          this.diffrence.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['difference']['5-year']).toFixed(2));
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

        // console.log(jsondata);

        for (let i = 0; i < jsondata.length; i++) {
          const element = jsondata[i];
          this.linecolumnNames.push(element.portfolio);
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
          let values;
          const valuesCollection = [];
          valuesCollection.push(element.toString());
          if (typeof mainObj[element] === 'number') {
            values = mainObj[element]
            valuesCollection.push(parseFloat(values));
          } else {
            values = (mainObj[element].split(',')).filter(Boolean);
            for (const iterator of values) {
              valuesCollection.push(parseFloat(iterator));
            }
          }
          this.linedata.push(valuesCollection);
        }
        this.linedata = [];
        if (this.linedata.length === 0) {
          this.linedata.push(['No data copy', 0, 0]);
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
      this.setdataindeshboard();
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');
      this.setdataindeshboard();
    });
  }

  signOut(): void {
    this.authService.signOut();
  }

  // generatePieChart() {
  //   this.pietitle = '';
  //   this.pietype = 'PieChart';
  //   var data = this.piedata;
  //   var columnNames = ['security__industry', 'total'];
  //   var options = {};

  // this.pietype = 'Pie';
  // this.piedata = {
  //   labels: this.pielable,
  //   series: this.pieseries,
  // };
  // this.pieoptions = {
  //   donut: false,
  //   showLabel: true,
  //   width: '100%',
  //   height: '300px'
  // };
  // this.pieevents = {
  //   draw: (data) => {
  //     const pathLength = data.element._node;
  //     if (data.type === 'pie') {
  //       data.element.animate({
  //         y2: {
  //           id: 'anim' + data.index,
  //           dur: 1000,
  //           from: -pathLength + 'px',
  //           to: '0px',
  //           easing: 'easeOutQuad',
  //           fill: 'freeze'
  //         } as IChartistAnimationOptions
  //       });
  //     }
  //   }
  // };
  //  }

  addRow() {
    let singlefund: portfolio_fund = {
      security: '',
      security_id: -1,
      p1record: -1,
      p2record: -1,
      p3record: -1,
      yourPortfolio: '0',
      comparision1: '0',
      comparision2: '0'
    };
    portfoliofundlist.push(singlefund);
    this.portfolioservice.resetfunds();
    this.portfolioservice.funds$.subscribe(f => {
      this.funds$ = f;
    });
    this.portfolioservice.total$.subscribe(total => {
      // alert('came here to set new row');
      this.total$ = total;
    });
    // portfoliofundlist.push(singlefund);
  }


  // generateDonotchart() {
  //   this.donutitle = '';
  //   this.donuttype = 'Pie';
  //   var data = this.donutdata
  // this.donutdata = {
  //   labels: this.donutlable,
  //   series: this.donutseries,
  // };

  // this.donutOptions = {
  //   donut: true,
  //   showLabel: true,
  //   width: '100%',
  //   height: '300px'
  // };
  //   this.donutevents = {
  //     draw: (data) => {
  //       const pathLength = data.element._node;
  //       if (data.type === 'pie') {
  //         data.element.animate({
  //           y2: {
  //             id: 'anim' + data.index,
  //             dur: 1000,
  //             from: -pathLength + 'px',
  //             to: '0px',
  //             easing: 'easeOutQuad',
  //             fill: 'freeze'
  //           } as IChartistAnimationOptions
  //         });
  //       }
  //     }
  // };

  // $(function () {
  //   const chart = new Chartist.Pie('.do-nut-chart', {
  //     series: [10, 20, 50, 20, 5, 50, 15],
  //     labels: [1, 2, 3, 4, 5, 6, 7]
  //   }, {
  //       donut: true,
  //       showLabel: true
  //     });

  //   // tslint:disable-next-line: only-arrow-functions
  //   chart.on('draw', function (data) {
  //     if (data.type === 'slice') {
  //       // Get the total path length in order to use for dash array animation
  //       const pathLength = data.element._node.getTotalLength();

  //       // Set a dasharray that matches the path length as prerequisite to animate dashoffset
  //       data.element.attr({
  //         'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
  //       });

  //       // Create animation definition while also assigning an ID to the animation for later sync usage
  //       const animationDefinition = {
  //         'stroke-dashoffset': {
  //           id: 'anim' + data.index,
  //           dur: 1000,
  //           from: -pathLength + 'px',
  //           to: '0px',
  //           easing: Chartist.Svg.Easing.easeOutQuint,
  //           // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
  //           fill: 'freeze'
  //         }
  //       };

  //       // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
  //       if (data.index !== 0) {
  //         animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
  //       }

  //       // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
  //       data.element.attr({
  //         'stroke-dashoffset': -pathLength + 'px'
  //       });

  //       // We can't use guided mode as the animations need to rely on setting begin manually
  //       // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
  //       data.element.animate(animationDefinition, false);
  //     }
  //   });

  //   // For the sake of the example we update the chart every time it's created with a delay of 8 seconds


  // });



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
        // this.userservice.getUser(data['key']);
        // this.userservice.get_portfolio_fund().subscribe(
        //   fundlist => {
        //     // console.log(fundlist);
        //   },
        //   error => {
        //     // console.log(error);
        //   }
        // );
      },
        error => {
          // alert('error occured');
          // console.log(error);
        });
    }
  }

  setfunds(fundlist, xportfolio1: any, xcomparision1: any, xcomparision2: any) {
    portfoliofundlist.length = 0;
    this.portfolioservice.resetfunds();
    this.portfolioservice.funds$.subscribe(f => {
      this.funds$ = f;
    });
    this.portfolioservice.total$.subscribe(total => {
      this.total$ = total;
    });
    let obj;
    // tslint:disable-next-line: forin
    // console.log("Length of obj", fundlist);
    for (obj = 0; obj < fundlist.length; obj++) {

      // console.log(fundlist[obj]);


      let singlefund: portfolio_fund = {
        // created_by: 0
        security: '',
        security_id: -1,
        p1record: -1,
        p2record: -1,
        p3record: -1,
        yourPortfolio: '0',
        comparision1: '0',
        comparision2: '0'
      };
      //     console.log(fundlist[obj]);

      singlefund.security = fundlist[obj]['security_name'];
      singlefund.security_id = fundlist[obj]['security'];
      var portfolio = fundlist[obj]['portfolio'];

      if (xportfolio1['id'] == fundlist[obj]['portfolio']) {
        singlefund.yourPortfolio = fundlist[obj]['quantity'];
        singlefund.p1record = fundlist[obj]['id'];
      } else if (xcomparision1['id'] == fundlist[obj]['portfolio']) {
        singlefund.comparision1 = fundlist[obj]['quantity'];
        singlefund.p2record = fundlist[obj]['id'];
      } else if (xcomparision2['id'] == fundlist[obj]['portfolio']) {
        singlefund.comparision2 = fundlist[obj]['quantity'];
        singlefund.p3record = fundlist[obj]['id'];
      }
      if (obj < fundlist.length - 1) {
        obj++;
        if (singlefund.security == fundlist[obj]['security_name']) {
          if (portfolio != fundlist[obj]['portfolio']) {
            if (xcomparision1['id'] == fundlist[obj]['portfolio']) {
              singlefund.comparision1 = fundlist[obj]['quantity'];
              singlefund.p2record = fundlist[obj]['id'];
            } else if (xcomparision2['id'] == fundlist[obj]['portfolio']) {
              singlefund.comparision2 = fundlist[obj]['quantity'];
              singlefund.p3record = fundlist[obj]['id'];
            }
          } else {
            obj--;
          }
        } else {
          obj--;
        }
      }
      if (obj < fundlist.length - 1) {
        obj++;
        if (singlefund.security == fundlist[obj]['security_name']) {
          if (portfolio != fundlist[obj]['portfolio']) {
            if (xcomparision2['id'] == fundlist[obj]['portfolio']) {
              singlefund.comparision2 = fundlist[obj]['quantity'];
              singlefund.p3record = fundlist[obj]['id'];
            }
          } else {
            obj--;
          }
        } else {
          obj--;
        }
      }
      // this.userFunds.push(singlefund);
      portfoliofundlist.push(singlefund);
      // // console.log(singlefund);

    }
    // console.log(portfoliofundlist);
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
        // console.log(data['key']);
        this.userservice.getUser(data['key']);
        this.modalService.dismissAll('Login Done');
        this.loginForm.reset();



      },
      error => {
        // console.log(error);
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
          this.setdataindeshboard();
        },
        error => {
          // console.log(error);
        }
      );
      this.modalService.dismissAll('Log in Done');
    }
  }

  searchsecurity($event) {
    // // console.log(this.securityinput);
    var securityList1 = [];
    if (this.securityinput.length > 1) {
      if ($event.timeStamp - this.lastkeydown1 > 200) {
        securityList1 = this.searchFromArray(securitylist, this.securityinput);

      }
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
      if (string1.match('portfolio')) {
        // alert(this.portfolio1);
        if (this.portfolio1 === undefined) {
          // alert('create portfolio1 called');
          this.userservice.createportfolio(1).subscribe(
            data => {
              this.portfolio1 = data;
              console.log("DATA", this.portfolio1);
              portfolio = data['id'];
              quantity = portfoliofundlist.find(x => x.yourPortfolio = item.yourPortfolio).yourPortfolio;
              this.createportfoliofundmethod(portfolio, quantity, item, 'p1');
              // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
            }, error => {
              // console.log(error);
              this.userservice.count--;
            }
          );
        } else {
          portfolio = this.portfolio1.id;
          quantity = portfoliofundlist.find(x => x.yourPortfolio = item.yourPortfolio).yourPortfolio;
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
              quantity = portfoliofundlist.find(x => x.comparision1 = item.comparision1).comparision1;
              this.createportfoliofundmethod(portfolio, quantity, item, 'p2');

              // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
            }, error => {
              // console.log(error);
              this.userservice.count--;
            }
          );
        } else {
          portfolio = this.comparision1.id;
          quantity = portfoliofundlist.find(x => x.comparision1 = item.comparision1).comparision1;
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
              quantity = portfoliofundlist.find(x => x.comparision2 = item.comparision2).comparision2;
              this.createportfoliofundmethod(portfolio, quantity, item, 'p3');

              // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);

            }, error => {
              // console.log(error);
              this.userservice.count--;
            }
          );
        } else {
          portfolio = this.comparision2.id;
          quantity = portfoliofundlist.find(x => x.comparision2 = item.comparision2).comparision2;
          this.createportfoliofundmethod(portfolio, quantity, item, 'p3');

          // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);
        }
      }
      // alert("Quantity " + quantity + " Portfolio " + portfolio + ' secutity ' + item.security);

    }
  }

  createportfoliofundmethod(portfolio, quantity, item: portfolio_fund, recordid) {
    // alert('came in create portfolio fund');
    var security = securitylist.find(x => x.name === item.security);
    // console.log(security);

    // name = this.securityinput);
    var recid;
    if (recordid === 'p1') {
      recid = item.p1record;
    } else if (recordid === 'p2') {
      recid = item.p2record;
    } else if (recordid === 'p3') {
      recid = item.p3record;
    }

    if (security === undefined) {
      alert("Please select valid security");
    } else {
      if (recid === -1) {
        // alert('post method');
        this.userservice.add_portfolio_fund(quantity, portfolio, security.id, this.currentUser['id']).subscribe(
          data => {
            // // console.log(data);
            this.setdataindeshboard();
          }, error => {
            // console.log(error);
          }
        );
      } else {
        // alert('put method');
        this.userservice.updateportfoliofund(recid, quantity, portfolio, security.id, this.currentUser['id']).subscribe(
          data => {
            // // console.log(data);
            this.setdataindeshboard();
          }, error => {
            // console.log(error);
          }
        );
      }
    }
  }


  dropboxupload() {
    this.fileupload.getUserInfo();
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





