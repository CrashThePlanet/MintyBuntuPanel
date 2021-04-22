import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

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
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
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
export class UpdateComponent implements OnInit {
  // define empty array for the task
  task = {
    editor: '',
    client: '',
    creationDate: '',
    editorName: ''
  };
  constructor(
    // define input for the id of the task
    @Inject(MAT_DIALOG_DATA) public id: any,
    private snackbar: SnackBarService,
    private httpService: HttpService,
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<UpdateComponent>
  ) { }
  // form
  updateForm = new FormGroup({
    shortDesc: new FormControl(null, [Validators.required]),
    editor: new FormControl(null, [Validators.required]),
    deliveryDate: new FormControl(null),
    priority: new FormControl(null, [Validators.required]),
    status: new FormControl(null, [Validators.required])
  });
  // function to get the data of the task
  getData(): void {
    // call api
    this.httpService.Post('task/getone', { accessToken: sessionStorage.getItem('accessToken'), id: this.id.id }).subscribe(responseData => {
      // check if there is an error with the token
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getData();
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
      if (responseData.status === 'notTaskFound') {
        // open snackbar with error
        this.snackbar.open('Aufgabe nicht gefunden.');
        // end function
        return;
      }
      // check if the data could be gotten
      if (responseData.status === 'gotData') {
        // put the data in the array
        this.task = responseData.task;
        // put the data in the form
        this.updateForm.controls.shortDesc.setValue(responseData.task.shortDesc);
        this.updateForm.controls.editor.setValue(responseData.task.description);
        this.updateForm.controls.deliveryDate.setValue(responseData.task.deliveryDate);
        this.updateForm.controls.priority.setValue(responseData.task.priority);
        this.updateForm.controls.status.setValue(responseData.task.status);
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal erneut.');
    });
  }
  // function to update the task
  update(): void {
    // check if the form is invalid
    if (this.updateForm.invalid) {
      // open snackbar with error
      this.snackbar.open('Bitte fülle alle benötigeten Felder aus.');
      // end function
      return;
    }
    // check if the form wasn´t touched
    if (!this.updateForm.dirty) {
      // open snackbar with error
      this.snackbar.open('Du musst Daten ändern um eine Aufgabe zu ändern');
      // end function
      return;
    }
    // call api with token, id and the form data
    this.httpService.Post('task/update', {
      accessToken: sessionStorage.getItem('accessToken'),
      data: {
        id: this.id.id,
        shortDesc: this.updateForm.controls.shortDesc.value,
        description: this.updateForm.controls.editor.value,
        deliveryDate: this.updateForm.controls.deliveryDate.value,
        priority: this.updateForm.controls.priority.value,
        status: this.updateForm.controls.status.value,
      }
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.update();
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
      // chack if the data couldn´t be found
      if (responseData.status === 'taskNotFound') {
        // open snackbar with error
        this.snackbar.open('Aufgabe wurde nich gefunden');
        // end function
        return;
      }
      // check if the task could be updated
      if (responseData.status === 'updateSuccess') {
        // close dialog windows
        this.dialogRef.close();
        // open snackbar with feedback
        this.snackbar.open('Aufgabe erfolgreich geändert');
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal erneut.');
    });
  }
  ngOnInit(): void {
    // get the data of the task
    this.getData();
  }

}
