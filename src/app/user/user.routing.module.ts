import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { UserDataComponent } from './pages/user-data/user-data.component';
import { UserComponent } from './pages/user.component';

const routes: Routes = [
    {
        path: 'user', component: UserComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'tasks', component: TasksComponent },
            { path: 'userData', component: UserDataComponent },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
