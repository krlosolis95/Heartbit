import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { Router } from '@angular/router';

import {
  ToastController
} from '@ionic/angular';

import {
  Subscription
} from 'rxjs';

import {
  BluetoothService
} from '../../services/bluetooth.service';


@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.page.html',
  styleUrls: ['./diagnostico.page.scss'],
  standalone: false
})
export class DiagnosticoPage
  implements OnInit, OnDestroy {

  // LECTURA ACTUAL
  bpm: number = 0;

  rrInterval: number = 0;


  // LECTURAS REALES DE ESTA SESIÓN
  lecturasBpm: number[] = [];

  ultimosIntervalos: number[] = [];


  // ESTADÍSTICAS CALCULADAS
  promedioBpm: number = 0;

  maxBpm: number = 0;

  minBpm: number = 0;

  cantidadLecturas: number = 0;

  // ESTADO PARA SABER SI ESTÁ CONECTADO
  conectado : boolean = false;

  private conectadoSubscription?:Subscription;


  private bpmSubscription?: Subscription;


  constructor(
    private router: Router,
    private toastController: ToastController,
    private bluetoothService: BluetoothService
  ) {}


  ngOnInit(): void {

  this.bpmSubscription =
    this.bluetoothService.bpm$
      .subscribe((bpm: number) => {
        this.procesarLectura(bpm);
      });

  this.conectadoSubscription =
    this.bluetoothService.conectado$
      .subscribe((estado: boolean) => {
        this.conectado = estado;
      });
}


  private procesarLectura(
    bpm: number
  ): void {

    /*
      El BluetoothService puede emitir 0
      cuando todavía no hay una lectura.

      No guardamos esos valores como parte
      del chequeo.
    */

    if (bpm <= 0) {

      this.bpm = 0;
      this.rrInterval = 0;

      return;

    }


    // BPM ACTUAL

    this.bpm = bpm;


    // INTERVALO R-R CALCULADO

    this.rrInterval =
      Math.round(
        60000 / bpm
      );


    // GUARDAMOS LA LECTURA REAL

    this.lecturasBpm.push(
      bpm
    );


    // GUARDAMOS EL INTERVALO CALCULADO

    this.ultimosIntervalos.push(
      this.rrInterval
    );


    // SOLO MOSTRAMOS LOS ÚLTIMOS 4 R-R

    if (
      this.ultimosIntervalos.length > 4
    ) {

      this.ultimosIntervalos.shift();

    }


    // ACTUALIZAMOS ESTADÍSTICAS

    this.calcularEstadisticas();

  }


  private calcularEstadisticas(): void {

    if (
      this.lecturasBpm.length === 0
    ) {

      this.promedioBpm = 0;
      this.maxBpm = 0;
      this.minBpm = 0;
      this.cantidadLecturas = 0;

      return;

    }


    this.cantidadLecturas =
      this.lecturasBpm.length;


    const suma =
      this.lecturasBpm.reduce(
        (
          acumulado: number,
          valor: number
        ) => acumulado + valor,
        0
      );


    this.promedioBpm =
      Math.round(
        suma /
        this.lecturasBpm.length
      );


    this.maxBpm =
      Math.max(
        ...this.lecturasBpm
      );


    this.minBpm =
      Math.min(
        ...this.lecturasBpm
      );

  }


  volver(): void {

    this.router.navigateByUrl(
      '/health'
    );

  }


  async crearReporte(): Promise<void> {

    await this.mostrarAviso(
      'Reporte preparado'
    );

  }


  async compartir(): Promise<void> {

    await this.mostrarAviso(
      'Opción de compartir preparada'
    );

  }


  private async mostrarAviso(
    message: string
  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration: 1400,

        position: 'bottom'

      });


    await toast.present();

  }

  async conectarSensor(): Promise<void> {

  try {

    await this.bluetoothService.buscarYConectar();

    await this.mostrarAviso(
      'Sensor conectado correctamente'
    );

  } catch (error) {

    console.error(error);

    await this.mostrarAviso(
      'No fue posible conectar el sensor'
    );
  }
}


async desconectarSensor(): Promise<void> {

  await this.bluetoothService.desconectar();

  await this.mostrarAviso(
    'Sensor desconectado'
  );
}


  ngOnDestroy(): void {

  this.bpmSubscription
    ?.unsubscribe();

  this.conectadoSubscription
    ?.unsubscribe();
}

}