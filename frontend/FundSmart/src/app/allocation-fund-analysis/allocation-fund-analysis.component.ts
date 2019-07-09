import { Component, OnInit } from '@angular/core';
import { IntercomponentCommunicationService } from '../intercomponent-communication.service';

@Component({
  selector: 'app-allocation-fund-analysis',
  templateUrl: './allocation-fund-analysis.component.html',
  styleUrls: ['./allocation-fund-analysis.component.css']
})
export class AllocationFundAnalysisComponent implements OnInit {

  constructor(private interconn: IntercomponentCommunicationService) { }

  ngOnInit() {
    this.interconn.titleSettermethod('Allocation & Fund Analysis');
  }

}
