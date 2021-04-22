import { Component, OnInit } from '@angular/core';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-user-control',
  templateUrl: './user-control.component.html',
  styleUrls: ['./user-control.component.css']
})
export class UserControlComponent implements OnInit {
  // define empty arrays for the cards
  notActivated = new Array;
  activated = new Array;
  deactivated = new Array;
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
  ) { }
  // function to get all users depending on their status
  getUsers(): void {
    // call api
    this.httpService.Post('user/getstatus', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getUsers();
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
      // check if there were no users found (error)
      if (responseData.status === 'usersNotFound') {
        // open snackbar with error
        this.snackbar.open('Es konnten leider keine Nutzer gefunden werden');
        // end function
        return;
      }
      // check if the users were gooten
      if (responseData.status === 'gotUsers') {
        // assign the users with the different status to the empty array
        this.notActivated = responseData.user.notActivated;
        this.activated = responseData.user.activated;
        this.deactivated = responseData.user.deactivated;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to activate an user
  activate(id: string): void {
    // call application
    // send id of the target user
    this.httpService.Post('user/activate', {
      accessToken: sessionStorage.getItem('accessToken'),
      id: id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.activate(id);
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
      // check if the target user was not found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if the activation was successful
      if (responseData.status === 'activateSuccessful') {
        // open snackbar with feedback
        this.snackbar.open('Status erfolgreich geändert');
        // reload all users
        this.getUsers();
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to deactivate a user
  deactivate(id: string): void {
    // call api
    // send id of the target user with it
    this.httpService.Post('user/deactivate', {
      accessToken: sessionStorage.getItem('accessToken'),
      id: id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.deactivate(id);
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
      // check if the target user was not found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if the deactivation was successful
      if (responseData.status === 'deactivateSuccessful') {
        // open snackbar with feedback
        this.snackbar.open('Status erfolgreich geändert');
        // reload all users
        this.getUsers();
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to upgrade a user to an admin
  toAdmin(id: string): void {
    // call api
    // send id of the target user
    this.httpService.Post('user/toadmin', {
      accessToken: sessionStorage.getItem('accessToken'),
      id: id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.toAdmin(id);
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
      // check if the target user was not found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if the upgrade was successfull
      if (responseData.status === 'upgradeSuccessful') {
        // open snackbar with feedback
        this.snackbar.open('Admin erfolgreich hinzugefügt');
        // reload all users
        this.getUsers();
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  ngOnInit(): void {
    // get users
    this.getUsers();
  }
}
