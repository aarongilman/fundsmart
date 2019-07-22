import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';

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

    constructor(
        private interconn: IntercomponentCommunicationService,
        private router: Router, private route: ActivatedRoute,
        private userservice: ServercommunicationService) {
        this.interconn.logoutcomponentMethodCalled$.subscribe(
            () => {
                this.router.navigate(['/home']);
            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod('Allocation Recomendation');
        this.getCurrentAllocation();
    }

    getCurrentAllocation() {
        this.route.queryParamMap.subscribe((queryParams: Params) => {
            this.order = queryParams.params.id;
            if (queryParams.params.id !== undefined) {
                this.userservice.get(`api/current_allocation/?portfolio_ids=${this.order}`).toPromise().then(
                    (result: any) => {
                        result.forEach((resultlist: any) => {
                            const names = Object.keys(resultlist);
                            for (const i in names) {
                                this.currentAllocationData.push([names[i], resultlist[names[i]]]);
                            }
                        });
                    });
            }
        });
    }

    routeTo() {
        this.router.navigate(['/allocation_fund_analysis'], { queryParams: { id: this.order } });
    }

}
