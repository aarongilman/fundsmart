import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ChartistModule } from 'ng-chartist';
import { SocialloginService } from './sociallogin.service';
import { HeaderComponent } from './header/header.component';
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DragAndDropDirective } from './drag-and-drop.directive';
import { GetfileforuploadService } from './getfileforupload.service';
import {
  GoogleApiModule,
  GoogleApiService,
  GoogleAuthService,
  NgGapiClientConfig,
  NG_GAPI_CONFIG,
  GoogleApiConfig
} from 'ng-gapi';
import { SortableDirective } from './sortable.directive';


let gapiClientConfig: NgGapiClientConfig = {
  client_id: '883505734730-7culcu4hmm1m13ocq1uhbkr3fc31gpnf.apps.googleusercontent.com',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive',
  ].join(" ")
};

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('883505734730-7culcu4hmm1m13ocq1uhbkr3fc31gpnf.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('1625784934400382')
  }
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
    AllocationFundAnalysisComponent,
    HeaderComponent,
    ResetPasswordComponent,
    DragAndDropDirective,
    SortableDirective
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    SocialLoginModule,
    ChartistModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    }),
  ],
  providers: [ServercommunicationService, SocialloginService, GetfileforuploadService,
    IntercomponentCommunicationService, {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
