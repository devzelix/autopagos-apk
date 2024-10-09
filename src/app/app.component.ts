import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from './services/helper.service';
// import function to register Swiper custom elements
//import { register } from 'swiper/element/bundle';
// register Swiper custom elements
//register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    console.log('onRightClick')
    event.preventDefault();
  }

  public showScrollArrow: boolean = false;

  constructor(public helper: HelperService) { }

  public handleShowScrollArrow = (event: Event) => {
    this.showScrollArrow = ((event.target as HTMLDivElement).scrollTop > 0)
  }



  public scrollToTop = () => {
    const scrollElement: HTMLElement | null = document.getElementById('content-scrollable')
    scrollElement?.scrollTo({top: 0, behavior: 'smooth'});
  }

}
