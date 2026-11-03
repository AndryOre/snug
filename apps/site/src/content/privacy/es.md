---
englishLastUpdated: November 3, 2026
---

# Política de privacidad de Snug

Última actualización: 3 de noviembre de 2026

## Introducción

Snug se compromete a proteger tu privacidad. Esta Política de privacidad explica
nuestras prácticas sobre la recogida, el uso y la divulgación de la información
que recibimos a través de nuestra extensión de navegador.

## Recogida y uso de la información

Snug no recoge, almacena ni transmite ningún dato personal de sus usuarios.
Nuestra extensión funciona por completo dentro de tu navegador y no envía tus
marcadores ni tus ajustes a servidores externos. El único contacto de red es la
página de despedida opcional que se describe más abajo en «Página de
desinstalación».

### Datos de los marcadores

- La extensión accede a los marcadores de tu navegador únicamente para
  exportarlos a archivos HTML, JSON, CSV, Markdown, OPML o XBEL, o para
  importarlos desde archivos HTML, JSON, CSV o XBEL, un archivo `Bookmarks` de
  un perfil de Chrome o una exportación de Safari. La página Duplicados también
  lee tus marcadores para encontrar copias de la misma dirección, y solo las
  elimina cuando lo confirmas.
- Este acceso ocurre solo cuando inicias de forma explícita una operación de
  importación o exportación, o cuando se ejecuta una exportación automática
  programada que has configurado (consulta "Exportación automática" más abajo).
- Tus datos de marcadores se procesan localmente en tu dispositivo y no se
  transmiten a nosotros ni a terceros.

### Favicons

- Para mostrar los iconos de los sitios junto a tus marcadores, la extensión lee
  los favicons mediante la API `_favicon` integrada en el navegador. Esta
  consulta busca favicons que tu navegador ya tiene en caché y no realiza
  ninguna solicitud de red a nosotros ni a los sitios marcados.

### Exportación automática

- Puedes activar, si quieres, la exportación automática programada de tus
  marcadores. Una vez activada, la extensión exporta tus marcadores con el
  intervalo que configures y guarda los archivos resultantes sin mostrar un
  cuadro para elegir la ubicación. De forma predeterminada se escriben
  directamente en la carpeta Descargas de tu dispositivo mediante la función de
  descargas del navegador. Si eliges una carpeta personalizada, se escriben en
  su lugar en una carpeta que hayas seleccionado en tu equipo mediante la API
  File System Access del navegador.
- Esto solo ocurre si activas de forma explícita la exportación automática y
  configuras una programación; está desactivada por defecto.
- Retención: tras cada exportación automática correcta, Snug elimina sus propios
  archivos exportados más antiguos que superen el número que establezcas (10 por
  defecto; 0 los conserva todos). Solo elimina los archivos que él mismo guardó,
  en la carpeta Descargas o en tu carpeta personalizada, y nunca toca otros
  archivos.
- Carpeta personalizada: la carpeta que eliges se recuerda en tu dispositivo
  para que las exportaciones automáticas puedan seguir escribiendo en ella. Es
  posible que el navegador te pida confirmar de nuevo el acceso. Los archivos
  nunca se envían a ningún servidor y elegir una carpeta no requiere ningún
  permiso adicional.
- Notificaciones: si una exportación automática falla, Snug muestra una
  notificación del sistema en tu dispositivo con el motivo. Puedes desactivarla
  en la página de Exportación automática. Las exportaciones correctas nunca
  notifican, y ningún contenido de las notificaciones sale de tu dispositivo.
- Permisos opcionales: los permisos `downloads` y `notifications` son
  opcionales. Snug solicita `downloads` cuando activas la exportación automática
  con el destino Descargas, cuando cambias el destino a Descargas o cuando usas
  «Exportar ahora» sin acceso a Descargas, y `notifications` solo cuando activas
  las notificaciones de errores. Si los rechazas, la función permanece
  desactivada y nada más cambia.

### Página de desinstalación

- Cuando desinstalas Snug, tu navegador abre una página de despedida en
  `https://snug.andryore.dev/goodbye/`. La dirección que Snug registra para ello
  incluye tres valores: la versión de la extensión, tu idioma y si las copias de
  seguridad programadas están activadas (`?lang=<code>&v=<version>&ae=<0|1>`).
  No incluye ningún identificador ni ninguno de tus marcadores.
- La página de despedida usa Umami, un servicio de analítica sin cookies, para
  contar la visita y el motivo en el que haces clic. No establece cookies.
  Elegir un motivo es opcional.

## Almacenamiento de datos

- Snug no almacena ningún dato de usuario, incluidos los marcadores, en
  servidores externos.
- Los archivos creados durante la exportación (manual o automática) se guardan
  directamente en tu dispositivo local: en tu carpeta Descargas mediante la
  función de descargas del navegador o, en las exportaciones automáticas, en la
  carpeta personalizada que elegiste mediante la API File System Access del
  navegador. Las exportaciones manuales y el archivo de instantánea de seguridad
  usan un enlace estándar `<a download>` y no necesitan el permiso `downloads`;
  solo las exportaciones automáticas guardadas en tu carpeta Descargas usan el
  permiso `downloads`, que es opcional y se solicita como se describe arriba.
- La extensión guarda tus preferencias y ajustes locales, como el tema, las
  opciones de visualización, las opciones de exportación, la plantilla del
  nombre de archivo y tu configuración de exportación automática, mediante el
  almacenamiento local del navegador (`storage.local`). Estos datos permanecen
  en tu dispositivo y nunca se transmiten a ningún sitio.
- Si eliges una carpeta personalizada para las exportaciones automáticas, Snug
  guarda la referencia del navegador a esa carpeta (un identificador de carpeta,
  no tus marcadores ni el contenido de la carpeta) en el almacenamiento local
  del navegador de la extensión (IndexedDB). Permanece en tu dispositivo y nunca
  se transmite a ningún sitio.
- Snug puede mostrar en la ventana emergente una tarjeta única y descartable que
  te invita a valorar la extensión en la tienda desde la que se instaló (Chrome
  Web Store o Microsoft Edge Add-ons) después de tu primera exportación
  correcta. Para mostrarla una sola vez, Snug guarda dos marcas de tiempo
  locales en `storage.local`: cuándo estuvo disponible la tarjeta y cuándo la
  descartaste. No contienen contenido de marcadores, información personal ni
  identificadores, y nunca se transmiten a ningún sitio. La tarjeta es solo un
  enlace: abrir la página de la tienda es decisión tuya, y el propio Snug no
  realiza ninguna solicitud de red para ello.
- Antes de cada importación con "Restaurar — reemplazar", y siempre que decidas
  crear una en Ajustes, Snug guarda una instantánea de seguridad de tu barra de
  marcadores y de los demás marcadores para que la importación se pueda
  deshacer. Esto almacena el contenido de tus marcadores (títulos, direcciones y
  estructura de carpetas) de forma local en el almacenamiento local del
  navegador, conservando las cinco últimas instantáneas, y además guarda cada
  una como archivo en tu carpeta Descargas. Nunca sale de tu dispositivo.

## Permisos

Snug solicita los siguientes permisos del navegador, cada uno usado únicamente
para el fin descrito:

| Permiso            | Finalidad                                                                                                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmarks`        | Leer y escribir los marcadores de tu navegador para admitir la importación y la exportación.                                                                                                                                                                                                                          |
| `favicon`          | Mostrar los iconos de los sitios junto a los marcadores mediante la API `_favicon` integrada en el navegador.                                                                                                                                                                                                         |
| `storage`          | Guardar tus preferencias y ajustes locales en tu dispositivo.                                                                                                                                                                                                                                                         |
| `alarms`           | Programar y activar las exportaciones automáticas de marcadores con el intervalo configurado.                                                                                                                                                                                                                         |
| `downloads`        | Opcional. Se solicita cuando activas la exportación automática con el destino Descargas, cambias el destino a Descargas o usas «Exportar ahora» sin acceso a Descargas. Guardar las exportaciones automáticas en tu carpeta Descargas y eliminar los archivos de exportación automática antiguos de Snug (Retención). |
| `notifications`    | Opcional. Se solicita solo cuando activas las notificaciones de errores. Mostrar una notificación en tu dispositivo cuando falla una exportación automática. Puedes desactivarla.                                                                                                                                     |
| `unlimitedStorage` | Conservar en tu dispositivo las cinco últimas instantáneas de seguridad de tus marcadores, que pueden ser grandes en bibliotecas extensas.                                                                                                                                                                            |
| `offscreen`        | Crear un documento oculto de corta duración para que una exportación automática se convierta en un archivo descargable. No tiene interfaz y no carga contenido remoto.                                                                                                                                                |

## Servicios de terceros

Nuestra extensión no se integra con ningún servicio de terceros ni herramienta
de analítica, ni los utiliza. La única excepción es la página de despedida de
nuestro sitio web, que usa Umami (sin cookies) como se describe arriba en
«Página de desinstalación».

## Cambios en esta Política de privacidad

Podemos actualizar nuestra Política de privacidad de vez en cuando. Te
avisaremos de cualquier cambio publicando la nueva Política de privacidad en
esta página y actualizando la fecha de "Última actualización" que aparece al
principio de esta política.

## Contacto

Si tienes alguna pregunta sobre esta Política de privacidad, ponte en contacto
con nosotros:

- Por correo electrónico: hello@andryore.dev
- Abriendo una incidencia en nuestro repositorio de GitHub:
  https://github.com/AndryOre/snug/issues

## Consentimiento

Al usar Snug, consientes nuestra Política de privacidad y aceptas sus términos.
