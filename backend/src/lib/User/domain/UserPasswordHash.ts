/**
 * Clase para almacenar y validar hashes de contraseñas
 * No realiza validaciones de formato, solo verifica que el hash no esté vacío
 */
export class UserPasswordHash {
  readonly value: string; // Este es el hash de la contraseña

  constructor(value: string) {
    if (!value) {
      throw new Error('Password hash cannot be empty.');
    }
    this.value = value;
  }
}
