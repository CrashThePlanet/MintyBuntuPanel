import { SnackBarService } from './../../../core/services/snack-bar.service';
import { HttpService } from './../../../core/services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  // fontawsome icons
  faUserPlus = faUserPlus;
  // standard error for all inputs
  fornameError = 'Bitte gib deinen Vorname ein!';
  surnameError = 'Bitte gib deinen Nachname an!';
  nicknameError = 'Bitte gib einen Nickname ein';
  emailError = 'Bitte gib eine gültige @mintybuntu.com Email ein!';
  pwError = 'Bitte gib ein Passwort ein, welches den Vorgaben entspricht!';
  pwRepeatError = 'Bitte wiederhole dein Passwort!';
  // tooltip (requirements) for the password
  pwRequirements = 'Goßbruchstaben, Kleinbuchstaben, Zahlen, mindestens 8 Zeichen';
  // empty "master" error
  error = '';
  // and the var to show the error
  pwrError = false;

  // the form with validators
  registrationForm = new FormGroup({
    forname: new FormControl(null, [Validators.required]),
    surname: new FormControl(null, [Validators.required]),
    nickname: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [
      Validators.required,
      // must be an @mintybuntu.com email
      Validators.pattern('^[a-zA-Z]+\.[a-zA-Z]+@mintybuntu\.com$')]),
    pw: new FormControl(null, [
      Validators.required,
      // must have lower and uppercase letter and numbers and at least 8 chars
      Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')
    ]),
    pwRepeat: new FormControl(null, [Validators.required])
  });
  constructor(private httpService: HttpService, private snackBarServ: SnackBarService) { }
  // check if an input is valid (used to show errors)
  checkValid(input: string): boolean {
    // check if input has been touched and if its invalid
    if (this.registrationForm.controls[input].invalid &&
      this.registrationForm.controls[input].touched) {
      // if return true
      return true;
    }
    // if not, return false
    return false;
  }
  // function to check if an step is valid
  checkStepValid(stepper: MatStepper, input1: string, input2?: string): void {
    // check if the first input is invalid
    if (this.registrationForm.controls[input1].invalid) {
      // set it to uncompleted
      stepper.selected.completed = false;
      // end function
      return;
    }
    // check if there is an second input (in this step)
    if (input2 !== undefined) {
      // check if the second input is invalid
      if (this.registrationForm.controls[input2].invalid) {
        // if its invalid set it to uncompleted
        stepper.selected.completed = false;
        // end function
        return;
      }
      // set step to completed and go to the next step
      stepper.selected.completed = true;
      stepper.next();
      // end function
      return;
    }
    // if there is just one input
    // set step to completed und go to the next step
    stepper.selected.completed = true;
    stepper.next();
  }
  // function to registrate
  registrate(): void {
    // check if form (or better the inputs in it) are invalid
    if (this.registrationForm.invalid) {
      // set error
      this.error = 'Die Eingaben stimmen nicht mit den Bedinungen überein';
      // end function
      return;
    }
    // if, check if both passwords are not the same
    if (this.registrationForm.controls.pw.value !== this.registrationForm.controls.pwRepeat.value) {
      // set visuel error
      this.registrationForm.controls.pwRepeat.setErrors({ invalid: true });
      this.pwrError = true;
      this.pwRepeatError = 'Die Passwörter stimmen nicht überein!';
      // end function
      return;
    }
    // get all values from the form
    const requestData = {
      forname: this.registrationForm.controls.forname.value,
      surname: this.registrationForm.controls.surname.value,
      nickname: this.registrationForm.controls.nickname.value,
      email: this.registrationForm.controls.email.value,
      password: this.registrationForm.controls.pw.value
    };
    // call server to registrate
    this.httpService.Post('register', requestData).subscribe(data => {
      // check if user was created
      if (data.status === 'userCreated') {
        // set snackbar with info and reset the form
        this.snackBarServ.open('Account erstellt. Warte bitte auf aktivierung!');
        this.registrationForm.reset();
        return;
      }
      // set error
      this.snackBarServ.open('Account konnte nicht erstellt werden!');
      // end function
      return;
    });
  }
  ngOnInit(): void {
  }

}
