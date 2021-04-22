import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  // define the default action to show in the
  // headline of the dialog
  action = 'erstellen';
  // these three array are needed for the chip select
  // for the member of a group
  // define the array where ALL users will be stored
  allUser = new Array;
  // define empty array where the selected users will be stored
  user = new Array;
  // define empty array where the unused user will be stored
  unusedUser = new Array;
  // define the keys to sperate the chips
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbar: SnackBarService,
    private tokenService: TokenService,
    private httpService: HttpService,
    public dialogRef: MatDialogRef<GroupComponent>
  ) {
  }
  // the form
  groupForm = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    editor: new FormControl(null, [Validators.required]),
    workspace: new FormControl(null, [Validators.required]),
    userSelect: new FormControl(null)
  });
  // funktion to get the possible users
  getUsers(filter: boolean = false): any {
    // call api
    this.httpService.Post('group/getuser', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
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
      // check if the users couln´t be found
      if (responseData.status === 'couldntFindUsers') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden');
        // end function
        return;
      }
      // check if the users were gotten
      if (responseData.status === 'gotUsers') {
        // put the users in the two arrays
        this.allUser = responseData.users;
        this.unusedUser = responseData.users;
        // check if there unused user should be filtered
        // this is used if the user wants to edit a group
        // so all user wich are in the group will be deleted from
        // the unused user array
        if (filter) {
          // lopp through the user (wich are in the group)
          this.user.forEach((user) => {
            // check if this user is in the array of the
            // unused user
            if (this.unusedUser.includes(user)) {
              // get the index of this user
              const index = this.unusedUser.indexOf(user);
              // if there is an index
              if (index >= 0) {
                // remove the user from the array
                this.unusedUser.splice(index, 1);
              }
            }
          });
        }
        // end  function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to remove a user wich is selected
  remove(user: string): void {
    // get the index of the user
    const index = this.user.indexOf(user);
    // if there is an index
    if (index >= 0) {
      // remove the user from the array of the selected user
      this.user.splice(index, 1);
      // put the user in the array of the unused user
      this.unusedUser.push(user);
    }
  }
  // function to select a user
  selected(event: MatAutocompleteSelectedEvent): void {
    // get the index of the user
    const index = this.unusedUser.indexOf(event.option.viewValue);
    // if there is an index
    if (index >= 0) {
      // remove the user from the array of the unused user
      this.unusedUser.splice(index, 1);
      // put the user in the array of the selected user
      this.user.push(event.option.viewValue);
    }
  }
  // function to save a group
  // both, new and existing groups
  save(): void {
    // check if the form is invalid
    if (this.groupForm.invalid) {
      // open snackbar with error
      this.snackbar.open('Bitte fülle alle Felder aus');
      // end function
      return;
    }
    // check if there is less then on user selected
    if (this.user.length <= 0) {
      // open snackbar with error
      this.snackbar.open('Wähle mindestens ein Mitglied aus');
      // end function
      return;
    }
    // lopp through the selected user
    this.user.forEach((user) => {
      // check if the user id not in the list of the available
      // or if every possible user got selected, check if the both array are unequel
      if (!this.allUser.includes(user) || this.user !== this.allUser) {
        // open snackbar with error
        this.snackbar.open('Deine Auswahl an Mitgliedern ist nicht gültig.');
        // end function
        return;
      }
    });
    // check if this is an edit of a group
    if (this.data.edit) {
      // call api to update a group
      this.httpService.Post('group/update', {
        // send the token
        accessToken: sessionStorage.getItem('accessToken'),
        // send the data of the group
        data: {
          id: this.data.id,
          name: this.groupForm.controls.name.value,
          description: this.groupForm.controls.editor.value,
          workspace: this.groupForm.controls.workspace.value,
          member: this.user
        }
      }).subscribe(responseData => {
        // check if the token is invalid
        if (responseData.status === 'tokenError') {
          // validate (and possible refresh) the token
          this.tokenService.validateToken();
          // call the same function
          this.save();
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
        // check if (atleast) one user could not be removed (if he is supposed to be)
        if (responseData.status === 'memberNotFound') {
          // open snackbar with error
          this.snackbar.open('Nutzer konnte nicht enfernt werden. Gruppe wurde nicht geändert');
          // end function
          return;
        }
        // check if (atleast) one user coul not be added (if he is supposed to be)
        if (responseData.status === 'userNotAssigned') {
          // open snackbar with error
          this.snackbar.open('Nutzer konnte nicht hinzugefügt werden. Greuppe wurde nicht geändert');
          // end function
          return;
        }
        // check if the group was not found
        if (responseData.status === 'groupNotFound') {
          // open snackbar with error
          this.snackbar.open('Gruppe nicht gefunden');
          // end function
          return;
        }
        // check if the group was updated
        if (responseData.status === 'groupUpdated') {
          // close the dialog an emit an refresh of the groups
          this.dialogRef.close('refresh');
          // open snackbar with feedback
          this.snackbar.open('Änderungen gespeichert');
          // end function
          return;
        }
        // open snackbar with error
        this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
      });
      return;
    }
    // if this is the creation of a new group
    // call api to create the group
    this.httpService.Post('group/create', {
      // send token
      accessToken: sessionStorage.getItem('accessToken'),
      // send the data
      group: {
        name: this.groupForm.controls.name.value,
        description: this.groupForm.controls.editor.value,
        workspace: this.groupForm.controls.workspace.value,
        member: this.user
      }
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.save();
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
      // check if (atleast) one user was not added
      if (responseData.status === 'userNotAssigned') {
        // open snackbar with error / error-ish feedback
        this.snackbar.open('Gruppe erstellt. Mindestens ein Nutzer wurde nicht richtig hinzugefügt');
        // close the dialog and emit an refresh of the groups
        this.dialogRef.close('refresh');
        // end function
        return;
      }
      // check if the group could not be created
      if (responseData.status === 'failedToCreateGroup') {
        // open snackbar with error
        this.snackbar.open('Gruppe konnte nicht erstellt werden');
        // end function
        return;
      }
      // check if the group was created
      if (responseData.status === 'groupCreated') {
        // close the dialog and emit an refresh of the groups
        this.dialogRef.close('refresh');
        // open snackbar with feedback
        this.snackbar.open('Gruppe erstellt');
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  // function to get the data of a group
  getGroup(): void {
    // call api
    this.httpService.Post('group/getone', {
      // send token
      accessToken: sessionStorage.getItem('accessToken'),
      // send the id
      id: this.data.id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.getGroup();
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
      // check if the group was not found
      if (responseData.status === 'groupNotFound') {
        // open snackbar with error
        this.snackbar.open('Gruppe nicht gefunden');
        // end function
        return;
      }
      // check if the group was found
      if (responseData.status === 'gotGroup') {
        // put the data in the form
        this.groupForm.controls.name.setValue(responseData.group.name);
        this.groupForm.controls.editor.setValue(responseData.group.description);
        this.groupForm.controls.workspace.setValue(responseData.group.workspace);
        // put the user in the array of the selected user
        this.user = responseData.group.member;
        // get all users and filter the users
        // so the selected user will be removed from the unused user
        this.getUsers(true);
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  ngOnInit(): void {
    // check if this dialog was opened to edit
    if (this.data.edit) {
      // change the action
      this.action = 'bearbeiten';
      // get the group data
      this.getGroup();
      // end function
      return;
    }
    // get all users
    this.getUsers();
  }
}
