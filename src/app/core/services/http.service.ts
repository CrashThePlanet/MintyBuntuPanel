import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SnackBarService } from './snack-bar.service';
import { Router } from '@angular/router';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
@Injectable()
export class HttpService {
  baseURL = 'http://localhost:1337/';
  header = { 'content-type': 'application/json' };
  constructor(
    private http: HttpClient,
    private snackbar: SnackBarService,
    private cookieService: CookieService,
    private router: Router,
    public loaderService: LoaderService
  ) { }
  // post function
  Post(route: string, data: any): Observable<any> {
    return this.http.post(this.baseURL + route, data, { headers: this.header });
  }
}
