import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor(public authService: AuthService, private menuCtrl: MenuController) { }

  ngOnInit() {}

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  Onlogout() {
    this.authService.logout();
  }
}




