import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HttpService } from './http.service';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  returnFeedback: any;
  constructor(
    private cookieService: CookieService,
    private httpService: HttpService,
    private snackbar: SnackBarService,
    private router: Router
  ) { }
  // function to delete all tokens
  handleInvalidToken(): void {
    console.log('got called');
    // delte in session
    sessionStorage.clear();
    // selete in cookie
    this.cookieService.deleteAll();
    // send back to login page
    this.router.navigate(['/login']);
  }
  // function to refresh access token
  // option parameter for other values (tokens from cookie as example)
  // "gotData?: any"
  async refreshToken(): Promise<any> {
    let _returnFeedback;
    // get expired access token and refresh token from session
    // call backend
    await this.httpService.Post('tokenControl/refreshToken', {
      expiredToken: sessionStorage.getItem('accessToken'),
      refreshToken: sessionStorage.getItem('refreshToken'),
    }).subscribe((responseData: any) => {
      // if one of the tokens (refreshToken or the expired access token)
      // is invalid
      if (responseData.status === 'invalidRefreshToken' ||
        responseData.status === 'invalidToken' ||
        responseData.status === 'unequelRefreshToken') {
        // delete all tokens
        this.handleInvalidToken();
        // return a false statemant
        _returnFeedback = false;
      } else if (responseData.status === 'newTokenCreated') {
        // if the new access token could be
        // created
        // set both tokens and adminlevel as sessions
        sessionStorage.setItem('accessToken', responseData.newAccessToken);
        sessionStorage.setItem('refreshToken', responseData.refreshToken);
        sessionStorage.setItem('adminLevel', responseData.adminLevel);
        // check if there is also a token in a cookie
        if (this.cookieService.get('accessToken') !== '') {
          // if, set the token also as the cookie
          this.cookieService.set('accessToken', responseData.newAccessToken);
        }
        // return true statement
        _returnFeedback = true;
      } else {
        // if there is any other error
        // as example a server error
        // clear all tokens an send user to login
        this.handleInvalidToken();
        // and also a visual feedback
        this.snackbar.open('Ein Fehler ist aufgetreten. Bitte melde dich erneut an!');
        // also return false
        _returnFeedback = false;
      }
    });
    return _returnFeedback;
  }
  // function validate the access token
  async validateToken(): Promise<any> {
    let _returnFeedback;
    // console.log(sessionStorage.getItem('accessToken'));
    // console.log('k');
    // call server
    // tslint:disable-next-line: semicolon
    await this.httpService.Post('tokenControl/validateToken', {
      accessToken: sessionStorage.getItem('accessToken')
    }).toPromise().then((responseData: any) => {
      // if token ist valid return true
      if (responseData.status === 'tokenValid') {
        _returnFeedback = true;
      } else if (responseData.status === 'tokenExpired') {
        // if token is expired, refresh token
        _returnFeedback = this.refreshToken();
      } else {
        // if the token is invalid
        // delete all tokens (session an cookie)
        // and redirect to login page
        this.handleInvalidToken();
        _returnFeedback = false;
      }
    });
    return _returnFeedback;
  }
}
