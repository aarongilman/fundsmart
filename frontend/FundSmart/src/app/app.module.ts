import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeadSearchComponent } from './head-search/head-search.component';
import { HomeComponent } from './home/home.component';
import { HoldingSummaryComponent } from './holding-summary/holding-summary.component';
import { HoldingDetailsComponent } from './holding-details/holding-details.component';
import { FundComponent } from './fund/fund.component';
import { FundRecommendationComponent } from './fund-recommendation/fund-recommendation.component';
import { FundCreateComponent } from './fund-create/fund-create.component';
import { AllocationRecommendationComponent } from './allocation-recommendation/allocation-recommendation.component';
import { AllocationFundAnalysisComponent } from './allocation-fund-analysis/allocation-fund-analysis.component';
import {NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ServercommunicationService} from './servercommunication.service';

@NgModule({
  declarations: [
    AppComponent,
    HeadSearchComponent,
    HomeComponent,
    HoldingSummaryComponent,
    HoldingDetailsComponent,
    FundComponent,
    FundRecommendationComponent,
    FundCreateComponent,
    AllocationRecommendationComponent,
    AllocationFundAnalysisComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [ServercommunicationService,],
  bootstrap: [AppComponent]
})
export class AppModule { }
