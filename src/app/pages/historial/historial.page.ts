import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface QR {
  [x: string]: string;
  cedula: string ;
  serial: string ;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  private itemsCollection: AngularFirestoreCollection<QR>;
  private QR: Observable<QR[]>;

  constructor(private db: AngularFirestore) {
    this.itemsCollection = db.collection<QR>('QR');
    this.QR = this.itemsCollection.valueChanges();
  }

  // Traer todos los QR

  getAllQR() {
    return this.QR = this.itemsCollection.snapshotChanges().pipe
    (map( changes => {
      return changes.map( action => {
        const data = action.payload.doc.data() as QR;
        data.id = action.payload.doc.id;
        return data;
      });
    }));
  }

  // Agregar QR a Firebase
  // add(cedula: string, serial: string) {
  //  const id = this.db.createId();
  //  const qr: QR = {id, cedula, serial};
  //  this.itemsCollection.doc(id).set(qr);
  // }

  // Mostrar QR's registrados al abrir la página

  ngOnInit() {
    // tslint:disable-next-line: no-shadowed-variable
    this.getAllQR().subscribe(QR => {
      console.log('QR', QR);
    });
  }

}
