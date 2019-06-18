import { Component, OnInit, NgModule } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../user';
import { portfolio_fund } from '../portfolio_fund';
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
declare let $: any;
import * as Chartist from 'chartist';

@Component({

  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  existing: HistoricalData;
  recommended: HistoricalData;
  diffrence: HistoricalData;



  doughnutchartData: DoughnutChart[] = [];
  securitylist: security[] = [];
  userFunds: portfolio_fund[] = [];
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


  pietype: ChartType;
  piedata: IChartistData;
  pieoptions: IPieChartOptions;
  pieevents: ChartEvent;
  pielable = [];
  pieseries = [];
  constructor(private modalService: NgbModal, private interconn: IntercomponentCommunicationService,
    private userservice: ServercommunicationService,
    private fileupload: GetfileforuploadService,
    private authService: AuthService) {
    this.interconn.componentMethodCalled$.subscribe(
      () => {
        this.setcurrent_user();
      });
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
      security: undefined,
      yourPortfolio: undefined,
      comparision1: undefined,
      comparision2: undefined
    };
    this.userFunds.push(singlefund);
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

  setfunds(fundlist) {

    let obj;

    // tslint:disable-next-line: forin
    // for (datalist in fundlist['results']) {
    //   console.log("datalist" + fundlist['results'][datalist]['security']);

    // console.log("Length of datalist ", datalist.length);

    for (obj = 0; obj < fundlist['results'].length; obj++) {
      let singlefund: portfolio_fund = {
        security: '',
        yourPortfolio: '',
        comparision1: '',
        comparision2: ''
      };
      // console.log(obj);
      // console.log(fundlist['results'][obj]['security']);

      singlefund.security = fundlist['results'][obj]['security'];
      singlefund.yourPortfolio = fundlist['results'][obj]['quantity'];
      obj++;

      if (singlefund.security == fundlist['results'][obj]['security']) {
        singlefund.comparision1 = fundlist['results'][obj]['quantity'];
        obj++;
      }



      if (singlefund.security == fundlist['results'][obj]['security']) {
        singlefund.comparision2 = fundlist['results'][obj]['quantity'];
      }
      // console.log("Single fund", singlefund);
      this.userFunds.push(singlefund);
    }
    // console.log("User funds array", this.userFunds);

    // }
  }

  userlogin() {
    this.userservice.doLogin(this.username, this.pass1).subscribe(
      data => {
        console.log(data['key']);
        this.userservice.getUser(data['key']);
        this.modalService.dismissAll('Login Done');
        this.username = '';
        this.pass1 = '';
        this.userservice.get_portfolio_fund().subscribe(
          fundlist => {
            this.setfunds(fundlist);
            // console.log(this.userFunds);
          },
          error => {
            console.log(error);
          }
        );
        this.userservice.get_historical_perfomance().subscribe(
          result => {
            console.log(result);
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
            console.log(Number.parseFloat(Number.parseFloat(result[0]['existing']['1-year']).toFixed(2)));

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

            // console.log("Existing", this.existing);
            // console.log(this.recommended);
            // console.log(this.diffrence);
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
      },
      error => {
        alert('Wrong Credentials / Server Problem');
      }
    );
  }

  openmodal(modalid) {
    this.modalService.open(modalid, { ariaLabelledBy: 'app-home' }).result.then((result) => {
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

  deleteAttachment(index) {
    this.files.splice(index, 1);
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
}
