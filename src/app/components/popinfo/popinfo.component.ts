import { Component,OnInit } from '@angular/core';
import { PopoverController,NavController,AlertController } from '@ionic/angular';
import { AuthService } from 'src/services/auth.service';
import { BarcodeScanner,BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AngularFirestore,AngularFirestoreCollection } from '@angular/fire/firestore';
import { QR,HistorialPage} from '../../pages/historial/historial.page';
import { Observable } from 'rxjs';
import { format } from 'path';
import { stringify } from '@angular/core/src/render3/util';
import { firestore } from 'firebase';
import * as firebase from 'firebase';

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

  constructor(private popoverCtrl: PopoverController,
              private authService: AuthService,
              private barcodeScanner: BarcodeScanner,
              private navCtrl: NavController,
              private db: AngularFirestore,
              private alertController: AlertController) {

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

  Onlogout() {
    this.authService.logout();
    this.popoverCtrl.dismiss();
  }

  reporte() {
  }

  // Escanner y Opciones

  scanCode() {
    this.barcodeScanner.scan(this.BarcodeScannerOptions).then(barcodeData => {
        const verificacion = barcodeData.text.length === 89 || 90;
        // const url =  'https://carnetdelapatria.org.ve'.indexOf('carnetdelpatria');
        const obtenercedula = barcodeData.text.split('/').slice(6).join();
        const obtenerserial = barcodeData.text.split('/').slice(5, -1).join();

        // Escaner cancelado
        if (barcodeData.cancelled === true) {
          this.navCtrl.back();
          return false;
        }

        // Si es diferente a cancelado
        if (!barcodeData.cancelled && verificacion) {
          this.db.collection('QR', (ref) => ref.where('cedula', '==', obtenercedula).limit(1)).get().subscribe(users => {
              if (users.size > 0) {
                // Si encuentra una persona ya escaneada con la misma cédula muestra un mensaje de alerta
                this.AlertQRExist();
                this.cerrarPop();
                return false;
              } else {
                // Si no hay ningun registro entonces lo agrega a la base de datos de Firebase:
                this.itemsCollection.add({
                  cedula: obtenercedula,
                  serial: obtenerserial,
                  createdAt: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                  endDate: new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/'),
                });
              }
            });
        } else {
          this.AlertQRFail();
          this.cerrarPop();
          console.log(verificacion);
          return false;
        }
        this.cerrarPop();
      })
      .catch(err => {
        console.log('Error', err);
      });
  }
}
