import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { File } from '@ionic-native/file/ngx';
import { NavController, ToastController } from '@ionic/angular';


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

  constructor(public db: AngularFirestore,
              public navCtrl: NavController,
              public file: File,
              public toastCtrl: ToastController) {
    // this.itemsCollection = db.collection<QR>('QR');
    // this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    // this.QR = this.itemsCollection.valueChanges();

    // this.db.collection('QR').doc('EDbal1KTfmlZg1WTlu0r').get().forEach(doc => {
    //   console.log(doc.data().createdAt);
    // });
  }

  loadResults() {
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

    this.itemsCollection = this.db.collection('QR', ref => ref.where('createdAt', '>=', fecha1) && ref.where('endDate', '<=', fecha2));
    this.QR = this.itemsCollection.valueChanges();

    // this.db.collection('QR', ref => ref.where('createdAt', '>=', fecha1) && ref.where('endDate', '<=', fecha2)).get().subscribe(ref => {
    //   const jsonvalue: any[] = [];
    //   ref.forEach(docs => {
    //     jsonvalue.push(this.getAllQR);
    //   });
    //   console.log(jsonvalue);
    //   return;
    //   }).catch( error => {
    //       res.status(500).send(error);
    // });
  }

  // Traer todos los QR
getAllQR() {
    // return this.QR = this.itemsCollection.snapshotChanges().pipe(map( changes => {
    //   return changes.map( action => {
    //     const data = action.payload.doc.data() as QR;
    //     data.id = action.payload.doc.id;
    //     return data;
    //   });
    // }));
  }

  // Mostrar QR's registrados al abrir la página
ngOnInit() {
    // tslint:disable-next-line: no-shadowed-variable
    // this.getAllQR().subscribe(QR => {
    //   console.log('QR', QR);
    // });
  }

  // Método para tomar el día
  dateToday() {
    const date = new Date().toISOString().slice(0, 10);
    this.startDate = date.split('-')[2] + '-' + date.split('-')[1] + '-' + date.split('-')[0];
  }

  // Generando tabla y pdf
  cantWidths(columns) {
    const widths = [];
    columns.forEach(() => {
      widths.push('auto');
    });
    return widths;
  }

  buildTableBody(data, columns) {
      const body = [];
      body.push(columns);
      // tslint:disable-next-line:only-arrow-functions
      data.forEach(function(row) {
          const dataRow = [];
          // tslint:disable-next-line:only-arrow-functions
          columns.forEach(function(column) {
              dataRow.push(row[column].toString());
          });
          body.push(dataRow);
      });
      return body;
  }

  table(data, columns) {
      return {
          table: {
            widths: this.cantWidths(columns),
              headerRows: 1,
              body: this.buildTableBody(data, columns)
          }
      };
  }

  generarPDF() {
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = {
      content: [
        {
        text: this.dateToday(),
        width: '*',
        alignment: 'right',
        style: 'small'
      },
        {
        text: 'Familias escaneadas',
        width: '*',
        alignment: 'center',
        style: 'header'
      },
      {
        width: '*',
        alignment: 'left',
        style: 'subheader',
        text: 'Registro de todas las familias escaneadas desde  ' +
        new Date(this.startDate).toISOString().replace(/T.*/, '').split('-').reverse().join('/')
        + '  hasta  ' + new Date(this.endDate).toISOString().replace(/T.*/, '').split('-').reverse().join('/')
      },
      {
        style: 'tableExample',
        table: {
          body: [
            ['ID', 'Cédula', 'Serial', 'createdAt']
          ]
        }
      }
        // this.table(this.jsonvalue, ['id', 'cedula', 'serial', 'createdAt', 'endDate'])
          // {
          //   columns: [
          //     [{
          //       text: 'Firstname : '
          //     },
          //     {
          //       text: 'Lastname : '
          //     },
          //     {
          //       text: 'Username : '
          //     },
          //     {
          //       text: 'Email : '
          //     }]
          //   ]}
      ],
      styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      },
      small: {
        fontSize: 8,
      }
    }
    };
    pdfmake.createPdf(docDefinition).open();
  }
}
