import { DeleteGroupComponent } from './delete-group/delete-group.component';
import { GroupComponent } from './group/group.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-group-control',
  templateUrl: './group-control.component.html',
  styleUrls: ['./group-control.component.css']
})
export class GroupControlComponent implements OnInit {
  // fontawesome
  faPlus = faPlus;
  // define empty array for the groups for the html
  groups = new Array;
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private snackbar: SnackBarService,
    private dialog: MatDialog
  ) { }
  // function to open a dialog to create a new group
  openCreate(): void {
    // open dialog using the group comp
    const createDialog = this.dialog.open(GroupComponent, {
      // set width of the dialog
      width: '600px',
      // send data so the dialog knows what to do
      data: { edit: false }
    });
    // listen to close event
    createDialog.afterClosed().subscribe(action => {
      // check if the dialog emits to refresh
      if (action === 'refresh') {
        // get all groups
        this.getGroups();
        // end function
        return;
      }
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
      // check if there were no groups found
      if (responseData.status === 'noGroupsFound') {
        // open snackbar with error
        this.snackbar.open('Keine Gruppen gefunden');
        // end function
        return;
      }
      // check if the groups were gotten
      if (responseData.status === 'gotGroups') {
        // asignt the groups to the empty array
        this.groups = responseData.groups;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal')
    });
  }
  // function to open the dialog to edit a group
  edit(id: string): void {
    // open dialog using group comp
    const dialogRef = this.dialog.open(GroupComponent, {
      // set width of the dialog
      width: '600px',
      data: {
        // send edit: true so the dialog knows to edit a group
        // (and not create a new one)
        edit: true,
        // send the id of the group
        id: id
      }
    });
    // listen for close event of the dialog
    dialogRef.afterClosed().subscribe(action => {
      // check if the dialog emits to refresh
      if (action === 'refresh') {
        // get all groups
        this.getGroups();
        // end function
        return;
      }
    });
  }
  // function to open a dialog to delete a group
  // requires a group (name, id, ...)
  delete(group: any): void {
    // open dialog using the delete component
    const dialogRef = this.dialog.open(DeleteGroupComponent, {
      // send the name of the group with it
      data: { name: group.name }
    });
    // listen for close event of the dialog
    dialogRef.afterClosed().subscribe(result => {
      // if the user wants to delete the group
      if (result === 'true') {
        // call function to delete
        this.finalDelete(group.id);
      }
    });
  }
  // function to delete a group
  // requires the id of the group
  finalDelete(id: string): void {
    // call api
    this.httpService.Post('group/delete', {
      // send token
      accessToken: sessionStorage.getItem('accessToken'),
      // send if of the group
      id: id
    }).subscribe(responseData => {
      // check if the token is invalid
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        // using the same id
        this.finalDelete(id);
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
      // check if the group wasn´t found
      if (responseData.status === 'groupNotFound') {
        // open snackbar with error
        this.snackbar.open('Gruppe nicht gefunden');
        // end function
        return;
      }
      // check if (atleast) one of the members
      // wasn´t found
      if (responseData.status === 'memberNotFound') {
        // open snackbar with error
        this.snackbar.open('Nutzer nicht gefunden. Gruppe nicht gelöscht');
        // end function
        return;
      }
      // check if the group wasn´t found
      if (responseData.status === 'groupNotDeleted') {
        // open snackbar with error
        this.snackbar.open('Gruppe konnte nicht gelöscht werden');
        // end function
        return;
      }
      // check if the group was deleted
      if (responseData.status === 'groupDeleted') {
        // reload the groups
        this.getGroups();
        // open snackbar with feedback
        this.snackbar.open('Gruppe gelöscht');
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal');
    });
  }
  ngOnInit(): void {
    // get all groups
    this.getGroups();
  }
}
