import { Component, OnInit } from '@angular/core';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  // declare array for the tasks
  tasks = new Array;
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
  ) { }
  // function to get all tasks for this user
  getTasks(): void {
    // call api
    this.httpService.Post('task/get', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check fi there is an error with the token
      if (responseData.status === 'tokenError') {
        // validate / refresh / delete the token
        this.tokenService.validateToken();
        // call his self
        this.getTasks();
        // end function
        return;
      }
      // check if tasks for a group couln´t be found
      if (responseData.status === 'groupTaskNotFound') {
        // open snackbar with error
        this.snackbar.open('Aufgabe(n) für Gruppe konnten nicht gefunden werden');
        // end function
        return;
      }
      // check if the user was not found
      if (responseData.status === 'userNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
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

  ngOnInit(): void {
    // get all tasks
    this.getTasks();
  }

}
