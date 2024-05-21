import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Employee } from '../../../models/employee.model';
@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [MatCardModule, CommonModule, DatePipe, MatIconModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss'
})
export class EmployeeDetailsComponent {
  employee: Employee;
  actionsStyles = {
    'display': 'flex',
    'justify-content': 'flex-end'
  };
  cardStyles = {
    'max-width': '600px',
    'margin': '20px auto',
    'padding': '16px',
    'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.12)',
    'border-radius': '4px',
    'font-family': 'Arial, sans-serif'
  };


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EmployeeDetailsComponent>) {
    this.employee = data.employee;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
