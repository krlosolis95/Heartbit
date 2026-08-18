import { Injectable } from '@angular/core';
import {
  BleClient,
  numberToUUID,
  BleDevice
} from '@capacitor-community/bluetooth-le';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  // Servicio estándar de frecuencia cardíaca BLE
  private readonly HEART_RATE_SERVICE =
    numberToUUID(0x180D);

  // Característica estándar Heart Rate Measurement
  private readonly HEART_RATE_CHARACTERISTIC =
    numberToUUID(0x2A37);

  private dispositivoActual?: BleDevice;

  private bpmSubject =
    new BehaviorSubject<number>(0);

  bpm$ = this.bpmSubject.asObservable();

  private conectadoSubject =
    new BehaviorSubject<boolean>(false);

  conectado$ =
    this.conectadoSubject.asObservable();

  constructor() {}

  async inicializar(): Promise<void> {

    try {

      await BleClient.initialize({
        androidNeverForLocation: true
      });

      console.log(
        'Bluetooth inicializado correctamente'
      );

    } catch (error) {

      console.error(
        'Error inicializando Bluetooth:',
        error
      );

      throw error;

    }

  }

  async buscarYConectar(): Promise<void> {

    try {

      await this.inicializar();

      console.log(
        'Buscando dispositivo Heartbit...'
      );

      const dispositivo =
        await BleClient.requestDevice({
          services: [
            this.HEART_RATE_SERVICE
          ]
        });

      console.log(
        'Dispositivo encontrado:',
        dispositivo
      );

      await BleClient.connect(
        dispositivo.deviceId,
        () => {

          console.log(
            'ESP32 desconectado'
          );

          this.conectadoSubject.next(
            false
          );

          this.bpmSubject.next(0);

        }
      );

      this.dispositivoActual =
        dispositivo;

      this.conectadoSubject.next(
        true
      );

      console.log(
        'ESP32 conectado'
      );

      await this.escucharLatidos();

    } catch (error) {

      console.error(
        'Error Bluetooth:',
        error
      );

      this.conectadoSubject.next(
        false
      );

      throw error;

    }

  }

  private async escucharLatidos():
    Promise<void> {

    if (!this.dispositivoActual) {

      return;

    }

    const deviceId =
      this.dispositivoActual.deviceId;

    await BleClient.startNotifications(

      deviceId,

      this.HEART_RATE_SERVICE,

      this.HEART_RATE_CHARACTERISTIC,

      (value: DataView) => {

        const bpm =
          this.leerHeartRate(value);

        console.log(
          'BPM recibido:',
          bpm
        );

        this.bpmSubject.next(
          bpm
        );

      }

    );

  }

  private leerHeartRate(
    data: DataView
  ): number {

    /*
      Heart Rate Measurement estándar BLE.

      Byte 0 = flags.

      Si el bit 0 es 0:
      BPM ocupa 8 bits.

      Si el bit 0 es 1:
      BPM ocupa 16 bits.
    */

    const flags =
      data.getUint8(0);

    const es16Bits =
      (flags & 0x01) !== 0;

    if (es16Bits) {

      return data.getUint16(
        1,
        true
      );

    }

    return data.getUint8(1);

  }

  async desconectar():
    Promise<void> {

    if (!this.dispositivoActual) {

      return;

    }

    try {

      await BleClient.disconnect(
        this.dispositivoActual.deviceId
      );

    } catch (error) {

      console.error(
        'Error al desconectar:',
        error
      );

    }

    this.dispositivoActual =
      undefined;

    this.conectadoSubject.next(
      false
    );

    this.bpmSubject.next(0);

  }

}