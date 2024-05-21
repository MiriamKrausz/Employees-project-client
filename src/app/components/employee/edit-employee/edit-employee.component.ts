import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { AddPositionComponent } from '../../position/add-position/add-position.component';
import { Employee } from '../../../models/employee.model';
import { EmployeeService } from '../../../services/employee.service';
import { PositionService } from '../../../services/position.service';
import { Position } from '../../../models/position.model';
@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatButtonModule, MatDialogModule, MatExpansionModule, MatIconModule, MatDialogContent, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatSelectModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ]
})

export class EditEmployeeComponent {
  employeeForm: FormGroup;
  positions: Position[] = [];
  newPositionName: string = "other";
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee },
    private _employeeService: EmployeeService,
    private _positionService: PositionService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPositions();
  }
  initializeForm(): void {
    const employee = this.data.employee;
    this.employeeForm = this.fb.group({
      firstName: [employee.firstName, [Validators.required, Validators.pattern(/^[א-ת\u0590-\u05FEa-zA-Z]{2,}$/)]],
      surname: [employee.surname, [Validators.required, Validators.pattern(/^[א-ת\u0590-\u05FEa-zA-Z]{2,}$/)]],
      identityNumber: [employee.identityNumber],
      gender: [employee.gender, Validators.required],
      dateOfBirth: [employee.dateOfBirth, [Validators.required, this.ageValidator()]],
      beginningOfWork: [employee.beginningOfWork, [Validators.required, this.beginningOfWorkValidator()]],
      positions: this.fb.array([])
    });

    if (employee.positions && employee.positions.length > 0) {
      employee.positions.forEach(position => {
        this.addPositionControl(position.position.id, position.isAdministrative, position.entryDate);
      });
    } else {
      this.addPositionControl();
    }
  }

  addPositionControl(positionId: number = null, isAdministrative: boolean = false, entryDate: Date = null): void {
    this.positionsFormArray.push(this.fb.group({
      positionId: [positionId, Validators.required],
      isAdministrative: [isAdministrative, Validators.required],
      entryDate: [entryDate, [Validators.required, this.entryDateValidator()]]
    }));
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

  loadPositions(): void {
    this._positionService.getAllPositions().subscribe(positions => {
      this.positions = positions;
    });
  }
  removePositionControl(index: number): void {
    this.positionsFormArray.removeAt(index);
  }
  isPositionDisabled(positionId: number, index: number): boolean {
    const selectedPositions = this.employeeForm.value.positions.map((pos: any) => pos.positionId);
    return selectedPositions.includes(positionId) && selectedPositions.indexOf(positionId) !== index;
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

  submit(): void {
    if (this.employeeForm.valid) {
      const employeeId = this.data.employee.id;
      this._employeeService.getEmployeeById(employeeId).subscribe((employee: Employee) => {
        const updatedEmployee = {
          ...employee,
          ...this.employeeForm.value
        };
        this._employeeService.updateEmployee(updatedEmployee).subscribe(() => {
          this.openSnackBar('Employee updated successfully');
          this.dialogRef.close(true);
        }, error => {
          if (error.status === 400)
            this.openSnackBar(error.error.errors[0]);
        });
      }, error => {
        this.openSnackBar('Error getting employee by ID');
      });
    } else {
      this.employeeForm.markAllAsTouched();
      this.openSnackBar('Form is not valid');
    }
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',

    });
  }
  cancel(): void {
    this.dialogRef.close();
  }
}