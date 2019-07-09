import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';

@Component({
  selector: 'app-allocation-recommendation',
  templateUrl: './allocation-recommendation.component.html',
  styleUrls: ['./allocation-recommendation.component.css']
})
export class AllocationRecommendationComponent implements OnInit {

  constructor(private interconn:IntercomponentCommunicationService) { }

  ngOnInit() {
    this.interconn.titleSettermethod('Allocation Recomendation');
  }

}
