import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';

@Component({
  selector: 'app-fund-recommendation',
  templateUrl: './fund-recommendation.component.html',
  styleUrls: ['./fund-recommendation.component.css']
})
export class FundRecommendationComponent implements OnInit {

  constructor(private interconn: IntercomponentCommunicationService) { }

  ngOnInit() {
    this.interconn.titleSettermethod('Fund Recommendation');
  }

}
