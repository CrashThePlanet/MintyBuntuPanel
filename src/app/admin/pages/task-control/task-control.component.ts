import { Component, OnInit } from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-task-control',
  templateUrl: './task-control.component.html',
  styleUrls: ['./task-control.component.css']
})
export class TaskControlComponent implements OnInit {
  faEllipsisV = faEllipsisV;
  // declare array for the tasks
  tasks = new Array;
  editors = new Array;
  groups = new Array;
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
  ) { }
  // function to get all tasks for this user
  getTasks(): void {
    // call api
    this.httpService.Post('task/getall', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check fi there is an error with the token
      if (responseData.status === 'tokenError') {
        // validate / refresh / delete the token
        this.tokenService.validateToken();
        // call his self
        this.getTasks();
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
      // check if the tasks couldn´t be found
      if (responseData.status === 'couldNotFindTask') {
        // open snackbar with error
        this.snackbar.open('Aufgaben nicht gefunden');
        // end function
        return;
      }
      // check if the action was successful
      if (responseData.status === 'gotTasks') {
        // put the tasks in the array
        this.tasks = responseData.tasks;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler is aufgetreten. Versuche es später noch einmal erneut.');
    });
  }
  // function to get all editors for the filter
  getEditors(): void {
    // call api
    this.httpService.Post('task/editors', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check fi there is an error with the token
      if (responseData.status === 'tokenError') {
        // validate / refresh / delete the token
        this.tokenService.validateToken();
        // call the same function
        this.getEditors();
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
      // check if the api couldn´t find tasks
      if (responseData.status === 'couldntFindUsers') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if the api could find the users (editors)
      if (responseData.status === 'gotUsers') {
        // put the users in the array
        this.editors = responseData.user;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to get all groups to filter by them
  getGroups(): void {
    // call api
    this.httpService.Post('group/get', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getGroups();
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
      // check if no groups where found (due to an error or so)
      if (responseData.status === 'noGroupsFound') {
        // open snackbar with error
        this.snackbar.open('Gruppe(n) nich gefunden');
        // end function
        return;
      }
      // check if the groups were gotten
      if (responseData.status === 'gotGroups') {
        // put the groups in the array
        this.groups = responseData.groups;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    })
  }
  // function to filter the task by the editor
  filter(editor: any): void {
    // call api
    // send token and the editor to filter with it
    this.httpService.Post('task/filter', {
      accessToken: sessionStorage.getItem('accessToken'),
      editor: editor.id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.filter(editor);
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
      // check if the api wasn´t able to find the tasks
      if (responseData.status === 'couldntFindTasks') {
        // open snackbar with error
        this.snackbar.open('Keine Aufgaben gefunden');
        // end function
        return;
      }
      // check if the api coul find the tasks
      if (responseData.status === 'gotFilteredTasks') {
        // put the tasks in the array
        this.tasks = responseData.tasks;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }

  ngOnInit(): void {
    // get all tasks
    this.getTasks();
    // get all editors for the filter
    this.getEditors();
    // get all groups
    this.getGroups();
  }
}
