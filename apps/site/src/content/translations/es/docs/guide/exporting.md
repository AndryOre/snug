---
title: Exportar marcadores
sourceHash: 2c9f860aa372f840
---

1. Exportación rápida: en el popup, elige un formato y haz clic en "Exportar
   todo" para exportar todo tu árbol de marcadores.
2. Para controlar qué se exporta, abre la página **Exportar** de la app:
   - Usa el cuadro de búsqueda para encontrar marcadores concretos.
   - Marca marcadores individuales o carpetas completas (o usa "Seleccionar
     todos los marcadores").
   - Ajusta el panel **Opciones de exportación** (favicons, fechas, ocultar
     carpetas, plantilla de nombre de archivo).
   - Elige el formato de exportación y haz clic en "Exportar N marcadores".

## Formatos de exportación

Snug exporta seis formatos:

| Formato  | Extensión | Ideal para                                                          |
| -------- | --------- | ------------------------------------------------------------------- |
| HTML     | `.html`   | Importar en cualquier navegador (archivo de marcadores Netscape).   |
| JSON     | `.json`   | Restaurar en Snug con las carpetas y ubicaciones raíz intactas.     |
| CSV      | `.csv`    | Hojas de cálculo; una fila por marcador con una columna `folder`.   |
| Markdown | `.md`     | Notas y wikis; las carpetas se convierten en encabezados y listas.  |
| OPML     | `.opml`   | Lectores de feeds y herramientas de esquemas.                       |
| XBEL     | `.xbel`   | Otros gestores de marcadores que leen el formato XML de marcadores. |

Markdown y OPML son solo de exportación: Snug no puede volver a importarlos.

## Progreso y Cancelar

Una exportación o importación larga muestra una tarjeta de progreso con un
conteo en curso. Haz clic en **Cancelar** para detenerla. Una exportación
cancelada no descarga ningún archivo. Una importación cancelada elimina los
marcadores que ya había añadido, y un Restaurar — reemplazar cancelado devuelve
tus marcadores anteriores desde la instantánea de seguridad. Cancelar un lote de
importación devuelve tus marcadores a como estaban antes de que empezara el
lote.

## Nombres de los archivos exportados

De forma predeterminada, los archivos exportados se llaman
`Bookmarks_<fecha>_<hora>` (por ejemplo `Bookmarks_2026-10-03_14-05-09`). Para
personalizarlo:

1. Abre la página **Exportar** de la app (el mismo panel aparece en
   **Auto-export**).
2. En **Opciones de exportación**, edita "Plantilla de nombre de archivo". Una
   vista previa en vivo muestra el nombre de archivo resultante mientras
   escribes.
3. Usa estos marcadores de posición (sin distinguir mayúsculas de minúsculas)
   para incluir la fecha y la hora actuales:

   | Marcador de posición | Valor   |
   | -------------------- | ------- |
   | `%yyyy`              | Año (4) |
   | `%yy`                | Año (2) |
   | `%mm`                | Mes     |
   | `%dd`                | Día     |
   | `%hh`                | Hora    |
   | `%min`               | Minuto  |
   | `%sec`               | Segundo |

   Por ejemplo, `%yyyy%mm%dd myPc` produce `20260930 myPc.html` (y la extensión
   correspondiente para los demás formatos).

La plantilla se aplica en todos los lugares donde se genera un nombre de
archivo: la exportación básica del popup, la página Exportar y Auto-export. Los
caracteres no permitidos en nombres de archivo (`/ \ : * ? " < > |`) se
reemplazan por `_`, y una plantilla que quede vacía vuelve a usar "Bookmarks".
