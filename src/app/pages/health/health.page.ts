import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Subscription
} from 'rxjs';

import {
  AppLauncher
} from '@capacitor/app-launcher';

import {
  AuthService
} from '../../services/auth.service';

import {
  BluetoothService
} from '../../services/bluetooth.service';


@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: false
})
export class HealthPage
  implements OnInit, OnDestroy {


  // USUARIO

  nombreUsuario = 'Usuario';


  // DATOS DEL SENSOR

  bpm = 0;

  rrInterval = 0;

  conectado = false;


  // MENSAJE

  mensaje = '';


  // CONTACTO PROVISIONAL

  nombreContacto =
    'Roberto Trujillo';

  tipoContacto =
    'Contacto de apoyo';

  numeroContacto =
    '6561234567';


  // SUBSCRIPCIONES

  private bpmSubscription?: Subscription;

  private conexionSubscription?: Subscription;


  constructor(

    private router: Router,

    private authService: AuthService,

    private bluetoothService: BluetoothService

  ) {}


  ngOnInit(): void {

    this.cargarNombreUsuario();

    this.escucharSensor();

  }


  /*
   * CARGAR NOMBRE DEL USUARIO
   */

  private cargarNombreUsuario(): void {

    const usuario =
      this.authService.getUsuarioActual();


    if (
      usuario &&
      usuario.displayName
    ) {

      this.nombreUsuario =
        usuario.displayName;

    } else {

      this.nombreUsuario =
        'Usuario';

    }

  }


  /*
   * ESCUCHAR DATOS DEL SENSOR
   */

  private escucharSensor(): void {


    // BPM

    this.bpmSubscription =
      this.bluetoothService.bpm$
        .subscribe((bpm: number) => {

          this.bpm = bpm;


          if (bpm > 0) {

            this.rrInterval =
              Math.round(
                60000 / bpm
              );

          } else {

            this.rrInterval = 0;

          }

        });


    // ESTADO DE CONEXIÓN

    this.conexionSubscription =
      this.bluetoothService.conectado$
        .subscribe((estado: boolean) => {

          this.conectado = estado;


          if (!estado) {

            this.bpm = 0;

            this.rrInterval = 0;

          }

        });

  }


  async conectarSensor(): Promise<void> {

  try {

    await this.bluetoothService.buscarYConectar();

    console.log('Sensor Heartbit conectado');

  } catch (error) {

    console.error(
      'No se pudo conectar con Heartbit:',
      error
    );
  }
}


async desconectarSensor(): Promise<void> {

  try {

    await this.bluetoothService.desconectar();

    console.log('Sensor desconectado');

  } catch (error) {

    console.error(
      'Error al desconectar:',
      error
    );
  }
}


  /*
   * ABRIR DIAGNÓSTICO
   */

  abrirDiagnostico(): void {

    this.router.navigateByUrl(
      '/diagnostico'
    );

  }


  /*
   * LLAMAR AL CONTACTO
   */

  async llamarContacto(): Promise<void> {

    try {

      await AppLauncher.openUrl({

        url:
          `tel:${this.numeroContacto}`

      });

    } catch (error) {

      console.error(
        'No se pudo abrir la aplicación de teléfono:',
        error
      );

    }

  }


  /*
   * ENVIAR SMS
   */

  async enviarMensaje(): Promise<void> {

    const mensajeLimpio =
      this.mensaje.trim();


    if (!mensajeLimpio) {

      return;

    }


    const mensajeCodificado =
      encodeURIComponent(
        mensajeLimpio
      );


    try {

      await AppLauncher.openUrl({

        url:
          `sms:${this.numeroContacto}?body=${mensajeCodificado}`

      });


      this.mensaje = '';

    } catch (error) {

      console.error(
        'No se pudo abrir la aplicación de mensajes:',
        error
      );

    }

  }


  /*
   * LIMPIAR SUBSCRIPCIONES
   */

  ngOnDestroy(): void {

    this.bpmSubscription
      ?.unsubscribe();

    this.conexionSubscription
      ?.unsubscribe();

  }

}