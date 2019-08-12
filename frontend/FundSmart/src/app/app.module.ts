import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';

import { AllocationRecommendationComponent } from './allocation-recommendation/allocation-recommendation.component';
import { AllocationFundAnalysisComponent } from './allocation-fund-analysis/allocation-fund-analysis.component';
import { FundRecommendationComponent } from './fund-recommendation/fund-recommendation.component';
import { HoldingSummaryComponent } from './holding-summary/holding-summary.component';
import { HoldingDetailsComponent } from './holding-details/holding-details.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { FundCreateComponent } from './fund-create/fund-create.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { FundComponent } from './fund/fund.component';

import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import { ServercommunicationService } from './servercommunication.service';
import { GetfileforuploadService } from './getfileforupload.service';
import { SocialloginService } from './sociallogin.service';

import {
    GoogleLoginProvider,
    FacebookLoginProvider,
    SocialLoginModule,
    AuthServiceConfig
} from 'angularx-social-login';
import { GoogleChartsModule } from 'angular-google-charts';
import { MatMenuModule } from '@angular/material';

import { DragAndDropDirective } from './drag-and-drop.directive';
import { SortableDirective } from './sortable.directive';

import { FilterPipe } from './filter.pipe';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { GoogleApiModule, NgGapiClientConfig, NG_GAPI_CONFIG } from 'ng-gapi';
import { ToastrModule } from 'ngx-toastr';
import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TestComponent } from './test/test.component';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { HighchartsChartModule } from 'highcharts-angular';
import { GlobalCurrency } from './fund/global';


PlotlyModule.plotlyjs = PlotlyJS;
const cookieConfig: NgcCookieConsentConfig = {
    cookie: {
        // domain: 'localhost'
        domain: 'ec2-3-130-87-74.us-east-2.compute.amazonaws.com'
        // it is mandatory to set a domain, for cookies to work properly (see https://goo.gl/S2Hy2A)
    },
    palette: {
        popup: {
            background: '#2b9d75'
        },
        button: {
            background: '#fca62b'
        }
    },
    theme: 'edgeless',
    type: 'info'
};

const gapiClientConfig: NgGapiClientConfig = {
    client_id: '883505734730-7culcu4hmm1m13ocq1uhbkr3fc31gpnf.apps.googleusercontent.com',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/drive',
    ].join(' ')
};

const config = new AuthServiceConfig([
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
        SortableDirective,
        FilterPipe,
        TestComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        AppRoutingModule,
        NgbModule,
        HttpClientModule,
        FormsModule,
        ConfirmDialogModule,
        TooltipModule,
        PlotlyModule,
        NgSelectModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        MatMenuModule,
        HighchartsChartModule,
        DataTablesModule,
        NgcCookieConsentModule.forRoot(cookieConfig),
        ToastrModule.forRoot(),
        SocialLoginModule,
        GoogleChartsModule.forRoot(),
        GoogleApiModule.forRoot({
            provide: NG_GAPI_CONFIG,
            useValue: gapiClientConfig
        }),
    ],
    providers: [
        ServercommunicationService,
        SocialloginService,
        GetfileforuploadService,
        ConfirmationService,
        GlobalCurrency,
        IntercomponentCommunicationService, {
            provide: AuthServiceConfig,
            useFactory: provideConfig
        },
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
