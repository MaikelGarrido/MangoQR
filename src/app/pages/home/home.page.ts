import { Component } from '@angular/core';
import { MenuController, NavController, AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/services/auth.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { QR } from '../historial/historial.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  barcodeData: string;
  BarcodeScannerOptions: BarcodeScannerOptions;
  private itemsCollection: AngularFirestoreCollection<QR>;
  private QR: Observable<QR[]>;

   constructor(private menuCtrl: MenuController,
               private authService: AuthService,
               private barcodeScanner: BarcodeScanner,
               private navCtrl: NavController,
               private db: AngularFirestore,
               private alertController: AlertController,
               private popoverCtrl: PopoverController) {

                  this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc').limit(5));
                  this.QR = this.itemsCollection.valueChanges();

                // Opciones del escaner
                  this.BarcodeScannerOptions = {
                showTorchButton: true,
                showFlipCameraButton: true,
                prompt: 'Escanea el código QR del carnet de la patria',
                formats: 'QR_CODE'
                };
               }

   cerrarPop() {
    this.popoverCtrl.dismiss();
  }

   ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

   toggleMenu() {
     this.menuCtrl.toggle();
   }

   async AlertQRFail() {
    const alert = await this.alertController.create({
      header: 'ALERTA',
      message: 'El código QR no pertenece a la plataforma Patria',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  async AlertQRExist() {
    const alert = await this.alertController.create({
      header: 'ALERTA',
      message: 'La cédula ya está registrada',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  async AlertQR() {
    const alert = await this.alertController.create({
      header: 'ALERTA',
      message: 'El QR no pertenece a la platarforma patria',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  //  // Escanner y Opciones
  // scanBolsa() {
  //   this.barcodeScanner.scan(this.BarcodeScannerOptions).then(barcodeData => {
  //       // Escaner cancelado
  //       if (barcodeData.cancelled === true) {
  //         this.navCtrl.back();
  //         return false;
  //       }
  //       const hola = barcodeData.text;
  //       if (hola.includes('https://carnetdelapatria.gob.ve/info/')) {
  //         const verificacion = barcodeData.text.length === 89 || 90;
  //         console.log(barcodeData);
  //         const obtenercedula = barcodeData.text.split('/').slice(6).join();
  //         const obtenerserial = barcodeData.text.split('/').slice(5, -1).join();
  //         // Si es diferente a cancelado
  //         if (!barcodeData.cancelled && verificacion) {
  //           this.db.collection('QR', (ref) => ref.where('cedula', '==', obtenercedula).limit(1)).get().subscribe(users => {
  //               if (users.size > 0) {
  //                 // Si encuentra una persona ya escaneada con la misma cédula muestra un mensaje de alerta
  //                 this.AlertQRExist();
  //                 this.cerrarPop();
  //                 return false;
  //               }
  //               if (obtenercedula && obtenercedula === '') {
  //                 this.AlertQR();
  //                 this.cerrarPop();
  //                 return false;
  //               } else {
  //                 // Si no hay ningun registro entonces lo agrega a la base de datos de Firebase:
  //                 this.itemsCollection.add({
  //                   cedula: obtenercedula,
  //                   serial: obtenerserial,
  //                   createdAt: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
  //                   endDate: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
  //                 });
  //               }
  //             });
  //           } else {
  //             this.AlertQRFail();
  //             this.cerrarPop();
  //             console.log(verificacion);
  //             return false;
  //           }
  //       } else {
  //         this.AlertQRFail();
  //         this.cerrarPop();
  //         return false;
  //       }
  //       this.cerrarPop();
  //     })
  //     .catch(err => {
  //       console.log('Error', err);
  //     });
  // }




}
