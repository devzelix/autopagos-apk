import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from './services/helper.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor( public helper:HelperService) {}
}
