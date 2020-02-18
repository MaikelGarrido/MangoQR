import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { NologinGuard } from '../guards/nologin.guard';

const routes: Routes = [

  // { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule', canActivate : [NologinGuard] },
  { path: 'home', redirectTo: '', canActivate : [AuthGuard] },
  { path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule', canActivate : [AuthGuard] }

  // { path: 'historial', loadChildren: './pages/historial/historial.module#HistorialPageModule', canActivate : [AuthGuard]},
  // { path: 'contacto', loadChildren: './pages/contacto/contacto.module#ContactoPageModule', canActivate : [AuthGuard]},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
