import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { Router } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import { AllocationData } from '../historicaldata';
import { ToastrService } from 'ngx-toastr';
import { portfolioidSelect } from '../fund/portfolioid_select';

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
        pieSliceText: 'none',
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

    linetitle = '';
    linedata = [];
    lineoptions = {
        pointSize: 1,
        curveType: 'function',
        tooltips: {
            mode: 'index'
        },
        colors: ['#5ace9f', '#fca622', '#1395b9', '#0e3c54', '#cc0000', '#e65c00', '#ecaa39', '#eac843', '#a2b86d'],
    };
    linewidth = 600;
    lineheight = 280;
    linetype = 'LineChart';
    linecolumnNames = [];

    constructor(
        private interconn: IntercomponentCommunicationService,
        private userservice: ServercommunicationService,
        private router: Router,
        private tostr: ToastrService
    ) {
        this.interconn.componentMethodCalled$.toPromise().then(
            () => {
                if (portfolioidSelect.length > 0) {
                    this.getCurrentAllocation();
                    this.getHistoricalPerformance();
                    this.getLinegraph();
                }
            });
        this.interconn.logoutcomponentMethodCalled$.toPromise().then(
            () => {
                this.router.navigate(['/home']);
            });
    }

    ngOnInit() {
        this.interconn.titleSettermethod('Allocation & Fund Analysis');
        if (portfolioidSelect.length === 0) {
            this.tostr.info('Please select portfolio id/ids from Fund page', 'Information');
        } else {
            if (this.userservice.currentuser) {
                this.getCurrentAllocation();
                this.getHistoricalPerformance();
                this.getLinegraph();
            }
        }
    }

    getCurrentAllocation() {
        if (portfolioidSelect.length > 0) {
            this.userservice.get(`api/current_allocation/?portfolio_ids=${portfolioidSelect}`).toPromise().then(
                (result: any) => {
                    result.forEach((resultlist: any) => {
                        const names = Object.keys(resultlist);
                        // tslint:disable-next-line: forin
                        for (const i in names) {
                            this.currentAllocationData.push([names[i], resultlist[names[i]]]);
                        }
                    });
                });
        }
    }

    getHistoricalPerformance() {
        this.userservice.allocationRecommendationHistorical(portfolioidSelect).toPromise().then(
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

    getLinegraph() {
        if (portfolioidSelect.length > 0) {
            this.userservice.get(`api/allocation_line_graph/?portfolio_ids=${portfolioidSelect}`).toPromise().then(
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

                });
        }
    }

}
