import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {isWithinInterval, isBefore } from 'date-fns';
import { format } from 'date-fns/esm';


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

    // this.startDate = new Date('').toISOString();

    // https://www.joshmorony.com/prevent-access-to-pages-in-ionic-with-angular-route-guards/
    // https://www.joshmorony.com/native-web-facebook-authentication-with-firebase-in-ionic/
    // https://stackoverflow.com/questions/4673527/converting-milliseconds-to-a-date-jquery-javascript
    // https://stackoverflow.com/questions/56072916/having-a-problem-when-converting-firebase-timestamp-in-standard-format
    // https://stackoverflow.com/questions/58679592/how-to-convert-firebase-firestore-timestamp-to-zulu-datetime-format-in-firebase
    // https://stackoverflow.com/questions/57211166/firestore-timestamp-is-seconds-0-nanoseconds-0-when-using-retrofit
    // https://github.com/datejs/Datejs
    // https://stackoverflow.com/questions/53336061/how-to-save-date-in-angular-as-a-timestamp-to-firestore
    // https://stackoverflow.com/questions/53482750/convert-date-to-timestamp-for-storing-into-firebase-firestore-in-javascript

  }

  loadResults() {

    const prueba = new Date(1578268750317).toLocaleDateString().split(' ');
    console.log(prueba);

    if (!this.startDate || !this.endDate) {
        console.log('Calculando fecha');
        console.log(this.startDate);
        console.log(this.endDate);
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
