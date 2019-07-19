import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import { AllocationData } from '../historicaldata';

@Component({
    selector: 'app-allocation-fund-analysis',
    templateUrl: './allocation-fund-analysis.component.html',
    styleUrls: ['./allocation-fund-analysis.component.css']
})

export class AllocationFundAnalysisComponent implements OnInit {
    historical: any = [];
    total4 = [];

    order = [];

    currentAllocationTitle = '';
    currentAllocationData = [];
    currentAllocationWidth = 400;
    currentAllocationHeight = 400;
    currentAllocationType = 'PieChart';
    currentAllocationOption = {
        legend: { position: "top", alignment: 'start', maxLines: 10 },
        pieHole: 0.8,
        colors: ['#5F9EA0', '#A52A2A', '#DC143C', '#556B2F', '#2F4F4F'],
        animation: {
            duration: 10000,
            easing: 'out'
        },
        enableInteractivity: true,
    };
    existing: AllocationData = {
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    recommended: AllocationData = {
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    diffrence: AllocationData = {
        oneyear: 0,
        threeyear: 0,
        fiveyear: 0
    };
    constructor(
        private interconn: IntercomponentCommunicationService,
        private route: ActivatedRoute,
        private userservice: ServercommunicationService
    ) { }


    ngOnInit() {
        this.interconn.titleSettermethod('Allocation & Fund Analysis');
        this.getCurrentAllocation();
        this.getHistoricalPerformance();
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

    getHistoricalPerformance() {
        this.userservice.allocationRecommendationHistorical(this.order).subscribe(
            result => {
                this.existing = {
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                this.recommended = {
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                this.diffrence = {
                    oneyear: 0,
                    threeyear: 0,
                    fiveyear: 0
                };
                if (result[0]) {
                    this.existing.oneyear = Number.parseFloat(Number.parseFloat(result[0]['Current Allocation']['1-year']).toFixed(2));
                    this.existing.threeyear = Number.parseFloat(Number.parseFloat(result[0]['Current Allocation']['3-year']).toFixed(2));
                    this.existing.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['Current Allocation']['5-year']).toFixed(2));

                    this.recommended.oneyear = Number.parseFloat(Number.parseFloat(result[0]['Recommended Allocation']['1-year']).toFixed(2));
                    this.recommended.threeyear = Number.parseFloat(Number.parseFloat(result[0]['Recommended Allocation']['3-year']).toFixed(2));
                    this.recommended.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['Recommended Allocation']['5-year']).toFixed(2));

                    this.diffrence.oneyear = Number.parseFloat(Number.parseFloat(result[0]['Difference']['1-year']).toFixed(2));
                    this.diffrence.threeyear = Number.parseFloat(Number.parseFloat(result[0]['Difference']['3-year']).toFixed(2));
                    this.diffrence.fiveyear = Number.parseFloat(Number.parseFloat(result[0]['Difference']['5-year']).toFixed(2));
                }
            });
    }

}
