import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Location } from '@angular/common';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.css']
})
export class LicensesComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faExternalLink = faExternalLinkAlt;

  constructor(private location: Location) { }
  back(): void {
    this.location.back();
  }
  ngOnInit(): void {
  }

}
