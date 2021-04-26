import { HttpService } from './core/services/http.service';
import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { LoaderService, TokenService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'MintyBuntu ManagmentPanel';
  constructor(
    private router: Router,
    private tokenService: TokenService,
    public loaderService: LoaderService
  ) {
    // check if route (url) changes
    this.router.events.subscribe((event: Event) => {
      // if the route is not one of these urls
      if (this.router.url !== '/registrate' &&
        this.router.url !== '/legal/licenses' &&
        this.router.url !== '/legal/notice' &&
        this.router.url !== '/login'
      ) {
        // wait for end of route change
        if (event instanceof NavigationEnd) {
          // validate token
          // this.tokenService.validateToken();
        }
      }
    });
  }
}
