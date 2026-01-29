# Plan: Impresión de tickets para OTP y Débito Inmediato (éxito y fallido)

## Objetivo
Imprimir ticket térmico en los flujos de **Débito Inmediato (OTP)** en dos casos:
- **Éxito**: cuando el back responde con `response.status === 200 && response.data.status === true`.
- **Fallido**: cuando el back responde con error o `response.data.status === false`.

Sin alterar la lógica actual de impresión de **puntos Ubi** (punto de venta).

---

## Estado actual

| Flujo | ¿Imprime ticket? | Dónde |
|-------|------------------|--------|
| Puntos Ubi (POS) | Sí | `modal-payment.component.ts`: al recibir `resPay.data.TRANS_CODE_RESULT === '00'` se arma `IPrintTicket`, se guarda en `lastVoucher`, se llama `_directPrinter.printTicket()` y luego `_pdfService.ticketCreateAndUpload()` con `skip_print: true`. |
| Débito Inmediato (OTP) | No | `handleSuccessfulDebitoPayment()` solo muestra Swal y emite `onSubmitPayForm`. En fallo solo se muestra Swal. |

- **Interfaz del ticket**: `IPrintTicket` en `src/app/interfaces/printer.interface.ts` (date, hours, refNumber, numSeq, abononumber, status, describe, amount, methodPayment, checkoutIdentify, id_sede, is_anulation, etc.).
- **Impresión local**: `DirectPrinterService.buildTicketText()` ya usa `data.status`; si contiene `'APROBAD'` muestra "PAGO APROBADO", si no muestra el texto tal cual (ej. "RECHAZADO" o "PAGO FALLIDO"). No hace falta cambiar la interfaz para éxito/fallido.
- **Respuesta back débito**: `IProcessDebitoResponse` con `data.status`, `data.message`, `data.paymentDetails.reference`, `data.paymentDetails.code`, `data.paymentDetails.success`.

---

## Plan de implementación

### 1. Crear función auxiliar para armar el ticket de débito
**Archivo**: `modal-payment.component.ts`

- **Función**: `buildDebitoTicket(success: boolean, response: IProcessDebitoResponse, formData: any): IPrintTicket`
- **Éxito**:
  - `refNumber` = `response.data.paymentDetails.reference`
  - `numSeq` = `response.data.paymentDetails.code` o `'-'`
  - `status` = `'APROBADO'`
  - `describe` = `'Pago Débito Inmediato'` (o concepto si viene en response)
  - `amount` = `formData.monto`
  - `methodPayment` = `'Débito Inmediato (OTP)'`
  - Resto: `date`/`hours` con `this.dateNew`, `abononumber` = `this.nroAbonado`, `checkoutIdentify`/`id_sede` desde `LocalstorageService`, `is_anulation: false`.
- **Fallido**:
  - `refNumber` = `response?.data?.paymentDetails?.reference ?? 'N/A'`
  - `numSeq` = `'-'`
  - `status` = `'RECHAZADO'` o `'PAGO FALLIDO'` (el texto que quieras ver en el ticket)
  - `describe` = `response?.data?.message ?? 'Pago no procesado'`
  - Mismo resto de campos (amount, methodPayment, fecha, abonado, etc.).

Así se reutiliza `IPrintTicket` y `buildTicketText()` sin tocar la impresora ni la API driver.

### 2. Imprimir en caso de éxito (Débito/OTP)
**Archivo**: `modal-payment.component.ts`

- Dentro de `onDebitoFormComplete`, cuando `response.status === 200 && response.data.status === true`:
  1. Construir ticket con `buildDebitoTicket(true, response, formData)`.
  2. **Opcional pero recomendado**: guardar en `lastVoucher` con `_localStorageService.set<IPrintTicket>('lastVoucher', ticket)` para que "Imprimir último voucher" del panel admin pueda reimprimir este ticket (mismo criterio que Ubi).
  3. Llamar `await this._directPrinter.printTicket(ticket)` (en try/catch, sin bloquear flujo si falla la impresión).
  4. Si se desea registro digital igual que Ubi: llamar `_pdfService.ticketCreateAndUpload({ ...ticket, skip_print: true })` en try/catch (opcional).
  5. Mantener la llamada actual a `handleSuccessfulDebitoPayment(response, formData)` (Swal + emit).

No modificar el bloque existente de Ubi (`resPay.data.TRANS_CODE_RESULT === '00'`).

### 3. Imprimir en caso de fallido (Débito/OTP)
**Archivo**: `modal-payment.component.ts`

- En el `else` de débito (cuando el pago no es exitoso):
  1. Construir ticket con `buildDebitoTicket(false, response, formData)` (usar `response` aunque venga con status/error; si no hay response por excepción, ver punto 4).
  2. **No** guardar en `lastVoucher` (el "último voucher" sigue siendo el último exitoso, Ubi o débito).
  3. Llamar `await this._directPrinter.printTicket(ticket)` en try/catch.
  4. No llamar `ticketCreateAndUpload` para fallidos (a menos que el negocio pida guardar comprobante de intento fallido).

- Si el fallo viene por **excepción** (catch de `processDebitoPayment`), no hay `IProcessDebitoResponse`. Opciones:
  - Construir un ticket mínimo con `describe: error.message`, `status: 'PAGO FALLIDO'`, `refNumber: 'N/A'`, mismo amount/método desde `formData`, e imprimir; o
  - No imprimir en catch y solo imprimir cuando hay respuesta del back con `data.status === false`. Recomendación: imprimir también en catch con ticket “fallido” genérico para que el usuario tenga constancia.

### 4. No tocar
- `DirectPrinterService`: `buildTicketText()` ya trata cualquier `status`; no hace falta parámetro nuevo.
- Flujo Ubi: ni el `if (resPay.data.TRANS_CODE_RESULT === '00')` ni la construcción de `digitalTicket` ni `lastVoucher` para Ubi.
- `action-admin` (Imprimir último voucher): sigue usando `lastVoucher`; si solo guardas en `lastVoucher` el ticket de **éxito** (Ubi o débito), el comportamiento queda coherente.
- Interfaz `IPrintTicket`: no es obligatorio añadir campos; con `status` y `describe` basta para éxito/fallido.

---

## Resumen de cambios por archivo

| Archivo | Cambio |
|---------|--------|
| `modal-payment.component.ts` | 1) Método `buildDebitoTicket(success, response, formData)`. 2) En éxito débito: construir ticket, guardar `lastVoucher`, imprimir, opcional upload. 3) En fallo débito (else + catch): construir ticket fallido e imprimir (no guardar `lastVoucher`). |
| `printer.interface.ts` | Sin cambios (opcional: añadir `ticketType?: 'success' \| 'failed'` si más adelante se quiere distinguir en API/analytics). |
| `direct-printer.service.ts` | Sin cambios. |
| Flujo Ubi en `modal-payment` | Sin cambios. |

---

## Recomendaciones

1. **Misma forma de ticket que Ubi**: Reutilizar `IPrintTicket` y `DirectPrinterService.printTicket()`; solo cambiar el origen de los datos (response débito en lugar de response Ubi). Así no se duplica lógica ni se rompe la impresión de puntos.
2. **lastVoucher solo para éxitos**: Guardar en `lastVoucher` solo cuando el pago débito sea exitoso; en fallido solo imprimir, no reemplazar `lastVoucher`. Así "Imprimir último voucher" del panel admin sigue siendo el último comprobante exitoso (Ubi o débito).
3. **Impresión en try/catch**: Tanto en éxito como en fallo, envolver `_directPrinter.printTicket()` en try/catch y no bloquear el flujo ni el cierre del modal si la impresora falla (igual que en Ubi).
4. **Ticket fallido en catch**: Si se desea uniformidad, en el `catch` de `processDebitoPayment` construir un ticket fallido con mensaje genérico y también imprimirlo.
5. **Upload digital (éxito)**: Si quieren registro en API/PDF igual que Ubi, llamar a `ticketCreateAndUpload` solo para débito exitoso, con `skip_print: true`.
6. **Texto en ticket fallido**: Usar `status: 'RECHAZADO'` o `'PAGO FALLIDO'` y `describe: response.data.message` para que en el ticket se vea claro el motivo del fallo.

---

## Orden sugerido de implementación

1. Implementar `buildDebitoTicket()` y usarlo solo en el caso **éxito**: imprimir + guardar `lastVoucher` + opcional upload. Probar.
2. Añadir impresión en el **fallo** (cuando `response.data.status === false`).
3. Opcional: añadir impresión en el **catch** con ticket fallido genérico.
4. Revisar que "Imprimir último voucher" del panel admin siga mostrando solo el último éxito (Ubi o débito).

Con esto se cubren los dos casos (éxito y fallido) basados en la respuesta del back y se mantiene intacta la lógica de impresión de puntos Ubi.

---

## Flujo completo implementado (resumen)

| Paso | Éxito (response.status 200 y data.status true) | Fallido (respuesta del back) | Fallido (excepción / catch) |
|------|-----------------------------------------------|------------------------------|----------------------------|
| 1 | `buildDebitoTicket(true, response, formData)` | `buildDebitoTicket(false, response, formData)` | `buildDebitoTicket(false, null, formData, error.message)` |
| 2 | `printDebitoTicket(ticket, { saveLastVoucher: true, uploadDigital: true })` | `printDebitoTicket(ticket)` | `printDebitoTicket(ticket)` |
| 3 | `handleSuccessfulDebitoPayment(response, formData)` (Swal + emit) | Swal error + mensaje del back | Swal error + mensaje de excepción |

- **lastVoucher**: solo se actualiza en éxito (para que "Imprimir último voucher" del panel admin sea el último éxito).
- **Impresión**: siempre en try/catch dentro de `printDebitoTicket`; no bloquea el flujo si falla la impresora.
- **Upload digital**: solo en éxito, con `skip_print: true` (igual que Ubi).
- **Texto en ticket fallido**: `status: 'RECHAZADO'`, `describe: response.data.message` o `error.message`.
