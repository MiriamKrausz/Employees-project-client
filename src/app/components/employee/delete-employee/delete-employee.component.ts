import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.model';
@Component({
  selector: 'app-delete-employee',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, MatDialogModule,],
  templateUrl: './delete-employee.component.html',
  styleUrl: './delete-employee.component.scss'
})
export class DeleteEmployeeComponent {
  employee: Employee;

  constructor(
    public dialogRef: MatDialogRef<DeleteEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) data: { employee: Employee },
    private _employeeService: EmployeeService
  ) {
    this.employee = data.employee;
  }

  onConfirmDelete(): void {
    this.dialogRef.close(true);
    this._employeeService.deleteEmployee(this.employee.id)
      .subscribe(() => {
      }, (error) => {
        console.error('Error deleting employee:', error);
      });
  }
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
