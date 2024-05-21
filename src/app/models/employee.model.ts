import { EmployeePosition } from "./employee-position.model";

export class Employee {
    id: number;
    firstName: string;
    surname: string;
    identityNumber: string;
    gender: string;
    dateOfBirth: Date;
    beginningOfWork: Date;
    positions: EmployeePosition[];
  } 
