import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {isWithinInterval, isBefore } from 'date-fns';


export interface QR {
  [x: string]: any;
  cedula: string ;
  serial: string ;
  createdAt: any;
  endDate: any;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})

export class HistorialPage implements OnInit {

  private itemsCollection: AngularFirestoreCollection<QR>;
  private QR: Observable<QR[]>;

  startDate;
  endDate;
  myDates = [];

  constructor(public db: AngularFirestore) {
    // this.itemsCollection = db.collection<QR>('QR');
    this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    this.QR = this.itemsCollection.valueChanges();

    // this.db.collection('QR').doc('EDbal1KTfmlZg1WTlu0r').get().forEach(doc => {
    //   console.log(doc.data().createdAt);
    // });

    // const citiesRef = db.collection('QR', ref => ref.orderBy('createdAt').endAt(1000000));
    // console.log(citiesRef);

  }

  loadResults() {
    if (!this.startDate || !this.endDate) {
        console.log('Calculando fecha');
        return;
    }

    const startDate = new Date(this.startDate).getTime();
    const endDate = new Date(this.endDate).getTime();

    // const startfulldate = this.db.firestore.batch.length(new Date(1556062581000));
    this.db.collection('QR', ref => ref.where('createdAt', '==', startDate)).get().subscribe(ref => {
        const jsonvalue: any[] = [];
        ref.forEach(docs => {
          jsonvalue.push(docs.data());
           });
        console.log(jsonvalue);
        return;
            // }).catch( error => {
            //     res.status(500).send(error);
            });
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
    // tslint:disable-next-line: no-shadowed-variable
    this.getAllQR().subscribe(QR => {
      console.log('QR', QR);
    });
  }
}
