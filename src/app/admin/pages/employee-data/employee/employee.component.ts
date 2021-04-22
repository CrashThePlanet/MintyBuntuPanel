import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  // define all inputs for the content
  @Input()
  username: string | undefined;
  @Input()
  forname: string | undefined;
  @Input()
  surname: string | undefined;
  @Input()
  nickname: string | undefined;
  @Input()
  birthdate: string | undefined;
  @Input()
  email: string | undefined;
  @Input()
  secondEmail: string | undefined;
  @Input()
  job: string | undefined;
  @Input()
  phone: string | undefined;
  @Input()
  postCode: string | undefined;
  @Input()
  place: string | undefined;
  @Input()
  houseNumber: string | undefined;
  @Input()
  createdAt: string | undefined;
  @Input()
  notes: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
