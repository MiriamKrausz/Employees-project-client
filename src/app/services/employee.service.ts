import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  public baseUrl = "https://localhost:7109/api/Employees";

  constructor(private http: HttpClient) { }
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${employee.id}`, employee);
  }
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  exportEmployeesToExcel(): Observable<any> {
    return new Observable(observer => {
      this.getAllEmployees().subscribe((employees: Employee[]) => {
        const formattedEmployees = employees.flatMap(employee => {
          const employeeData: any = {
            'Employee ID': employee.id,
            'First Name': employee.firstName,
            'Surname': employee.surname,
            'Identity Number': employee.identityNumber,
            'Gender': employee.gender,
            'Date of Birth': this.formatDate(employee.dateOfBirth),
            'Beginning of Work': this.formatDate(employee.beginningOfWork)
          };
          const positionData = employee.positions.map(position => ({
            'Position ID': position.position.id,
            'Position Name': position.position.name,
            'Administrative': position.isAdministrative ? 'Yes' : 'No',
            'Entry Date': this.formatDate(position.entryDate)
          }));
          if (positionData.length > 1) {
            return positionData.map((position, index) => index === 0 ? { ...employeeData, ...position } : position);
          } else {
            return { ...employeeData, ...positionData[0] };
          }
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedEmployees);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const now = new Date();
        const formattedDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        const fileName = `employees_${formattedDate}.xlsx`;
        const excelBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(excelBlob, fileName);
        observer.next();
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }
  private formatDate(date: Date): string {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
