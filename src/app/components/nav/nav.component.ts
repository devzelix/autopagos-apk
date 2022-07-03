import { Component, OnInit } from '@angular/core';
import { TasaService } from '../../services/tasa.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public tasa: string = '';
  public tasaExiste: boolean = false

  constructor( private tasaService: TasaService ) { }

  ngOnInit(): void {
    this.tasaService.tasa.subscribe((res) => {
      this.tasaExiste = true;
      this.tasa = parseFloat(res).toFixed(2);
    })
  }

}
