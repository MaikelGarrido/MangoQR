import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase';


export interface QR {
  [x: string]: any;
  cedula: string ;
  serial: string ;
  createdAt: Date;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  private itemsCollection: AngularFirestoreCollection<QR>;
  private QR: Observable<QR[]>;

  constructor(public db: AngularFirestore) {
    // this.itemsCollection = db.collection<QR>('QR');
    this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    this.QR = this.itemsCollection.valueChanges();
    // this.QR = this.itemsCollection.snapshotChanges().pipe(map( changes => {
    //   return changes.map( action => {
    //     const data = action.payload.doc.data() as QR;
    //     data.id = action.payload.doc.id;
    //     return data;
    //   });
    // }));
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  // Traer todos los QR
  getAllQR() {
    return this.QR = this.itemsCollection.snapshotChanges().pipe(map( changes => {
      return changes.map( action => {
        const data = action.payload.doc.data() as QR;
        data.id = action.payload.doc.id;
        return data;
      });
    }));
  }

  // Mostrar QR's registrados al abrir la página
  ngOnInit() {
    this.getAllQR().subscribe(QR => {
      console.log('QR', QR);
    });
  }
}
