import {Routes} from '@angular/router';
import { Login } from './login';
import { Register } from './register';
import { Layout } from './layout';
import { Dashboard } from './dashboard';
import { Transactions } from './transactions';
import { Strategy } from './strategy';
import { NewTransaction } from './new-transaction';
import { Goals } from './goals';
import { Profile } from './profile';
import { CustomReportComponent } from './custom-report';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'transactions', component: Transactions },
      { path: 'transactions/new', component: NewTransaction },
      { path: 'strategy', component: Strategy },
      { path: 'goals', component: Goals },
      { path: 'profile', component: Profile },
      { path: 'photo', component: CustomReportComponent, data: { id: 'photo' } },
      { path: 'report/:id', component: CustomReportComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
