import {
  Component,
  OnInit
} from '@angular/core';
import {
  PopoverController,
  NavController,
  AlertController
} from '@ionic/angular';
import {
  AuthService
} from 'src/services/auth.service';
import {
  BarcodeScanner,
  BarcodeScannerOptions
} from '@ionic-native/barcode-scanner/ngx';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import {
  QR,
  HistorialPage
} from '../../pages/historial/historial.page';
import {
  Observable
} from 'rxjs';
import {
  format
} from 'path';

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
      header: 'Alerta',
      message: 'El código QR no pertenece a la plataforma Patria',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  async AlertQRExist() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'La cédula ya está registrda en la Base de datos',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  Onlogout() {
    this.authService.logout();
    this.popoverCtrl.dismiss();
  }

  add(cedula: string, serial: string) {
    const id = this.db.createId();
    const qr: QR = {
      id,
      cedula,
      serial
    };
    this.itemsCollection.doc(id).set(qr);
  }

  // Escanner y Opciones

  scanCode() {
    this.barcodeScanner.scan(this.BarcodeScannerOptions).then(barcodeData => {

        const verificacion = barcodeData.text.length === 90;
        // tslint:disable-next-line:variable-name
        const obtener_cedula = barcodeData.text.split('/').slice(6).join();
        // tslint:disable-next-line:variable-name
        const obtener_serial = barcodeData.text.split('/').slice(5, -1).join();

        // Escaner cancelado
        if (barcodeData.cancelled === true) {
          this.navCtrl.back();
          return false;
        }

        // Si es diferente a cancelado
        if (!barcodeData.cancelled && verificacion === true) {
          this.db.collection('QR', (ref) => ref.where('cedula', '==', obtener_cedula)
          .limit(1))
          .get()
          .subscribe(users => {
            if (users.size > 0) {
              // Si encuentra un usuario con la misma cedula
              // muestras un mensaje de que ya esta o algo asi
              this.AlertQRExist();
              this.cerrarPop();
              return false;
            } else {
              // Si no hay ninguno entonces:
              this.itemsCollection.add({
                cedula: obtener_cedula,
                serial: obtener_serial,
              });
            }
          });
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
