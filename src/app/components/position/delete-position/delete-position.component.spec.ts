import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePositionComponent } from './delete-position.component';

describe('DeletePositionComponent', () => {
  let component: DeletePositionComponent;
  let fixture: ComponentFixture<DeletePositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePositionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeletePositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
