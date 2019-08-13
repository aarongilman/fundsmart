import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';
import { Router } from '@angular/router';
import { ServercommunicationService } from '../servercommunication.service';
import { AllocationData } from '../historicaldata';
import { ToastrService } from 'ngx-toastr';
import { portfolioidSelect } from '../fund/portfolioid_select';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-allocation-fund-analysis',
    templateUrl: './allocation-fund-analysis.component.html',
    styleUrls: ['./allocation-fund-analysis.component.css']
})

export class AllocationFundAnalysisComponent implements OnInit {

    historical: any = [];

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
            '#ecaa39', '#eac843', '#04202c', '#a2b86d',
            '#5ace9f', '#fca622', '#32384d', '#304040',
            '#922b21', '#e74c3c', '#211f30', '#128277',
            '#633974', '#8e44ad', '#1a5276', '#3498db',
            '#0e6655', '#52be80', '#f4d03f', '#dc7633',
            '#717d7e', '#212f3c', '#7d5642', '#5a4e4d',
        ],
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

    linedata = [];
    lineoptions = {
        pointSize: 1,
        curveType: 'function',
        tooltips: {
            mode: 'index'
        },
        colors: [
            '#5ace9f', '#fca622', '#1395b9', '#0e3c54',
            '#cc0000', '#e65c00', '#ecaa39', '#eac843',
            '#a2b86d', '#922b21', '#e74c3c', '#633974',
            '#8e44ad', '#1a5276', '#3498db', '#0e6655',
            '#52be80', '#f4d03f', '#dc7633', '#717d7e',
            '#212f3c'
        ],
    };
    linewidth = 600;
    lineheight = 280;
    linetype = 'LineChart';
    linecolumnNames = [];

    constructor(
        private interconn: IntercomponentCommunicationService,
        private userservice: ServercommunicationService,
        private router: Router,
        private tostr: ToastrService,
        private spinner: NgxSpinnerService
    ) {
        this.interconn.componentMethodCalled$.toPromise().then(() => {
            if (portfolioidSelect.length > 0) {
                this.spinner.show();
                this.getCurrentAllocation();
                this.getHistoricalPerformance();
                this.getLinegraph();
            }
        });
        this.interconn.logoutcomponentMethodCalled$.toPromise().then(() => {
            this.router.navigate(['/home']);
        });
    }

    ngOnInit() {
        this.interconn.titleSettermethod('Allocation & Fund Analysis');
        if (portfolioidSelect.length === 0) {
            this.tostr.info('Please select portfolio id/ids from Fund page', 'Information');
        } else {
            if (this.userservice.currentuser) {
                this.spinner.show();
                this.getCurrentAllocation();
                this.getHistoricalPerformance();
                this.getLinegraph();
            }
        }
    }

    getCurrentAllocation() {
        if (portfolioidSelect.length > 0) {
            this.userservice.getCurrentAllocation(portfolioidSelect).toPromise().then((result: any) => {
                result.forEach((resultlist: any) => {
                    const names = Object.keys(resultlist);
                    // tslint:disable-next-line: forin
                    for (const i in names) {
                        this.currentAllocationData.push([names[i], resultlist[names[i]]]);
                    }
                });
                this.spinner.hide();
            });
        } else {
            this.spinner.hide();
        }
    }

    getHistoricalPerformance() {
        this.userservice.allocationRecommendationHistorical(portfolioidSelect).toPromise().then(result => {
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
        this.userservice.getLineGraph(portfolioidSelect).toPromise().then((jsondata: any) => {
            let totalportfolios = jsondata.length + 1;
            this.linedata = [];
            this.linecolumnNames = ['label'];
            const tempArray = [];
            const mainObj = {};
            for (let i = 0; i < jsondata.length; i++) {
                const element = jsondata[i];
                if (element['label'].length > 0) {
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
            }
            for (let i = 0; i < tempArray.length; i++) {
                const element = tempArray[i];
                let values;
                const valuesCollection = [];
                valuesCollection.push(element.toString());
                if (typeof mainObj[element] === 'number') {
                    values = mainObj[element];
                    valuesCollection.push(parseFloat(values));
                } else {
                    values = (mainObj[element].split(',')).filter(Boolean);
                    for (const iterator of values) {
                        valuesCollection.push(parseFloat(iterator));
                    }
                }
                if (valuesCollection.length === totalportfolios) {
                    this.linedata.push(valuesCollection);
                }
            }
            this.spinner.hide();
        });
    }

}
