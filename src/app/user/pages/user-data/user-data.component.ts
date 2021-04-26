import { Component, OnInit } from '@angular/core';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
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
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css'],
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
export class UserDataComponent implements OnInit {
  // fontawsome icons
  faPencilAlt = faPencilAlt;
  // store redirect value for chackbox
  redirect = false;
  // define style for the quill editor
  editorStyles = {
    height: '200px',
  };
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
  ) { }
  // the form
  userDataForm = new FormGroup({
    forname: new FormControl(null, [
      Validators.required,
    ]),
    surname: new FormControl(null, [
      Validators.required,
    ]),
    nickname: new FormControl(null, [
      Validators.required,
    ]),
    birthDate: new FormControl(null, [
      Validators.required,
    ]),
    postCode: new FormControl(null, [
      Validators.required,
    ]),
    place: new FormControl(null, [
      Validators.required,
    ]),
    houseNumber: new FormControl(null, [
      Validators.required,
    ]),
    phone: new FormControl(null, [
      Validators.required,
    ]),
    email: new FormControl(null, [
      Validators.required,
      Validators.email
    ]),
    editor: new FormControl(null)
  });
  // function to get the user data
  getData(): void {
    // make api call, send access token
    this.httpService.Post('user', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // if data could be gotten
      if (responseData.status === 'gotData') {
        // apply the data from the server to the input field
        this.userDataForm.controls.forname.setValue(responseData.content.forname);
        this.userDataForm.controls.surname.setValue(responseData.content.surname);
        this.userDataForm.controls.nickname.setValue(responseData.content.nickname);
        this.userDataForm.controls.birthDate.setValue(moment(responseData.content.birthDate, "DD.MM.YYYY"));
        this.userDataForm.controls.postCode.setValue(responseData.content.postCode);
        this.userDataForm.controls.place.setValue(responseData.content.place);
        this.userDataForm.controls.houseNumber.setValue(responseData.content.houseNumber);
        this.userDataForm.controls.phone.setValue(responseData.content.phone);
        this.userDataForm.controls.email.setValue(responseData.content.email);
        this.redirect = responseData.content.redirect;
        this.userDataForm.controls.editor.setValue(responseData.content.notes);
        // end function
        return;
      }
      if (responseData.status === 'tokenError') {
        // if there is an error with the token
        // validate it
        this.tokenService.validateToken();
        // if the code reaches this point there is
        // an new (valid) token
        // call his self to get data
        this.getData();
        // end function
        return;
      }
      if (responseData.status === 'noUser') {
        // if there is no user
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // if there is any other problem
      // open snackbar with error
      this.snackbar.open('Ein fehler ist aufgetreten');
    });
  }
  // function to get the avata image
  getAvatar(): void {
    // to do
  }
  // function to send a change request
  sendRequest(): void {
    // check if form is invalid
    if (this.userDataForm.invalid) {
      // open snackbar with error
      this.snackbar.open('Bitte fülle alle Felder aus!');
      // end function
      return;
    }
    // check if data in the form hasn´t been changed
    if (!this.userDataForm.dirty) {
      // if there are no changes, open snackbar with error
      this.snackbar.open('Du kannst nur eine Änderung einreichen, wenn du auch etwas geändert hast!');
      // end function
      return;
    }
    const date = this.userDataForm.controls.birthDate.value;
    const finalDate = _moment(date).format("DD.MM.YYYY");

    // put the data from the form in an array
    const requestData = {
      forname: this.userDataForm.controls.forname.value,
      surname: this.userDataForm.controls.surname.value,
      nickname: this.userDataForm.controls.nickname.value,
      birthDate: finalDate,
      postCode: this.userDataForm.controls.postCode.value,
      place: this.userDataForm.controls.place.value,
      houseNumber: this.userDataForm.controls.houseNumber.value,
      phone: this.userDataForm.controls.phone.value,
      secondEmail: this.userDataForm.controls.email.value,
      redirect: this.redirect,
      notes: this.userDataForm.controls.editor.value,
    };
    // call server, send also the access token with it
    this.httpService.Post('user/update', {
      accessToken: sessionStorage.getItem('accessToken'),
      newData: requestData
    }).subscribe(responseData => {
      // check for an error with the token
      if (responseData.status === 'tokenError') {
        // validate the token
        // the validate function hadle evry possible state
        this.tokenService.validateToken();
        // so if the code reaches this point
        // there is a new (valid) access token
        // recall his self
        this.sendRequest();
        // end function
        return;
      }
      // check if there is already a request
      if (responseData.status === 'alreadyRequested') {
        // if the user already sended a request today
        // open snackbar with error
        this.snackbar.open('Du kannst nur eine Anfrage pro Tag versenden!');
        // end function
        return;
      }
      // check if there is already a request in the queue
      if (responseData.status === 'requestInQueue') {
        // if there is a request in the database (wich waits to be accapted or cancelled)
        // open snackbar an set error
        this.snackbar.open('Es befindet sich bereits eine Anfrage in der Warteschlange!');
        // end function
        return;
      }
      // reload the data in the form
      this.getData();
      // open snackbar with feedback
      this.snackbar.open('Anfrage gesendet');
    });
  }
  ngOnInit(): void {
    // get all the data
    this.getData();
  }

}
