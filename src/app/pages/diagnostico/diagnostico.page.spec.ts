import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagnosticoPage } from './diagnostico.page';

describe('DiagnosticoPage', () => {
  let component: DiagnosticoPage;
  let fixture: ComponentFixture<DiagnosticoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
