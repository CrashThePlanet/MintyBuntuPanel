import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateTaskComponent } from './pages/create-task/create-task.component';
import { EmployeeDataComponent } from './pages/employee-data/employee-data.component';
import { TaskControlComponent } from './pages/task-control/task-control.component';
import { AdminControlComponent } from './pages/admin-control/admin-control.component';
import { RequestControlComponent } from './pages/admin-control/request-control/request-control.component';
import { UserControlComponent } from './pages/admin-control/user-control/user-control.component';
import { GroupControlComponent } from './pages/admin-control/group-control/group-control.component';
import { AdminComponent } from './pages/admin.component';

const routes: Routes = [
    {
        path: 'admin', component: AdminComponent,
        children: [
            { path: 'creatTask', component: CreateTaskComponent },
            { path: 'employeeData', component: EmployeeDataComponent },
            { path: 'taskControl', component: TaskControlComponent },
            {
                path: 'adminControl', component: AdminControlComponent,
                children: [
                    { path: 'requests', component: RequestControlComponent },
                    { path: 'user', component: UserControlComponent },
                    { path: 'groups', component: GroupControlComponent }
                ]
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
