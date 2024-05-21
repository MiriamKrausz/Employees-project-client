import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: TopBarComponent },
  { path: '**', component: NotFoundComponent }
];


