import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServercommunicationService } from './servercommunication.service';
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { SocialloginService } from './sociallogin.service';

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("883505734730-7culcu4hmm1m13ocq1uhbkr3fc31gpnf.apps.googleusercontent.com")
  }
  // ,
  // {
  //   id: FacebookLoginProvider.PROVIDER_ID,
  //   provider: new FacebookLoginProvider("Facebook-App-Id")
  // }
]);

export function provideConfig() {
  return config;
}



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
    FormsModule,
    SocialLoginModule
  ],
  providers: [ServercommunicationService, SocialloginService, {
    provide: AuthServiceConfig,
    useFactory: provideConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
