import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopinfoComponent } from '../../components/popinfo/popinfo.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(private popoverCtrl: PopoverController) {}

  ionViewWillEnter() {
  }

  ngOnInit() {
  }

  async mostrarPop(evento: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopinfoComponent,
      event: evento,
      mode: 'ios',
      backdropDismiss: true,
      cssClass: 'pop-over-style',
      translucent: true
    });

    await popover.present();
  }

}
