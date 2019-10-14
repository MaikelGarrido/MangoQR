import { Component, OnInit} from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  iconos: icono [] = [
    {
      icon: 'contact',
      name: 'contacto',
      redirectTo: 'contacto'
    },
];

  constructor(public authService: AuthService, private menuCtrl: MenuController) { }

  ngOnInit() {}

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  Onlogout() {
    this.authService.logout();
 }


}

// tslint:disable-next-line: class-name
interface icono {
  icon: string;
  name: string;
  redirectTo: string;
}

