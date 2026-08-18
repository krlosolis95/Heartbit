import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {

  nombre = '';
  correo = '';
  password = '';
  confirmarPassword = '';

  mostrarError = false;
  cargando = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async registrar(): Promise<void> {

    this.mostrarError =
      !this.nombre.trim() ||
      !this.correo.trim() ||
      !this.password.trim() ||
      !this.confirmarPassword.trim();

    if (this.mostrarError) {
      return;
    }

    if (this.password !== this.confirmarPassword) {

      await this.mostrarMensaje(
        'Las contraseñas no coinciden'
      );

      return;
    }

    if (this.password.length < 6) {

      await this.mostrarMensaje(
        'La contraseña debe tener al menos 6 caracteres'
      );

      return;
    }

    this.cargando = true;

    try {

      const resultado =
        await this.authService.registrar(
          this.nombre.trim(),
          this.correo.trim(),
          this.password
        );

      console.log(
        'Usuario creado:',
        resultado.user.uid
      );

      await this.mostrarMensaje(
        'Cuenta creada correctamente'
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
        'auth/email-already-in-use'
      ) {

        await this.mostrarMensaje(
          'Este correo ya está registrado'
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
        'auth/weak-password'
      ) {

        await this.mostrarMensaje(
          'La contraseña es demasiado débil'
        );

      } else {

        await this.mostrarMensaje(
          'No se pudo crear la cuenta'
        );

      }

    } finally {

      this.cargando = false;

    }

  }

  volver(): void {

    this.router.navigateByUrl(
      '/login'
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