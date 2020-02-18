import { Component, OnInit } from '@angular/core';
import { PopoverController, NavController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/services/auth.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { QR } from '../../pages/historial/historial.page';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { InfoComponent } from '../info/info.component';

@Component({
  selector: 'app-popinfo',
  templateUrl: './popinfo.component.html',
  styleUrls: ['./popinfo.component.scss'],
})
export class PopinfoComponent implements OnInit {

  barcodeData: string;
  BarcodeScannerOptions: BarcodeScannerOptions;

  private itemsCollection: AngularFirestoreCollection < QR > ;
  private QR: Observable < QR[] > ;
  dataReturned: any;

  constructor(private popoverCtrl: PopoverController,
              private authService: AuthService,
              private barcodeScanner: BarcodeScanner,
              private navCtrl: NavController,
              private db: AngularFirestore,
              private alertController: AlertController,
              public modalController: ModalController) {

    this.itemsCollection = db.collection < QR > ('QR');
    this.QR = this.itemsCollection.valueChanges();
    // this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));

    // Opciones del escaner
    this.BarcodeScannerOptions = {
      showTorchButton: true,
      showFlipCameraButton: true,
      prompt: 'Escanea el código QR del carnet de la patria',
      formats: 'QR_CODE'
    };
  }

  ngOnInit() {}

  cerrarPop() {
    this.popoverCtrl.dismiss();
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

  Onlogout() {
    this.authService.logout();
    this.popoverCtrl.dismiss();
  }

  // async openQR(QR) {
  //   this.modalController.create({
  //     component: SeleccionComponent,
  //     cssClass: 'modal-css',
  //     componentProps: {
  //       cedula: QR.cedula,
  //       serial: QR.serial
  //     }
  //   }).then(modalController =>
  //     modalController.present());
  // }

  // async presentModal() {
  //   const modal = await this.modalController.create({
  //     component: InfoComponent,
  //     cssClass: 'modal-css',
  //     componentProps: {
  //       cedula: ,
  //       serial: '12321321421'
  //     }
  //   });
  //   await modal.present();
  // }

  // Escanner y Opciones
  scanCode() {
    this.barcodeScanner.scan(this.BarcodeScannerOptions).then(async barcodeData => {
        // Escaner cancelado
        if (barcodeData.cancelled === true) {
          this.navCtrl.back();
          return false;
        }
        const hola = barcodeData.text;
        if (hola.includes('https://carnetdelapatria.gob.ve/info/') || hola.includes('http://carnetdelapatria.gob.ve/info/')) {
          const verificacion = barcodeData.text.length === 89 || 90;
          console.log(barcodeData);
          const obtenercedula = barcodeData.text.split('/').slice(6).join();
          const obtenerserial = barcodeData.text.split('/').slice(5, -1).join();
          const tipo = 'bolsa';
          const modal = await this.modalController.create({
            component: InfoComponent,
            cssClass: 'modal-css',
            componentProps: {
              cedula: obtenercedula,
              serial: obtenerserial,
              fecha: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
              // tslint:disable-next-line: object-literal-shorthand
              tipo: tipo
            }
          });
          // Si es diferente a cancelado
          if (!barcodeData.cancelled) {
            this.db.collection('QR', (ref) => ref.where('cedula', '==', obtenercedula)).get().subscribe(users => {
                if (users.size > 0) {
                  // Si encuentra una persona ya escaneada con la misma cédula muestra un mensaje de alerta
                  this.AlertQRExist();
                  this.cerrarPop();
                  return false;
                } else {
                  // Si no hay ningun registro entonces lo agrega a la base de datos de Firebase:
                  // this.itemsCollection.add({
                  //   cedula: obtenercedula,
                  //   serial: obtenerserial,
                  //   createdAt: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                  //   endDate: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                  // });
                  modal.present();
                }
              });
            } else {
              this.AlertQRFail();
              this.cerrarPop();
              console.log(verificacion);
              return false;
            }
        } else {
          this.AlertQRFail();
          this.cerrarPop();
          return false;
        }
        this.cerrarPop();
      })
      .catch(err => {
        console.log('Error', err);
      });
  }


  // Scan bombonas
  scanBombonas() {
    this.barcodeScanner.scan(this.BarcodeScannerOptions).then(async barcodeData => {
      // Escaner cancelado
      if (barcodeData.cancelled === true) {
        this.navCtrl.back();
        return false;
      }
      const hola = barcodeData.text;
      if (hola.includes('https://carnetdelapatria.gob.ve/info/') ||
      hola.includes('http://carnetdelapatria.gob.ve/info/')) {
        const verificacion = barcodeData.text.length === 89 || 90;
        console.log(barcodeData);
        const obtenercedula = barcodeData.text.split('/').slice(6).join();
        const obtenerserial = barcodeData.text.split('/').slice(5, -1).join();
        const tipo = 'bombona';
        const modal = await this.modalController.create({
          component: InfoComponent,
          cssClass: 'modal-css',
          componentProps: {
            cedula: obtenercedula,
            serial: obtenerserial,
            fecha: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
            // tslint:disable-next-line: object-literal-shorthand
            tipo: tipo
          }
        });
        // Si es diferente a cancelado
        if (!barcodeData.cancelled) {
          this.db.collection('QR', (ref) => ref.where('cedula', '==', obtenercedula)).get().subscribe(users => {
              if (users.size > 0) {
                // Si encuentra una persona ya escaneada con la misma cédula muestra un mensaje de alerta
                this.AlertQRExist();
                this.cerrarPop();
                return false;
              } else {
                // Si no hay ningun registro entonces lo agrega a la base de datos de Firebase:
                // this.itemsCollection.add({
                //   cedula: obtenercedula,
                //   serial: obtenerserial,
                //   createdAt: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                //   endDate: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                // });
                modal.present();
              }
            });
          } else {
            this.AlertQRFail();
            this.cerrarPop();
            console.log(verificacion);
            return false;
          }
      } else {
        this.AlertQRFail();
        this.cerrarPop();
        return false;
      }
      this.cerrarPop();
    })
    .catch(err => {
      console.log('Error', err);
    });
  }

  // Scan bombonas
  scanSalud() {
    this.barcodeScanner.scan(this.BarcodeScannerOptions).then(async barcodeData => {
      // Escaner cancelado
      if (barcodeData.cancelled === true) {
        this.navCtrl.back();
        return false;
      }
      const hola = barcodeData.text;
      if (hola.includes('https://carnetdelapatria.gob.ve/info/') ||
      hola.includes('http://carnetdelapatria.gob.ve/info/')) {
        const verificacion = barcodeData.text.length === 89 || 90;
        console.log(barcodeData);
        const obtenercedula = barcodeData.text.split('/').slice(6).join();
        const obtenerserial = barcodeData.text.split('/').slice(5, -1).join();
        const tipo = 'salud';
        const modal = await this.modalController.create({
          component: InfoComponent,
          cssClass: 'modal-css',
          componentProps: {
            cedula: obtenercedula,
            serial: obtenerserial,
            fecha: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
            // tslint:disable-next-line: object-literal-shorthand
            tipo: tipo
          }
        });
        // Si es diferente a cancelado
        if (!barcodeData.cancelled) {
          this.db.collection('QR', (ref) => ref.where('cedula', '==', obtenercedula)).get().subscribe(users => {
              if (users.size > 0) {
                // Si encuentra una persona ya escaneada con la misma cédula muestra un mensaje de alerta
                this.AlertQRExist();
                this.cerrarPop();
                return false;
              } else {
                // Si no hay ningun registro entonces lo agrega a la base de datos de Firebase:
                // this.itemsCollection.add({
                //   cedula: obtenercedula,
                //   serial: obtenerserial,
                //   createdAt: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                //   endDate: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                // });
                modal.present();
              }
            });
          } else {
            this.AlertQRFail();
            this.cerrarPop();
            console.log(verificacion);
            return false;
          }
      } else {
        this.AlertQRFail();
        this.cerrarPop();
        return false;
      }
      this.cerrarPop();
    })
    .catch(err => {
      console.log('Error', err);
    });
  }
}
