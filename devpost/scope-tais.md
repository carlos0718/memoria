---
doc: scope
status: approved
---

# El día de Tais (nombre provisorio)

Una app de celular donde Tais cuenta cómo le fue en el colegio tocando pictogramas que se dicen en voz alta, y la familia ve un historial por fecha con lo preocupante destacado.

## The Unique Kernel

Pictogramas que muestran **la acción, no solo el objeto** ("una persona comiendo", no "un pan"), animados como GIF donde una imagen fija no alcanza, para que Tais los reconozca de verdad. Lo que ella toca se convierte en una **frase completa (armada por IA)** y queda en un **registro fechado que marca lo negativo**, para que la familia pueda hacer seguimiento.

## Who It's For

**Tais**, sobrina del autor, con retraso madurativo y habla muy limitada: dice algunas palabras, hace sonidos onomatopéyicos y sabe decir "sí" y "no". Va al colegio 3 veces por semana. Hoy no usa ninguna herramienta para comunicarse y la familia "no entiende lo que ella siente".
Usuario secundario: **el adulto que está con ella** (mamá, papá) cuando vuelve del colegio. Le pregunta cómo le fue y después revisa el historial.

## The Core Loop

Tais vuelve del colegio → abre la app en el celular (la bienvenida refuerza que la reconozca) → un adulto le pregunta "¿cómo te fue en el colegio?" → ella toca pictogramas (jugó con amigos, comió pan, tomó una bebida, bailó; o algo que le hicieron) → cada uno suena en voz alta → la app arma una oración completa → queda guardado con fecha en el historial, con lo negativo destacado.
Vuelve cada día de colegio porque es su forma de contar lo que vivió.

## Inspiration & Identity

- Pictogramas de [ARASAAC](https://arasaac.org) (gratuitos, en español, con API abierta) como base; algunos animados por el autor (GIFs hechos con ayuda de otro LLM).
- Texto a voz: cada pictograma "habla".
- A Tais le encantan la música y bailar; es parte de su mundo y debería estar presente.
- Tono: cálido, simple, reconocible para ella; confiable para la familia.

## Why This Matters to the Learner

Es personal: Tais "tiene limitaciones al expresar sus emociones… y nosotros no entendemos lo que ella siente". El objetivo es darle una forma de expresar "esas emociones guardadas", sobre todo si en el colegio le pasa algo malo, y que la familia pueda saberlo y actuar.

## What "Working" Looks Like

Un video corto con la grabación de la pantalla: se abre la app, se ven los pictogramas (fijos y animados), se tocan varios para contar un día normal de Tais, cada uno suena y aparece la oración completa. Después se abre el **historial**: el día queda guardado con fecha, y un día con un pictograma negativo aparece destacado.
**El momento "qué bueno":** tres o cuatro toques de Tais se convierten en una frase que la familia entiende, y lo que le preocupa a la familia queda marcado solo.
Ideal si se puede: grabar a Tais usando la app en el celular (desplegada).
**Contar el porqué:** por fuera la app puede parecer simple; su impacto está en lo conceptual. La presentación en la hackathon tiene que explicarlo.

## The POC Boundary

- Un conjunto chico de pictogramas del día escolar (comer, tomar, jugar con amigos, bailar, emociones, "sí" y "no", y algunos negativos como "me gritaron" o "me pegaron"). Primero, imágenes fijas de ARASAAC; el autor decide sobre la marcha cuáles necesitan GIF.
- Tocar un pictograma lo dice en voz alta y lo suma a la frase.
- La IA arma una oración completa a partir de los pictogramas elegidos.
- Detección de lo negativo en dos capas: cada pictograma negativo viene **marcado de antemano** (confiable, no depende de la IA) y, además, la IA interpreta la frase.
- Historial por fecha, con los registros negativos destacados.
- Un solo celular y una sola usuaria (Tais).
- Despliegue: opcional en la hackathon, pero deseado (no es complicado y permite que Tais la use en su celular).

## Later

- Publicarla para que la usen otras familias (varios perfiles, cuentas).
- Más pictogramas y más GIFs, y personalizarlos para niño.
- Exportar o compartir el historial para llevarlo al colegio o a fonoaudiología.

## Explicitly Cut

- **Cuentas, login y varios usuarios:** para probar la idea alcanza con Tais en un celular.
- **Lectura fácil ("Explicámelo fácil"):** lo viste como referencia, pero no es el foco.
