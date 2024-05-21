import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-position',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule],
  templateUrl: './delete-position.component.html',
  styleUrl: './delete-position.component.scss'
})
export class DeletePositionComponent {
  constructor(
    public dialogRef: MatDialogRef<DeletePositionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
