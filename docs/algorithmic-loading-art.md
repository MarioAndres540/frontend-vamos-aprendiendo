# Espera Viva — filosofía del arte generativo de carga

*Movimiento algorítmico para las esperas de Vamos Aprendiendo. Aplicado con la técnica del skill Algorithmic Art (azar con semilla, ruido, campos de flujo y partículas), dibujado con Canvas 2D.*

## Filosofía

La espera no es un vacío entre dos pantallas: es un momento en el que el sistema todavía está pensando. **Espera Viva** propone que ese tiempo se vea como un pequeño organismo en marcha, no como un reloj. Cada pestaña del panel tiene su propio estudio, una criatura matemática distinta, que nace, se mueve y desaparece cuando llega la información. Quien cambia de pestaña no ve «cargando»: ve que algo ya está pasando.

La belleza está en el proceso, no en la imagen final. Ningún estudio repite un fotograma: son sistemas vivos que evolucionan con el tiempo. Un ruido de valor suavizado, sembrado con una semilla, guía el movimiento; la misma semilla siempre da la misma composición y cada carga usa una semilla nueva, así que cada espera es distinta sin dejar de ser reconocible. El azar nunca es ruido sin control: es variación afinada con cuidado, hecha para que la pantalla respire.

El semblante de cada estudio lleva una alusión discreta a su pestaña, para quien la busque: la **Constelación** del Inicio une puntos como un tablero que reúne datos; la **Interferencia** de Diagnósticos mide ondas que se suman y se anulan, como quien afina una observación; el **Flujo** de Actividades es movimiento puro y juego; el **Pulso de datos** de Analíticas son columnas que respiran con una línea que las recorre; la **Filotaxia** de la Biblioteca abre semillas en ángulo áureo, como una flor de conocimiento; y las **Órbitas** de Configuración son engranes que dibujan su trazo, ajustes que giran en su sitio.

Es un trabajo de oficio: cada parámetro (cantidad de partículas, distancia de enlace, longitud de las estelas, razón de los engranes) se ajustó a mano para que el movimiento sea sereno, legible sobre un fondo claro y barato para el dispositivo. La paleta es la del producto (morado de marca, cielo, naranja de acento, verde, rosa y lila) y todo dibuja con transparencia, de modo que el fondo lo pone la tarjeta y el arte nunca compite con el contenido.

La espera también cuida a quien la mira. Con «reducir movimiento» activado el arte se detiene en una sola imagen; en una pestaña del navegador en segundo plano deja de dibujar; y todo es decorativo (`aria-hidden`) mientras la región de carga se anuncia a los lectores de pantalla.

## Los seis estudios

| Pestaña | Estudio | Algoritmo |
|---|---|---|
| Inicio | Constelación | Puntos que derivan siguiendo un campo de ruido y se enlazan con una línea cuando se acercan |
| Diagnósticos | Interferencia | Tres fuentes de onda que se mueven despacio; una rejilla de puntos crece y cambia de color según la suma de sus ondas |
| Actividades | Flujo | Partículas que siguen un campo de ruido y dejan estelas que se desvanecen hacia transparente |
| Analíticas | Pulso de datos | Columnas cuya altura sigue el ruido en el tiempo, una línea naranja sobre sus cimas y un punto que la recorre |
| Biblioteca | Filotaxia | Semillas en ángulo áureo (137,5°) que giran y pulsan en tres espirales |
| Configuración | Órbitas | Hipotrocoides (curvas de engrane) con razones enteras al azar y un trazo que se desvanece |

## Dónde está y cómo se usa

- Algoritmos: `app/utils/loading-art.ts` (`createArtScene(variante, ancho, alto, semilla)`).
- Componente: `app/components/ui/UiLoadingArt.vue` (llena a su contenedor, que debe tener `position: relative`; cambia la semilla en cada carga).
- Dentro de los esqueletos: `SkeletonSubjectHeader` (prop `art`, Actividades, Analíticas y Diagnósticos), `SkeletonArtBanner` (Biblioteca y Configuración) y detrás de las columnas del gráfico del Inicio.
- Para una pantalla nueva: `<SkeletonSubjectHeader art="biblioteca" />` o `<SkeletonArtBanner variant="…" />`. Variantes: `inicio`, `diagnosticos`, `actividades`, `analiticas`, `biblioteca`, `configuracion`.

## Por qué Canvas 2D y no p5.js

p5.js (más de 1 MB) tendría que descargarse justo cuando el usuario espera una respuesta. Canvas 2D reproduce las mismas técnicas sin ese costo. Si se quisiera explorar o afinar un estudio con controles, se puede llevar a un visor de p5.js del skill sin cambiar el algoritmo.
