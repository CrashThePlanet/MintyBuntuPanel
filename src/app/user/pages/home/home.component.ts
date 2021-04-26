import { Component, OnInit } from '@angular/core';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // define var for the amount of new tasks since the last login
  newTasks = 0;
  // define array for the group names
  groups = new Array;
  // vars for the feedback of the requests
  requestFound = false;
  requestStatus: any;
  message: any;
  requestID: any;
  // varibale wichs store the update notes
  // has a default note / message
  updates = '<h1>Keine Updates</h1>';
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
  ) { }
  // functio nto get the amount of new tasks
  getNewtasksAmount(): void {
    // get all tasks
    this.httpService.Post('task/get', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getNewtasksAmount();
        // end function
        return;
      }
      // check if no tasks were found
      if (responseData.status === 'coulNotFindTask') {
        // open snackbar with error
        this.snackbar.open('Aufgaben nicht gefunden');
        // end function
        return;
      }
      // check if no users were found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if tasks for a group were not found
      if (responseData.status === 'groupTaskNotFound') {
        // open snackbar with error
        this.snackbar.open('Aufgaben einer Gruppe nicht gefunden');
        // end function
        return;
      }
      // check if tasks were found
      if (responseData.status === 'gotTasks') {
        // loop through the tasks
        responseData.tasks.forEach((task: any) => {
          // check if the creation date of the tasks were newer then the last login
          if (task.creationDate > responseData.lastLogin) {
            // increse the amount of new tasks by one
            this.newTasks++;
          }
        });
      }
    });
  }
  // function to get the names of the groups
  getGroups(): void {
    // call api
    this.httpService.Post('group/gerpersonal', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getGroups();
        // end function
        return;
      }
      // check if no user was found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nich gefunden');
        // end function
        return;
      }
      // check if the group was not found
      if (responseData.status === 'groupNotFound') {
        // open snackbar with error
        this.snackbar.open('Gruppe(n) nicht gefunden');
        // end function
        return;
      }
      // check if the group names were gotten
      if (responseData.status === 'gotGroups') {
        // open snackbar with error
        this.groups = responseData.groups;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to get (possible) reactions to change requests
  getRequestsReaction(): void {
    // call api
    this.httpService.Post('user/getrequestreactions', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getRequestsReaction();
        // end function
        return;
      }
      // check if there is no request
      if (responseData.status === 'noRequestFound') {
        // set status
        this.requestStatus = 'nothingFound';
        // end function
        return;
      }
      // check if there is an request but no reaction to it
      if (responseData.status === 'notReacted') {
        this.requestFound = true;
        // change status
        this.requestStatus = 'noReaction';
        // end function
        return;
      }
      // check if if the first request got declined
      if (responseData.status === 'declined') {
        this.requestFound = true;
        // set status
        this.requestStatus = 'declined';
        // set id for delete function
        this.requestID = responseData.id;
        // set message / reason for the user
        this.message = responseData.message;
        // end function
        return;
      }
      // check if the first request got accapted
      if (responseData.status === 'accapted') {
        this.requestFound = true;
        // set status
        this.requestStatus = 'accapted';
        // set the id for the delete function
        this.requestID = responseData.id;
        // end function
        return;
      }
      // check if the request was corrupted (wrong data)
      if (responseData.status === 'corruptedRequest') {
        this.requestFound = true;
        // set status
        this.requestStatus = 'corrupted';
        // set the id for the delete function
        this.requestID = responseData.id;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to delete a request
  delete(id: string): void {
    // call api
    // send token and the id of the request
    this.httpService.Post('user/deleterequest', {
      accessToken: sessionStorage.getItem('accessToken'),
      id: id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.delete(id);
        // end function
        return;
      }
      // check ifthe request was deleted
      if (responseData.status === 'requestDelete') {
        // open snackbar with feedback
        this.snackbar.open('Anfrage gelöscht');
        // reload the requests
        this.getRequestsReaction();
        // end function
        return;
      }
      // check if an error occured while deleting the request
      if (responseData.status === 'notDeleted') {
        // open snackbar with error
        this.snackbar.open('Anfrage konnte nicht gelöscht werden');
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to get update notes
  getUpdates(): void {
    // call api
    this.httpService.Post('home/updates', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getUpdates();
        // end function
        return;
      }
      // check if there were updates found
      if (responseData.status === 'updatesFound') {
        // set the update notes in the variable
        this.updates = responseData.updates;
      }
    });
  }
  ngOnInit(): void {
    // get all the data
    this.getNewtasksAmount();
    this.getGroups();
    this.getRequestsReaction();
    this.getUpdates();
  }

}
