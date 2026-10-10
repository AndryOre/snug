---
title: Importar marcadores
sourceHash: 4c537c8e1b7a7231
---

1. Importación rápida, desde el popup:
   - Si quieres, cambia el modo de importación predeterminado (consulta
     [**Ajustes**](settings.md)); empieza en **Restaurar — combinar**.
   - Haz clic en "Elegir archivos…" y selecciona uno o más archivos de
     marcadores (consulta **Orígenes de importación** más abajo), o suéltalos en
     la sección Importar del popup. Aparece una superposición "Suelta los
     archivos para importar" mientras arrastras. Los archivos que sueltes
     mientras hay una importación en curso se ignoran.
   - La extensión detecta automáticamente cada formato e importa los marcadores
     de inmediato con el modo de importación predeterminado. Un archivo CSV, o
     cualquier otro archivo sin datos de la Barra de marcadores u Otros
     marcadores, siempre se importa en una carpeta nueva llamada "Marcadores
     importados", sin importar el modo predeterminado.
   - Varios archivos se importan juntos como un **lote de importación**
     (consulta más abajo). Un archivo que Snug no puede leer se deja fuera. La
     advertencia lista hasta tres archivos omitidos como `nombre: motivo` y
     luego "y N más".
   - Si el modo predeterminado es **Restaurar — reemplazar**, el popup solo
     muestra una advertencia en línea de que tus marcadores existentes se
     reemplazarán. Al elegir un archivo se abre la página **Importar** de la
     app, donde revisas el reemplazo y lo confirmas (antes se guarda una
     instantánea de seguridad, así que puedes deshacerlo). Las importaciones muy
     grandes también abren la página **Importar**.
2. Vista previa primero, desde la página **Importar** de la app:
   - Suelta o selecciona uno o más archivos de marcadores. Cada archivo recibe
     una fila con su formato detectado y el número de marcadores, o con el
     motivo por el que no se puede leer. Puedes quitar un archivo o usar
     **Añadir archivos** para agregar más.
   - Una vista previa detallada muestra el árbol de marcadores tal como se
     importaría. Los marcadores que Omitir duplicados dejaría fuera llevan una
     insignia `Duplicado · omitido`, para que puedas evaluar el archivo antes de
     que cambie nada.
   - Elige un modo de importación (preseleccionado según tu valor
     predeterminado):
     - **Crear carpeta**: añade todos los marcadores a una carpeta nueva
       "Marcadores importados". Disponible para cualquier archivo, incluido CSV
       (que no tiene estructura de carpetas que restaurar).
     - **Restaurar — combinar**: coloca los marcadores en sus ubicaciones
       originales junto a los existentes. Solo disponible para archivos
       JSON/HTML que incluyen datos de ubicación.
     - **Restaurar — reemplazar**: primero vacía tu Barra de marcadores y Otros
       marcadores actuales, y luego restaura los marcadores a sus ubicaciones
       originales. Solo disponible para archivos que incluyen datos de
       ubicación, y para un archivo a la vez.
   - Al seleccionar "Restaurar — reemplazar" se muestra cuántos marcadores
     eliminará y añadirá el reemplazo, se listan los marcadores que se
     eliminarán y se requiere confirmar un cuadro de advertencia antes de que se
     ejecute la importación.
   - **Omitir duplicados** (activado de forma predeterminada) deja fuera
     cualquier marcador cuya URL ya exista en tu navegador e indica cuántos de
     los marcadores seleccionados omitirá. Se aplica a Crear carpeta y a
     Restaurar — combinar, no a Restaurar — reemplazar. El interruptor se
     comparte con la importación rápida.

## Selección de importación

En Crear carpeta y Restaurar — combinar, el árbol de vista previa tiene casillas
de verificación. Marca marcadores sueltos, carpetas completas o una mezcla, y
Snug importa solo la **selección de importación**. Restaurar — reemplazar no
tiene selección: siempre importa todo.

## Lote de importación

Varios archivos importados a la vez se ejecutan como un **lote de importación**:
un solo modo de importación, una sola vista previa y un solo progreso. Snug
comprueba las URL existentes una sola vez, así que Omitir duplicados también
deja fuera un marcador que aparece en dos de los archivos.

- En Crear carpeta con dos o más archivos, cada archivo va a su propia carpeta,
  con el nombre del archivo (sin su extensión). Un solo archivo conserva la
  carpeta "Marcadores importados", y los archivos CSV siempre la usan.
- Restaurar — reemplazar necesita exactamente un archivo. Con dos o más archivos
  está desactivado, porque el segundo archivo borraría el primero.
- Un archivo que no se puede leer se deja fuera al momento de la vista previa y
  aparece en el resultado.
- Cancelar, o un fallo a mitad del proceso, devuelve tus marcadores a como
  estaban antes de que empezara el lote.

## Orígenes de importación

Snug detecta el formato a partir del tipo MIME del archivo, luego su extensión y
después su contenido. Lee:

- Exportaciones de Snug y de navegadores: HTML (archivo de marcadores Netscape),
  JSON, CSV y XBEL.
- Un archivo `Bookmarks` de un perfil de Chrome (el archivo JSON sin procesar
  dentro de la carpeta de un perfil de Chrome). Sus carpetas quedan en sus
  ubicaciones originales.
- Una exportación de Safari (HTML). Favoritos pasa a ser la Barra de marcadores;
  la Lista de lectura y las demás carpetas de Safari quedan en Otros marcadores,
  con la Lista de lectura en su propia carpeta.

## La instantánea de seguridad y Deshacer

Antes de cada Restaurar — reemplazar, Snug guarda una **instantánea de
seguridad** de tu Barra de marcadores y Otros marcadores: un archivo JSON en tu
carpeta de Descargas (`snug-safety-snapshot-<fecha>.json`), además de una copia
guardada dentro de la extensión. La confirmación del reemplazo te lo indica y
enlaza a la tarjeta de instantáneas de seguridad en Ajustes. Si no se puede
guardar la instantánea, no se elimina nada.

- Tras un reemplazo, **Deshacer importación** en el resultado restaura la
  instantánea.
- En **Ajustes**, la tarjeta de instantáneas de seguridad lista las últimas
  cinco. Puedes restaurar o descargar cualquiera, tras confirmar, y tomar una
  nueva en cualquier momento.

Snug conserva las últimas cinco instantáneas, así que una sexta reemplaza a la
más antigua, salvo que la instantánea más reciente que contenga marcadores nunca
se descarta. Restaurar una instantánea es en sí un reemplazo, así que Snug
guarda primero una nueva instantánea de tus marcadores actuales. Todo se queda
en tu dispositivo y Snug no hace solicitudes de red.
