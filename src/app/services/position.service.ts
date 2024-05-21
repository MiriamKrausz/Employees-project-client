import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Position } from '../models/position.model';
import { EmployeeService } from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  public baseUrl = "https://localhost:7109/api/Position";
  constructor(private http: HttpClient, private employeeService: EmployeeService) {
  }

  getAllPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.baseUrl).pipe(
      map(positions => positions.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }
  addPosition(Position: Position): Observable<Position> {
    return this.http.post<Position>(this.baseUrl, Position)
  }
  deletePosition(id: number): Observable<void> {
    return new Observable<void>(observer => {
      this.employeeService.getAllEmployees().subscribe(employees => {
        const isAssociated = employees.some(employee => employee.positions.some(position => position.position.id === id));
        if (isAssociated) {
          observer.error("Cannot delete position associated with employee(s)");
        } else {
          this.http.delete<void>(`${this.baseUrl}/${id}`).subscribe(() => {
            observer.next();
            observer.complete();
          }, error => {
            observer.error(error);
          });
        }
      }, error => {
        observer.error(error);
      });
    });
  }

}

