import { DeleteComponent } from './../delete/delete.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faCheck, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';
import { UpdateComponent } from '../update/update.component';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  // declare all input
  @Input()
  shortDesc: string | undefined;
  @Input()
  description: string | undefined;
  @Input()
  priority: string | undefined;
  @Input()
  status: string | undefined;
  @Input()
  creationDate: string | undefined;
  @Input()
  deliveryDate: string | undefined;
  @Input()
  client: string | undefined;
  @Input()
  id: string | undefined;
  @Input()
  editor: string | undefined;
  @Input()
  editorName: string | undefined;
  // output to reload the tasks
  @Output()
  refresh = new EventEmitter();
  // font awsome icons
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;

  constructor(
    private tokenService: TokenService,
    private httpService: HttpService,
    private snackbar: SnackBarService,
    private dialog: MatDialog
  ) { }
  // function to delete a task
  deleteTask(): void {
    // call api
    this.httpService.Post('task/delete', { accessToken: sessionStorage.getItem('accessToken'), id: this.id }).subscribe(responseData => {
      // check if there is an error with the token
      if (responseData.status === 'tokenError') {
        // validate (and possible refresh) the token
        this.tokenService.validateToken();
        // call the same function
        this.deleteTask();
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
      // check if the task could be deleted
      if (responseData.status === 'taskDeleted') {
        // open snackbar with feedback
        this.snackbar.open('Aufgabe wurde erfolgreich gelöscht');
        // emit to refresh tasks
        this.refresh.emit();
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal erneut.');
    });
  }
  // function to open the dialog + listen to close event
  openDelete(): void {
    // open the dialog with the status component as content
    // send the short description (headline) with it
    const dialogRef = this.dialog.open(DeleteComponent, { data: { shortDesc: this.shortDesc } });
    // listen to the close event
    dialogRef.afterClosed().subscribe(decision => {
      // if the user wants to deliver the task
      if (decision === 'true') {
        // call function
        this.deleteTask();
      }
    });
  }
  // function to open the edit window
  openEdit(): void {
    // open window
    const dialogRef = this.dialog.open(UpdateComponent, { width: '600px', data: { id: this.id } });
    // listen to close event
    dialogRef.afterClosed().subscribe(() => {
      // emit to refresh tasks
      this.refresh.emit();
    });
  }
  ngOnInit(): void {
    // check if the deliveryDate is null
    if (this.deliveryDate === null) {
      // set an other value for it
      this.deliveryDate = 'unbestimmt';
    }
  }
}
