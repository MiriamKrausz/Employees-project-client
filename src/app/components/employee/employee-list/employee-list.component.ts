import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.model';
import { DeleteEmployeeComponent } from '../delete-employee/delete-employee.component';
import { EditEmployeeComponent } from '../edit-employee/edit-employee.component';
import { EmployeeDetailsComponent } from '../employee-details/employee-details.component';


@Component({
  standalone: true,

  imports: [CommonModule, MatTooltipModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatToolbarModule, MatCheckboxModule, MatSortModule, MatPaginatorModule, MatExpansionModule, MatIconModule, MatDialogModule, MatButtonModule, MatSelectModule, ReactiveFormsModule, MatDatepickerModule, MatSlideToggleModule],
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter },
  ]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns: string[] = [
    'firstName',
    'surname',
    'identityNumber',
    'beginningOfWork',
    'actions',
  ];
  isLoading: boolean = false;
  dataSource: MatTableDataSource<Employee>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog, private _employeeService: EmployeeService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getEmployees();
  }
  formatDate(date: any): string {
    return formatDate(date, 'yyyy-MM-dd', 'en');
  }

  getEmployees(): void {
    this.isLoading = true;
    this._employeeService.getAllEmployees().subscribe({
      next: (res: Employee[]) => {
        this.employees = res;
        this.dataSource = new MatTableDataSource(this.employees);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  addEmployee(): void {
    const dialogRef = this.dialog.open(AddEmployeeComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getEmployees();
      }
    });
  }

  editEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EditEmployeeComponent, { width: '600px', height: '600px', data: { employee } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getEmployees();
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(DeleteEmployeeComponent, { data: { employee } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openSnackBar('Employee deleted successfully', 'Close');
        this.getEmployees();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewDetails(row: Employee): void {
    this.dialog.open(EmployeeDetailsComponent, { data: { employee: row } });
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}
