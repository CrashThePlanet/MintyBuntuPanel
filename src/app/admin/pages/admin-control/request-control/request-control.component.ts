import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-request-control',
  templateUrl: './request-control.component.html',
  styleUrls: ['./request-control.component.css']
})
export class RequestControlComponent implements OnInit {
  // fontawsome icons
  faCheck = faCheck;
  faTimes = faTimes;
  // empty variable for the front end
  // used for the requests
  requests: any | undefined;
  noRequests = false;
  // variable toto show the input for the reason why
  // the request got declinded
  decline = false;
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
  ) { }
  // the form for the reason
  declineForm = new FormGroup({
    editor: new FormControl(null, [Validators.required])
  });
  // function to get all requests
  getRequests(): void {
    // call api
    this.httpService.Post('user/getrequests', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getRequests();
        // end function
        return;
      }
      // check if the access got denied
      if (responseData.status === 'accessDenied') {
        // open snackbar with error
        this.snackbar.open('Zugriff verweigert');
        // end function
        return;
      }
      // check if the reqests couldn´t be found
      if (responseData.status === 'couldntFindRequests') {
        // set variable to show the requests to true
        // so it won´t show the requests anymore
        this.noRequests = true;
        // open snackbar with error
        this.snackbar.open('Anträge konnten nicht gefunden werden.');
        // end function
        return;
      }
      // check if requests could be gotten
      if (responseData.status === 'gotRequests') {
        // put requests in variable
        this.requests = responseData.requests;
        console.log(this.requests[0].new.birthdate);
        // end function
        return;
      }
      // check if trhere are no requests
      if (responseData.status === 'noRequests') {
        // set variable to show the requests to true
        // so it won´t show the requests anymore
        this.noRequests = true;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to decline a request
  declineRequest(requestID: string): void {
    // check if the form is invalid
    if (this.declineForm.invalid) {
      // mark form as touched
      // so the error shows up
      this.declineForm.markAsTouched();
      // end function
      return;
    }
    // call api
    // send token, the id of the request and the message with it
    this.httpService.Post('user/delinerequest', {
      accessToken: sessionStorage.getItem('accessToken'),
      data: {
        // tslint:disable-next-line: object-literal-shorthand
        requestID: requestID,
        message: this.declineForm.controls.editor.value
      }
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.declineRequest(requestID);
        // end function
        return;
      }
      // check if the access got denied
      if (responseData.status === 'accessDenied') {
        // open snackbar with error
        this.snackbar.open('Zugriff verweigert');
        // end function
        return;
      }
      // check if the request couldn´t be found
      if (responseData.status === 'requestNotFound') {
        // open snackbar with error
        this.snackbar.open('Anfrage wurde nicht gefunden');
        // end function
        return;
      }
      // check if decline was successful
      if (responseData.status === 'requestDeclined') {
        // reload the requests
        this.getRequests();
        // open snackbar with feedback
        this.snackbar.open('Anfrage abgelehnt');
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to accapt a request
  acceptRequest(request: any): void {
    // call api
    // send the token and the ids of the reques an the user with it
    this.httpService.Post('user/accaptrquest', {
      accessToken: sessionStorage.getItem('accessToken'),
      data: {
        idE: request.old.idE,
        idA: request.old.idA,
        idR: request.new.idR
      }
    }
    ).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.acceptRequest(request);
        // end function
        return;
      }
      // check if the access got denied
      if (responseData.status === 'accessDenied') {
        // open snackbar with error
        this.snackbar.open('Zugriff verweigert');
        // end function
        return;
      }
      // check if the request wasn´t found
      if (responseData.status === 'requestNotFound') {
        // open snackbar with error
        this.snackbar.open('Anfrage nicht gefunden');
        // end function
        return;
      }
      // check if the user wasn´t found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if the action was successful
      if (responseData.status === 'accaptSuccess') {
        // reload requests
        this.getRequests();
        // open snackbar with feedback
        this.snackbar.open('Anfrage erfolgrech akzeptiert');
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  ngOnInit(): void {
    // get all requests
    this.getRequests();

  }
}
