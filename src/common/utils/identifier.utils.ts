/**
 * Normaliza el identificador de cuenta (el email que hace de nombre de usuario):
 * recorta los espacios del inicio y del final y lo convierte a minúsculas.
 *
 * Es una función pura y determinista: solo depende del valor recibido y no
 * accede al reloj, a HTTP ni a la capa de persistencia. No muta la entrada
 * (las cadenas son inmutables) y es idempotente, por lo que aplicarla de nuevo
 * sobre su resultado devuelve el mismo valor.
 */
export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}
