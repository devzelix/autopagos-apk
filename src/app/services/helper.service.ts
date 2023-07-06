import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  public dniToReload: string | number = '';
  public view:boolean=false;

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe((parameter: any) => {
      const { app } = parameter;
      if (app !== undefined && app !== null) this.view = !this.view;
    })
  }


}
