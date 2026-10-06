import { useEffect, useMemo, useState } from "react";

import {

  View,

  Text,

  SafeAreaView,

  TextInput,

  Pressable,

  StyleSheet,

  ScrollView,

} from "react-native";

import * as Speech from "expo-speech";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NinosHome from "../componentes/ninos/NinosHome";
import Niveles from "../componentes/ninos/Niveles";


type Perfil = "nino" | "adolescente" | "adulto" | "";



type PantallaNino =

  | "inicio"

  | "niveles"

  | "jugar"

  | "leer"

  | "escuchar"

  | "progreso";



type TipoEjercicio =

  | "palabra"

  | "letra"

  | "completar"

  | "ordenar"

  | "frase"

  | "comprension"

  | "escuchar";



type Ejercicio = {

  tipo: TipoEjercicio;

  pregunta: string;

  texto?: string;

  opciones: string[];

  correcta: string;

  ayuda?: string;

};



const TOTAL_NIVELES = 200;



/* =========================================================

   PALABRAS

\========================================================= */



const palabrasMuyFaciles = [

  "GATO",

  "CASA",

  "MESA",

  "PATO",

  "LUNA",

  "SOL",

  "PEZ",

  "PAN",

  "OSO",

  "FLOR",

];



const palabrasFaciles = [

  "PELOTA",

  "ESCUELA",

  "AMIGO",

  "FAMILIA",

  "CAMINO",

  "VENTANA",

  "JUEGO",

  "LIBRO",

  "PERRO",

  "GATO",

];



const palabrasMedias = [

  "MARIPOSA",

  "BICICLETA",

  "MONTAÑA",

  "ELEFANTE",

  "HELADERA",

  "JARDINERO",

  "AVENTURA",

  "ESCRITURA",

  "CUADERNO",

  "MAESTRA",

];



const palabrasDificiles = [

  "RESPONSABILIDAD",

  "CONCENTRACIÓN",

  "APRENDIZAJE",

  "EXTRAORDINARIO",

  "COMUNICACIÓN",

  "IMAGINACIÓN",

  "INFORMACIÓN",

  "OPORTUNIDAD",

  "ORGANIZACIÓN",

  "EXPERIENCIA",

];



/* =========================================================

   FRASES

\========================================================= */



const frasesMuyFaciles = [

  "El gato corre.",

  "El perro juega.",

  "La niña lee.",

  "El sol brilla.",

  "El pez nada.",

];



const frasesFaciles = [

  "El gato juega con una pelota.",

  "La niña lee un libro.",

  "El perro corre en el parque.",

  "Mi amigo tiene una bicicleta.",

  "El sol sale por la mañana.",

];



const frasesMedias = [

  "La niña lee un libro en la escuela.",

  "El perro corre rápidamente por el parque.",

  "Mi amigo juega con su bicicleta nueva.",

  "La familia prepara la comida en la cocina.",

  "El gato duerme tranquilo junto a la ventana.",

];



const frasesDificiles = [

  "La niña terminó su tarea antes de salir a jugar.",

  "El perro encontró una pelota debajo de la mesa.",

  "Mi amigo organizó sus libros antes de comenzar a estudiar.",

  "La familia decidió caminar hasta el parque después de almorzar.",

  "El estudiante leyó lentamente el texto para comprender cada parte.",

];



/* =========================================================

   DIFICULTAD

\========================================================= */



function dificultadNivel(numero: number) {

  if (numero <= 5) return "🟢 Muy fácil";

  if (numero <= 10) return "🟢 Fácil";

  if (numero <= 20) return "🟡 Fácil +";

  if (numero <= 40) return "🟡 Medio";

  if (numero <= 70) return "🟠 Medio +";

  if (numero <= 100) return "🟠 Difícil";

  if (numero <= 130) return "🔴 Difícil +";

  if (numero <= 160) return "🔴 Muy difícil";

  if (numero <= 199) return "🟣 Avanzado";

  return "🏆 Maestro";

}



/* =========================================================

   OBTENER PALABRA SEGÚN NIVEL

\========================================================= */



function obtenerPalabra(numero: number) {

  if (numero <= 10) {

    return palabrasMuyFaciles[

      (numero - 1) % palabrasMuyFaciles.length

    ];

  }



  if (numero <= 40) {

    return palabrasFaciles[

      (numero - 11) % palabrasFaciles.length

    ];

  }



  if (numero <= 100) {

    return palabrasMedias[

      (numero - 41) % palabrasMedias.length

    ];

  }



  return palabrasDificiles[

    (numero - 101) % palabrasDificiles.length

  ];

}



/* =========================================================

   OBTENER FRASE SEGÚN NIVEL

\========================================================= */



function obtenerFrase(numero: number) {

  if (numero <= 20) {

    return frasesMuyFaciles[

      (numero - 1) % frasesMuyFaciles.length

    ];

  }



  if (numero <= 70) {

    return frasesFaciles[

      (numero - 21) % frasesFaciles.length

    ];

  }



  if (numero <= 130) {

    return frasesMedias[

      (numero - 71) % frasesMedias.length

    ];

  }



  return frasesDificiles[

    (numero - 131) % frasesDificiles.length

  ];

}



/* =========================================================

   GENERADOR DE OPCIONES

\========================================================= */



function opcionesConRespuesta(

  correcta: string,

  otras: string[]

) {

  const todas = Array.from(

    new Set([correcta, ...otras])

  ).slice(0, 3);

  // Mezclamos las opciones para que la respuesta correcta
  // no aparezca siempre en la primera posición.
  for (let i = todas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [todas[i], todas[j]] = [todas[j], todas[i]];
  }

  return todas;
}



/* =========================================================

   CREAR EJERCICIO

\========================================================= */



function crearEjercicio(numero: number): Ejercicio {
  const palabra = obtenerPalabra(numero);
  const frase = obtenerFrase(numero);

  /* =========================================================
     NIVELES 1 - 10
     RECONOCER PALABRAS
  ========================================================= */
  if (numero <= 10) {
    const ejercicios = [
      { palabra: "GATO", opciones: ["GATO", "PATO", "CASA"], ayuda: "Mirá bien la palabra y elegí la misma." },
      { palabra: "CASA", opciones: ["MESA", "CASA", "LUNA"], ayuda: "Buscá CASA entre las opciones." },
      { palabra: "PATO", opciones: ["PATO", "GATO", "PEZ"], ayuda: "Leé despacio y elegí PATO." },
      { palabra: "LUNA", opciones: ["LUNA", "CASA", "MESA"], ayuda: "Buscá la palabra LUNA." },
      { palabra: "PELOTA", opciones: ["PELOTA", "PELO", "PALOMA"], ayuda: "Mirá todas las letras antes de responder." },
      { palabra: "PERRO", opciones: ["PERRO", "GATO", "PATO"], ayuda: "Encontrá la palabra PERRO." },
      { palabra: "FLOR", opciones: ["FLOR", "SOL", "PAN"], ayuda: "Buscá FLOR entre las opciones." },
      { palabra: "MESA", opciones: ["CASA", "MESA", "LUNA"], ayuda: "Leé lentamente la palabra." },
      { palabra: "SOL", opciones: ["SOL", "OSO", "PEZ"], ayuda: "Elegí la palabra que aparece arriba." },
      { palabra: "OSO", opciones: ["OSO", "SOL", "GATO"], ayuda: "Este es el último desafío de esta etapa." },
    ];
    const ejercicio = ejercicios[numero - 1];
    return {
      tipo: "palabra",
      pregunta: numero === 1
        ? "¡Empecemos! Encontrá la palabra correcta:"
        : numero === 10
        ? "🏆 ¡Excelente! Último desafío de esta etapa:"
        : "Encontrá la palabra correcta:",
      texto: ejercicio.palabra,
      opciones: ejercicio.opciones,
      correcta: ejercicio.palabra,
      ayuda: ejercicio.ayuda,
    };
  }

  /* =========================================================
     NIVELES 11 - 20
     ENCONTRAR LETRAS
  ========================================================= */
  if (numero <= 20) {
    const ejercicios = [
      { palabra: "GATO", letra: "G" },
      { palabra: "CASA", letra: "S" },
      { palabra: "PATO", letra: "T" },
      { palabra: "LUNA", letra: "N" },
      { palabra: "PELOTA", letra: "P" },
      { palabra: "PERRO", letra: "R" },
      { palabra: "FLOR", letra: "L" },
      { palabra: "MESA", letra: "M" },
      { palabra: "SOL", letra: "O" },
      { palabra: "OSO", letra: "S" },
    ];
    const ejercicio = ejercicios[numero - 11];
    return {
      tipo: "letra",
      pregunta: "¿Qué letra aparece en esta palabra?",
      texto: ejercicio.palabra,
      opciones: opcionesConRespuesta(
        ejercicio.letra,
        ["A", "E", "I", "O", "U", "M", "P", "S", "T"].filter(
          (letra) => letra !== ejercicio.letra
        )
      ),
      correcta: ejercicio.letra,
      ayuda: "Mirá la palabra con calma y buscá la letra.",
    };
  }

  /* =========================================================
     NIVELES 21 - 30
     COMPLETAR PALABRAS
  ========================================================= */
  if (numero <= 30) {
    const ejercicios = [
      { palabra: "GATO", posicion: 0 },
      { palabra: "CASA", posicion: 1 },
      { palabra: "PATO", posicion: 2 },
      { palabra: "LUNA", posicion: 3 },
      { palabra: "PELOTA", posicion: 0 },
      { palabra: "PERRO", posicion: 1 },
      { palabra: "FLOR", posicion: 2 },
      { palabra: "MESA", posicion: 0 },
      { palabra: "PEZ", posicion: 1 },
      { palabra: "OSO", posicion: 2 },
    ];
    const ejercicio = ejercicios[numero - 21];
    const letra = ejercicio.palabra[ejercicio.posicion];
    const incompleta =
      ejercicio.palabra.substring(0, ejercicio.posicion) +
      "_" +
      ejercicio.palabra.substring(ejercicio.posicion + 1);
    return {
      tipo: "completar",
      pregunta: "Completá la palabra:",
      texto: incompleta,
      opciones: opcionesConRespuesta(
        letra,
        ["A", "E", "I", "O", "U", "P", "S", "T", "L"].filter(
          (otra) => otra !== letra
        )
      ),
      correcta: letra,
      ayuda: "Elegí la letra que falta para formar la palabra.",
    };
  }

  /* =========================================================
     NIVELES 31 - 40
     FRASES CORTAS
  ========================================================= */
  if (numero <= 40) {
    const ejercicios = [
      { frase: "El gato duerme.", correcta: "gato" },
      { frase: "La niña lee.", correcta: "niña" },
      { frase: "El perro corre.", correcta: "perro" },
      { frase: "La pelota rueda.", correcta: "pelota" },
      { frase: "El niño juega.", correcta: "niño" },
      { frase: "La mamá cocina.", correcta: "mamá" },
      { frase: "El papá lee.", correcta: "papá" },
      { frase: "El gato come.", correcta: "gato" },
      { frase: "La niña salta.", correcta: "niña" },
      { frase: "El perro duerme.", correcta: "perro" },
    ];
    const ejercicio = ejercicios[numero - 31];
    return {
      tipo: "palabra",
      pregunta: "¿Cuál de estas palabras aparece en la frase?",
      texto: ejercicio.frase,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["casa", "árbol", "escuela", "pelota", "amigo"].filter(
          (otra) => otra !== ejercicio.correcta
        )
      ),
      correcta: ejercicio.correcta,
      ayuda: "Leé la frase despacio y buscá la palabra.",
    };
  }

  /* =========================================================
     NIVELES 41 - 50
     COMPRENSIÓN SENCILLA
  ========================================================= */
  if (numero <= 50) {
    const ejercicios = [
      { frase: "El gato duerme en la cama.", pregunta: "¿Qué animal aparece?", correcta: "gato" },
      { frase: "La niña lee un libro.", pregunta: "¿Quién lee?", correcta: "niña" },
      { frase: "El perro corre en el parque.", pregunta: "¿Qué animal corre?", correcta: "perro" },
      { frase: "El niño juega con una pelota.", pregunta: "¿Con qué juega?", correcta: "pelota" },
      { frase: "La mamá cocina en la casa.", pregunta: "¿Quién cocina?", correcta: "mamá" },
      { frase: "El papá lee un libro.", pregunta: "¿Qué hace el papá?", correcta: "lee" },
      { frase: "La niña tiene una flor.", pregunta: "¿Qué tiene la niña?", correcta: "flor" },
      { frase: "El gato toma agua.", pregunta: "¿Qué hace el gato?", correcta: "toma" },
      { frase: "El perro juega con el niño.", pregunta: "¿Con quién juega el perro?", correcta: "niño" },
      { frase: "La familia come en la mesa.", pregunta: "¿Dónde come la familia?", correcta: "mesa" },
    ];
    const ejercicio = ejercicios[numero - 41];
    return {
      tipo: "comprension",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.frase,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["gato", "perro", "niña", "niño", "pelota", "casa", "flor", "lee", "toma", "mesa"].filter(
          (otra) => otra !== ejercicio.correcta
        )
      ),
      correcta: ejercicio.correcta,
      ayuda: "Leé toda la frase antes de elegir.",
    };
  }

  /* =========================================================
     NIVELES 51 - 60
     PALABRAS MÁS LARGAS
  ========================================================= */
  if (numero <= 60) {
    const ejercicios = [
      { palabra: "PELOTA", posicion: 2 },
      { palabra: "ESCUELA", posicion: 1 },
      { palabra: "AMIGO", posicion: 3 },
      { palabra: "FAMILIA", posicion: 4 },
      { palabra: "CAMINO", posicion: 2 },
      { palabra: "VENTANA", posicion: 3 },
      { palabra: "JUEGO", posicion: 1 },
      { palabra: "LIBRO", posicion: 2 },
      { palabra: "PERRO", posicion: 3 },
      { palabra: "GATO", posicion: 1 },
    ];
    const ejercicio = ejercicios[numero - 51];
    const letra = ejercicio.palabra[ejercicio.posicion];
    const incompleta =
      ejercicio.palabra.substring(0, ejercicio.posicion) +
      "_" +
      ejercicio.palabra.substring(ejercicio.posicion + 1);
    return {
      tipo: "completar",
      pregunta: "Completá esta palabra:",
      texto: incompleta,
      opciones: opcionesConRespuesta(
        letra,
        ["A", "E", "I", "O", "U", "M", "N", "L", "R", "T"].filter(
          (otra) => otra !== letra
        )
      ),
      correcta: letra,
      ayuda: "Mirá las letras que están alrededor del espacio.",
    };
  }

  /* =========================================================
     NIVELES 61 - 70
     COMPRENSIÓN CON FRASES MÁS LARGAS
  ========================================================= */
  if (numero <= 70) {
    const ejercicios = [
      { frase: "Martina fue al parque con su mamá.", pregunta: "¿Con quién fue Martina al parque?", correcta: "mamá" },
      { frase: "Tomás llevó su pelota a la escuela.", pregunta: "¿Qué llevó Tomás?", correcta: "pelota" },
      { frase: "El perro encontró una pelota en el jardín.", pregunta: "¿Qué encontró el perro?", correcta: "pelota" },
      { frase: "Sofía leyó un libro antes de dormir.", pregunta: "¿Qué leyó Sofía?", correcta: "libro" },
      { frase: "La familia salió a caminar por el parque.", pregunta: "¿Qué hizo la familia?", correcta: "caminar" },
      { frase: "Pedro guardó sus juguetes en una caja.", pregunta: "¿Dónde guardó los juguetes?", correcta: "caja" },
      { frase: "La niña encontró una flor junto al árbol.", pregunta: "¿Qué encontró la niña?", correcta: "flor" },
      { frase: "El niño preparó su mochila para la escuela.", pregunta: "¿Qué preparó el niño?", correcta: "mochila" },
      { frase: "Ana escuchó una historia antes de acostarse.", pregunta: "¿Qué escuchó Ana?", correcta: "historia" },
      { frase: "Lucas ordenó sus libros después de estudiar.", pregunta: "¿Qué ordenó Lucas?", correcta: "libros" },
    ];
    const ejercicio = ejercicios[numero - 61];
    return {
      tipo: "comprension",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.frase,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["mamá", "papá", "pelota", "libro", "caminar", "caja", "flor", "mochila", "historia", "libros", "escuela", "parque"].filter(
          (otra) => otra !== ejercicio.correcta
        )
      ),
      correcta: ejercicio.correcta,
      ayuda: "Leé toda la frase. No hace falta responder rápido.",
    };
  }

  /* =========================================================
     NIVELES 71 - 90
     ORDENAR Y RECONOCER FRASES
  ========================================================= */

  if (numero <= 90) {
    const ejercicios = [
      { frase: "El gato duerme en la cama.", correcta: "El", pregunta: "¿Con qué palabra empieza la frase?" },
      { frase: "La niña lee un libro.", correcta: "La", pregunta: "¿Con qué palabra empieza la frase?" },
      { frase: "Mi perro corre en el parque.", correcta: "Mi", pregunta: "¿Con qué palabra empieza la frase?" },
      { frase: "Tomás juega con una pelota.", correcta: "Tomás", pregunta: "¿Quién aparece primero en la frase?" },
      { frase: "La familia sale de paseo.", correcta: "La", pregunta: "¿Con qué palabra empieza la frase?" },
      { frase: "Sofía prepara su mochila.", correcta: "Sofía", pregunta: "¿Quién aparece primero en la frase?" },
      { frase: "El niño abre la ventana.", correcta: "El", pregunta: "¿Con qué palabra empieza la frase?" },
      { frase: "Mi mamá cocina la cena.", correcta: "Mi", pregunta: "¿Con qué palabra empieza la frase?" },
      { frase: "Lucas ordena sus juguetes.", correcta: "Lucas", pregunta: "¿Quién aparece primero en la frase?" },
      { frase: "La maestra explica la tarea.", correcta: "La", pregunta: "¿Con qué palabra empieza la frase?" },
    ];

    const ejercicio = ejercicios[(numero - 71) % ejercicios.length];

    return {
      tipo: "ordenar",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.frase,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["El", "La", "Mi", "Tomás", "Sofía", "Lucas", "niño", "familia"]
      ),
      correcta: ejercicio.correcta,
      ayuda: "Leé la frase de izquierda a derecha y buscá la primera palabra.",
    };
  }


  /* =========================================================
     NIVELES 91 - 110
     COMPLETAR PALABRAS INTERMEDIAS
  ========================================================= */

  if (numero <= 110) {
    const ejercicios = [
      { palabra: "MARIPOSA", posicion: 1 },
      { palabra: "ESCUELA", posicion: 2 },
      { palabra: "BICICLETA", posicion: 3 },
      { palabra: "CUADERNO", posicion: 4 },
      { palabra: "VENTANA", posicion: 2 },
      { palabra: "CAMINO", posicion: 3 },
      { palabra: "AMIGO", posicion: 1 },
      { palabra: "FAMILIA", posicion: 4 },
      { palabra: "JARDIN", posicion: 2 },
      { palabra: "AVENTURA", posicion: 5 },
    ];

    const ejercicio = ejercicios[(numero - 91) % ejercicios.length];
    const letra = ejercicio.palabra[ejercicio.posicion];
    const incompleta =
      ejercicio.palabra.substring(0, ejercicio.posicion) +
      "_" +
      ejercicio.palabra.substring(ejercicio.posicion + 1);

    return {
      tipo: "completar",
      pregunta: "Completá la palabra:",
      texto: incompleta,
      opciones: opcionesConRespuesta(
        letra,
        ["A", "E", "I", "O", "U", "B", "C", "M", "N", "R", "T", "L"]
      ),
      correcta: letra,
      ayuda: "Observá las letras que están antes y después del espacio.",
    };
  }


  /* =========================================================
     NIVELES 111 - 130
     COMPRENSIÓN INTERMEDIA
  ========================================================= */

  if (numero <= 130) {
    const ejercicios = [
      { texto: "Martina fue al parque porque quería jugar con sus amigos.", pregunta: "¿Por qué fue Martina al parque?", correcta: "jugar" },
      { texto: "Pedro guardó el libro en su mochila antes de salir.", pregunta: "¿Dónde guardó Pedro el libro?", correcta: "mochila" },
      { texto: "La maestra escribió una palabra nueva en el pizarrón.", pregunta: "¿Qué escribió la maestra?", correcta: "palabra" },
      { texto: "Sofía tomó agua después de correr durante mucho tiempo.", pregunta: "¿Qué tomó Sofía?", correcta: "agua" },
      { texto: "El perro encontró una pelota debajo de la mesa.", pregunta: "¿Qué encontró el perro?", correcta: "pelota" },
      { texto: "Lucas ordenó sus juguetes porque quería encontrar su auto.", pregunta: "¿Por qué ordenó sus juguetes?", correcta: "encontrar" },
      { texto: "Ana llevó un paraguas porque estaba por llover.", pregunta: "¿Qué llevó Ana?", correcta: "paraguas" },
      { texto: "El niño terminó la tarea y después salió a jugar.", pregunta: "¿Qué hizo después de terminar la tarea?", correcta: "jugar" },
      { texto: "La familia preparó la mesa antes de comenzar a comer.", pregunta: "¿Qué preparó la familia?", correcta: "mesa" },
      { texto: "Tomás leyó el cuento dos veces para entenderlo mejor.", pregunta: "¿Cuántas veces leyó el cuento?", correcta: "dos" },
    ];

    const ejercicio = ejercicios[(numero - 111) % ejercicios.length];

    return {
      tipo: "comprension",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.texto,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["jugar", "mochila", "palabra", "agua", "pelota", "encontrar", "paraguas", "mesa", "dos", "correr"]
      ),
      correcta: ejercicio.correcta,
      ayuda: "Leé todo el texto. La respuesta está dentro de la oración.",
    };
  }


  /* =========================================================
     NIVELES 131 - 150
     COMPRENSIÓN INTERMEDIA / DIFÍCIL
  ========================================================= */

  if (numero <= 150) {
    const ejercicios = [
      { texto: "Julia preparó su mochila la noche anterior para no llegar tarde a la escuela.", pregunta: "¿Por qué preparó Julia la mochila antes?", correcta: "no llegar tarde" },
      { texto: "Martín buscó sus lentes por toda la casa hasta encontrarlos sobre la mesa.", pregunta: "¿Dónde encontró Martín los lentes?", correcta: "sobre la mesa" },
      { texto: "El equipo practicó durante una hora antes de comenzar el partido.", pregunta: "¿Qué hizo el equipo antes del partido?", correcta: "practicó" },
      { texto: "Camila cerró la ventana porque comenzó a entrar mucho viento.", pregunta: "¿Por qué cerró Camila la ventana?", correcta: "por el viento" },
      { texto: "Nicolás llevó un libro a la biblioteca y luego eligió otro para leer en casa.", pregunta: "¿Qué eligió Nicolás para llevar a casa?", correcta: "otro libro" },
      { texto: "La familia salió temprano para llegar a tiempo al cumpleaños de la abuela.", pregunta: "¿Por qué salió temprano la familia?", correcta: "llegar a tiempo" },
      { texto: "Valentina ordenó los colores por grupos antes de comenzar su dibujo.", pregunta: "¿Qué hizo antes de dibujar?", correcta: "ordenó los colores" },
      { texto: "El alumno leyó nuevamente la consigna porque no había entendido la primera vez.", pregunta: "¿Por qué volvió a leer?", correcta: "no había entendido" },
      { texto: "Santiago dejó la bicicleta adentro porque comenzó a llover.", pregunta: "¿Por qué dejó la bicicleta adentro?", correcta: "porque llovía" },
      { texto: "Lucía terminó de estudiar y guardó todos sus materiales en la mochila.", pregunta: "¿Qué hizo después de estudiar?", correcta: "guardó los materiales" },
    ];

    const ejercicio = ejercicios[(numero - 131) % ejercicios.length];

    return {
      tipo: "comprension",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.texto,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["practicó", "por el viento", "otro libro", "llegar a tiempo", "ordenó los colores", "no había entendido", "porque llovía", "guardó los materiales", "sobre la mesa", "dibujó"]
      ),
      correcta: ejercicio.correcta,
      ayuda: "Buscá la información exacta. Algunas respuestas son parecidas entre sí.",
    };
  }


  /* =========================================================
     NIVELES 151 - 170
     ESCUCHAR Y DISCRIMINAR PALABRAS
  ========================================================= */

  if (numero <= 170) {
    const ejercicios = [
      { palabra: "ESCUELA", distractores: ["ESCUELA", "ESCALERA", "ESQUINA"] },
      { palabra: "MARIPOSA", distractores: ["MARIPOSA", "MARINERO", "MARIPOSAS"] },
      { palabra: "VENTANA", distractores: ["VENTANA", "VENTANA", "VENTURA"] },
      { palabra: "BICICLETA", distractores: ["BICICLETA", "BICICLETA", "BIBLIOTECA"] },
      { palabra: "CUADERNO", distractores: ["CUADERNO", "CUADRADO", "CUIDADO"] },
      { palabra: "FAMILIA", distractores: ["FAMILIA", "FANTASÍA", "FARMACIA"] },
      { palabra: "AVENTURA", distractores: ["AVENTURA", "VENTANA", "AVENTURA"] },
      { palabra: "JARDINERO", distractores: ["JARDINERO", "JARDÍN", "JUGUETERO"] },
      { palabra: "APRENDIZAJE", distractores: ["APRENDIZAJE", "APRENDER", "APROBACIÓN"] },
      { palabra: "ESCRITURA", distractores: ["ESCRITURA", "ESTRUCTURA", "ESCULTURA"] },
    ];

    const ejercicio = ejercicios[(numero - 151) % ejercicios.length];

    return {
      tipo: "escuchar",
      pregunta: "🔊 Escuchá la palabra y elegí exactamente la que escuchaste:",
      texto: ejercicio.palabra,
      opciones: opcionesConRespuesta(
        ejercicio.palabra,
        ejercicio.distractores.filter((opcion) => opcion !== ejercicio.palabra)
      ),
      correcta: ejercicio.palabra,
      ayuda: "Podés escuchar nuevamente antes de responder. Prestá atención a cada sílaba.",
    };
  }


  /* =========================================================
     NIVELES 171 - 190
     PALABRAS DIFÍCILES Y COMPRENSIÓN
  ========================================================= */

  if (numero <= 190) {
    const ejercicios = [
      { texto: "La responsabilidad de cuidar el material es de todos los estudiantes.", pregunta: "¿Qué deben cuidar los estudiantes?", correcta: "el material" },
      { texto: "La concentración ayuda a comprender mejor una lectura difícil.", pregunta: "¿Qué ayuda a comprender mejor?", correcta: "la concentración" },
      { texto: "El aprendizaje mejora cuando practicamos un poco todos los días.", pregunta: "¿Cuándo mejora el aprendizaje?", correcta: "cuando practicamos" },
      { texto: "La comunicación permite compartir ideas con otras personas.", pregunta: "¿Qué permite compartir ideas?", correcta: "la comunicación" },
      { texto: "La imaginación ayuda a crear historias nuevas y divertidas.", pregunta: "¿Qué ayuda a crear historias?", correcta: "la imaginación" },
      { texto: "La organización permite encontrar rápidamente los materiales.", pregunta: "¿Qué permite encontrar los materiales?", correcta: "la organización" },
      { texto: "Una oportunidad para practicar puede ayudar a mejorar una habilidad.", pregunta: "¿Qué puede ayudar a mejorar una habilidad?", correcta: "una oportunidad" },
      { texto: "La experiencia aumenta cuando aprendemos de nuestros errores.", pregunta: "¿Qué aumenta cuando aprendemos de nuestros errores?", correcta: "la experiencia" },
      { texto: "La información debe leerse con atención antes de tomar una decisión.", pregunta: "¿Cómo debe leerse la información?", correcta: "con atención" },
      { texto: "Una aventura extraordinaria puede comenzar con una pequeña idea.", pregunta: "¿Con qué puede comenzar una aventura?", correcta: "una pequeña idea" },
    ];

    const ejercicio = ejercicios[(numero - 171) % ejercicios.length];

    return {
      tipo: "comprension",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.texto,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        ["el material", "la concentración", "cuando practicamos", "la comunicación", "la imaginación", "la organización", "una oportunidad", "la experiencia", "con atención", "una pequeña idea"]
      ),
      correcta: ejercicio.correcta,
      ayuda: "Este nivel es más difícil. Leé dos veces si lo necesitás.",
    };
  }


  /* =========================================================
     NIVELES 191 - 199
     DESAFÍO AVANZADO
  ========================================================= */

  if (numero <= 199) {
    const ejercicios = [
      {
        texto: "Aunque el camino era largo, Martina continuó caminando porque quería llegar antes del anochecer.",
        pregunta: "¿Por qué continuó caminando Martina?",
        correcta: "quería llegar antes del anochecer",
      },
      {
        texto: "Pedro revisó dos veces la tarea antes de entregarla para evitar errores.",
        pregunta: "¿Para qué revisó la tarea dos veces?",
        correcta: "evitar errores",
      },
      {
        texto: "Como había olvidado el paraguas, Lucas esperó unos minutos hasta que terminó la lluvia.",
        pregunta: "¿Por qué esperó Lucas?",
        correcta: "había olvidado el paraguas",
      },
      {
        texto: "Sofía eligió el libro más corto porque tenía poco tiempo para leerlo.",
        pregunta: "¿Por qué eligió el libro más corto?",
        correcta: "tenía poco tiempo",
      },
      {
        texto: "El grupo organizó sus materiales antes de comenzar el proyecto para trabajar mejor.",
        pregunta: "¿Para qué organizó los materiales?",
        correcta: "para trabajar mejor",
      },
      {
        texto: "Ana volvió a leer el párrafo porque una palabra importante no había quedado clara.",
        pregunta: "¿Por qué volvió a leer?",
        correcta: "una palabra no había quedado clara",
      },
      {
        texto: "Tomás guardó el dibujo con cuidado para que no se doblara dentro de la mochila.",
        pregunta: "¿Para qué lo guardó con cuidado?",
        correcta: "para que no se doblara",
      },
      {
        texto: "La familia decidió salir temprano porque el viaje podía durar varias horas.",
        pregunta: "¿Por qué decidió salir temprano?",
        correcta: "el viaje podía durar varias horas",
      },
      {
        texto: "El estudiante subrayó las ideas principales para recordarlas cuando estudiara nuevamente.",
        pregunta: "¿Para qué subrayó las ideas principales?",
        correcta: "para recordarlas",
      },
    ];

    const ejercicio = ejercicios[(numero - 191) % ejercicios.length];

    return {
      tipo: "comprension",
      pregunta: ejercicio.pregunta,
      texto: ejercicio.texto,
      opciones: opcionesConRespuesta(
        ejercicio.correcta,
        [
          "evitar errores",
          "quería llegar antes del anochecer",
          "había olvidado el paraguas",
          "tenía poco tiempo",
          "para trabajar mejor",
          "una palabra no había quedado clara",
          "para que no se doblara",
          "el viaje podía durar varias horas",
          "para recordarlas",
          "porque estaba cansado",
        ]
      ),
      correcta: ejercicio.correcta,
      ayuda: "🏅 Desafío avanzado: compará cada opción con la información del texto.",
    };
  }


  /* =========================================================
     NIVEL 200
     DESAFÍO MAESTRO
  ========================================================= */

  return {
    tipo: "comprension",
    pregunta: "🏆 ¡DESAFÍO MAESTRO! ¿Cuál es la idea principal?",
    texto:
      "Para aprender algo nuevo, es importante practicar con calma, prestar atención a los detalles y volver a intentarlo cuando una actividad resulta difícil. Cada pequeño avance ayuda a mejorar.",
    opciones: [
      "Practicar con calma ayuda a aprender.",
      "Nunca hay que volver a intentar.",
      "Aprender siempre es fácil.",
      "Los detalles no son importantes.",
    ],
    correcta: "Practicar con calma ayuda a aprender.",
    ayuda:
      "🏆 Llegaste al nivel 200. Leé todo el texto, pensá en la idea principal y elegí la mejor respuesta.",
  };
}


/* =========================================================

   COMPONENTE PRINCIPAL

\========================================================= */



export default function HomeScreen() {

  const [nombre, setNombre] =

    useState("");



  const [perfil, setPerfil] =

    useState<Perfil>("");



  const [pantallaNino, setPantallaNino] =

    useState<PantallaNino>("inicio");



  const [estrellas, setEstrellas] =

    useState(0);



  const [

    nivelesCompletados,

    setNivelesCompletados,

  ] = useState<number[]>([]);



  const [nivelActual, setNivelActual] =

    useState(1);



  const [mensajeJuego, setMensajeJuego] =

    useState("");



  const [

    respuestaElegida,

    setRespuestaElegida,

  ] = useState("");

  const [modoLectura, setModoLectura] = useState(false);

  const [tamanoLectura, setTamanoLectura] = useState(25);

  const [espaciadoLectura, setEspaciadoLectura] = useState(42);

  const [altoContraste, setAltoContraste] = useState(false);

  const [ultimoTextoHablado, setUltimoTextoHablado] = useState("");

  const [vozActiva, setVozActiva] = useState(false);



  const [

    nombreGuardado,

    setNombreGuardado,

  ] = useState(false);



  const ejercicioActual = useMemo(

    () => crearEjercicio(nivelActual),

    [nivelActual]

  );



  const textoLectura =

    "El gato juega con una pelota. Corre por la casa y salta muy alto. Después se queda tranquilo y descansa.";



  /* =======================================================

     CARGAR DATOS

  ======================================================= */



  useEffect(() => {

    AsyncStorage.getItem("estrellas").then(

      (valor) => {

        if (valor !== null) {

          setEstrellas(Number(valor));

        }

      }

    );



    AsyncStorage.getItem(

      "nivelesCompletados"

    ).then((valor) => {

      if (valor !== null) {

        try {

          setNivelesCompletados(

            JSON.parse(valor)

          );

        } catch {

          setNivelesCompletados([]);

        }

      }

    });



    AsyncStorage.getItem("nombre").then(

      (valor) => {

        if (valor !== null) {

          setNombre(valor);

          setNombreGuardado(true);

        }

      }

    );

  }, []);



  /* =======================================================

     VOZ

  ======================================================= */



  function hablar(texto: string) {

    if (!texto.trim()) return;

    Speech.stop();
    setUltimoTextoHablado(texto);
    setVozActiva(true);

    Speech.speak(texto, {
      language: "es-AR",
      rate: 0.78,
      pitch: 1,
      onDone: () => setVozActiva(false),
      onStopped: () => setVozActiva(false),
      onError: () => setVozActiva(false),
    });
  }

  function repetirVoz() {
    if (ultimoTextoHablado) hablar(ultimoTextoHablado);
  }

  function detenerVoz() {
    Speech.stop();
    setVozActiva(false);
  }


  /* =======================================================

     ESTRELLA

  ======================================================= */



  function ganarEstrella() {

    setEstrellas((actual) => {

      const nuevasEstrellas =

        actual + 1;



      AsyncStorage.setItem(

        "estrellas",

        String(nuevasEstrellas)

      );



      return nuevasEstrellas;

    });

  }



  /* =======================================================

     COMPLETAR NIVEL

  ======================================================= */



  function completarNivel(numero: number) {

    setNivelesCompletados((actuales) => {

      if (actuales.includes(numero)) {

        return actuales;

      }



      const nuevos = [

        ...actuales,

        numero,

      ].sort((a, b) => a - b);



      AsyncStorage.setItem(

        "nivelesCompletados",

        JSON.stringify(nuevos)

      );



      return nuevos;

    });

  }



  /* =======================================================

     NIVEL DESBLOQUEADO

  ======================================================= */



  function nivelDesbloqueado(

    numero: number

  ) {

    if (numero === 1) {

      return true;

    }



    return nivelesCompletados.includes(

      numero - 1

    );

  }



  /* =======================================================

     RESPONDER

  ======================================================= */



  function responder(opcion: string) {

    setRespuestaElegida(opcion);



    if (

      opcion ===

      ejercicioActual.correcta

    ) {

      const yaEstabaCompletado =

        nivelesCompletados.includes(

          nivelActual

        );



      if (!yaEstabaCompletado) {

        ganarEstrella();

        completarNivel(

          nivelActual

        );

      }



      setMensajeJuego(

        "⭐ ¡Muy bien! ¡Respuesta correcta!"

      );



      hablar(

        "Muy bien. Respuesta correcta."

      );

    } else {

      setMensajeJuego(

        "💛 Probá otra vez. Mirá con atención."

      );



      hablar(

        "Probá otra vez."

      );

    }

  }



  /* =======================================================

     SIGUIENTE NIVEL

  ======================================================= */



  function siguienteNivel() {

    if (

      nivelActual >=

      TOTAL_NIVELES

    ) {

      setMensajeJuego(

        "🏆 ¡Llegaste al nivel 200!"

      );



      return;

    }



    const siguiente =

      nivelActual + 1;



    setNivelActual(siguiente);

    setMensajeJuego("");

    setRespuestaElegida("");

  }



  /* =======================================================

     SELECCIONAR NIVEL

  ======================================================= */



  function seleccionarNivel(

    numero: number

  ) {

    if (

      !nivelDesbloqueado(numero)

    ) {

      setMensajeJuego(

        "🔒 Primero completá el nivel anterior."

      );



      return;

    }



    setNivelActual(numero);

    setMensajeJuego("");

    setRespuestaElegida("");

    setPantallaNino("jugar");

  }



  /* =======================================================

     VOLVER AL MENÚ

  ======================================================= */



  function volverInicio() {

    detenerVoz();

    setMensajeJuego("");

    setRespuestaElegida("");

    setPantallaNino("inicio");

  }



  /* =======================================================

     VOLVER A NIVELES

  ======================================================= */



  function volverNiveles() {

    detenerVoz();

    setMensajeJuego("");

    setRespuestaElegida("");

    setPantallaNino("niveles");

  }



  const porcentaje =

    (nivelesCompletados.length /

      TOTAL_NIVELES) *

    100;



  /* =======================================================

     PERFIL NIÑO

  ======================================================= */



  if (perfil === "nino") {

    /* =====================================================

       LISTA DE NIVELES

    ===================================================== */



    if (pantallaNino === "niveles") {
      return (
        <Niveles
          nivelActual={nivelActual}
          nivelesCompletados={nivelesCompletados}
          totalNiveles={TOTAL_NIVELES}
          onSeleccionarNivel={(nivel) => {
            setNivelActual(nivel);
            setPantallaNino("jugar");
          }}
          onVolver={() => {
            setPantallaNino("inicio");
          }}
        />
      );
    }


    /* =====================================================

       JUGAR NIVEL

    ===================================================== */



    if (

      pantallaNino ===

      "jugar"

    ) {

      return (

        <View

          style={

            styles.screenWrapper

          }

        >

          {/* FLECHA SUPERIOR */}



          <SafeAreaView style={styles.topSafeArea}>
          <View

            style={

              styles.topBar

            }

          >

            <Pressable

              style={

                styles.topBackButton

              }

              onPress={

                volverNiveles

              }

            >

              <Text

                style={

                  styles.topBackText

                }

              >

                ←

              </Text>

            </Pressable>



            <Text

              style={

                styles.topBarTitle

              }

            >

              Nivel{" "}

              {nivelActual}

            </Text>



            <View

              style={

                styles.topBarSpacer

              }

            />

          </View>
          </SafeAreaView>



          <ScrollView

            contentContainerStyle={

              styles.ninoContainer

            }

          >

            <Text

              style={

                styles.ninoLogo

              }

            >

              Lectura+ ⭐

            </Text>



            <Text

              style={

                styles.ninoTitle

              }

            >

              🎮 Nivel{" "}

              {nivelActual}

            </Text>



            <Text

              style={

                styles.difficulty

              }

            >

              {dificultadNivel(

                nivelActual

              )}

            </Text>



            <View

              style={

                styles.levelCard

              }

            >

              <Text

                style={

                  styles.levelStars

                }

              >

                ⭐ {estrellas} estrellas

              </Text>



              <Text

                style={

                  styles.progressText

                }

              >

                🏆{" "}

                {

                  nivelesCompletados.length

                }{" "}

                /{" "}

                {TOTAL_NIVELES}{" "}

                niveles

              </Text>



              <Text

                style={

                  styles.progressText

                }

              >

                📈{" "}

                {porcentaje.toFixed(

                  0

                )}

                %

              </Text>

            </View>



            <View

              style={

                styles.exerciseCard

              }

            >

              <Text

                style={

                  styles.exerciseType

                }

              >

                {ejercicioActual.tipo ===

                  "palabra" &&

                  "🔤 PALABRAS"}



                {ejercicioActual.tipo ===

                  "letra" &&

                  "🔠 LETRAS"}



                {ejercicioActual.tipo ===

                  "completar" &&

                  "🧩 COMPLETAR"}



                {ejercicioActual.tipo ===

                  "ordenar" &&

                  "🔀 ORDENAR"}



                {ejercicioActual.tipo ===

                  "frase" &&

                  "📖 FRASES"}



                {ejercicioActual.tipo ===

                  "comprension" &&

                  "🧠 COMPRENSIÓN"}



                {ejercicioActual.tipo ===

                  "escuchar" &&

                  "🔊 ESCUCHAR"}

              </Text>



              <Text

                style={

                  styles.ninoQuestion

                }

              >

                {

                  ejercicioActual.pregunta

                }

              </Text>



              {ejercicioActual.texto && (

                <View

                  style={

                    styles.wordCard

                  }

                >

                  <Text

                    style={

                      styles.bigWord

                    }

                  >

                    {

                      ejercicioActual.texto

                    }

                  </Text>

                </View>

              )}



              {ejercicioActual.ayuda && (

                <Text

                  style={

                    styles.helpText

                  }

                >

                  💡{" "}

                  {

                    ejercicioActual.ayuda

                  }

                </Text>

              )}



              {ejercicioActual.texto && (

                <Pressable

                  style={

                    styles.listenSmallButton

                  }

                  onPress={() =>

                    hablar(

                      ejercicioActual.texto!

                    )

                  }

                >

                  <Text

                    style={

                      styles.listenSmallText

                    }

                  >

                    🔊 ESCUCHAR

                  </Text>

                </Pressable>

              )}



              <View style={styles.voiceRow}>
                <Pressable style={styles.voiceButton} onPress={() => hablar(ejercicioActual.texto || "")}><Text style={styles.voiceButtonText}>🔁 REPETIR TEXTO</Text></Pressable>
                {vozActiva && <Pressable style={styles.voiceButton} onPress={detenerVoz}><Text style={styles.voiceButtonText}>⏹ DETENER</Text></Pressable>}
              </View>

              {ejercicioActual.opciones.map(

                (

                  opcion,

                  indice

                ) => {

                  const elegida =

                    respuestaElegida ===

                    opcion;



                  const correcta =

                    opcion ===

                    ejercicioActual.correcta;



                  return (

                    <Pressable

                      key={`${opcion}-${indice}`}

                      style={[

                        styles.gameButton,

                        elegida &&

                          correcta &&

                          styles.correctButton,

                        elegida &&

                          !correcta &&

                          styles.wrongButton,

                      ]}

                      onPress={() =>

                        responder(

                          opcion

                        )

                      }

                    >

                      <Text

                        style={

                          styles.gameButtonText

                        }

                      >

                        {opcion}

                      </Text>

                    </Pressable>

                  );

                }

              )}

            </View>



            {mensajeJuego !==

              "" && (

              <View

                style={

                  styles.messageCard

                }

              >

                <Text

                  style={

                    styles.gameMessage

                  }

                >

                  {mensajeJuego}

                </Text>

              </View>

            )}



            {nivelesCompletados.includes(

              nivelActual

            ) && (
              <View style={styles.rewardCard}>
                <Text style={styles.rewardTitle}>🎉 ¡Nivel superado!</Text>
                <Text style={styles.rewardText}>Ganaste una estrella y desbloqueaste el siguiente desafío.</Text>
              </View>
            )}

            {nivelesCompletados.includes(

              nivelActual

            ) && (

              <Pressable

                style={

                  styles.nextButton

                }

                onPress={

                  siguienteNivel

                }

              >

                <Text

                  style={

                    styles.nextButtonText

                  }

                >

                  ➡️ SIGUIENTE NIVEL

                </Text>

              </Pressable>

            )}



            <Pressable

              style={

                styles.backButton

              }

              onPress={

                volverNiveles

              }

            >

              <Text

                style={

                  styles.backText

                }

              >

                ← Volver a niveles

              </Text>

            </Pressable>

          </ScrollView>

        </View>

      );

    }



    /* =====================================================

       LEER

    ===================================================== */



    if (

      pantallaNino ===

      "leer"

    ) {

      return (

        <View

          style={

            styles.screenWrapper

          }

        >

          <SafeAreaView style={styles.topSafeArea}>
          <View

            style={

              styles.topBar

            }

          >

            <Pressable

              style={

                styles.topBackButton

              }

              onPress={

                volverInicio

              }

            >

              <Text

                style={

                  styles.topBackText

                }

              >

                ←

              </Text>

            </Pressable>



            <Text

              style={

                styles.topBarTitle

              }

            >

              Mi lectura

            </Text>



            <View

              style={

                styles.topBarSpacer

              }

            />

          </View>
          </SafeAreaView>



          <ScrollView

            contentContainerStyle={

              styles.ninoContainer

            }

          >

            <Text

              style={

                styles.ninoLogo

              }

            >

              Lectura+ ⭐

            </Text>



            <Text

              style={

                styles.readTitle

              }

            >

              📖 Mi lectura

            </Text>



            <View

              style={

                styles.readCard

              }

            >

              <Text

                style={[
                  styles.readText,
                  {
                    fontSize: tamanoLectura,
                    lineHeight: espaciadoLectura,
                    letterSpacing: modoLectura ? 1.4 : 0.2,
                    color: altoContraste ? "#000000" : "#222222",
                  },
                ]}

              >

                El gato juega con una

                pelota.

              </Text>



              <Text

                style={[
                  styles.readText,
                  {
                    fontSize: tamanoLectura,
                    lineHeight: espaciadoLectura,
                    letterSpacing: modoLectura ? 1.4 : 0.2,
                    color: altoContraste ? "#000000" : "#222222",
                  },
                ]}

              >

                Corre por la casa y

                salta muy alto.

              </Text>



              <Text

                style={[
                  styles.readText,
                  {
                    fontSize: tamanoLectura,
                    lineHeight: espaciadoLectura,
                    letterSpacing: modoLectura ? 1.4 : 0.2,
                    color: altoContraste ? "#000000" : "#222222",
                  },
                ]}

              >

                Después se queda

                tranquilo y descansa.

              </Text>

            </View>



            <View style={styles.readControls}>
              <Text style={styles.readControlsTitle}>⚙️ Adaptar lectura</Text>
              <View style={styles.readControlRow}>
                <Pressable style={styles.smallControlButton} onPress={() => setTamanoLectura((v) => Math.max(20, v - 2))}><Text style={styles.smallControlText}>A−</Text></Pressable>
                <Text style={styles.controlValue}>{tamanoLectura}px</Text>
                <Pressable style={styles.smallControlButton} onPress={() => setTamanoLectura((v) => Math.min(38, v + 2))}><Text style={styles.smallControlText}>A+</Text></Pressable>
              </View>
              <View style={styles.readControlRow}>
                <Pressable style={styles.smallControlButton} onPress={() => setEspaciadoLectura((v) => Math.max(32, v - 2))}><Text style={styles.smallControlText}>↕−</Text></Pressable>
                <Text style={styles.controlValue}>Espacio</Text>
                <Pressable style={styles.smallControlButton} onPress={() => setEspaciadoLectura((v) => Math.min(58, v + 2))}><Text style={styles.smallControlText}>↕+</Text></Pressable>
              </View>
              <Pressable style={[styles.optionButton, altoContraste && styles.optionButtonActive]} onPress={() => setAltoContraste((v) => !v)}><Text style={styles.optionButtonText}>◐ Alto contraste</Text></Pressable>
              <Pressable style={[styles.optionButton, modoLectura && styles.optionButtonActive]} onPress={() => setModoLectura((v) => !v)}><Text style={styles.optionButtonText}>📖 Lectura amigable para dislexia</Text></Pressable>
            </View>

            <Pressable

              style={

                styles.ninoButton

              }

              onPress={() =>

                hablar(

                  textoLectura

                )

              }

            >

              <Text

                style={

                  styles.ninoButtonText

                }

              >

                📢 ESCUCHAR

              </Text>

            </Pressable>



                        <View style={styles.voiceRow}>
              <Pressable style={styles.voiceButton} onPress={repetirVoz}><Text style={styles.voiceButtonText}>🔁 REPETIR</Text></Pressable>
              {vozActiva && <Pressable style={styles.voiceButton} onPress={detenerVoz}><Text style={styles.voiceButtonText}>⏹ DETENER</Text></Pressable>}
            </View>

<Pressable

              style={

                styles.backButton

              }

              onPress={

                volverInicio

              }

            >

              <Text

                style={

                  styles.backText

                }

              >

                ← Volver

              </Text>

            </Pressable>

          </ScrollView>

        </View>

      );

    }



    /* =====================================================

       ESCUCHAR

    ===================================================== */



    if (

      pantallaNino ===

      "escuchar"

    ) {

      return (

        <View

          style={

            styles.screenWrapper

          }

        >

          <SafeAreaView style={styles.topSafeArea}>
          <View

            style={

              styles.topBar

            }

          >

            <Pressable

              style={

                styles.topBackButton

              }

              onPress={

                volverInicio

              }

            >

              <Text

                style={

                  styles.topBackText

                }

              >

                ←

              </Text>

            </Pressable>



            <Text

              style={

                styles.topBarTitle

              }

            >

              Escuchar

            </Text>



            <View

              style={

                styles.topBarSpacer

              }

            />

          </View>
          </SafeAreaView>



          <View

            style={

              styles.ninoContainer

            }

          >

            <Text

              style={

                styles.ninoLogo

              }

            >

              Lectura+ ⭐

            </Text>



            <Text

              style={

                styles.ninoTitle

              }

            >

              🔊 Escuchar

            </Text>



            <Text

              style={

                styles.listenText

              }

            >

              Tocá el botón para

              escuchar una frase.

            </Text>



            <Pressable

              style={

                styles.ninoButton

              }

              onPress={() =>

                hablar(

                  "Hola. Vamos a aprender jugando con Lectura más."

                )

              }

            >

              <Text

                style={

                  styles.ninoButtonText

                }

              >

                🔊 ESCUCHAR

              </Text>

            </Pressable>



            <Pressable

              style={

                styles.backButton

              }

              onPress={

                volverInicio

              }

            >

              <Text

                style={

                  styles.backText

                }

              >

                ← Volver

              </Text>

            </Pressable>

          </View>

        </View>

      );

    }



    /* =====================================================

       PROGRESO

    ===================================================== */



    if (

      pantallaNino ===

      "progreso"

    ) {

      return (

        <View

          style={

            styles.screenWrapper

          }

        >

          <SafeAreaView style={styles.topSafeArea}>
          <View

            style={

              styles.topBar

            }

          >

            <Pressable

              style={

                styles.topBackButton

              }

              onPress={

                volverInicio

              }

            >

              <Text

                style={

                  styles.topBackText

                }

              >

                ←

              </Text>

            </Pressable>



            <Text

              style={

                styles.topBarTitle

              }

            >

              Mi progreso

            </Text>



            <View

              style={

                styles.topBarSpacer

              }

            />

          </View>
          </SafeAreaView>



          <ScrollView

            contentContainerStyle={

              styles.ninoContainer

            }

          >

            <Text

              style={

                styles.ninoLogo

              }

            >

              Lectura+ ⭐

            </Text>



            <Text

              style={

                styles.ninoTitle

              }

            >

              📊 Mi progreso

            </Text>



            <View

              style={

                styles.progressCard

              }

            >

              <Text

                style={

                  styles.progressBig

                }

              >

                ⭐ {estrellas}

              </Text>



              <Text

                style={

                  styles.progressText

                }

              >

                estrellas conseguidas

              </Text>



              <Text

                style={

                  styles.progressLevel

                }

              >

                🏆{" "}

                {

                  nivelesCompletados.length

                }{" "}

                /{" "}

                {TOTAL_NIVELES}

              </Text>



              <Text

                style={

                  styles.progressText

                }

              >

                niveles completados

              </Text>



              <Text

                style={

                  styles.progressLevel

                }

              >

                📈{" "}

                {porcentaje.toFixed(

                  0

                )}

                %

              </Text>



              <Text

                style={

                  styles.progressText

                }

              >

                {nivelActual < 5

                  ? "🌱 Estamos empezando."

                  : nivelActual < 20

                  ? "🚀 Vas muy bien."

                  : nivelActual < 50

                  ? "🔥 Gran progreso."

                  : nivelActual < 100

                  ? "💪 Cada vez mejor."

                  : nivelActual < 200

                  ? "🏆 Estás llegando muy lejos."

                  : "👑 ¡Sos un maestro de Lectura+!"}

              </Text>

            </View>



            <Pressable

              style={

                styles.backButton

              }

              onPress={

                volverInicio

              }

            >

              <Text

                style={

                  styles.backText

                }

              >

                ← Volver

              </Text>

            </Pressable>

          </ScrollView>

        </View>

      );

    }



    /* =====================================================

       INICIO NIÑO

    ===================================================== */

    return (
      <NinosHome
        nombre={nombre}
        estrellas={estrellas}

        onNiveles={() =>
          setPantallaNino("niveles")
        }

        onLeer={() =>
          setPantallaNino("leer")
        }

        onEscuchar={() =>
          setPantallaNino("escuchar")
        }

        onProgreso={() =>
          setPantallaNino("progreso")
        }

        onCambiarPerfil={() => {
          Speech.stop();
          setPerfil("");
          setPantallaNino("inicio");
        }}
      />
    );
  }

  

  /* =======================================================

     ADOLESCENTE

  ======================================================= */



  if (

    perfil ===

    "adolescente"

  ) {

    return (

      <ScrollView

        contentContainerStyle={

          styles.adolescenteContainer

        }

      >

        <Text

          style={

            styles.logo

          }

        >

          Lectura+

        </Text>



        <Text

          style={

            styles.title

          }

        >

          Hola,{" "}

          {nombre ||

            "usuario"}{" "}

          👋

        </Text>



        <Text

          style={

            styles.subtitle

          }

        >

          Tu espacio de lectura

        </Text>



        <Pressable

          style={

            styles.button

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            📚 Mis lecturas

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.button

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            🧠 Desafíos

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.button

          }

          onPress={() =>

            hablar(

              textoLectura

            )

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            🔊 Escuchar un texto

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.button

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            📊 Mi progreso

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.backButton

          }

          onPress={() =>

            setPerfil("")

          }

        >

          <Text

            style={

              styles.backText

            }

          >

            ← Cambiar perfil

          </Text>

        </Pressable>

      </ScrollView>

    );

  }



  /* =======================================================

     ADULTO

  ======================================================= */



  if (

    perfil ===

    "adulto"

  ) {

    return (

      <ScrollView

        contentContainerStyle={

          styles.adultoContainer

        }

      >

        <Text

          style={

            styles.logo

          }

        >

          Lectura+

        </Text>



        <Text

          style={

            styles.title

          }

        >

          Hola,{" "}

          {nombre ||

            "usuario"}{" "}

          👋

        </Text>



        <Text

          style={

            styles.subtitle

          }

        >

          Herramientas para una

          lectura más cómoda

        </Text>



        <Pressable

          style={

            styles.button

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            📄 Adaptar un texto

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.button

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            📷 Escanear texto

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.button

          }

          onPress={() =>

            hablar(

              textoLectura

            )

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            🔊 Escuchar texto

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.button

          }

        >

          <Text

            style={

              styles.buttonText

            }

          >

            📊 Mi progreso

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.backButton

          }

          onPress={() =>

            setPerfil("")

          }

        >

          <Text

            style={

              styles.backText

            }

          >

            ← Cambiar perfil

          </Text>

        </Pressable>

      </ScrollView>

    );

  }



  /* =======================================================

     PANTALLA INICIAL

  ======================================================= */



  return (

    <ScrollView

      contentContainerStyle={

        styles.container

      }

    >

      <Text

        style={

          styles.logo

        }

      >

        Lectura+ ⭐

      </Text>



      <Text

        style={

          styles.title

        }

      >

        ¡Hola! 👋

      </Text>



      <Text

        style={

          styles.subtitle

        }

      >

        Una forma más fácil de

        leer, aprender y jugar.

      </Text>



      <Text

        style={

          styles.label

        }

      >

        ¿Cómo te llamás?

      </Text>



      <TextInput

        style={

          styles.input

        }

        placeholder="Escribí tu nombre"

        placeholderTextColor="#777"

        value={nombre}

        onChangeText={(

          texto

        ) => {

          setNombre(texto);



          if (

            texto.trim() !==

            ""

          ) {

            AsyncStorage.setItem(

              "nombre",

              texto

            );



            setNombreGuardado(

              true

            );

          }

        }}

      />



      <Text

        style={

          styles.label

        }

      >

        Elegí tu perfil

      </Text>



      <Pressable

        style={

          styles.button

        }

        onPress={() =>

          setPerfil("nino")

        }

      >

        <Text

          style={

            styles.buttonText

          }

        >

          🧒 Niño/a

        </Text>

      </Pressable>



      <Pressable

        style={

          styles.button

        }

        onPress={() =>

          setPerfil(

            "adolescente"

          )

        }

      >

        <Text

          style={

            styles.buttonText

          }

        >

          🧑 Adolescente

        </Text>

      </Pressable>



      <Pressable

        style={

          styles.button

        }

        onPress={() =>

          setPerfil("adulto")

        }

      >

        <Text

          style={

            styles.buttonText

          }

        >

          👨 Adulto/a

        </Text>

      </Pressable>



      {nombreGuardado && (

        <Text

          style={

            styles.savedText

          }

        >

          💾 Tu nombre quedó

          guardado.

        </Text>

      )}

    </ScrollView>

  );

}


/* =========================================================

   ESTILOS

\========================================================= */



const styles =

  StyleSheet.create({

    screenWrapper: {

      flex: 1,

      backgroundColor:

        "#FFF4D6",

    },

    topSafeArea: {
      backgroundColor: "#FFF4D6",
    },



    container: {

      flexGrow: 1,

      justifyContent:

        "center",

      padding: 28,

      backgroundColor:

        "#F7F4FF",

    },



    ninoContainer: {

      flexGrow: 1,

      padding: 28,

      backgroundColor:

        "#FFF4D6",

      paddingBottom: 60,

    },



    adolescenteContainer: {

      flexGrow: 1,

      justifyContent:

        "center",

      padding: 28,

      backgroundColor:

        "#EAF4FF",

    },



    adultoContainer: {

      flexGrow: 1,

      justifyContent:

        "center",

      padding: 28,

      backgroundColor:

        "#F3F3F3",

    },



    /* =====================================================

       BARRA SUPERIOR

    ===================================================== */



    topBar: {

      height: 76,
      paddingTop: 10,

      backgroundColor:

        "#FFFFFF",

      borderBottomWidth: 2,

      borderBottomColor:

        "#777",

      flexDirection:

        "row",

      alignItems:

        "center",

      justifyContent:

        "space-between",

      paddingHorizontal: 12,

      zIndex: 10,

    },



    topBackButton: {

      width: 58,

      height: 58,

      borderRadius: 29,

      backgroundColor:

        "#F1F1F1",

      borderWidth: 2,

      borderColor:

        "#555",

      alignItems:

        "center",

      justifyContent:

        "center",

    },



    topBackText: {

      fontSize: 38,

      fontWeight:

        "800",

      lineHeight: 42,

    },



    topBarTitle: {

      fontSize: 23,

      fontWeight:

        "800",

      textAlign:

        "center",

    },



    topBarSpacer: {

      width: 58,

    },



    /* =====================================================

       GENERAL

    ===================================================== */



    logo: {

      fontSize: 38,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 25,

    },



    ninoLogo: {

      fontSize: 38,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 25,

    },



    title: {

      fontSize: 32,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 15,

    },



    ninoTitle: {

      fontSize: 34,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 15,

    },



    ninoQuestion: {

      fontSize: 23,

      fontWeight:

        "700",

      textAlign:

        "center",

      marginBottom: 22,

      lineHeight: 31,

    },



    subtitle: {

      fontSize: 20,

      textAlign:

        "center",

      marginBottom: 25,

      lineHeight: 30,

    },



    ninoSubtitle: {

      fontSize: 23,

      fontWeight:

        "600",

      textAlign:

        "center",

      marginBottom: 20,

    },



    label: {

      fontSize: 18,

      fontWeight:

        "700",

      marginBottom: 10,

    },



    input: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 2,

      borderColor:

        "#888",

      borderRadius: 14,

      padding: 16,

      fontSize: 20,

      marginBottom: 20,

    },



    button: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 2,

      borderColor:

        "#888",

      borderRadius: 16,

      padding: 17,

      marginBottom: 12,

      alignItems:

        "center",

    },



    buttonText: {

      fontSize: 20,

      fontWeight:

        "700",

    },



    ninoButton: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 2,

      borderColor:

        "#555",

      borderRadius: 20,

      padding: 20,

      marginBottom: 16,

      alignItems:

        "center",

    },



    ninoButtonText: {

      fontSize: 23,

      fontWeight:

        "800",

    },



    /* =====================================================

       NIVELES

    ===================================================== */



    levelCard: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 2,

      borderColor:

        "#777",

      borderRadius: 22,

      padding: 20,

      marginBottom: 22,

      alignItems:

        "center",

    },



    levelTitle: {

      fontSize: 27,

      fontWeight:

        "800",

      marginBottom: 8,

      textAlign:

        "center",

    },



    levelStars: {

      fontSize: 22,

      fontWeight:

        "800",

      marginBottom: 10,

      textAlign:

        "center",

    },



    levelIntro: {

      fontSize: 20,

      textAlign:

        "center",

      lineHeight: 30,

      marginBottom: 20,

    },



    levelButton: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 3,

      borderColor:

        "#555",

      borderRadius: 22,

      padding: 20,

      marginBottom: 16,

      alignItems:

        "center",

      width: "100%",

    },



    levelLocked: {

      opacity: 0.45,

    },



    levelCompleted: {

      borderWidth: 4,

    },



    levelButtonTitle: {

      fontSize: 26,

      fontWeight:

        "800",

      marginBottom: 6,

      textAlign:

        "center",

    },



    levelButtonText: {

      fontSize: 19,

      marginBottom: 8,

      textAlign:

        "center",

    },



    unlockText: {

      fontSize: 17,

      fontWeight:

        "700",

      textAlign:

        "center",

    },



    difficulty: {

      fontSize: 22,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 18,

    },



    /* =====================================================

       EJERCICIOS

    ===================================================== */



    exerciseCard: {

      backgroundColor:

        "#FFFDF5",

      borderWidth: 2,

      borderColor:

        "#777",

      borderRadius: 25,

      padding: 22,

      marginBottom: 20,

    },



    exerciseType: {

      fontSize: 18,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 15,

    },



    wordCard: {

      backgroundColor:

        "#FFFFFF",

      borderRadius: 20,

      padding: 25,

      marginBottom: 18,

    },



    bigWord: {

      fontSize: 40,

      fontWeight:

        "800",

      textAlign:

        "center",

      letterSpacing: 4,

      lineHeight: 50,

    },



    helpText: {

      fontSize: 18,

      textAlign:

        "center",

      marginBottom: 18,

      lineHeight: 27,

    },



    listenSmallButton: {

      backgroundColor:

        "#EEEEEE",

      borderRadius: 16,

      padding: 14,

      marginBottom: 18,

      alignItems:

        "center",

    },



    listenSmallText: {

      fontSize: 18,

      fontWeight:

        "800",

    },



    gameButton: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 3,

      borderColor:

        "#555",

      borderRadius: 20,

      padding: 20,

      marginBottom: 15,

      alignItems:

        "center",

    },



    gameButtonText: {

      fontSize: 24,

      fontWeight:

        "800",

      textAlign:

        "center",

    },



    correctButton: {

      borderWidth: 5,

    },



    wrongButton: {

      opacity: 0.65,

    },



    messageCard: {

      backgroundColor:

        "#FFFFFF",

      borderRadius: 20,

      padding: 18,

      marginBottom: 18,

    },



    gameMessage: {

      fontSize: 22,

      fontWeight:

        "800",

      textAlign:

        "center",

      lineHeight: 30,

    },



    nextButton: {

      backgroundColor:

        "#FFFFFF",

      borderWidth: 4,

      borderColor:

        "#555",

      borderRadius: 22,

      padding: 20,

      marginBottom: 15,

      alignItems:

        "center",

    },



    nextButtonText: {

      fontSize: 22,

      fontWeight:

        "800",

      textAlign:

        "center",

    },



    /* =====================================================

       LECTURA

    ===================================================== */



    readControls: {
      backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20, marginBottom: 22,
    },
    readControlsTitle: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 16 },
    readControlRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    smallControlButton: { backgroundColor: "#EEEEEE", borderRadius: 14, minWidth: 70, padding: 12, alignItems: "center" },
    smallControlText: { fontSize: 21, fontWeight: "800" },
    controlValue: { fontSize: 18, fontWeight: "700", minWidth: 100, textAlign: "center" },
    optionButton: { backgroundColor: "#F2F2F2", borderRadius: 16, padding: 15, marginTop: 8, alignItems: "center" },
    optionButtonActive: { borderWidth: 3, borderColor: "#333333" },
    optionButtonText: { fontSize: 18, fontWeight: "800", textAlign: "center" },
    voiceRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 15 },
    voiceButton: { backgroundColor: "#EEEEEE", borderRadius: 16, paddingVertical: 13, paddingHorizontal: 18, alignItems: "center" },
    voiceButtonText: { fontSize: 17, fontWeight: "800" },
    rewardCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 22, marginBottom: 18, alignItems: "center" },
    rewardTitle: { fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 8 },
    rewardText: { fontSize: 19, lineHeight: 28, textAlign: "center" },

    readTitle: {

      fontSize: 34,

      fontWeight:

        "800",

      textAlign:

        "center",

      marginBottom: 25,

    },



    readCard: {

      backgroundColor:

        "#FFFFFF",

      borderRadius: 22,

      padding: 30,

      marginBottom: 25,

    },



    readText: {

      fontSize: 25,

      fontWeight:

        "600",

      lineHeight: 42,

      marginBottom: 25,

    },



    /* =====================================================

       ESCUCHAR

    ===================================================== */



    listenText: {

      fontSize: 23,

      textAlign:

        "center",

      marginBottom: 30,

      lineHeight: 32,

    },



    /* =====================================================

       PROGRESO

    ===================================================== */



    progressCard: {

      backgroundColor:

        "#FFFFFF",

      borderRadius: 24,

      padding: 30,

      alignItems:

        "center",

      marginBottom: 25,

    },



    progressBig: {

      fontSize: 42,

      fontWeight:

        "800",

      marginBottom: 10,

    },



    progressLevel: {

      fontSize: 28,

      fontWeight:

        "800",

      marginVertical: 18,

      textAlign:

        "center",

    },



    progressText: {

      fontSize: 20,

      textAlign:

        "center",

      lineHeight: 30,

      marginBottom: 8,

    },



    /* =====================================================

       VOLVER

    ===================================================== */



    backButton: {

      marginTop: 15,

      alignItems:

        "center",

      padding: 14,

      minHeight: 50,

    },



    backText: {

      fontSize: 19,

      textDecorationLine:

        "underline",

      fontWeight:

        "600",

    },



    savedText: {

      fontSize: 17,

      textAlign:

        "center",

      marginTop: 15,

      fontWeight:

        "700",

    },

  });