---
title: Auto-export
sourceHash: 3b23ffc5e9f86ebd
---

Snug puede exportar tus marcadores según un horario, sin ninguna acción manual:

1. Abre la página **Auto-export** de la app.
2. Activa la exportación automática, elige uno o más de los seis formatos, un
   intervalo y, si quieres, una ruta de carpeta para los archivos exportados.
   Los intervalos son cada hora, cada 12 horas, diaria, cada 3 días o semanal.
   Las ejecuciones diarias, cada 3 días y semanales ocurren a una hora
   preferida; las semanales además te permiten elegir el día. Las ejecuciones
   cada hora y cada 12 horas ignoran la hora.
3. A partir de entonces, la extensión exporta tus marcadores con ese horario y
   guarda los archivos directamente en tu carpeta de Descargas, sin cuadro de
   diálogo para guardar ni avisos adicionales. Si el navegador estaba cerrado o
   la extensión no estaba disponible cuando tocaba una exportación programada,
   se pone al día automáticamente poco después de que el navegador vuelva a
   iniciarse, en lugar de esperar a la siguiente hora programada.

**Conservar las últimas N ejecuciones** (Retención, 10 de forma predeterminada)
limita cuántas exportaciones se acumulan: tras cada ejecución correcta, Snug
elimina los archivos de sus propias ejecuciones más antiguas más allá de N
(todos los formatos de una ejecución conservada se quedan) y sus entradas en el
historial de descargas del navegador. Solo elimina archivos que Snug mismo
guardó, nunca otros archivos de la carpeta, y un archivo que ya borraste o
moviste simplemente se omite. Una ejecución fallida no elimina nada. Ponlo en 0
para conservarlo todo.

**Avisarme cuando falle una exportación** (activado de forma predeterminada)
muestra una notificación del sistema, con el título "Snug · Falló la exportación
automática" y el motivo, cuando una ejecución falla. Al hacer clic en ella se
abre la página Auto-export. Las ejecuciones correctas nunca notifican, y los
fallos repetidos reemplazan la notificación anterior en lugar de acumularse. Una
ejecución programada o de puesta al día que falla también coloca una insignia
"!" en el ícono de la barra de herramientas hasta que una ejecución tenga éxito.

Los cambios en la página **Auto-export** se guardan automáticamente. Su tarjeta
de estado siempre muestra el estado real del horario, independientemente de
cualquier cambio sin guardar que haya debajo:

- **Última ejecución**: cuándo se ejecutó por última vez la exportación
  automática, con su resultado y, si falló, el mensaje de error almacenado. El
  popup también muestra la próxima ejecución, o un aviso de fallo, en su fila de
  estado de exportación automática.
- **Próxima ejecución**: cuándo le toca de nuevo, o "La exportación automática
  está desactivada" si la exportación automática está desactivada.

**Exportar ahora** ejecuta una exportación de inmediato con los formatos y la
ruta que haya en pantalla, incluso si el interruptor de activación está apagado.
Muestra un indicador de carga mientras se ejecuta y un breve mensaje de éxito o
de error cuando termina; la fila "Última ejecución" de la tarjeta de estado se
actualiza para reflejarlo. Ejecutarlo nunca cambia tu horario automático ni su
próxima hora programada.
