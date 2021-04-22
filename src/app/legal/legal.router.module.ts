import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LicensesComponent } from './pages/licenses/licenses.component';
import { NoticeComponent } from './pages/notice/notice.component';
import { LegalComponent } from './pages/legal.component';

const routes: Routes = [
    {
        path: 'legal', component: LegalComponent,
        children: [
            { path: 'notice', component: NoticeComponent },
            { path: 'licenses', component: LicensesComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LegalRoutingModule { }
