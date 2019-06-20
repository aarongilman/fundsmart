import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../user';
import { portfolio_fund } from '../portfolio_fund';
import { portfoliofundlist } from '../portfolio_fundlist';
import { PortfoliofundhelperService } from '../portfoliofundhelper.service';
import { SortableDirective, SortEvent } from '../sortable.directive';
import { security } from '../security';
import { DoughnutChart } from '../doughnut_chart';
import * as $ from 'jquery';
import { ServercommunicationService } from '../servercommunication.service';
import { AuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { GetfileforuploadService } from '../getfileforupload.service';
import { IPieChartOptions, IChartistAnimationOptions, IChartistData, ILineChartOptions } from 'chartist';
import { ChartEvent, ChartType } from 'ng-chartist';
import { HistoricalData } from '../historicaldata';
// declare let ^: any;
import * as Chartist from 'chartist';



@Component({

  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [PortfoliofundhelperService, DecimalPipe]
})

export class HomeComponent implements OnInit {

  funds$: Observable<portfolio_fund[]>;
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



  doughnutchartData: DoughnutChart[] = [];
  securitylist: security[] = [];
  userFunds = portfoliofundlist;
  reguser: User = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password1: '',
    password2: ''
  };
  files: any = [];
  currentUser: any;

  socialuser: SocialUser;
  loggedIn: boolean;

  closeResult: string;
  showdetail_flag = false;
  firstname = '';
  lastname = '';
  email = '';
  phone = '';
  pass1 = '';
  pass2 = '';
  username = '';

  securityinput: string;
  portfolioinput: string;
  comp1input: string;
  comp2input: string;
  lastkeydown1: number = 0;

  portfolio1: any;
  comparision1: any;
  comparision2: any;

  pietype: ChartType;
  piedata: IChartistData;
  pieoptions: IPieChartOptions;
  pieevents: ChartEvent;
  pielable = [];
  pieseries = [];
  constructor(private modalService: NgbModal, private interconn: IntercomponentCommunicationService,
    private userservice: ServercommunicationService,
    private fileupload: GetfileforuploadService,
    private authService: AuthService,
    public portfolioservice: PortfoliofundhelperService) {

    this.funds$ = portfolioservice.funds$;
    this.portfolioservice.total$.subscribe(total => {
      this.total$ = total;
    });

    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        this.userFunds = [];
        this.portfolioservice.resetfunds();
        this.funds$ = this.portfolioservice.funds$;
        this.portfolioservice.total$.subscribe(total => {
          this.total$ = total;
        });
      }
    );


    this.interconn.componentMethodCalled$.subscribe(
      () => {
        // alert("In first method");
        this.setcurrent_user();

        this.userservice.getUserPortfolio().subscribe(
          data => {
            this.portfolio1 = data['results']['0'];
            this.comparision1 = data['results']['1'];
            this.comparision2 = data['results']['2'];
            this.userservice.get_portfolio_fund().subscribe(
              fundlist => {
                this.setfunds(fundlist, data['results']['0'], data['results']['1'], data['results']['2']);
              },
              error => {
                console.log(error);
              }
            );
          },
          error => {
            console.log(error);
          });

        this.userservice.get_historical_perfomance().subscribe(
          result => {
            // console.log(result);
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

          },
          error => {
            console.log(error);
          }
        );
        this.userservice.get_home_pie_chart().subscribe(
          jsondata => {
            // console.log(jsondata);
            // tslint:disable-next-line: forin
            for (var data in jsondata) {
              this.pielable.push(jsondata[data]['security__asset_type']);
              this.pieseries.push(jsondata[data]['total']);
            }

          },
          error => {
            console.log(error);
          }
        );
        this.userservice.get_deshboard_doughnut_chart().subscribe(
          jsondata => {
            // console.log(jsondata);
            // tslint:disable-next-line: forin
            for (var data in jsondata) {
              var doughnutobj: DoughnutChart = {
                security__industry: '',
                total: -1
              }
              // console.log(jsondata[data]['security__industry'], jsondata[data]['total']);
              doughnutobj.security__industry = jsondata[data]['security__industry'];
              doughnutobj.total = jsondata[data]['total'];
              this.doughnutchartData.push(doughnutobj);
            }
          },
          error => { console.log(error); }

        );
      });
    // alert(this.currentUser.name);
  }

  ngOnInit() {
    this.userservice.get_security().subscribe(
      securitylist => {
        // console.log(securitylist);
        // tslint:disable-next-line: forin
        for (var obj in securitylist) {
          var securityobj: security = {
            id: -1,
            isin: '',
            name: '',
            ticker: ''
          };
          securityobj.id = securitylist[obj]['id'];
          securityobj.isin = securitylist[obj]['isin'];
          securityobj.name = securitylist[obj]['name'];
          securityobj.ticker = securitylist[obj]['ticker'];
          this.securitylist.push(securityobj);
        }
      }
    );
    // this.userservice.checklogin();
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');
      this.userservice.get_portfolio_fund().subscribe(
        fundlist => {
          console.log(fundlist);
        },
        error => {
          console.log(error);
        }
      );
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user) => {
      this.userservice.socialLogin(user);
      this.setcurrent_user();
      this.modalService.dismissAll('Log in Done');
      this.userservice.get_portfolio_fund().subscribe(
        fundlist => {
          console.log(fundlist);
        },
        error => {
          console.log(error);
        }
      );
    });
  }

  signOut(): void {
    this.authService.signOut();
  }

  generatePieChart() {
    this.pietype = 'Pie';
    this.piedata = {
      labels: this.pielable,
      series: this.pieseries,
    };
    this.pieoptions = {
      donut: false,
      showLabel: true,
      width: '100%',
      height: '300px'
    };
    this.pieevents = {
      draw: (data) => {
        const pathLength = data.element._node.getTotalLength();
        if (data.type === 'pie') {
          data.element.animate({
            y2: {
              id: 'anim' + data.index,
              dur: 1000,
              from: -pathLength + 'px',
              to: '0px',
              easing: 'easeOutQuad',
              fill: 'freeze'
            } as IChartistAnimationOptions
          });
        }
      }
    };
  }

  addRow() {
    let singlefund: portfolio_fund = {
      security: '',
      yourPortfolio: '0.00',
      comparision1: '0.00',
      comparision2: '0.00'
    };
    this.userFunds.push(singlefund);
    this.portfolioservice.resetfunds();
    this.funds$ = this.portfolioservice.funds$;
    this.portfolioservice.total$.subscribe(total => {
      this.total$ = total;
    });
    // portfoliofundlist.push(singlefund);
  }


  // generateDonotchart() {
  //   $(function () {
  //     const chart = new Chartist.Pie('.do-nut-chart', {
  //       series: [10, 20, 50, 20, 5, 50, 15],
  //       labels: [1, 2, 3, 4, 5, 6, 7]
  //     }, {
  //         donut: true,
  //         showLabel: true
  //       });

  //     // tslint:disable-next-line: only-arrow-functions
  //     chart.on('draw', function (data) {
  //       if (data.type === 'slice') {
  //         // Get the total path length in order to use for dash array animation
  //         const pathLength = data.element._node.getTotalLength();

  //         // Set a dasharray that matches the path length as prerequisite to animate dashoffset
  //         data.element.attr({
  //           'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
  //         });

  //         // Create animation definition while also assigning an ID to the animation for later sync usage
  //         const animationDefinition = {
  //           'stroke-dashoffset': {
  //             id: 'anim' + data.index,
  //             dur: 1000,
  //             from: -pathLength + 'px',
  //             to: '0px',
  //             easing: Chartist.Svg.Easing.easeOutQuint,
  //             // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
  //             fill: 'freeze'
  //           }
  //         };

  //         // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
  //         if (data.index !== 0) {
  //           animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
  //         }

  //         // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
  //         data.element.attr({
  //           'stroke-dashoffset': -pathLength + 'px'
  //         });

  //         // We can't use guided mode as the animations need to rely on setting begin manually
  //         // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
  //         data.element.animate(animationDefinition, false);
  //       }
  //     });

  //     // For the sake of the example we update the chart every time it's created with a delay of 8 seconds


  //   });

  // }

  registerUser() {
    if (this.showdetail_flag === false) {
      $(".register-slide").slideDown("500");
      this.showdetail_flag = true;
    } else {
      if (this.pass1 == this.pass2) {
        this.reguser.firstname = this.firstname;
        this.reguser.lastname = this.lastname;
        this.reguser.email = this.email;
        this.reguser.phone = this.phone;
        this.reguser.password1 = this.pass1;
        this.reguser.password2 = this.pass2;
        this.reguser.username = this.username;
        this.userservice.doRegistration(this.reguser).subscribe(data => {
          localStorage.setItem('authkey', data['key']);
          alert('registration successful');
          this.firstname = '';
          this.lastname = '';
          this.email = '';
          this.phone = '';
          this.pass1 = '';
          this.pass2 = '';
          this.username = '';
          this.showdetail_flag = false;
          this.modalService.dismissAll('Registration Done');
          this.userservice.getUser(data['key']);
          this.userservice.get_portfolio_fund().subscribe(
            fundlist => {
              console.log(fundlist);
            },
            error => {
              console.log(error);
            }
          );
        },
          error => {
            alert('error occured');
          });
      } else {
        alert('Password doesnot match');
      }
    }
  }

  setfunds(fundlist, xportfolio1: any, xcomparision1: any, xcomparision2: any) {

    let obj;
    // tslint:disable-next-line: forin
    // console.log("Length of obj",fundlist['results'].length);    
    for (obj = 0; obj < fundlist['results'].length; obj++) {

      let singlefund: portfolio_fund = {
        // created_by: 0
        security: '',
        yourPortfolio: '0.00',
        comparision1: '0.00',
        comparision2: '0.00'
      };
      singlefund.security = fundlist['results'][obj]['security_name'];
      var portfoilo = fundlist['results'][obj]['portfolio'];
      if (xportfolio1['id'] == fundlist['results'][obj]['portfolio']) {
        singlefund.yourPortfolio = fundlist['results'][obj]['quantity'];
      } else if (xcomparision1['id'] == fundlist['results'][obj]['portfolio']) {
        singlefund.comparision1 = fundlist['results'][obj]['quantity'];
      } else if (xcomparision2['id'] == fundlist['results'][obj]['portfolio']) {
        singlefund.comparision2 = fundlist['results'][obj]['quantity'];
      }
      if (obj < fundlist['results'].length - 1) {
        obj++;
        if (singlefund.security == fundlist['results'][obj]['security_name']) {
          if (portfoilo != fundlist['results'][obj]['portfolio']) {
            if (xcomparision1['id'] == fundlist['results'][obj]['portfolio']) {
              singlefund.comparision1 = fundlist['results'][obj]['quantity'];
            } else if (xcomparision2['id'] == fundlist['results'][obj]['portfolio']) {
              singlefund.comparision2 = fundlist['results'][obj]['quantity'];
            }
          } else {
            obj--;
          }
        } else {
          obj--;
        }
      }
      if (obj < fundlist['results'].length - 1) {
        obj++;
        if (singlefund.security == fundlist['results'][obj]['security_name']) {
          if (portfoilo != fundlist['results'][obj]['portfolio']) {
            if (xcomparision2['id'] == fundlist['results'][obj]['portfolio']) {
              singlefund.comparision2 = fundlist['results'][obj]['quantity'];
            }
          } else {
            obj--;
          }
        } else {
          obj--;
        }
      }
      this.userFunds.push(singlefund);
      // portfoliofundlist.push(singlefund);
      // console.log(singlefund);

    }
    this.portfolioservice.resetfunds();
    this.funds$ = this.portfolioservice.funds$;
    // this.total$ = this.portfolioservice.total$;
    // this.portfolioservice.funds$.subscribe(result => this.funds$);
    this.portfolioservice.total$.subscribe(total => {
      this.total$ = total;
    });
  }

  userlogin() {
    this.userservice.doLogin(this.username, this.pass1).subscribe(
      data => {
        localStorage.setItem('authkey', data['key']);
        console.log(data['key']);
        this.userservice.getUser(data['key']);
        this.modalService.dismissAll('Login Done');
        this.username = '';
        this.pass1 = '';



      },
      error => {
        alert('Wrong Credentials / Server Problem');
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
    this.userservice.reset_pwd_sendemail(this.email).subscribe(data => {
      console.log(data);
    },
      error => {
        console.log(error);
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
  }



  uploadFile(event) {
    // alert('upload file event');
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element.name);
      console.log(element);

      const formData = new FormData();
      formData.append('data_file', element);
      this.userservice.uploadfile(formData).subscribe(
        res => {
          console.log(res);
        },
        error => {
          console.log(error);
        }
      );
      this.modalService.dismissAll('Log in Done');
    }
  }

  searchsecurity($event) {
    // console.log(this.securityinput);
    var securityList1 = [];
    if (this.securityinput.length > 1) {
      if ($event.timeStamp - this.lastkeydown1 > 200) {
        securityList1 = this.searchFromArray(this.securitylist, this.securityinput);

      }
      // console.log(securityList1);
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
    // console.log(matches);
    return matches;
  }

  addportfolioFund(string1, item) {
    $('#input').on('keydown', function (e) {
      if (e.which == 8 || e.which == 46) return false;
    });
    alert(item.security);
    // if (this.securityinput === undefined || item.security === '') {
    //   alert('Plese select security first');
    // } else if (this.currentUser == undefined) {
    //   alert("Please login first");
    // }
    // else {
    //   var portfolio;
    //   var quantity;
    //   if (string1.match('portfolio')) {
    //     portfolio = this.portfolio1.id;
    //     quantity = this.portfolioinput;
    //   } else if (string1.match('comp1')) {
    //     portfolio = this.comparision1.id;
    //     quantity = this.comp1input;
    //   } else if (string1.match('comp2')) {
    //     portfolio = this.comparision2.id;
    //     quantity = this.comp2input;
    //   }
    //   var security = this.securitylist.find(x => x.name === this.securityinput);
    // name = this.securityinput);
    // this.userservice.add_portfolio_fund(quantity, portfolio, security.id, this.currentUser['id']).subscribe(
    //   data => {
    //     // console.log(data);
    //     this.userservice.get_portfolio_fund().subscribe(
    //       fundlist => {
    // this.userFunds = [];
    //         this.setfunds(fundlist, this.portfolio1, this.comparision1, this.comparision2);
    //       },
    //       error => {
    //         console.log(error);
    //       }
    //     );
    //   }, error => {
    //     console.log(error);
    //   }
    // );
    // }
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





