
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Position } from '../../../models/position.model';
import { EmployeeService } from '../../../services/employee.service';
import { PositionService } from '../../../services/position.service';
import { AddPositionComponent } from '../../position/add-position/add-position.component';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatCheckboxModule, MatExpansionModule, MatIconModule, MatDialogModule, MatButtonModule, MatSelectModule, ReactiveFormsModule, MatDatepickerModule, MatSlideToggleModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ]
})

export class AddEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  employees: Employee[] = [];
  positions: Position[] = [];
  newPositionName: string = "other";

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEmployeeComponent>,
    private _employeeService: EmployeeService,
    private _positionService: PositionService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPositions();
  }

  initializeForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[א-ת\u0590-\u05FEa-zA-Z]{2,}$/)]],
      surname: ['', [Validators.required, Validators.pattern(/^[א-ת\u0590-\u05FEa-zA-Z]{2,}$/)]],
      identityNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/), this.checkExistingEmployee()]],
      gender: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, this.ageValidator()]],
      beginningOfWork: ['', [Validators.required, this.beginningOfWorkValidator()]],
      positions: this.fb.array([], Validators.required)
    });
    this.addPositionControl();
  }

  addPositionControl(): void {
    this.positionsFormArray.push(this.fb.group({
      positionId: ['', Validators.required],
      isAdministrative: [false],
      entryDate: ['', [Validators.required, this.entryDateValidator()]]
    }));
  }

  loadPositions(): void {
    this._positionService.getAllPositions().subscribe(positions => {
      this.positions = positions;
    });
  }

  openOtherPositionDialog(index: number) {
    const dialogRef = this.dialog.open(AddPositionComponent, {
      width: '250px'
    });
    dialogRef.afterClosed().subscribe(newPositionName => {
      if (newPositionName) {
        const newPosition: Position = {
          id: 0,
          name: newPositionName
        };
        this._positionService.addPosition(newPosition).subscribe((res) => {
          this.loadPositions();
          const positionsFormArray = this.employeeForm.get('positions') as FormArray;
          positionsFormArray.at(index).patchValue({ positionId: res.id });
        });
      }
    });
  }

  removePositionControl(index: number): void {
    this.positionsFormArray.removeAt(index);
  }

  isPositionDisabled(positionId: number, index: number): boolean {
    const selectedPositions = this.employeeForm.value.positions.map((pos: any) => pos.positionId);
    return selectedPositions.includes(positionId) && selectedPositions.indexOf(positionId) !== index;
  }

  submit(): void {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      this._employeeService.addEmployee(formData).subscribe(() => {
        this.openSnackBar('Employee added successfully');
        this.dialogRef.close(true);
      }, error => {
        if (error.status === 400)
          this.openSnackBar(error.error.errors[0]);
      });
    } else {
      this.employeeForm.markAllAsTouched();
      this.openSnackBar('Form is not valid');
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  get positionsFormArray(): FormArray {
    return this.employeeForm.get('positions') as FormArray;
  }

  ageValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 ? null : { 'underage': true };
    };
  }

  beginningOfWorkValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const workDate = new Date(control.value);
      const birthDate = new Date(this.employeeForm?.get('dateOfBirth').value);
      return workDate >= birthDate ? null : { 'beginningOfWorkInvalid': true };
    };
  }

  entryDateValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const entryDate = new Date(control.value);
      const workDate = new Date(this.employeeForm?.get('beginningOfWork').value);
      if (entryDate < workDate) {
        return { 'entryDateBeforeWorkDate': true };
      }
      return null;
    };
  }

  checkExistingEmployee() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      this._employeeService.getAllEmployees().subscribe((res) => {
        this.employees = res;
      })
      return this.employees.find(employee => employee.identityNumber === control.value) ? { 'duplicateIdentityNumber': true } : null;
    };
  };
}


