import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestControlComponent } from './request-control.component';

describe('RequestControlComponent', () => {
  let component: RequestControlComponent;
  let fixture: ComponentFixture<RequestControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
