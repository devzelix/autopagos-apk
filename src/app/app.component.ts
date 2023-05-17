import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { 

  public view:boolean=false;

  constructor( private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((parameter: any) => {
      const { app } = parameter;
      if (app !== undefined && app !== null) this.view = !this.view;
    })
  }
}
