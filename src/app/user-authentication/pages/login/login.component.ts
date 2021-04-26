import { SnackBarService } from './../../../core/services/snack-bar.service';
import { HttpService } from './../../../core/services/http.service';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core';
import { relativeTimeRounding } from 'moment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  faUser = faUser;
  usernameError = '';
  showUE = false;
  pwError = '';
  showPE = false;

  constructor(
    private httpService: HttpService,
    private snackbar: SnackBarService,
    private cookieService: CookieService,
    private router: Router,
    private tokenService: TokenService
  ) { }
  // var wich stores choice if the user wants to be remembered
  rememberMe = false;
  // the form
  loginForm = new FormGroup({
    username: new FormControl(null,
      [Validators.required]
    ),
    password: new FormControl(null,
      [Validators.required]
    )
  });
  // invert the var
  // triggered by checkbox
  invertRemember(): void {
    this.rememberMe = !this.rememberMe;
  }
  // function to login
  login(): void {
    // check if the form (all data in it) is unvalid
    if (!this.loginForm.valid) {
      // set error as snackbar
      this.snackbar.open('Fülle bitte alle Felder aus!');
      // end function
      return;
    }
    // get data from form
    const requestData = {
      username: this.loginForm.controls.username.value,
      password: this.loginForm.controls.password.value
    };
    // call post function in service to post to server
    this.httpService.Post('login', requestData).subscribe(data => {
      // check if there was an server error
      if (data.status === 'somethingWiredOccured') {
        // set error as snackbar
        this.snackbar.open('Ein Fehler ist aufgetreten. Versuche es noch einmal!');
        // end function
        return;
      }
      // check if there was no user found
      if (data.status === 'noUserFound') {
        // set visual error
        this.usernameError = 'Nutzer nicht gefunden!';
        this.showUE = true;
        this.loginForm.controls.username.setErrors({ invalid: true });
        // end function
        return;
      }
      // check if password was incorrect
      if (data.status === 'wrongPassword') {
        // set visual error
        this.pwError = 'Falsches Passwort!';
        this.showPE = true;
        this.loginForm.controls.password.setErrors({ invalid: true });
        // end function
        return;
      }
      // check if account is inactive
      if (data.status === 'notActivated') {
        // set error as snackbar
        this.snackbar.open('Dein Account ist derzeit deaktiviert!');
        // end function
        return;
      }
      // set the two tokens (for authentication)
      // and the adminLevel (for access) as session
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('refreshToken', data.refreshToken);
      sessionStorage.setItem('adminLevel', data.adminLevel);
      // check if the user wants to be remembered
      if (this.rememberMe) {
        // if, set the two tokens as cookie
        this.cookieService.set('accessToken', data.accessToken, 56);
        this.cookieService.set('refreshToken', data.refreshToken, 56);
        this.cookieService.set('adminLevel', data.adminLevel, 56);
      }
      // send the user to the "home" page
      this.router.navigate(['/user/home']);
    });
  }
  // checking for existing session
  // or if the user wanted to be remembered (cookies)
  ngOnInit(): void {
    // check if there are both tokens as session
    if (sessionStorage.getItem('accessToken') !== null &&
      sessionStorage.getItem('refreshToken') !== null) {
      // validate those tokens
      if (this.tokenService.validateToken()) {
        // if there are valid, send to "home" page
        this.router.navigate(['/user/home']);
      }
      // end  function
      return;
    }
    // check if there are both tokens as cookie
    if (this.cookieService.get('accessToken') !== '' &&
      this.cookieService.get('refreshToken') !== '') {
        // call api to validate token
        this.httpService.Post('tokenControl/validateToken', {
          accessToken: this.cookieService.get('accessToken')
        }).subscribe(async responseData => {
          // check if the token is valid (or just expired)
          if (responseData.status === 'tokenExpired' || responseData.status === 'tokenValid') {
            // set the tokens and the adminLevel as session
            sessionStorage.setItem('accessToken', this.cookieService.get('accessToken'));
            sessionStorage.setItem('refreshToken', this.cookieService.get('refreshToken'));
            sessionStorage.setItem('adminLevel', this.cookieService.get('adminLevel'));
            // refresh the access token
            await this.tokenService.refreshToken();
            // send user to home page
            this.router.navigate(['/user/home']);
          }
        });
    }
  }
}
