import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
// used the work whith normal Jquery (and bottstrap)
declare let $: any;
// import things from "momentJS" to set a custom date formate for the Datepicker
// go to the Angular Material page to see the code
// format: DD.MM.YYYY => exapmle: 03.06.2021
import * as _moment from 'moment';
const moment = _moment;
export const MY_FORMATS: any = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css'],
  // code for momentjs
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CreateTaskComponent implements OnInit {
  editors = new Array;
  groups = new Array;
  faSave = faSave;
  // define style for the quill editor
  editorStyles = {
    height: '200px',
  };

  constructor(
    private snackbar: SnackBarService,
    private httpService: HttpService,
    private tokenService: TokenService,
  ) { }

  createTaskForm = new FormGroup({
    shortDesc: new FormControl(null, [Validators.required]),
    editor: new FormControl(null, [Validators.required]),
    priority: new FormControl(null, [Validators.required]),
    editor2: new FormControl(null, [Validators.required]),
    deliveryDate: new FormControl(null)
  });
  // function to get all activated users
  getUsers(): void {
    // call api
    this.httpService.Post('task/editors', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if there is an erre with the token
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getUsers();
        // end function
        return;
      }
      // check if there where no users
      if (responseData.status === 'couldNotFindUsers') {
        // open snackbar with error
        this.snackbar.open('Keine Nutzer gefunden');
        // end function
        return;
      }
      if (responseData.status === 'accessDenied') {
        this.snackbar.open('Zugriff verweigert');
        return;
      }
      // check if users could be found
      if (responseData.status === 'gotUsers') {
        // put all users in an array
        this.editors = responseData.user;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten');
    });
  }
  // function to get all groups
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
      // check if there qere no groups userNotFound
      if (responseData.status === 'noGroupsFound') {
        // open snackbar with error
        this.snackbar.open('Keine Gruppen gefunden');
        // end function
        return;
      }
      // the groups were gotten
      if (responseData.status === 'gotGroups') {
        // put the groups in the empty array
        this.groups = responseData.groups;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to create the task
  createTask(): void {
    // check if the form is invalid
    if (this.createTaskForm.invalid) {
      // open snackbar with error
      this.snackbar.open('Bitte fülle alle benötigeten Felder aus');
      // end function
      return;
    }
    // call api
    this.httpService.Post('task/create', {
      accessToken: sessionStorage.getItem('accessToken'),
      data: this.createTaskForm.value
    }).subscribe(responseData => {
      // check if there is an error with the token
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.createTask();
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
      // check if the task could be created
      if (responseData.status === 'taskCreated') {
        // open snackbar with feedback
        this.snackbar.open('Aufgabe wurde erstellt!');
        // clear the form
        this.createTaskForm.reset();
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal erneut.');
    });
  }

  ngOnInit(): void {
    // get all possible users
    this.getUsers();
    // get all possible groups
    this.getGroups();
  }
}
