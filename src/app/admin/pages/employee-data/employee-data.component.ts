import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { HttpService, SnackBarService, TokenService } from 'src/app/core';

@Component({
  selector: 'app-employee-data',
  templateUrl: './employee-data.component.html',
  styleUrls: ['./employee-data.component.css']
})
export class EmployeeDataComponent implements OnInit {
  // define empty array for the cards
  users = new Array;
  // font awsome icons
  faEllipsisV = faEllipsisV;
  constructor(
    private httpService: HttpService,
    private snackbar: SnackBarService,
    private tokenService: TokenService
  ) { }
  // get all employees
  getUsers(): void {
    // call api
    this.httpService.Post('user/getall', { accessToken: sessionStorage.getItem('accessToken') }).subscribe(responseData => {
      // check if there is an error with the token
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
      // check if everything went fine
      if (responseData.status === 'gotUsers') {
        // put the users from the api into the empty array
        this.users = responseData.users;
        // end function
        return;
      }
      // open snackbar with error
      this.snackbar.open('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.');
    });
  }

  // function to sort the employees by the first "letter" of the lastname
  async sort(letter: string): Promise<void> {
    // get all emplyees (reset possible filter)
    await this.getUsers();
    // wait 20 ms
    setTimeout(() => {
      // define empty, temorary array
      const tempUsersArray = new Array;
      // loop through the employees
      this.users.forEach((user) => {
        // check if the first letter of the lastname is the same as
        // as the filter letter
        // its lower case
        if (user.surname[0].toLowerCase() === letter) {
          // put the user in the temp array
          tempUsersArray.push(user);
        }
      });
      // put the temp array in the global array
      this.users = tempUsersArray;
    }, 20);
  }
  ngOnInit(): void {
    // get all employees
    this.getUsers();
  }

}
