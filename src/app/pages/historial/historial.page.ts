import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


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

  startDate = new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/');
  endDate = new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/');

  constructor(public db: AngularFirestore) {
    // this.itemsCollection = db.collection<QR>('QR');
    this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    this.QR = this.itemsCollection.valueChanges();

    // this.db.collection('QR').doc('EDbal1KTfmlZg1WTlu0r').get().forEach(doc => {
    //   console.log(doc.data().createdAt);
    // });
  }

  loadResults() {
    // this.startDate = new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/');
    // console.log(this.startDate);

    // new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/')
    // const prueba = new Date(1578268750317).toLocaleDateString().split(' ');
    // console.log(prueba);

    const fecha1 = new Date(this.startDate).toISOString().replace(/T.*/, '').split('-').reverse().join('/');
    const fecha2 = new Date(this.endDate).toISOString().replace(/T.*/, '').split('-').reverse().join('/');
    console.log('Fecha inicial:' + fecha1);
    console.log('Fecha final:' + fecha2);

    if (!this.startDate || !this.endDate) {
        console.log('Calculando fecha');
        console.log(this.startDate);
        console.log(this.endDate);
        return;
    }


    this.db.collection('QR', ref => ref.where('createdAt', '>=', fecha1) && ref.where('endDate', '<=', fecha2)).get().subscribe(ref => {
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
