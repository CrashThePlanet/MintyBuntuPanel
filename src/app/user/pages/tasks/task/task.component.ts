import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';
import { StatusComponent } from '../status/status.component';

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
  groupName?: string | undefined;
  // output to reload the tasks
  @Output()
  refresh = new EventEmitter();
  // font awsome icons
  faCheck = faCheck;

  constructor(
    private tokenService: TokenService,
    private httpService: HttpService,
    private snackbar: SnackBarService,
    private dialog: MatDialog
  ) { }
  // function to deliver a task
  deliverTask(): void {
    // call api
    // send access token and the id of the task
    this.httpService.Post('task/deliver', {
      accessToken: sessionStorage.getItem('accessToken'),
      id: this.id
    }).subscribe(responseData => {
      // check for an token error
      if (responseData.status === 'tokenError') {
        // validate token
        this.tokenService.validateToken();
        // call his self
        this.deliverTask();
        // end function
        return;
      }
      // check if task could be delivered
      if (responseData.status === 'delivered') {
        // open snackbar with feeback
        this.snackbar.open('Aufgabe abgeliefert.');
        // reload the tasks
        this.refresh.emit();
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal erneut.');
      // reload the tasks
      this.refresh.emit();
    });
  }
  // function to open the dialog + listen to close event
  openDeliver(): void {
    // open the dialog with the status component as content
    // send the short description (headline) with it
    const dialogRef = this.dialog.open(StatusComponent, {
      data: { shortDesc: this.shortDesc },
      panelClass: 'dialogClass'
    });
    // listen to the close event
    dialogRef.afterClosed().subscribe(decision => {
      // if the user wants to deliver the task
      if (decision === 'true') {
        // call function
        this.deliverTask();
      }
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
