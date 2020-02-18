import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { QR } from 'src/app/pages/historial/historial.page';
import { ModalController, Platform, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {

  nombre: string;
  @Input() cedula;
  @Input() serial;
  @Input() fecha;
  @Input() tipo;

  private itemsCollection: AngularFirestoreCollection < QR > ;
  private QR: Observable <QR[]> ;

  constructor(private db: AngularFirestore,
              private modalController: ModalController,
              private platform: Platform,
              public toastCtrl: ToastController) {

    this.itemsCollection = db.collection < QR > ('QR');
    this.QR = this.itemsCollection.valueChanges();
   }

   btnGuardar() {
    this.db.collection('QR', (ref) => ref.where('cedula', '==', this.cedula)).get().subscribe(async users => {
                if (users.size > 0) {
                  // Si encuentra una persona ya escaneada con la misma cédula muestra un mensaje de alerta
                  // this.AlertQRExist();
                  // this.cerrarPop();
                  return false;
                } else {
                  // Si no hay ningun registro entonces lo agrega a la base de datos de Firebase:
                  this.itemsCollection.add({
                    cedula: this.cedula,
                    serial: this.serial,
                    createdAt: this.fecha,
                    endDate: this.fecha,
                    nombre: this.nombre,
                    tipo: this.tipo
                  });
                  this.modalController.dismiss();
                  const toast = await this.toastCtrl.create({
                    message: '¡QR escaneado exitosamente!',
                    mode: 'ios',
                    duration: 3000,
                    position: 'top'
                  });
                  toast.present();
                }
              });
            }

  ngOnInit() {}

}
