import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { NavController, ToastController, Platform } from '@ionic/angular';
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
  private data = [];
  pdf: any;

  startDate = new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/');
  endDate = new Date().toISOString().replace(/T.*/, '').split('-').reverse().join('/');

  constructor(public db: AngularFirestore,
              public navCtrl: NavController,
              public file: File,
              public fileOpener: FileOpener,
              public toastCtrl: ToastController,
              public platform: Platform) {
    // this.itemsCollection = db.collection<QR>('QR');

    // this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    // this.QR = this.itemsCollection.valueChanges();
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

    this.itemsCollection = this.db.collection('QR', ref =>
    ref.where('createdAt', '>=', fecha1)
    && ref.where('endDate', '<=', fecha2));

    this.QR = this.itemsCollection.valueChanges();
    this.data = [];

    const userDoc = this.itemsCollection;
    userDoc.get().subscribe((querySnapshot) => {
      querySnapshot.forEach((doc => {
        // console.log(doc.id, '=>', doc.data());
        this.data.push(doc.data());
      }));
    });

    // this.db.collection('QR', ref => ref.where('createdAt', '>=', fecha1) && ref.where('endDate', '<=', fecha2)).get().subscribe(ref => {
    //   const jsonvalue: any[] = [];
    //   ref.forEach(docs => {
    //     jsonvalue.push(docs.id);
    //   });
    //   console.log(jsonvalue);
    //   return;
    //   // }).catch( error => {
    //   //     res.status(500).send(error);
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
  // dateToday() {
  //   const date = new Date().toISOString().slice(0, 10);
  //   this.startDate = date.split('-')[2] + '-' + date.split('-')[1] + '-' + date.split('-')[0];
  // }

  generarPDF() {
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    const self = this;

    const data = [
      ['Cédula', 'Serial', 'Fecha escaneado']
    ];

    this.data.forEach(user => {
      data.push([user.cedula, user.serial, user.createdAt]);
      console.log('position', user);
    });


    const docDefinition = {
      footer: (currentPage, pageCount) =>
      ({ text: currentPage.toString() + ' de ' + pageCount, alignment: 'center'}),

      content: [
        {
        text: '',
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
        alignment: 'center',
        style: 'subheader',
        text: 'Registro de todas las familias escaneadas'
      },
      {
        columns: [
          { width: '*', text: ''},
          {
            width: 'auto',
            table: {
              body: data
            }
          },
          { width: '*', text: ''}
        ]
      }
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
        margin: [0, 5, 0, 15],

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

    this.pdf = pdfmake.createPdf(docDefinition);
    this.openPDF();
    // this.pdf.download();
    // pdfmake.createPdf(docDefinition).open();
  }

    openPDF() {
      if (this.platform.is('cordova')) {
        this.pdf.getBuffer((buffer) => {
          const blob = new Blob([ buffer ], { type: 'application/pdf' });
          this.file
            .writeFile(this.file.dataDirectory, 'Bitacora.pdf', blob, { replace: true })
            .then((fileEntry) => {
              this.fileOpener.open(
                this.file.dataDirectory + 'Bitacora.pdf',
                'application/pdf'
              );
            });
        });
        return true;
      }
      this.pdf.download();
    }
}
