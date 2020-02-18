import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { PopinfoComponent } from './popinfo/popinfo.component';
import { MenuComponent } from './menu/menu.component';
import { InfoComponent } from './info/info.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  entryComponents: [
    InfoComponent
  ],
  declarations: [
    MenuComponent,
    HeaderComponent,
    PopinfoComponent,
    InfoComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    PopinfoComponent,
    MenuComponent,
    InfoComponent,
    FormsModule
  ],
})
export class ComponentsModule { }
