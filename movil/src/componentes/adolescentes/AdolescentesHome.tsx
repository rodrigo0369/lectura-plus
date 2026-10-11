import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
type AdolescentesHomeProps = {
  onVolver: () => void;
  onCamara?: () => void;
};
type Seccion =
  | "inicio"
  | "leer"
  | "comprender"
  | "estudiar"
  | "atencion"
  | "progreso";
type TipoEjercicio =
  | "pregunta"
  | "verdadero"
  | "palabra"
  | "ordenar";
type EjercicioComprension = {
  tipo: TipoEjercicio;
  texto: string;
  pregunta: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
};
type ParteEstudio = {
  titulo: string;
  contenido: string;
  ayuda: string;
};
type ActividadAtencion = {
  tipo: "visual" | "secuencia" | "orden" | "memoria";
  titulo: string;
  instrucciones: string;
  pregunta: string;
  opciones: string[];
  correcta: string;
  ayuda: string;
};
type ProgresoAdolescente = {
  leerEscuchas: number;
  comprenderRealizadas: number;
  comprenderCorrectas: number;
  estudiarPartesCompletadas: number;
  estudiarPreguntasRealizadas: number;
  estudiarPreguntasCorrectas: number;
  atencionRealizadas: number;
  atencionCorrectas: number;
};
const STORAGE_KEY = "@lectura_plus_progreso_adolescente";

function mezclarOpciones(opciones: string[]): string[] {
  const resultado = [...opciones];
  for (let i = resultado.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}
const progresoInicial: ProgresoAdolescente = {
  leerEscuchas: 0,
  comprenderRealizadas: 0,
  comprenderCorrectas: 0,
  estudiarPartesCompletadas: 0,
  estudiarPreguntasRealizadas: 0,
  estudiarPreguntasCorrectas: 0,
  atencionRealizadas: 0,
  atencionCorrectas: 0,
};
const ejerciciosComprension: EjercicioComprension[] = [
  {
    tipo: "pregunta",
    texto:
      "Tomás tenía que estudiar para una evaluación. En lugar de intentar aprender todo de memoria, decidió separar el texto en partes pequeñas. Primero leyó el título, después buscó las ideas principales y finalmente explicó el tema con sus propias palabras.",
    pregunta: "¿Qué estrategia decidió utilizar Tomás?",
    opciones: [
      "Separar el texto en partes y buscar las ideas principales",
      "Leer solamente el final",
      "Memorizar cada palabra",
      "No leer el texto",
    ],
    correcta: "Separar el texto en partes y buscar las ideas principales",
    explicacion:
      "Tomás dividió el material en partes y buscó las ideas principales.",
  },
  {
    tipo: "verdadero",
    texto:
      "Lucía tenía que leer un texto largo. Se dio cuenta de que algunas palabras eran difíciles. En vez de saltearlas, buscó su significado y volvió a leer la oración completa.",
    pregunta: "Lucía ignoró las palabras que no entendía.",
    opciones: ["Verdadero", "Falso"],
    correcta: "Falso",
    explicacion:
      "Lucía buscó el significado de las palabras difíciles y volvió a leer.",
  },
  {
    tipo: "palabra",
    texto:
      "Una persona puede mejorar su comprensión cuando logra relacionar una idea nueva con algo que ya conoce.",
    pregunta: "En este texto, ¿qué significa 'relacionar'?",
    opciones: [
      "Conectar una cosa con otra",
      "Olvidar una cosa",
      "Leer más rápido",
      "Copiar una palabra",
    ],
    correcta: "Conectar una cosa con otra",
    explicacion:
      "Relacionar significa conectar o vincular una idea con otra.",
  },
  {
    tipo: "ordenar",
    texto:
      "Para estudiar un texto, podemos seguir algunos pasos sencillos.",
    pregunta: "¿Cuál sería un buen orden?",
    opciones: [
      "Leer → encontrar ideas → explicar → resumir",
      "Resumir → cerrar el texto → leer",
      "Explicar → no leer → resumir",
      "Memorizar → borrar → leer",
    ],
    correcta: "Leer → encontrar ideas → explicar → resumir",
    explicacion:
      "Primero comprendemos el texto, después identificamos las ideas y finalmente las explicamos y resumimos.",
  },
  {
    tipo: "pregunta",
    texto:
      "Martín suele cansarse cuando encuentra páginas llenas de texto. Ahora decidió leer un párrafo por vez, hacer una pequeña pausa y continuar cuando se sintiera preparado.",
    pregunta: "¿Qué cambio hizo Martín?",
    opciones: [
      "Dividió la lectura en partes pequeñas",
      "Dejó de estudiar",
      "Leyó todo de una sola vez",
      "Solo leyó los títulos",
    ],
    correcta: "Dividió la lectura en partes pequeñas",
    explicacion:
      "Martín dividió la lectura y agregó pequeñas pausas.",
  },
  {
    tipo: "verdadero",
    texto:
      "Subrayar absolutamente todas las palabras de una página siempre ayuda a encontrar rápidamente la idea principal.",
    pregunta: "La afirmación es verdadera.",
    opciones: ["Verdadero", "Falso"],
    correcta: "Falso",
    explicacion:
      "Si se subraya todo, puede resultar más difícil distinguir qué información es realmente importante.",
  },
  {
    tipo: "palabra",
    texto:
      "Una idea principal es la información más importante que el autor quiere comunicar en un texto.",
    pregunta: "¿Qué significa 'principal' en este contexto?",
    opciones: [
      "Más importante",
      "Más larga",
      "Más difícil",
      "La última palabra",
    ],
    correcta: "Más importante",
    explicacion:
      "Principal significa que ocupa el lugar más importante dentro de la información.",
  },
  {
    tipo: "pregunta",
    texto:
      "Sofía estudió un tema y después intentó explicárselo a un amigo sin mirar el libro. Cuando no pudo explicar una parte, volvió a leerla.",
    pregunta: "¿Por qué volvió a leer esa parte?",
    opciones: [
      "Porque quería comprenderla mejor",
      "Porque quería terminar más rápido",
      "Porque no quería estudiar",
      "Porque quería cambiar de tema",
    ],
    correcta: "Porque quería comprenderla mejor",
    explicacion:
      "Explicar con palabras propias permite detectar qué partes todavía necesitamos comprender.",
  },
  {
    tipo: "ordenar",
    texto:
      "Antes de una evaluación, una estudiante quiere repasar un tema.",
    pregunta: "¿Qué opción representa mejor una estrategia de estudio?",
    opciones: [
      "Leer, identificar ideas, explicar y repasar",
      "Cerrar el libro y adivinar",
      "Leer solo una palabra",
      "Copiar todo sin comprender",
    ],
    correcta: "Leer, identificar ideas, explicar y repasar",
    explicacion:
      "Una estrategia útil combina comprensión, identificación de ideas y repaso.",
  },
  {
    tipo: "pregunta",
    texto:
      "Cuando un texto parece demasiado complicado, una buena estrategia puede ser reducir el tamaño de cada tarea. Por ejemplo, leer un párrafo, identificar una idea y recién después continuar.",
    pregunta: "¿Cuál es la idea principal del texto?",
    opciones: [
      "Dividir una tarea difícil en pasos pequeños puede ayudar",
      "Siempre hay que leer muy rápido",
      "Nunca hay que hacer pausas",
      "Hay que memorizar todo",
    ],
    correcta:
      "Dividir una tarea difícil en pasos pequeños puede ayudar",
    explicacion:
      "El texto propone hacer la tarea más manejable dividiéndola en pasos pequeños.",
  },
];
const partesEstudio: ParteEstudio[] = [
  {
    titulo: "¿De qué trata?",
    contenido:
      "Aprender no significa solamente memorizar información. También significa comprender, relacionar ideas y poder explicar lo aprendido con nuestras propias palabras.",
    ayuda:
      "Primero intentá descubrir de qué habla el texto en general. No hace falta recordar cada detalle.",
  },
  {
    titulo: "Idea principal",
    contenido:
      "Una idea principal resume lo más importante de un texto. Las demás ideas suelen aportar ejemplos, explicaciones o información que ayuda a comprenderla.",
    ayuda:
      "Preguntate: ¿qué es lo más importante que el texto quiere decir?",
  },
  {
    titulo: "Palabras clave",
    contenido:
      "Las palabras clave ayudan a recordar el tema. Pueden ser nombres, conceptos, acciones o términos que aparecen varias veces o que resultan especialmente importantes.",
    ayuda:
      "Elegí pocas palabras. No hace falta marcar todo el texto.",
  },
  {
    titulo: "Palabras difíciles",
    contenido:
      "Cuando aparece una palabra que no conocemos, podemos intentar comprenderla por el contexto, buscar su significado y volver a leer la oración.",
    ayuda:
      "No te quedes trabado en una sola palabra. Buscá una estrategia para comprenderla y continuá.",
  },
  {
    titulo: "Explicalo con tus palabras",
    contenido:
      "Una forma de comprobar si entendimos algo es intentar explicarlo sin copiar exactamente las palabras del texto.",
    ayuda:
      "Imaginá que tenés que explicárselo a alguien que nunca estudió ese tema.",
  },
  {
    titulo: "Hacé un resumen",
    contenido:
      "Un resumen conserva las ideas más importantes y elimina información que no resulta necesaria para comprender el tema.",
    ayuda:
      "Intentá responder: ¿qué pasó?, ¿qué es importante?, ¿por qué importa?",
  },
];
const preguntasEstudio = [
  {
    pregunta: "¿Qué significa comprender un tema?",
    opciones: [
      "Poder entenderlo y explicarlo",
      "Copiarlo muchas veces",
      "Memorizar cada palabra",
      "Leerlo sin pensar",
    ],
    correcta: "Poder entenderlo y explicarlo",
  },
  {
    pregunta: "¿Para qué sirven las palabras clave?",
    opciones: [
      "Para recordar los conceptos importantes",
      "Para llenar una hoja",
      "Para hacer el texto más largo",
      "Para reemplazar todas las oraciones",
    ],
    correcta: "Para recordar los conceptos importantes",
  },
  {
    pregunta: "¿Qué podemos hacer con una palabra difícil?",
    opciones: [
      "Buscar su significado y volver a leer",
      "Ignorar todo el texto",
      "Cerrar el libro",
      "Memorizarla sin saber qué significa",
    ],
    correcta: "Buscar su significado y volver a leer",
  },
  {
    pregunta: "¿Qué debería tener un buen resumen?",
    opciones: [
      "Las ideas más importantes",
      "Todas las palabras del texto",
      "Solo la primera oración",
      "Información sin relación",
    ],
    correcta: "Las ideas más importantes",
  },
  {
    pregunta: "¿Por qué puede servir explicar algo con palabras propias?",
    opciones: [
      "Porque permite comprobar si lo entendimos",
      "Porque hace que el texto desaparezca",
      "Porque evita leer",
      "Porque siempre reduce una tarea a una palabra",
    ],
    correcta: "Porque permite comprobar si lo entendimos",
  },
];
const actividadesAtencion: ActividadAtencion[] = [
  {
    tipo: "visual",
    titulo: "Encontrá el diferente",
    instrucciones:
      "Hay varios símbolos parecidos. Buscá el que es diferente.",
    pregunta: "¿Cuál es diferente?",
    opciones: ["AAAAAB", "AAAAAC", "AAAAAD", "AAAAAE"],
    correcta: "AAAAAB",
    ayuda: "Buscá la única opción que termina en B.",
  },
  {
    tipo: "visual",
    titulo: "Encontrá el diferente",
    instrucciones:
      "Observá las opciones y elegí la que no sigue el mismo patrón.",
    pregunta: "¿Cuál es diferente?",
    opciones: ["OOQOOO", "OOXOOO", "OOZOOO", "OOOOOO"],
    correcta: "OOQOOO",
    ayuda: "Buscá la única opción que contiene la letra Q.",
  },
  {
    tipo: "visual",
    titulo: "Atención visual",
    instrucciones:
      "Solo una opción contiene una letra diferente.",
    pregunta: "¿Cuál contiene la letra distinta?",
    opciones: ["MMMMNM", "MMMMXM", "MMMMYM", "MMMMMM"],
    correcta: "MMMMNM",
    ayuda: "Buscá la única opción que contiene la letra N.",
  },
  {
    tipo: "secuencia",
    titulo: "Secuencia",
    instrucciones:
      "Observá la secuencia y descubrí qué número continúa.",
    pregunta: "2 - 4 - 6 - 8 - ¿?",
    opciones: ["9", "10", "11", "12"],
    correcta: "10",
    ayuda: "Cada número aumenta de 2 en 2.",
  },
  {
    tipo: "secuencia",
    titulo: "Secuencia",
    instrucciones:
      "Pensá qué número debería continuar.",
    pregunta: "5 - 10 - 15 - 20 - ¿?",
    opciones: ["22", "24", "25", "30"],
    correcta: "25",
    ayuda: "Cada número aumenta de 5 en 5.",
  },
  {
    tipo: "secuencia",
    titulo: "Secuencia",
    instrucciones:
      "Encontrá el próximo número.",
    pregunta: "30 - 27 - 24 - 21 - ¿?",
    opciones: ["20", "19", "18", "17"],
    correcta: "18",
    ayuda: "Cada número disminuye de 3 en 3.",
  },
  {
    tipo: "orden",
    titulo: "Ordená",
    instrucciones:
      "Pensá cuál de estas acciones ocurre primero.",
    pregunta: "¿Qué hacemos primero para estudiar un texto?",
    opciones: [
      "Leerlo",
      "Hacer el resumen",
      "Responder preguntas",
      "Revisar las respuestas",
    ],
    correcta: "Leerlo",
    ayuda: "Primero necesitamos conocer el texto.",
  },
  {
    tipo: "orden",
    titulo: "Ordená",
    instrucciones:
      "Elegí el paso que tiene sentido realizar después.",
    pregunta: "Después de identificar la idea principal, ¿qué podemos hacer?",
    opciones: [
      "Explicarla con nuestras palabras",
      "Borrar el texto",
      "Dejar de leer",
      "Cambiar de tema sin comprenderlo",
    ],
    correcta: "Explicarla con nuestras palabras",
    ayuda:
      "Explicar con palabras propias ayuda a comprobar la comprensión.",
  },
  {
    tipo: "memoria",
    titulo: "Memoria",
    instrucciones:
      "Recordá el grupo de palabras y elegí el que coincide.",
    pregunta: "¿Cuál grupo contiene las mismas palabras?",
    opciones: [
      "LUNA - CASA - PAN",
      "LUNA - PATO - PAN",
      "SOL - CASA - PAN",
      "LUNA - CASA - PEZ",
    ],
    correcta: "LUNA - CASA - PAN",
    ayuda: "Compará las tres palabras.",
  },
  {
    tipo: "memoria",
    titulo: "Memoria",
    instrucciones:
      "Prestá atención a las palabras.",
    pregunta: "¿Cuál grupo coincide con: MESA - GATO - SOL?",
    opciones: [
      "MESA - GATO - SOL",
      "MESA - PATO - SOL",
      "CASA - GATO - SOL",
      "MESA - GATO - LUNA",
    ],
    correcta: "MESA - GATO - SOL",
    ayuda: "Buscá las tres palabras originales.",
  },
  {
    tipo: "memoria",
    titulo: "Memoria",
    instrucciones:
      "Recordá la secuencia.",
    pregunta: "¿Cuál coincide con: ROJO - AZUL - VERDE?",
    opciones: [
      "ROJO - AZUL - VERDE",
      "AZUL - ROJO - VERDE",
      "ROJO - VERDE - AZUL",
      "VERDE - AZUL - ROJO",
    ],
    correcta: "ROJO - AZUL - VERDE",
    ayuda: "El orden también forma parte de la memoria.",
  },
  {
    tipo: "secuencia",
    titulo: "Secuencia",
    instrucciones:
      "Encontrá el número que falta.",
    pregunta: "100 - 90 - 80 - 70 - ¿?",
    opciones: ["65", "60", "55", "50"],
    correcta: "60",
    ayuda: "La secuencia disminuye de 10 en 10.",
  },
];
export default function AdolescentesHome({
  onVolver,
  onCamara,
}: AdolescentesHomeProps) {
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [tamanoTexto, setTamanoTexto] = useState(21);
  const [espaciado, setEspaciado] = useState(8);
  const [textoPersonalizado, setTextoPersonalizado] = useState(
    "La lectura puede ser más fácil cuando tenemos tiempo, espacio y una forma cómoda de acceder al texto. Cada persona puede encontrar la estrategia que mejor le funciona."
  );
  const [comprensionIndice, setComprensionIndice] = useState(0);
  const [respuestaComprension, setRespuestaComprension] = useState("");
  const [comprensionCorrecta, setComprensionCorrecta] = useState<
    boolean | null
  >(null);
  const [indiceEstudio, setIndiceEstudio] = useState(0);
  const [preguntaEstudioIndice, setPreguntaEstudioIndice] = useState(0);
  const [respuestaEstudio, setRespuestaEstudio] = useState("");
  const [estudioCorrecto, setEstudioCorrecto] = useState<boolean | null>(
    null
  );
  const [atencionIndice, setAtencionIndice] = useState(0);
  const [respuestaAtencion, setRespuestaAtencion] = useState("");
  const [atencionCorrecta, setAtencionCorrecta] = useState<boolean | null>(
    null
  );
  const [progreso, setProgreso] =
    useState<ProgresoAdolescente>(progresoInicial);
  const [cargandoProgreso, setCargandoProgreso] = useState(true);
  const ejercicioComprension = useMemo(
    () => ejerciciosComprension[comprensionIndice],
    [comprensionIndice]
  );
  const opcionesComprension = useMemo(
    () => mezclarOpciones(ejercicioComprension.opciones),
    [comprensionIndice]
  );
  const parteEstudio = useMemo(
    () => partesEstudio[indiceEstudio],
    [indiceEstudio]
  );
  const preguntaEstudio = useMemo(
    () => preguntasEstudio[preguntaEstudioIndice],
    [preguntaEstudioIndice]
  );
  const opcionesEstudio = useMemo(
    () => mezclarOpciones(preguntaEstudio.opciones),
    [preguntaEstudioIndice]
  );
  const actividadAtencion = useMemo(
    () => actividadesAtencion[atencionIndice],
    [atencionIndice]
  );
  const opcionesAtencion = useMemo(
    () => mezclarOpciones(actividadAtencion.opciones),
    [atencionIndice]
  );
  const porcentajeComprension =
    progreso.comprenderRealizadas > 0
      ? Math.round(
          (progreso.comprenderCorrectas /
            progreso.comprenderRealizadas) *
            100
        )
      : 0;
  const porcentajeEstudio =
    progreso.estudiarPreguntasRealizadas > 0
      ? Math.round(
          (progreso.estudiarPreguntasCorrectas /
            progreso.estudiarPreguntasRealizadas) *
            100
        )
      : 0;
  const porcentajeAtencion =
    progreso.atencionRealizadas > 0
      ? Math.round(
          (progreso.atencionCorrectas /
            progreso.atencionRealizadas) *
            100
        )
      : 0;
  const actividadesTotales =
    progreso.comprenderRealizadas +
    progreso.estudiarPreguntasRealizadas +
    progreso.atencionRealizadas;
  const respuestasCorrectasTotales =
    progreso.comprenderCorrectas +
    progreso.estudiarPreguntasCorrectas +
    progreso.atencionCorrectas;
  const porcentajeGeneral =
    actividadesTotales > 0
      ? Math.round(
          (respuestasCorrectasTotales / actividadesTotales) * 100
        )
      : 0;
  useEffect(() => {
    cargarProgreso();
    return () => {
      Speech.stop();
    };
  }, []);
  async function cargarProgreso() {
    try {
      const guardado = await AsyncStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const datos = JSON.parse(guardado);
        setProgreso({
          ...progresoInicial,
          ...datos,
        });
      }
    } catch (error) {
      console.log("No se pudo cargar el progreso:", error);
    } finally {
      setCargandoProgreso(false);
    }
  }
  async function guardarProgreso(
    nuevoProgreso: ProgresoAdolescente
  ) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nuevoProgreso)
      );
    } catch (error) {
      console.log("No se pudo guardar el progreso:", error);
    }
  }
  function actualizarProgreso(
    cambios: Partial<ProgresoAdolescente>
  ) {
    setProgreso((actual) => {
      const nuevo = {
        ...actual,
        ...cambios,
      };
      guardarProgreso(nuevo);
      return nuevo;
    });
  }
  function registrarEscucha() {
    actualizarProgreso({
      leerEscuchas: progreso.leerEscuchas + 1,
    });
  }
  function hablar(texto: string) {
    Speech.stop();
    Speech.speak(texto, {
      language: "es-AR",
      rate: 0.75,
      pitch: 1,
    });
  }
  function detenerLectura() {
    Speech.stop();
  }
  function escucharLectura() {
    const texto = textoPersonalizado.trim();
    if (!texto) return;
    registrarEscucha();
    hablar(texto);
  }
  function responderComprension(opcion: string) {
    if (respuestaComprension) {
      return;
    }
    const esCorrecta = opcion === ejercicioComprension.correcta;
    setRespuestaComprension(opcion);
    setComprensionCorrecta(esCorrecta);
    actualizarProgreso({
      comprenderRealizadas: progreso.comprenderRealizadas + 1,
      comprenderCorrectas:
        progreso.comprenderCorrectas + (esCorrecta ? 1 : 0),
    });
  }
  function siguienteComprension() {
    setRespuestaComprension("");
    setComprensionCorrecta(null);
    setComprensionIndice(
      (actual) => (actual + 1) % ejerciciosComprension.length
    );
  }
  function reiniciarComprension() {
    setComprensionIndice(0);
    setRespuestaComprension("");
    setComprensionCorrecta(null);
  }
  function escucharComprension() {
    hablar(
      `${ejercicioComprension.texto}. ${ejercicioComprension.pregunta}`
    );
  }
  function siguienteParteEstudio() {
    if (indiceEstudio < partesEstudio.length - 1) {
      const nuevoIndice = indiceEstudio + 1;
      setIndiceEstudio(nuevoIndice);
      /*
       * IMPORTANTE:
       * indiceEstudio empieza en 0, pero el progreso representa
       * cantidad de partes completadas.
       *
       * Por eso:
       * parte 1 = 1
       * parte 2 = 2
       * parte 3 = 3
       * etc.
       *
       * Antes se guardaba nuevoIndice directamente, lo que hacía
       * que al llegar a la segunda parte se guardara solamente 1.
       */
      actualizarProgreso({
        estudiarPartesCompletadas: Math.max(
          progreso.estudiarPartesCompletadas,
          nuevoIndice + 1
        ),
      });
    }
  }
  function anteriorParteEstudio() {
    if (indiceEstudio > 0) {
      setIndiceEstudio((actual) => actual - 1);
    }
  }
  function escucharParteEstudio() {
    hablar(
      `${parteEstudio.titulo}. ${parteEstudio.contenido}`
    );
  }
  function escucharTextoCompleto() {
    const textoCompleto = partesEstudio
      .map(
        (parte) =>
          `${parte.titulo}. ${parte.contenido}`
      )
      .join(". ");
    hablar(textoCompleto);
  }
  function responderPreguntaEstudio(opcion: string) {
    if (respuestaEstudio) {
      return;
    }
    const esCorrecta = opcion === preguntaEstudio.correcta;
    setRespuestaEstudio(opcion);
    setEstudioCorrecto(esCorrecta);
    actualizarProgreso({
      estudiarPreguntasRealizadas:
        progreso.estudiarPreguntasRealizadas + 1,
      estudiarPreguntasCorrectas:
        progreso.estudiarPreguntasCorrectas +
        (esCorrecta ? 1 : 0),
    });
  }
  function siguientePreguntaEstudio() {
    setRespuestaEstudio("");
    setEstudioCorrecto(null);
    setPreguntaEstudioIndice(
      (actual) => (actual + 1) % preguntasEstudio.length
    );
  }
  function reiniciarEstudio() {
    setIndiceEstudio(0);
    setPreguntaEstudioIndice(0);
    setRespuestaEstudio("");
    setEstudioCorrecto(null);
  }
  function responderAtencion(opcion: string) {
    if (respuestaAtencion) {
      return;
    }
    const esCorrecta = opcion === actividadAtencion.correcta;
    setRespuestaAtencion(opcion);
    setAtencionCorrecta(esCorrecta);
    actualizarProgreso({
      atencionRealizadas: progreso.atencionRealizadas + 1,
      atencionCorrectas:
        progreso.atencionCorrectas + (esCorrecta ? 1 : 0),
    });
  }
  function siguienteAtencion() {
    setRespuestaAtencion("");
    setAtencionCorrecta(null);
    setAtencionIndice(
      (actual) => (actual + 1) % actividadesAtencion.length
    );
  }
  function reiniciarAtencion() {
    setAtencionIndice(0);
    setRespuestaAtencion("");
    setAtencionCorrecta(null);
  }
  function escucharAtencion() {
    hablar(
      `${actividadAtencion.instrucciones}. ${actividadAtencion.pregunta}`
    );
  }
  async function reiniciarProgreso() {
    const nuevo = { ...progresoInicial };
    setProgreso(nuevo);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nuevo)
      );
    } catch (error) {
      console.log("No se pudo reiniciar el progreso:", error);
    }
  }
  if (cargandoProgreso) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando tu progreso...
        </Text>
      </View>
    );
  }
  if (seccion === "leer") {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.logo}>Lectura+</Text>
        <Text style={styles.sectionTitle}>
          Leer mejor
        </Text>
        <Text style={styles.subtitle}>
          Encontrá la forma de lectura que te resulte más cómoda.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Ajustá el texto
          </Text>
          <Text style={styles.smallLabel}>
            Tamaño de letra
          </Text>
          <View style={styles.row}>
            <Pressable
              style={styles.smallButton}
              onPress={() =>
                setTamanoTexto((actual) =>
                  Math.max(16, actual - 2)
                )
              }
            >
              <Text style={styles.smallButtonText}>
                A-
              </Text>
            </Pressable>
            <Text style={styles.valueText}>
              {tamanoTexto}
            </Text>
            <Pressable
              style={styles.smallButton}
              onPress={() =>
                setTamanoTexto((actual) =>
                  Math.min(34, actual + 2)
                )
              }
            >
              <Text style={styles.smallButtonText}>
                A+
              </Text>
            </Pressable>
          </View>
          <Text style={styles.smallLabel}>
            Espacio entre líneas
          </Text>
          <View style={styles.row}>
            <Pressable
              style={styles.smallButton}
              onPress={() =>
                setEspaciado((actual) =>
                  Math.max(4, actual - 2)
                )
              }
            >
              <Text style={styles.smallButtonText}>
                −
              </Text>
            </Pressable>
            <Text style={styles.valueText}>
              {espaciado}
            </Text>
            <Pressable
              style={styles.smallButton}
              onPress={() =>
                setEspaciado((actual) =>
                  Math.min(18, actual + 2)
                )
              }
            >
              <Text style={styles.smallButtonText}>
                +
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.textCard}>
          <Text style={styles.cardTitle}>Tu texto</Text>
          <Text style={styles.helperText}>
            Escribí o pegá acá el texto que quieras practicar.
          </Text>
          <TextInput
            accessibilityLabel="Texto para practicar lectura"
            value={textoPersonalizado}
            onChangeText={setTextoPersonalizado}
            multiline
            textAlignVertical="top"
            placeholder="Escribí o pegá tu texto aquí..."
            placeholderTextColor="#667085"
            style={[styles.textInput, { fontSize: tamanoTexto, lineHeight: tamanoTexto + espaciado }]}
          />
        </View>
        <View style={styles.textCard}>
          <Text style={styles.cardTitle}>Vista de lectura</Text>
          <Text style={[styles.readingText, { fontSize: tamanoTexto, lineHeight: tamanoTexto + espaciado }]}>
            {textoPersonalizado.trim() || "Tu texto aparecerá aquí cuando empieces a escribir."}
          </Text>
        </View>
        <View style={styles.rowButtons}>
          <Pressable
            style={styles.primaryButton}
            onPress={escucharLectura}
          >
            <Text style={styles.primaryButtonText}>
              🔊 Escuchar
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={detenerLectura}
          >
            <Text style={styles.secondaryButtonText}>
              ⏹ Parar
            </Text>
          </Pressable>
        </View>
        {onCamara && (
          <Pressable
            style={styles.cameraButton}
            onPress={onCamara}
          >
            <Text style={styles.primaryButtonText}>
              📷 LEER CON LA CÁMARA
            </Text>
          </Pressable>
        )}
        <Text style={styles.helperText}>
          Veces que escuchaste una lectura:{" "}
          {progreso.leerEscuchas}
        </Text>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Speech.stop();
            setSeccion("inicio");
          }}
        >
          <Text style={styles.backText}>
            ← Volver
          </Text>
        </Pressable>
      </ScrollView>
    );
  }
  if (seccion === "comprender") {
    const progresoActual =
      ((comprensionIndice + 1) /
        ejerciciosComprension.length) *
      100;
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.logo}>Lectura+</Text>
        <Text style={styles.sectionTitle}>
          Comprender
        </Text>
        <Text style={styles.subtitle}>
          Leé, escuchá y pensá antes de responder.
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progresoActual}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Ejercicio {comprensionIndice + 1} de{" "}
          {ejerciciosComprension.length}
        </Text>
        <View style={styles.textCard}>
          <Text style={styles.readingText}>
            {ejercicioComprension.texto}
          </Text>
          <Pressable
            style={styles.listenButton}
            onPress={escucharComprension}
          >
            <Text style={styles.listenButtonText}>
              🔊 Escuchar texto
            </Text>
          </Pressable>
        </View>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {ejercicioComprension.pregunta}
          </Text>
          {opcionesComprension.map(
            (opcion, indiceOpcion) => {
              const seleccionada =
                respuestaComprension === opcion;
              const correcta =
                opcion === ejercicioComprension.correcta;
              return (
                <Pressable
                  key={`${opcion}-${indiceOpcion}`}
                  style={[
                    styles.optionButton,
                    seleccionada &&
                      (correcta
                        ? styles.optionCorrect
                        : styles.optionIncorrect),
                  ]}
                  onPress={() =>
                    responderComprension(opcion)
                  }
                  disabled={!!respuestaComprension}
                >
                  <Text style={styles.optionText}>
                    {opcion}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
        {comprensionCorrecta !== null && (
          <View
            style={[
              styles.feedbackCard,
              comprensionCorrecta
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {comprensionCorrecta
                ? "¡Correcto!"
                : "Probá otra vez la próxima."}
            </Text>
            <Text style={styles.feedbackText}>
              {ejercicioComprension.explicacion}
            </Text>
          </View>
        )}
        {respuestaComprension && (
          <Pressable
            style={styles.primaryButton}
            onPress={siguienteComprension}
          >
            <Text style={styles.primaryButtonText}>
              Siguiente ejercicio →
            </Text>
          </Pressable>
        )}
        <Pressable
          style={styles.secondaryButtonFull}
          onPress={reiniciarComprension}
        >
          <Text style={styles.secondaryButtonText}>
            Reiniciar
          </Text>
        </Pressable>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Speech.stop();
            setSeccion("inicio");
          }}
        >
          <Text style={styles.backText}>
            ← Volver
          </Text>
        </Pressable>
      </ScrollView>
    );
  }
  if (seccion === "estudiar") {
    const porcentajePartes =
      ((indiceEstudio + 1) / partesEstudio.length) *
      100;
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.logo}>Lectura+</Text>
        <Text style={styles.sectionTitle}>
          Estudiar
        </Text>
        <Text style={styles.subtitle}>
          Dividí el material en partes para estudiarlo sin
          sentir que tenés que aprender todo de una vez.
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${porcentajePartes}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Parte {indiceEstudio + 1} de{" "}
          {partesEstudio.length}
        </Text>
        <View style={styles.studyCard}>
          <Text style={styles.studyPartTitle}>
            {parteEstudio.titulo}
          </Text>
          <Text style={styles.studyPartText}>
            {parteEstudio.contenido}
          </Text>
          <Pressable
            style={styles.listenButton}
            onPress={escucharParteEstudio}
          >
            <Text style={styles.listenButtonText}>
              🔊 Escuchar esta parte
            </Text>
          </Pressable>
          <View style={styles.studyHelpBox}>
            <Text style={styles.studyHelpTitle}>
              💡 Ayuda
            </Text>
            <Text style={styles.studyHelpText}>
              {parteEstudio.ayuda}
            </Text>
          </View>
        </View>
        <View style={styles.rowButtons}>
          <Pressable
            style={[
              styles.secondaryButton,
              indiceEstudio === 0 &&
                styles.disabledButton,
            ]}
            onPress={anteriorParteEstudio}
            disabled={indiceEstudio === 0}
          >
            <Text style={styles.secondaryButtonText}>
              ← Anterior
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.primaryButton,
              indiceEstudio ===
                partesEstudio.length - 1 &&
                styles.disabledButton,
            ]}
            onPress={siguienteParteEstudio}
            disabled={
              indiceEstudio === partesEstudio.length - 1
            }
          >
            <Text style={styles.primaryButtonText}>
              Siguiente →
            </Text>
          </Pressable>
        </View>
        <View style={styles.textCard}>
          <Text style={styles.cardTitle}>
            Texto completo
          </Text>
          <Text style={styles.normalText}>
            {partesEstudio
              .map(
                (parte) =>
                  `${parte.titulo}: ${parte.contenido}`
              )
              .join("\n\n")}
          </Text>
          <Pressable
            style={styles.listenButton}
            onPress={escucharTextoCompleto}
          >
            <Text style={styles.listenButtonText}>
              🔊 Escuchar todo
            </Text>
          </Pressable>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            🧠 Estrategia
          </Text>
          <Text style={styles.tipText}>
            No intentes memorizar todo de una sola vez.
            Primero buscá qué quiere decir cada parte.
          </Text>
        </View>
        <View style={styles.questionCard}>
          <Text style={styles.cardTitle}>
            Comprobá lo aprendido
          </Text>
          <Text style={styles.progressText}>
            Pregunta {preguntaEstudioIndice + 1} de{" "}
            {preguntasEstudio.length}
          </Text>
          <Text style={styles.questionText}>
            {preguntaEstudio.pregunta}
          </Text>
          {opcionesEstudio.map((opcion, indiceOpcion) => {
            const seleccionada =
              respuestaEstudio === opcion;
            const correcta =
              opcion === preguntaEstudio.correcta;
            return (
              <Pressable
                key={`${opcion}-${indiceOpcion}`}
                style={[
                  styles.optionButton,
                  seleccionada &&
                    (correcta
                      ? styles.optionCorrect
                      : styles.optionIncorrect),
                ]}
                onPress={() =>
                  responderPreguntaEstudio(opcion)
                }
                disabled={!!respuestaEstudio}
              >
                <Text style={styles.optionText}>
                  {opcion}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {estudioCorrecto !== null && (
          <View
            style={[
              styles.feedbackCard,
              estudioCorrecto
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {estudioCorrecto
                ? "¡Muy bien!"
                : "No pasa nada, seguimos aprendiendo."}
            </Text>
            <Text style={styles.feedbackText}>
              {estudioCorrecto
                ? "La respuesta es correcta."
                : `La respuesta correcta es: ${preguntaEstudio.correcta}`}
            </Text>
          </View>
        )}
        {respuestaEstudio && (
          <Pressable
            style={styles.primaryButton}
            onPress={siguientePreguntaEstudio}
          >
            <Text style={styles.primaryButtonText}>
              Siguiente pregunta →
            </Text>
          </Pressable>
        )}
        <Pressable
          style={styles.secondaryButtonFull}
          onPress={reiniciarEstudio}
        >
          <Text style={styles.secondaryButtonText}>
            Reiniciar estudio
          </Text>
        </Pressable>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Speech.stop();
            setSeccion("inicio");
          }}
        >
          <Text style={styles.backText}>
            ← Volver
          </Text>
        </Pressable>
      </ScrollView>
    );
  }
  if (seccion === "atencion") {
    const progresoActividad =
      ((atencionIndice + 1) /
        actividadesAtencion.length) *
      100;
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.logo}>Lectura+</Text>
        <Text style={styles.sectionTitle}>
          Atención y memoria
        </Text>
        <Text style={styles.subtitle}>
          Entrená la atención, las secuencias y la memoria
          con ejercicios cortos.
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progresoActividad}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Actividad {atencionIndice + 1} de{" "}
          {actividadesAtencion.length}
        </Text>
        <View style={styles.studyCard}>
          <Text style={styles.studyPartTitle}>
            {actividadAtencion.titulo}
          </Text>
          <Text style={styles.studyPartText}>
            {actividadAtencion.instrucciones}
          </Text>
          <Pressable
            style={styles.listenButton}
            onPress={escucharAtencion}
          >
            <Text style={styles.listenButtonText}>
              🔊 Escuchar
            </Text>
          </Pressable>
        </View>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {actividadAtencion.pregunta}
          </Text>
          {opcionesAtencion.map((opcion, indiceOpcion) => {
            const seleccionada =
              respuestaAtencion === opcion;
            const correcta =
              opcion === actividadAtencion.correcta;
            return (
              <Pressable
                key={`${opcion}-${indiceOpcion}`}
                style={[
                  styles.optionButton,
                  seleccionada &&
                    (correcta
                      ? styles.optionCorrect
                      : styles.optionIncorrect),
                ]}
                onPress={() =>
                  responderAtencion(opcion)
                }
                disabled={!!respuestaAtencion}
              >
                <Text style={styles.optionText}>
                  {opcion}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {atencionCorrecta !== null && (
          <View
            style={[
              styles.feedbackCard,
              atencionCorrecta
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {atencionCorrecta
                ? "¡Bien!"
                : "Seguimos practicando."}
            </Text>
            <Text style={styles.feedbackText}>
              {atencionCorrecta
                ? "Prestaste atención al ejercicio."
                : `La respuesta correcta era: ${actividadAtencion.correcta}`}
            </Text>
            <Text style={styles.feedbackText}>
              {actividadAtencion.ayuda}
            </Text>
          </View>
        )}
        {respuestaAtencion && (
          <Pressable
            style={styles.primaryButton}
            onPress={siguienteAtencion}
          >
            <Text style={styles.primaryButtonText}>
              Siguiente actividad →
            </Text>
          </Pressable>
        )}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            🧠 Consejo
          </Text>
          <Text style={styles.tipText}>
            Si te equivocás, no significa que no puedas
            hacerlo. Volvé a mirar la consigna y probá
            otra estrategia.
          </Text>
        </View>
        <Pressable
          style={styles.secondaryButtonFull}
          onPress={reiniciarAtencion}
        >
          <Text style={styles.secondaryButtonText}>
            Reiniciar
          </Text>
        </Pressable>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Speech.stop();
            setSeccion("inicio");
          }}
        >
          <Text style={styles.backText}>
            ← Volver
          </Text>
        </Pressable>
      </ScrollView>
    );
  }
  if (seccion === "progreso") {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.logo}>Lectura+</Text>
        <Text style={styles.sectionTitle}>
          Mi progreso
        </Text>
        <Text style={styles.subtitle}>
          Este espacio guarda tu avance para que puedas
          ver cómo vas mejorando.
        </Text>
        <View style={styles.generalProgressCard}>
          <Text style={styles.generalProgressTitle}>
            Progreso general
          </Text>
          <Text style={styles.generalPercentage}>
            {porcentajeGeneral}%
          </Text>
          <Text style={styles.generalProgressText}>
            de respuestas correctas
          </Text>
          <View style={styles.progressTrackLarge}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${porcentajeGeneral}%`,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {actividadesTotales}
            </Text>
            <Text style={styles.statLabel}>
              actividades
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {respuestasCorrectasTotales}
            </Text>
            <Text style={styles.statLabel}>
              correctas
            </Text>
          </View>
        </View>
        <View style={styles.progressSectionCard}>
          <Text style={styles.progressSectionTitle}>
            📖 Comprender
          </Text>
          <Text style={styles.progressBig}>
            {porcentajeComprension}%
          </Text>
          <Text style={styles.normalText}>
            {progreso.comprenderRealizadas} ejercicios
            realizados
          </Text>
          <Text style={styles.normalText}>
            {progreso.comprenderCorrectas} respuestas
            correctas
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${porcentajeComprension}%`,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.progressSectionCard}>
          <Text style={styles.progressSectionTitle}>
            📚 Estudiar
          </Text>
          <Text style={styles.progressBig}>
            {porcentajeEstudio}%
          </Text>
          <Text style={styles.normalText}>
            {progreso.estudiarPreguntasRealizadas} preguntas
            realizadas
          </Text>
          <Text style={styles.normalText}>
            {progreso.estudiarPreguntasCorrectas} respuestas
            correctas
          </Text>
          <Text style={styles.normalText}>
            {progreso.estudiarPartesCompletadas} de{" "}
            {partesEstudio.length} partes recorridas
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (progreso.estudiarPartesCompletadas /
                      partesEstudio.length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.progressSectionCard}>
          <Text style={styles.progressSectionTitle}>
            🧠 Atención y memoria
          </Text>
          <Text style={styles.progressBig}>
            {porcentajeAtencion}%
          </Text>
          <Text style={styles.normalText}>
            {progreso.atencionRealizadas} actividades
            realizadas
          </Text>
          <Text style={styles.normalText}>
            {progreso.atencionCorrectas} respuestas correctas
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${porcentajeAtencion}%`,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.progressSectionCard}>
          <Text style={styles.progressSectionTitle}>
            🔊 Lectura en voz alta
          </Text>
          <Text style={styles.progressBig}>
            {progreso.leerEscuchas}
          </Text>
          <Text style={styles.normalText}>
            veces que utilizaste la lectura en voz alta
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            💪 Seguí avanzando
          </Text>
          <Text style={styles.tipText}>
            No importa solamente cuántas respuestas
            correctas tengas. Lo importante también es
            practicar, encontrar estrategias y descubrir
            qué forma de aprender te funciona mejor.
          </Text>
        </View>
        <Pressable
          style={styles.resetButton}
          onPress={reiniciarProgreso}
        >
          <Text style={styles.resetButtonText}>
            Reiniciar mi progreso
          </Text>
        </Pressable>
        <Pressable
          style={styles.backButton}
          onPress={() => setSeccion("inicio")}
        >
          <Text style={styles.backText}>
            ← Volver
          </Text>
        </Pressable>
      </ScrollView>
    );
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.logo}>Lectura+</Text>
      <Text style={styles.sectionTitle}>
        Lectura+ para adolescentes
      </Text>
      <Text style={styles.subtitle}>
        Acá no tenés que demostrar nada.
      </Text>
      <Text style={styles.introText}>
        Este espacio está pensado para ayudarte a leer,
        comprender, estudiar y entrenar la atención a tu
        propio ritmo.
      </Text>
      <Pressable
        style={styles.homeCard}
        onPress={() => setSeccion("leer")}
      >
        <Text style={styles.homeCardIcon}>
          📖
        </Text>
        <View style={styles.homeCardContent}>
          <Text style={styles.homeCardTitle}>
            Leer mejor
          </Text>
          <Text style={styles.homeCardText}>
            Ajustá el texto, escuchalo y usá la cámara
            para leer textos.
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.homeCard}
        onPress={() => setSeccion("comprender")}
      >
        <Text style={styles.homeCardIcon}>
          🧠
        </Text>
        <View style={styles.homeCardContent}>
          <Text style={styles.homeCardTitle}>
            Comprender
          </Text>
          <Text style={styles.homeCardText}>
            Practicá ideas principales, preguntas,
            palabras y comprensión.
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.homeCard}
        onPress={() => setSeccion("estudiar")}
      >
        <Text style={styles.homeCardIcon}>
          📚
        </Text>
        <View style={styles.homeCardContent}>
          <Text style={styles.homeCardTitle}>
            Estudiar
          </Text>
          <Text style={styles.homeCardText}>
            Dividí textos largos, buscá ideas y repasá
            lo aprendido.
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.homeCard}
        onPress={() => setSeccion("atencion")}
      >
        <Text style={styles.homeCardIcon}>
          🎯
        </Text>
        <View style={styles.homeCardContent}>
          <Text style={styles.homeCardTitle}>
            Atención y memoria
          </Text>
          <Text style={styles.homeCardText}>
            Actividades cortas para practicar atención,
            memoria y secuencias.
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.homeCard}
        onPress={() => setSeccion("progreso")}
      >
        <Text style={styles.homeCardIcon}>
          📊
        </Text>
        <View style={styles.homeCardContent}>
          <Text style={styles.homeCardTitle}>
            Mi progreso
          </Text>
          <Text style={styles.homeCardText}>
            {actividadesTotales > 0
              ? `${porcentajeGeneral}% de respuestas correctas`
              : "Todavía no hay actividades registradas."}
          </Text>
        </View>
      </Pressable>
      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>
          🌱 A tu ritmo
        </Text>
        <Text style={styles.motivationText}>
          No todos aprendemos de la misma manera. Usá las
          herramientas que te ayuden y avanzá de a poco.
        </Text>
      </View>
      <Pressable
        style={styles.backButton}
        onPress={() => {
          Speech.stop();
          onVolver();
        }}
      >
        <Text style={styles.backText}>
          ← Cambiar perfil
        </Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },
  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F4F8FC",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    fontSize: 21,
    lineHeight: 30,
    textAlign: "center",
    color: "#1D2939",
    fontWeight: "600",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#208AEF",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    textAlign: "center",
    color: "#152238",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 29,
    textAlign: "center",
    color: "#475467",
    marginBottom: 18,
  },
  introText: {
    fontSize: 19,
    lineHeight: 29,
    textAlign: "center",
    color: "#344054",
    marginBottom: 20,
  },
  homeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  homeCardIcon: {
    fontSize: 38,
    width: 55,
    textAlign: "center",
  },
  homeCardContent: {
    flex: 1,
    paddingLeft: 12,
  },
  homeCardTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 5,
  },
  homeCardText: {
    fontSize: 17,
    lineHeight: 25,
    color: "#475467",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 14,
  },
  smallLabel: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    color: "#344054",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 10,
  },
  rowButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  smallButton: {
    minWidth: 54,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#E8F2FC",
    borderWidth: 1,
    borderColor: "#A8C8E8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  smallButtonText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1769AA",
  },
  valueText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172033",
    minWidth: 45,
    textAlign: "center",
  },
  textCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  textInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#A8C8E8",
    borderRadius: 12,
    padding: 14,
    color: "#182230",
    backgroundColor: "#F8FBFF",
    textAlignVertical: "top",
    marginTop: 8,
  },
  readingText: {
    color: "#182230",
    fontWeight: "500",
  },
  normalText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#344054",
  },
  primaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#EAF1F7",
    borderWidth: 1,
    borderColor: "#B8C7D6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  secondaryButtonFull: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#EAF1F7",
    borderWidth: 1,
    borderColor: "#B8C7D6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#344054",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  cameraButton: {
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: "#1769AA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  listenButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#E8F2FC",
    borderWidth: 1,
    borderColor: "#A8C8E8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginTop: 16,
  },
  listenButtonText: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#1769AA",
  },
  helperText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#667085",
    marginBottom: 15,
  },
  backButton: {
    minHeight: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 8,
  },
  backText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: "#475467",
  },
  progressTrack: {
    height: 12,
    borderRadius: 20,
    backgroundColor: "#DDE5ED",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressTrackLarge: {
    height: 16,
    borderRadius: 20,
    backgroundColor: "#DDE5ED",
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#208AEF",
  },
  progressText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#667085",
    textAlign: "center",
    marginBottom: 15,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  questionText: {
    fontSize: 22,
    lineHeight: 31,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 16,
  },
  optionButton: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  optionCorrect: {
    backgroundColor: "#E8F7EE",
    borderColor: "#57A773",
  },
  optionIncorrect: {
    backgroundColor: "#FDECEC",
    borderColor: "#D66A6A",
  },
  optionText: {
    fontSize: 18,
    lineHeight: 25,
    color: "#1D2939",
    fontWeight: "600",
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: "#E8F7EE",
    borderColor: "#57A773",
  },
  feedbackIncorrect: {
    backgroundColor: "#FDECEC",
    borderColor: "#D66A6A",
  },
  feedbackTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 18,
    lineHeight: 27,
    color: "#344054",
  },
  studyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  studyPartTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 12,
  },
  studyPartText: {
    fontSize: 20,
    lineHeight: 31,
    color: "#344054",
  },
  studyHelpBox: {
    backgroundColor: "#F2F7FC",
    borderRadius: 14,
    padding: 15,
    marginTop: 16,
  },
  studyHelpTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    color: "#1769AA",
    marginBottom: 6,
  },
  studyHelpText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#344054",
  },
  tipCard: {
    backgroundColor: "#FFF9E8",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8D38C",
  },
  tipTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    color: "#6B5500",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 18,
    lineHeight: 27,
    color: "#594B18",
  },
  motivationCard: {
    backgroundColor: "#EAF5FF",
    borderRadius: 18,
    padding: 20,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#B7D7F2",
  },
  motivationTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#1769AA",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#344054",
  },
  generalProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  generalProgressTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#172033",
  },
  generalPercentage: {
    fontSize: 58,
    lineHeight: 68,
    fontWeight: "900",
    color: "#208AEF",
    marginTop: 8,
  },
  generalProgressText: {
    fontSize: 17,
    lineHeight: 24,
    color: "#667085",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  statNumber: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "900",
    color: "#1769AA",
  },
  statLabel: {
    fontSize: 16,
    lineHeight: 23,
    color: "#667085",
    textAlign: "center",
  },
  progressSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  progressSectionTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 8,
  },
  progressBig: {
    fontSize: 38,
    lineHeight: 47,
    fontWeight: "900",
    color: "#208AEF",
    marginBottom: 6,
  },
  resetButton: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#E0A1A1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#A33A3A",
  },
  disabledButton: {
    opacity: 0.45,
  },
});