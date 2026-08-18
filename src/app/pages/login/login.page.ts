import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {

  usuario = '';
  password = '';

  mostrarError = false;
  cargando = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async iniciarSesion(): Promise<void> {

    this.mostrarError =
      !this.usuario.trim() ||
      !this.password.trim();

    if (this.mostrarError) {
      return;
    }

    this.cargando = true;

    try {

      await this.authService.iniciarSesion(
        this.usuario.trim(),
        this.password
      );

      await this.mostrarMensaje(
        'Bienvenido a Heartbit'
      );

      this.router.navigateByUrl(
        '/health',
        {
          replaceUrl: true
        }
      );

    } catch (error: any) {

      console.error(
        'Error Firebase:',
        error
      );

      if (
        error.code ===
        'auth/invalid-credential'
      ) {

        await this.mostrarMensaje(
          'Correo o contraseña incorrectos'
        );

      } else if (
        error.code ===
        'auth/invalid-email'
      ) {

        await this.mostrarMensaje(
          'El correo no es válido'
        );

      } else if (
        error.code ===
        'auth/user-disabled'
      ) {

        await this.mostrarMensaje(
          'Esta cuenta está deshabilitada'
        );

      } else {

        await this.mostrarMensaje(
          'No se pudo iniciar sesión'
        );

      }

    } finally {

      this.cargando = false;

    }

  }

  irRegistro(): void {

    this.router.navigateByUrl(
      '/register'
    );

  }

  private async mostrarMensaje(
    message: string
  ): Promise<void> {

    const toast =
      await this.toastController.create({
        message,
        duration: 1800,
        position: 'bottom'
      });

    await toast.present();

  }

}