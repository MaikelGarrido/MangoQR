import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { promise } from 'protractor';
import { resolve, reject } from 'q';
import { Router } from '@angular/router';
import { auth } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AFauth: AngularFireAuth, private router: Router ) { }

  login(cedula: string, password: string) {

// tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve, rejected) => {

      this.AFauth.auth.signInWithEmailAndPassword(cedula, password).then(user => {
        resolve(user);
      }).catch(err => rejected(err));
    });

  }

  logout() {

    this.AFauth.auth.signOut().then (() => {
      this.router.navigate(['./login']);
    });
  }


}
