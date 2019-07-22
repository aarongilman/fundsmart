import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import { keyframes } from '@angular/animations';

@Component({
  selector: 'app-allocation-recommendation',
  templateUrl: './allocation-recommendation.component.html',
  styleUrls: ['./allocation-recommendation.component.css']
})
export class AllocationRecommendationComponent implements OnInit {
  order = [];

  // currentallocation
  currentAllocationTitle = '';
  currentAllocationData = [];
  currentAllocationWidth = 400;
  currentAllocationHeight = 400;
  currentAllocationType = 'PieChart';
  currentAllocationOption = {
    legend: { position: "top", alignment: 'start', maxLines: 10 },
    // legend: { position: 'labeled' },
    pieHole: 0.8,
    colors: ['#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d', '#5ace9f', '#fca622'],
    // colors: ['#5F9EA0', '#A52A2A', '#DC143C', '#556B2F', '#2F4F4F'],
    animation: {
      duration: 10000,
      easing: 'out'
    },
    enableInteractivity: true,
  };



  constructor(private interconn: IntercomponentCommunicationService,
    private router: Router, private route: ActivatedRoute,
    private userservice: ServercommunicationService) {
    this.interconn.logoutcomponentMethodCalled$.subscribe(
      () => {
        this.router.navigate(['/home']);
      }
    );
  }

  ngOnInit() {
    this.interconn.titleSettermethod('Allocation Recomendation');
    // this.route.queryParamMap.subscribe((queryParams: Params) => {
    //   this.order = queryParams.params.id;
    // });
    // console.log(this.order);

    this.getCurrentAllocation();
  }

  getCurrentAllocation() {
    this.route.queryParamMap.subscribe((queryParams: Params) => {
      this.order = queryParams.params.id;
      if (queryParams.params.id !== undefined) {
        this.userservice.get(`api/current_allocation/?portfolio_ids=${this.order}`).toPromise().then(
          (result: any) => {
            result.forEach((resultlist: any) => {
              // console.log(resultlist);
              const names = Object.keys(resultlist);
              // this.currentAllocationData.push()
              // console.log(names);
              // tslint:disable-next-line: forin
              for (const i in names) {
                // console.log(names[i], resultlist[names[i]]);
                this.currentAllocationData.push([names[i], resultlist[names[i]]]);
              }

            });


          }
        );
      }
    });
  }
}
