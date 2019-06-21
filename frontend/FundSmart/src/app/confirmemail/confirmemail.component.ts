import { Component, OnInit } from '@angular/core';
import { ServercommunicationService } from '../servercommunication.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-confirmemail',
  templateUrl: './confirmemail.component.html',
  styleUrls: ['./confirmemail.component.css']
})
export class ConfirmemailComponent implements OnInit {

  successmsg = '';
  constructor(private route: ActivatedRoute,private userservice: ServercommunicationService) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      // this.token = params['token'];
      this.userservice.confirm_email(params['token']).subscribe(
        data => {
          console.log(data);
        }
      );
      // console.log(params['uid']);
    });

  }

}
