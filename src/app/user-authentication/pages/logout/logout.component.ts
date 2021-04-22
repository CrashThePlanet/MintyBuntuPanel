import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private cookieService: CookieService, private router: Router) { }

  ngOnInit(): void {
    sessionStorage.clear();
    this.cookieService.deleteAll();
    this.router.navigate(['/login']);
  }

}
