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
  getDatabase,
  ref,
  set
} from 'firebase/database';

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

  private database =
    getDatabase(this.app);


  constructor() {}


  async registrar(
    nombre: string,
    email: string,
    password: string
  ): Promise<UserCredential> {

    // 1. CREAR USUARIO EN FIREBASE AUTH

    const resultado =
      await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );


    // 2. GUARDAR NOMBRE EN FIREBASE AUTH

    await updateProfile(
      resultado.user,
      {
        displayName: nombre
      }
    );


    // 3. CREAR PERFIL EN REALTIME DATABASE

    await set(
      ref(
        this.database,
        `users/${resultado.user.uid}/perfil`
      ),
      {
        nombre: nombre,
        email: email,
        fechaRegistro:
          new Date().toISOString()
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