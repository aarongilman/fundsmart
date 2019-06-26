import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';

@Component({
  selector: 'app-holding-details',
  templateUrl: './holding-details.component.html',
  styleUrls: ['./holding-details.component.css']
})
export class HoldingDetailsComponent implements OnInit {

  constructor(private userservice: ServercommunicationService) { }

  ngOnInit() {
    this.userservice.getHoldingDetails().subscribe(data => {
      console.log(data);
    });

  }

}
