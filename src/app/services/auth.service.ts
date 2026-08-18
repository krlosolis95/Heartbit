import { Injectable } from '@angular/core';

import {
  initializeApp
} from 'firebase/app';

import {
  Auth,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';

import {
  environment
} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private app =
    initializeApp(
      environment.firebaseConfig
    );

  private auth: Auth =
    getAuth(this.app);

  constructor() {}

  async registrar(
    nombre: string,
    email: string,
    password: string
  ): Promise<UserCredential> {

    const resultado =
      await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

    await updateProfile(
      resultado.user,
      {
        displayName: nombre
      }
    );

    return resultado;

  }

  async iniciarSesion(
    email: string,
    password: string
  ): Promise<UserCredential> {

    return await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

  }

  async cerrarSesion(): Promise<void> {

    await signOut(
      this.auth
    );

  }

  getUsuarioActual() {

    return this.auth.currentUser;

  }

}