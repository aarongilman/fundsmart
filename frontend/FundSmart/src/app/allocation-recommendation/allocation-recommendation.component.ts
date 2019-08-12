import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { Router } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import { ToastrService } from 'ngx-toastr';
import { portfolioidSelect } from '../fund/portfolioid_select';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-allocation-recommendation',
    templateUrl: './allocation-recommendation.component.html',
    styleUrls: ['./allocation-recommendation.component.css']
})
export class AllocationRecommendationComponent implements OnInit {

    currentAllocationData = [];
    currentAllocationWidth = 400;
    currentAllocationHeight = 400;
    currentAllocationType = 'PieChart';
    currentAllocationOption = {
        legend: {
            position: "top",
            alignment: 'start',
            maxLines: 10
        },
        pieHole: 0.8,
        pieSliceText: 'none',
        colors: [
            '#1395b9', '#0e3c54', '#cc0000', '#e65c00',
            '#ecaa39', '#eac843', '#a2b86d', '#5ace9f',
            '#fca622', '#1a5276', '#3498db', '#0e6655',
            '#52be80', '#f4d03f', '#dc7633', '#717d7e',
            '#212f3c', '#922b21', '#e74c3c', '#633974'
        ],
        animation: {
            duration: 10000,
            easing: 'out'
        },
        enableInteractivity: true,
    };

    constructor(
        private interconn: IntercomponentCommunicationService,
        private router: Router,
        private userservice: ServercommunicationService,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService
    ) {
        this.interconn.logoutcomponentMethodCalled$.toPromise().then(() => {
            this.router.navigate(['/home']);
        });
    }

    ngOnInit() {
        this.interconn.titleSettermethod('Allocation Recomendation');
        this.spinner.show();
        this.getCurrentAllocation();
    }

    getCurrentAllocation() {
        if (portfolioidSelect.length > 0) {
            this.userservice.getCurrentAllocation(portfolioidSelect).toPromise().then((result: any) => {
                result.forEach((resultlist: any) => {
                    const names = Object.keys(resultlist);
                    for (const i in names) {
                        this.currentAllocationData.push([names[i], resultlist[names[i]]]);
                    }
                });
                this.spinner.hide();
            });
        } else {
            this.toastr.info('Please select portfolio id/ids from Fund page', 'Information');
            this.spinner.hide();
        }
    }

    routeTo() {
        this.router.navigate(['/allocation_fund_analysis']);
    }

}
