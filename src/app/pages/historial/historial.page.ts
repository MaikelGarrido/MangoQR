import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { NavController, ToastController, Platform, AlertController, LoadingController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { isBefore, parseISO } from 'date-fns';


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

  date = new Date();
  dia = this.date.getDate();
  mes = this.date.getMonth();
  año = this.date.getFullYear();
  fecha = `${this.dia}/${this.mes}/${this.año}`;

  startDate = '';
  endDate = '';

  constructor(public db: AngularFirestore,
              public navCtrl: NavController,
              public file: File,
              public fileOpener: FileOpener,
              public toastCtrl: ToastController,
              public platform: Platform,
              public alertController: AlertController,
              public loadingCtrl: LoadingController) {
    // this.itemsCollection = db.collection<QR>('QR');

    // this.itemsCollection = db.collection<QR>('QR', ref => ref.orderBy('createdAt', 'desc'));
    // this.QR = this.itemsCollection.valueChanges();
  }

  async loadResults() {

    if (!this.startDate || !this.endDate) {
        console.log('Calculando fecha');
        console.log(this.startDate);
        console.log(this.endDate);
        return;
    }

    const fecha1 = new Date(this.startDate).toISOString().replace(/T.*/, '').split('-').reverse().join('/');
    const fecha2 = new Date(this.endDate).toISOString().replace(/T.*/, '').split('-').reverse().join('/');
    console.log('Fecha inicial:' + fecha1 );
    console.log('Fecha final:' + fecha2 );

    this.itemsCollection = this.db.collection('QR', ref =>
    ref.where('createdAt', '>=', fecha1) && ref.where('endDate', '<=', fecha2));
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

    const data = [
      ['Cédula', 'Serial', 'Fecha escaneado']
    ];

    this.data.forEach(user => {
      data.push([user.cedula, user.serial, user.createdAt]);
      console.log('position', user);
    });

    if (this.data.length === 0) {
      this.presentAlert();
      return false;
    }


    const docDefinition = {
      footer: (currentPage, pageCount) =>
      ({ text: currentPage.toString() + ' de ' + pageCount, alignment: 'center'}),

      content: [
        {
        text: this.fecha,
        width: '*',
        alignment: 'right',
        style: 'small'
      },
        {
        text: 'Personas escaneadas',
        width: '*',
        alignment: 'center',
        style: 'header'
      },
      {
        width: '*',
        alignment: 'center',
        style: 'subheader',
        text: 'Registro de todos los QR escaneados'
      },
      {
        columns: [
          { width: '*', text: ''},
          {
            width: 'auto',
            table: {
              body: data,
              widths: ['*', '*', '*']
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

    async openPDF() {
      const loading = await this.loadingCtrl.create({
        mode: 'ios',
        message: 'Generando PDF...',
        spinner: 'lines-small'
      });
      await loading.present();
      if (this.platform.is('cordova')) {
        this.pdf.getBuffer((buffer) => {
          const blob = new Blob([ buffer ], { type: 'application/pdf' });
          this.file
            .writeFile(this.file.dataDirectory, 'Escaneados.pdf', blob, { replace: true })
            .then(async (fileEntry) => {
              // tslint:disable-next-line: no-shadowed-variable
              const toast = await this.toastCtrl.create({
                message: '¡PDF creado exitosamente!',
                mode: 'ios',
                duration: 3000,
                position: 'top'
              });
              toast.present();
              this.fileOpener.open(
                this.file.dataDirectory + 'Escaneados.pdf',
                'application/pdf'
              );
            });
        });
        loading.dismiss();
        return true;
      }
      const toast = await this.toastCtrl.create({
        message: '¡PDF creado exitosamente!',
        mode: 'ios',
        duration: 3000,
        position: 'top'
      });
      toast.present();
      this.pdf.download();
      loading.dismiss();
    }

    async presentAlert() {
      const alert = await this.alertController.create({
        header: 'Alerta',
        message: 'No hay registro',
        mode: 'ios',
        buttons: ['OK']
      });
      await alert.present();
    }

    // async presentLoading() {
    //   const loading = await this.loadingCtrl.create({
    //     mode: 'ios',
    //     message: 'Generando PDF...',
    //     spinner: 'lines-small'
    //   });
    //   await loading.present();
    //   if (this.platform.is('cordova')) {
    //     this.pdf.getBuffer((buffer) => {
    //       const blob = new Blob([ buffer ], { type: 'application/pdf' });
    //       this.file
    //         .writeFile(this.file.dataDirectory, 'Escaneados.pdf', blob, { replace: true })
    //         .then(async (fileEntry) => {
    //           // tslint:disable-next-line: no-shadowed-variable
    //           const toast = await this.toastCtrl.create({
    //             message: '¡PDF creado exitosamente!',
    //             mode: 'ios',
    //             duration: 3000,
    //             position: 'top'
    //           });
    //           toast.present();
    //           this.fileOpener.open(
    //             this.file.dataDirectory + 'Escaneados.pdf',
    //             'application/pdf'
    //           );
    //         });
    //     });
    //     return true;
    //   loading.dismiss();
    // }
}
