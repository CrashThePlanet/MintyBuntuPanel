import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css']
})
export class NoticeComponent implements OnInit {
  faArrowLeft = faArrowLeft;

  constructor(private location: Location) { }
  back(): void {
    this.location.back();
  }
  ngOnInit(): void {
  }

}
