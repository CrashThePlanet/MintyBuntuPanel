import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonComponent } from './layout/button/button.component';


@NgModule({
  declarations: [
    ButtonComponent],
  imports: [
    FontAwesomeModule,
    CommonModule
  ],
  exports: [
    ButtonComponent,
    CommonModule
  ]
})
export class SharedModule { }
