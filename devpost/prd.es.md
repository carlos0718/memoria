---
doc: prd
status: approved
---

# MemorIA — Product Requirements

Un memotest retro de personajes de Rick and Morty pixelados en el navegador, donde jugás 5 niveles por turnos contra una IA de juego cuya memoria mejora en cada nivel; gana el juego quien gane más niveles.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey

1. El jugador abre MemorIA en el navegador (compu, tablet o celular).
2. Aparece el **modal de bienvenida**: escribe su nombre y lee las instrucciones (va a jugar contra una IA de juego, la dificultad y la inteligencia de la IA suben en cada nivel, son 5 niveles y gana el juego quien gane más niveles).
3. Empieza el **nivel 1**: 12 cartas boca abajo en el tablero.
4. **Tiro de dados:** el jugador tira con una tecla y la IA tira al mismo tiempo. Quien saca el número mayor empieza. Si empatan, se vuelve a tirar.
5. **Turnos:** quien juega da vuelta dos cartas. Si forman un par, van a su columna y sigue jugando. Si no forman par, quedan visibles unos segundos (según el nivel), se dan vuelta de nuevo y pasa el turno. Una manito muestra de quién es el turno y, cuando juega la IA, la manito es la que da vuelta sus cartas.
6. **Fin del nivel** (no quedan cartas): gana el nivel quien juntó más pares y suma un punto en el **marcador de niveles**. Se muestra un mensaje de victoria, derrota o empate. En un empate nadie suma. En todos los casos se pasa al nivel siguiente.
7. **Fin del juego** (después del nivel 5): gana quien tenga más niveles ganados. Si gana el jugador → **trofeo amarillo brillante girando con confeti**. Si gana la IA → **un robotcito levantando la copa**, que indica que ganó la IA. Si empatan en niveles → mensaje de empate. En los tres casos se ofrece reiniciar el juego desde el nivel 1.
8. Si cierra el navegador y vuelve, sigue exactamente donde estaba.

## Screens and Layout

Es una sola página con modales encima; no hay otras pantallas. Es responsive: se juega en compu, tablet y celular.

- **Modal de bienvenida:** campo para el nombre, instrucciones y botón para empezar.
- **Pantalla de juego (compu/tablet):** el tablero de cartas en el centro, la columna del jugador a un lado y la de la IA al otro. Cada columna muestra el nombre, los pares ganados en el nivel y los niveles ganados. También se ven el nivel actual y el tiro de dados.
- **Pantalla de juego (celular):** el tablero ocupa todo el ancho. Los nombres del jugador y de la IA van arriba del tablero, con los niveles ganados de cada uno a la vista. Al tocar un nombre se abre un modal con la información de ese jugador (cuántos pares lleva en el nivel).
- **Mensajes sobre el tablero:** resultado de cada nivel (victoria, derrota o empate) y el resultado final del juego.

## Look and Feel

- **Estilo:** videojuego de los 90, pixelado y colorido.
- **Cartas:** personajes de la [Rick and Morty API](https://rickandmortyapi.com), con aspecto **pixelado** para que combinen con la estética retro. Si la API falla, se reemplazan por cartas retro con número y color. *(Cambiado en `4-spec`: originalmente eran pictogramas de ARASAAC.)*
- **Detalles propios:** una manito que señala el turno y juega por la IA, un trofeo amarillo girando con confeti cuando gana el jugador y un robotcito con la copa cuando gana la IA.
- El nombre se escribe **MemorIA**, con "IA" en mayúscula.
- No se definieron una tipografía ni una paleta de colores concretas; alcanza con que la letra y los colores sean retro, pixelados y vivos, coherentes con lo anterior.

## Features and Behavior

### Bienvenida e instrucciones
- [ ] Al entrar por primera vez aparece un modal que pide el nombre y explica: rival = IA de juego, la dificultad sube en cada nivel, 5 niveles, gana el juego quien gane más niveles.
- [ ] No se puede empezar sin escribir un nombre.
- [ ] El nombre ingresado aparece en la columna (o en el encabezado, en el celular) del jugador.

### Tiro de dados
- [ ] Al empezar cada nivel, el jugador tira los dados con una tecla (en el celular, tocando) y la IA tira al mismo tiempo. Se ven los dos resultados.
- [ ] Quien saca el número mayor empieza el nivel.
- [ ] Si empatan, se vuelve a tirar hasta que uno saque más.

### Turnos y pares
- [ ] Solo se pueden dar vuelta cartas en el turno del jugador; mientras juega la IA, el tablero no responde a los toques del jugador.
- [ ] Un par acertado pasa a la columna de quien lo encontró y esa persona sigue jugando.
- [ ] Un par fallado queda visible el tiempo que marca el nivel (ver **Niveles**), se da vuelta de nuevo y pasa el turno.
- [ ] Una manito o flecha indica de quién es el turno. En el turno de la IA, la manito se mueve y da vuelta las cartas, como si la IA estuviera jugando.

### La IA de juego (el núcleo)
Source: `scope.md > The Unique Kernel`.
- La IA "ve" todas las cartas que se dan vuelta, tanto las suyas como las del jugador, pero las recuerda con una probabilidad que sube en cada nivel. Con lo que recuerda, intenta formar pares.
- [ ] **Nivel 1:** se nota que la IA se olvida seguido. Da vuelta cartas cuyo par ya se había visto y falla.
- [ ] **Nivel 5:** cuando las dos cartas de un par ya se vieron, la IA casi siempre lo encuentra.
- [ ] Al jugar el nivel 1 y el nivel 5, alguien que mira nota a simple vista que la IA del nivel 5 comete muchos menos errores.
- La memoria es nuestra (reglas y probabilidades); la jugada la elige **Jev**, un modelo de IA de decisiones tipadas de TypeSafe, que solo ve lo que la IA recuerda. Si Jev falla o no está seguro, decide un jugador local de reglas. Las instrucciones lo dicen. *(Cambiado en `4-spec`.)*

### Niveles

| Nivel | Cartas | Pares | Tiempo visible de un par fallado |
|---|---|---|---|
| 1 | 12 | 6 | 5 s |
| 2 | 16 | 8 | 4,5 s |
| 3 | 20 | 10 | 4 s |
| 4 | 24 | 12 | 3,5 s |
| 5 | 28 | 14 | 3 s |

- [ ] Cada nivel tiene la cantidad de cartas de la tabla, y cada personaje aparece exactamente dos veces, mezclados.
- [ ] Los personajes varían entre partidas: después del primer inicio o de un reinicio, el nivel 1 (y cada nivel) muestra un grupo de personajes distinto, al azar, y no siempre los mismos. *(Agregado en `4-spec`.)*
- [ ] El nivel actual se ve en pantalla.
- [ ] La memoria de la IA mejora en cada nivel (ver **La IA de juego**).
- [ ] Las 28 cartas del nivel 5 entran en la pantalla de un celular sin que haya que desplazarse de costado.

### Marcador de niveles y fin del juego
- [ ] Al terminar un nivel, quien juntó más pares suma 1 nivel ganado en el marcador, y se ve un mensaje de victoria o derrota sobre el tablero.
- [ ] Empate de pares → mensaje de empate, nadie suma, y se pasa al nivel siguiente.
- [ ] Cada nivel se juega una sola vez: después de cualquier resultado se pasa al siguiente.
- [ ] Mejor de 5: el juego termina antes apenas la ventaja en niveles ganados es mayor que los niveles que quedan (por ejemplo, 3–0 después del nivel 3, 3–1 después del nivel 4), con un mensaje "The game is decided!" antes de la pantalla final. *(Agregado durante `5-build`.)*
- [ ] El marcador de niveles ganados (jugador vs. IA) está siempre a la vista.
- [ ] Al terminar el nivel 5 gana el juego quien tenga más niveles ganados. Si gana el jugador → trofeo amarillo brillante girando con confeti.
- [ ] Si gana la IA → se muestra un robotcito levantando la copa, con un mensaje de que ganó la IA.
- [ ] Si empatan en niveles ganados → mensaje de empate.
- [ ] Las tres pantallas finales ofrecen reiniciar el juego: vuelve al nivel 1 con el marcador en 0 a 0 y el mismo nombre.

### Continuar donde quedó
- [ ] Si el jugador cierra el navegador y vuelve, el juego retoma **el tablero exacto**: nombre, nivel, marcador de niveles, cartas ya encontradas y en qué columna están, y las cartas que siguen boca abajo en el mismo lugar. No vuelve a pedirle el nombre.

## States and Boundaries

- **Primera vez:** modal de bienvenida con nombre e instrucciones.
- **Vuelta al juego:** el tablero exacto donde quedó (en ese navegador). Vuelve con el turno de quien estaba jugando; si había dos cartas sin par a la vista, vuelven boca abajo. Si el nivel ya tenía dados tirados, no se vuelven a tirar.
- **Turno de la IA:** el jugador no puede tocar el tablero.
- **Empate de dados:** se vuelve a tirar.
- **Empate de pares en un nivel:** mensaje de empate, nadie suma y se pasa al nivel siguiente.
- **Fin del juego:** trofeo con confeti (gana el jugador), robotcito con la copa (gana la IA) o mensaje de empate, y en todos los casos la opción de reiniciar.
- **Un solo jugador por navegador:** no hay cuentas; el progreso vive en ese dispositivo.

## Product Decisions

- **Nombre "MemorIA"**: "IA" en mayúscula, porque alude a la inteligencia artificial.
- **Dados en lugar de piedra, papel o tijera con cámara**: resuelve lo mismo (quién empieza) sin el costo y el riesgo de la cámara.
- **La dificultad crece por tres lados**: más cartas, mejor memoria de la IA y menos tiempo para ver un par fallado.
- **Tiempos de 5 s a 3 s**: el nivel 1 es tranquilo y el 5 exige, sin congelar la partida como pasaría con 7 s.
- **Acertar da otro turno**, como en el memotest de mesa.
- **Se sacan las vidas y se reemplazan por un marcador de niveles ganados**: las vidas (perder → repetir el nivel) chocaban con "gana el juego quien gane más niveles". Ahora cada nivel se juega una vez y el marcador decide. *Cambia `scope.md > The Core Loop` y `> The POC Boundary`, que mencionaban 3 vidas.*
- **Un empate de nivel no suma para nadie** y se sigue al nivel siguiente.
- **Final con robotcito**: si gana la IA, un robotcito con la copa; si empatan, mensaje de empate y la opción de reiniciar.
- **Manito para la IA**: hace que la IA se sienta como un jugador y se entienda en el video.
- **Celular: nombres arriba y detalle en un modal**, para que el tablero ocupe todo el ancho.
- **Estética retro de los 90 con personajes pixelados.**
- **Rick and Morty en lugar de ARASAAC** (`4-spec`): el autor aceptó el riesgo de derechos de autor; las imágenes se cargan en vivo desde la API y se citan.
- **Jev elige las jugadas de la IA** (`4-spec`), con la memoria en nuestro código y un respaldo de reglas.
- **Al volver, se retoma el tablero exacto**, con las cartas ganadas por cada uno.
- **Sin internet queda afuera** de esta prueba.
- **Todo el texto del juego en inglés** (modal, instrucciones, mensajes, botones): lo evalúa una comunidad de habla inglesa en la hackathon.
- **Video:** partes aceleradas para mostrar del nivel 1 al 5 en unos 3 minutos.

## What We're Building

- El modal de bienvenida con nombre e instrucciones.
- El tablero responsive con personajes de Rick and Morty pixelados (cartas de respaldo si la API falla).
- El tiro de dados, con desempate.
- Los turnos jugador/IA con la manito, los pares a cada columna y el turno extra al acertar.
- La IA de juego con una memoria que mejora en los 5 niveles.
- Los 5 niveles (12 a 28 cartas) con tiempos de 5 a 3 s.
- El marcador de niveles ganados, los mensajes de victoria, derrota y empate por nivel, y el resultado final con el trofeo.
- Retomar el tablero exacto en el mismo navegador.
- El crédito de las imágenes de los personajes (Rick and Morty API; © Adult Swim / Warner Bros. Discovery).

## Deferred From the POC

- **Piedra, papel o tijera con la cámara:** es un segundo juego dentro del juego (permisos, reconocimiento de la mano, qué hacer sin cámara).
- **Cuentas, tabla de puntajes global o jugar en otro dispositivo:** el progreso solo vive en ese navegador.
- **Jugar sin internet:** implica guardar las imágenes dentro del juego y una IA solo local; queda para otra implementación.

## Possible Later Enhancements

- Más niveles y otros sets o temas de cartas.
- Sonidos o música retro.
- Volver a sumar vidas, si se encuentra una forma de combinarlas con el marcador.

## Non-Goals

- **No usa un chatbot ni un modelo de lenguaje conversacional:** Jev solo devuelve una elección tipada con probabilidades; la curva de memoria son nuestras reglas y probabilidades.
- **No es multijugador humano contra humano.**

## Open Questions

- **Probabilidades exactas de memoria de la IA por nivel:** pueden quedar para `4-spec` o afinarse en el build. El criterio es que la diferencia entre el nivel 1 y el 5 se note a simple vista.
