
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeListComponent } from '../employee/employee-list/employee-list.component';
import { PositionService } from '../../services/position.service';
import { Employee } from '../../models/employee.model';
import { Position } from '../../models/position.model';
import { EmployeeService } from '../../services/employee.service';
import { DeletePositionComponent } from '../position/delete-position/delete-position.component';

/**
 * @title Filter autocomplete
 */
@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatExpansionModule,
    EmployeeListComponent,
    AsyncPipe,
  ],
  selector: 'app-top-bar',
  standalone: true,
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  @Output() searchTextChanged = new EventEmitter<string>();
  sidebarVisible: boolean;
  employeesName = new FormControl('');
  filteredEmployees: Observable<string[]> | undefined;
  positionName = new FormControl('');
  filteredPositions: Observable<string[]> | undefined;
  positions: Position[] = [];
  employees: Employee[] = [];
  sortedEmployees: Employee[] = [];

  constructor(public dialog: MatDialog, private _employeeService: EmployeeService, private _positionService: PositionService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.filteredEmployees = this.employeesName.valueChanges.pipe(
      startWith(''),
      map(value => this._filterEmployees(value || ''))
    );
    this.filteredPositions = this.positionName.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPositions(value || ''))
    );
    this.getEmployees();
    this.getPositions();
  }

  downloadToexcel(): void {
    this._employeeService.exportEmployeesToExcel().subscribe({
      next: () => {
        this.openSnackBar('The file was successfully downloaded', 'Close');
      }
    });
  }

  getEmployees(): void {
    this._employeeService.getAllEmployees().subscribe((res) => {
      this.employees = res;
      this.sortedEmployees = this.employees.slice();
      this.sortEmployees();
    });
  }
  getPositions(): void {
    this._positionService.getAllPositions().subscribe((res) => {
      this.positions = res;
    });
  }
  sortEmployees(): void {
    this.sortedEmployees.sort((a, b) => {
      const fullNameA = a.firstName.toLowerCase() + ' ' + a.surname.toLowerCase();
      const fullNameB = b.firstName.toLowerCase() + ' ' + b.surname.toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });
  }
  private _filterEmployees(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.sortedEmployees.map(employee => employee.firstName + ' ' + employee.surname)
      .filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filterPositions(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.positions.map(position => position.name.toLowerCase())
      .filter(option => option.includes(filterValue));
  }

  deletePositionDialog(position: Position): void {
    const dialogRef = this.dialog.open(DeletePositionComponent, {
      data: { positionName: position.name }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePosition(position.id);
      }
    });
  }

  deletePosition(positionId: number): void {
    this._positionService.deletePosition(positionId).subscribe({
      next: () => {
        this.openSnackBar('Position deleted successfully', 'close');
        this.getPositions();
      },
      error: err => {
        this.openSnackBar(err, 'close');
      }
    });
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }


}
