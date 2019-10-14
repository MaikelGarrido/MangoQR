import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MenuController, AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  cedula: string;
  password: string;

  constructor(private authService: AuthService,
              public router: Router,
              public menuCtrl: MenuController,
              public loadingCtrl: LoadingController,
              public alertController: AlertController) { }

  ngOnInit() {
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Verifique sus datos y conexión a Internet',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      mode: 'ios',
      message: 'Espere',
      spinner: 'lines-small'
    });
    await loading.present();
    this.authService.login(this.cedula, this.password).then(res => {
      this.router.navigate(['tabs/home']);
      return loading.dismiss();
    }).catch(err => this.presentAlert());
    loading.dismiss();
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
  }

  // OnSubmitLogin() {
  //   this.authService.login(this.cedula, this.password).then(res => {
  //     this.router.navigate(['tabs/home']);
  //   }).catch(err => alert('Los datos son incorrectos'));
  // }

}
