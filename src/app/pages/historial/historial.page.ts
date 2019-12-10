import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {isWithinInterval, isBefore } from 'date-fns';
import { element } from '@angular/core/src/render3';


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

  startDate;
  endDate;
  invalidSelection = false;
  data = [this.QR];
  filtered = [...this.data];

  constructor(public db: AngularFirestore) {
    // this.itemsCollection = db.collection<QR>('QR');
    this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    this.QR = this.itemsCollection.valueChanges();

    // getSpecificTicket(dateFrom: Date, dateTo: Date): any {
    //   this.ticketList = this.afDatabase.list('tickets', ref =>
    //   ref.orderByChild('issuedOn').startAt(dateFrom.toString()).endAt(dateTo.toString()));
    //   return this.ticketList.snapshotChanges();
    // }
  }


  loadResults() {
    if (!this.startDate || !this.endDate) {
      console.log('Calculando fecha');
      return;
    }
    const startDate = new Date(this.startDate).getTime();
    const endDate = new Date(this.endDate).getTime();

    this.filtered = this.data.filter(data => {
      return new Date(this.startDate).getTime() >= startDate && new Date(this.endDate).getTime() <= endDate;
    });
    console.log(this.startDate, this.endDate)
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
