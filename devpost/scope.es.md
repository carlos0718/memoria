---
doc: scope
status: approved
---

# MemorIA

Un juego de memoria con personajes de Rick and Morty en el que jugás por turnos contra una IA que recuerda cada vez mejor a medida que pasás de nivel.

## The Unique Kernel

Una **IA con memoria imperfecta que se afina nivel a nivel**. En el nivel 1 tiene poca probabilidad de recordar las cartas que ya vio y de acertar, así que se equivoca seguido. En cada nivel esa probabilidad sube, y en el nivel 5 casi no se olvida de nada. La diferencia se ve en sus errores y aciertos, turno a turno.

## Who It's For

Cualquier persona que quiera jugar un memotest y medirse contra un rival que va subiendo de nivel. No se definió un público más específico; se puede ajustar en `3-prd` si hace falta.

## The Core Loop

1. Empieza el nivel: se tiran los dados (el jugador tira con una tecla y la IA tira al mismo tiempo) y quien saca el número mayor empieza.
2. Se turnan para dar vuelta dos cartas. Si forman un par, las cartas pasan a la columna de quien lo encontró.
3. Cuando no quedan cartas, gana el nivel quien juntó más.
4. Quien gana el nivel suma un punto en el marcador de niveles (un empate no suma) y se pasa al siguiente nivel: más cartas y una IA con mejor memoria. Después del nivel 5, gana el juego quien ganó más niveles. *(Antes eran 3 vidas; se reemplazaron en `prd.md`.)*

Vuelve porque quiere ganarle a la IA del nivel siguiente.

## Inspiration & Identity

- Personajes de la [Rick and Morty API](https://rickandmortyapi.com) como imágenes de las cartas, pixelados. *(Cambiado en `4-spec`: originalmente eran pictogramas de ARASAAC.)* Las imágenes tienen derechos de autor (© Adult Swim / Warner Bros. Discovery): se cargan en vivo desde la API, nunca se guardan en el repo y se citan en el juego.
- El memotest de mesa: turnos, pares y cada uno con su pila de cartas.

## Why This Matters to the Learner

Un giro total después de explorar proyectos de accesibilidad que resultaron demasiado grandes para parametrizar en una hackathon. Este es un juego claro y divertido, y le permite al autor enfocarse en lo que más le interesa aprender: cómo trabajar con un agente de IA para construir algo "muy funcional" y con pocas fallas.

## What "Working" Looks Like

Un video corto: se tiran los dados, se juega una partida del nivel 1 y se ve a la IA equivocarse y olvidarse de cartas. Después se ve un nivel más alto, con más cartas y una IA que acierta mucho más. Los pares van a la columna de cada jugador, uno gana el nivel y suma en el marcador.
**El momento "qué bueno":** la misma IA que en el nivel 1 se olvidaba de todo, en el nivel 5 da vuelta un par que viste hace diez turnos y te lo gana.
En la presentación hay que aclarar cómo funciona la IA: una **memoria imperfecta** (reglas y probabilidades, código propio) que alimenta a **Jev**, un modelo de IA de decisiones tipadas de TypeSafe, que elige las jugadas. No es un chatbot. *(Cambiado en `4-spec`.)*

## The POC Boundary

- Tablero de memotest con personajes de Rick and Morty pixelados.
- Partida por turnos jugador contra IA, con los pares a la columna de cada uno. Gana quien junta más.
- Tiro de dados (con una tecla) para decidir quién empieza.
- 5 niveles: en cada uno aumentan las cartas (siempre en número par, empezando con una grilla chica, por ejemplo 2×3 o 3×4, hasta 4×4, 5×4…) y la probabilidad de que la IA recuerde y acierte.
- Marcador de niveles ganados: gana el juego quien gane más de los 5 niveles.

## Later

- Piedra, papel o tijera con la cámara para decidir quién empieza. Le gusta la idea, pero es un segundo juego dentro del juego: suma permisos de cámara, reconocimiento de la mano y qué hacer cuando no hay cámara.
- Más niveles, otros sets de imágenes o temas de cartas.

## Explicitly Cut

- **Los proyectos anteriores (Thaís, matemática inclusiva, educación sin fronteras):** se dejaron de lado por ser demasiado grandes o parecidos a algo que ya existe (Khan Academy). El scope de Thaís está guardado en `scope-tais.md`.
