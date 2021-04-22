import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // fontawsome icons
  faTimes = faTimes;
  faBars = faBars;
  // settings for the sidebar
  navMode = 'side';
  opened = true;
  manuellOpened = false;
  // var to store the value
  // if admin links should be shown
  admin = false;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private tokenService: TokenService,
  ) {
  }
  // listener for the screen width
  @HostListener('window:resize', ['$event'])
  isSmall(): boolean {
    // check if the sideNav didn´t got opened manuelly
    // i had to used this method
    // beacause the hostListener got also called when you invert
    // the opened state (see code below)
    if (!this.manuellOpened) {
      // if the screen is smaller then a certain value
      if (window.innerWidth <= 1200) {
        // change the mode of the sidebar
        this.navMode = 'over';
        this.opened = false;
        // end function and send true
        return true;
      }
      // if its bigger, set it back
      this.navMode = 'side';
      this.opened = true;
      // end function and send false
      return false;
    }
    // but if, check if the screen is small
    if (window.innerWidth <= 1200) {
      // if, return true
      return true;
    }
    // if not, return false
    return false;
  }
  // function to open or close the sidenav
  invertOpenState(): void {
    // set the var to true for the hostListerner
    this.manuellOpened = true;
    // change opened state
    this.opened = !this.opened;
  }
  // function to close the sidenav
  closeSideNav(): void {
    // onloy works if the small version of the
    // sidenav is used
    if (this.isSmall()) {
      // set the var to true for the hostListerner
      this.manuellOpened = false;
      // set opened state to false
      this.opened = false;
    }
  }
  ngOnInit(): void {
    // check if there are both tokens and the adminLevel in the session
    if (sessionStorage.getItem('accessToken') === null ||
      sessionStorage.getItem('refreshToken') === null ||
      sessionStorage.getItem('adminLevel') === null
    ) {
      // delete session if there is only one / two of the three
      sessionStorage.clear();
      // redirect ot login
      this.router.navigate(['/login']);
    }
    // check if the access token is valid
    this.tokenService.validateToken();
    // if the adminLevel is hight enough, set admin to true
    if (sessionStorage.getItem('adminLevel') === '3') {
      this.admin = true;
    }
    // check the screnn size an change settings
    this.isSmall();
  }

}
