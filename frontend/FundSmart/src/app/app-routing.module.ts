import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundComponent } from './fund/fund.component';
import { HomeComponent } from './home/home.component';
import { FundCreateComponent } from './fund-create/fund-create.component';
import { FundRecommendationComponent } from './fund-recommendation/fund-recommendation.component';
import { HoldingDetailsComponent } from './holding-details/holding-details.component';
import { HoldingSummaryComponent } from './holding-summary/holding-summary.component';
import { AllocationFundAnalysisComponent } from './allocation-fund-analysis/allocation-fund-analysis.component';
import { AllocationRecommendationComponent } from './allocation-recommendation/allocation-recommendation.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'funds',
        component: FundComponent
    },
    {
        path: 'create_fund',
        component: FundCreateComponent
    },
    {
        path: 'fund_recommendation',
        component: FundRecommendationComponent
    },
    {
        path: 'holding_details',
        component: HoldingDetailsComponent
    },
    {
        path: 'holding_summary',
        component: HoldingSummaryComponent
    },
    {
        path: 'allocation_fund_analysis',
        component: AllocationFundAnalysisComponent
    },
    {
        path: 'allocation_recommendation',
        component: AllocationRecommendationComponent
    },
    {
        path: 'reset-password/:uid/:token',
        component: ResetPasswordComponent
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
