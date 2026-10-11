import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

type Props = { nombre: string; onVolver: () => void; onCamara: () => void };
type Seccion = "inicio" | "adaptar" | "desafios" | "progreso";
type ProgresoGuardado = { correctas: number; hechas: number };

const CLAVE_TEXTO = "lecturaPlusAdultosTexto";
const CLAVE_PROGRESO = "lecturaPlusAdultosProgreso";

const TEXTO_INICIAL =
  "La lectura se vuelve más sencilla cuando avanzamos a nuestro ritmo. Podemos dividir la información en partes pequeñas, hacer pausas y volver a escuchar las ideas importantes.";

const PREGUNTAS = [
  {
    texto: "María organizó sus tareas en una lista y comenzó por la más urgente.",
    pregunta: "¿Qué hizo María primero?",
    opciones: ["Organizó sus tareas", "Salió a caminar", "Terminó todas las tareas"],
    correcta: "Organizó sus tareas",
  },
  {
    texto: "Tomás leyó un capítulo y después escribió tres ideas principales en su cuaderno.",
    pregunta: "¿Qué escribió Tomás?",
    opciones: ["Una historia larga", "Tres ideas principales", "Una lista de compras"],
    correcta: "Tres ideas principales",
  },
  {
    texto: "Antes de una reunión, Laura repasó sus notas para recordar los puntos importantes.",
    pregunta: "¿Para qué repasó sus notas?",
    opciones: ["Para recordar los puntos importantes", "Para cambiar de trabajo", "Para aprender una canción"],
    correcta: "Para recordar los puntos importantes",
  },
  {
    texto: "Pedro preparó la mochila por la noche para salir temprano a la mañana siguiente.",
    pregunta: "¿Por qué preparó Pedro la mochila por la noche?",
    opciones: ["Para salir temprano al día siguiente", "Porque quería comprar otra mochila", "Para ordenar la biblioteca"],
    correcta: "Para salir temprano al día siguiente",
  },
  {
    texto: "Ana dividió un informe largo en tres partes y descansó unos minutos entre cada una.",
    pregunta: "¿Cómo organizó Ana el informe?",
    opciones: ["Lo dividió en tres partes", "Lo dejó sin terminar", "Lo leyó todo sin descansar"],
    correcta: "Lo dividió en tres partes",
  },
  {
    texto: "Cuando no entendió una instrucción, Martín volvió a leerla despacio y anotó sus dudas.",
    pregunta: "¿Qué hizo Martín cuando no entendió la instrucción?",
    opciones: ["La volvió a leer y anotó sus dudas", "La ignoró", "Cambió de actividad sin revisar"],
    correcta: "La volvió a leer y anotó sus dudas",
  },
];

export default function AdultosHome({ nombre, onVolver, onCamara }: Props) {
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [tamano, setTamano] = useState(23);
  const [espaciado, setEspaciado] = useState(10);
  const [contraste, setContraste] = useState(false);
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [correctas, setCorrectas] = useState(0);
  const [hechas, setHechas] = useState(0);
  const [datosCargados, setDatosCargados] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const pregunta = PREGUNTAS[indice % PREGUNTAS.length];
  const porcentaje = useMemo(
    () => (hechas > 0 ? Math.round((correctas / hechas) * 100) : 0),
    [correctas, hechas],
  );

  // Carga el texto y el progreso guardados antes de activar el guardado automático.
  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const [textoGuardado, progresoRaw] = await Promise.all([
          AsyncStorage.getItem(CLAVE_TEXTO),
          AsyncStorage.getItem(CLAVE_PROGRESO),
        ]);

        if (!activo) return;

        if (textoGuardado !== null) {
          setTexto(textoGuardado);
        }

        if (progresoRaw) {
          const progreso = JSON.parse(progresoRaw) as Partial<ProgresoGuardado>;
          const totalHechas = Math.max(0, Number(progreso.hechas) || 0);
          const totalCorrectas = Math.max(
            0,
            Math.min(totalHechas, Number(progreso.correctas) || 0),
          );
          setHechas(totalHechas);
          setCorrectas(totalCorrectas);
        }
      } catch {
        if (activo) setMensaje("No se pudieron cargar algunos datos guardados.");
      } finally {
        if (activo) setDatosCargados(true);
      }
    }

    void cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  // Guarda el progreso solo después de haber terminado la carga inicial.
  useEffect(() => {
    if (!datosCargados) return;

    AsyncStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ correctas, hechas }),
    ).catch(() => {
      setMensaje("No se pudo guardar el progreso en este dispositivo.");
    });
  }, [correctas, hechas, datosCargados]);

  // Guarda el texto con una pequeña espera para no escribir en el almacenamiento
  // en cada pulsación. Conserva también el botón de guardado manual.
  useEffect(() => {
    if (!datosCargados) return;

    const temporizador = setTimeout(() => {
      AsyncStorage.setItem(CLAVE_TEXTO, texto).catch(() => {
        setMensaje("No se pudo guardar el texto automáticamente.");
      });
    }, 700);

    return () => clearTimeout(temporizador);
  }, [texto, datosCargados]);

  function hablar(valor = texto) {
    const limpio = valor.trim();
    if (!limpio) {
      setMensaje("Escribí un texto antes de reproducir el audio.");
      return;
    }
    setMensaje("");
    Speech.stop();
    Speech.speak(limpio, {
      language: "es-AR",
      rate: 0.78,
      pitch: 1,
    });
  }

  function responder(opcion: string) {
    // Evita contar dos veces una misma pregunta.
    if (respuesta) return;
    setRespuesta(opcion);
    setHechas((valor) => valor + 1);
    if (opcion === pregunta.correcta) {
      setCorrectas((valor) => valor + 1);
    }
  }

  function siguiente() {
    if (!respuesta) return;
    setIndice((valor) => (valor + 1) % PREGUNTAS.length);
    setRespuesta("");
  }

  async function guardarTexto() {
    try {
      await AsyncStorage.setItem(CLAVE_TEXTO, texto);
      setMensaje("Texto guardado en este dispositivo.");
    } catch {
      setMensaje("No se pudo guardar el texto. Intentá nuevamente.");
    }
  }

  async function reiniciarEstadisticas() {
    try {
      await AsyncStorage.setItem(
        CLAVE_PROGRESO,
        JSON.stringify({ correctas: 0, hechas: 0 }),
      );
      setCorrectas(0);
      setHechas(0);
      setMensaje("Estadísticas reiniciadas.");
    } catch {
      setMensaje("No se pudieron reiniciar las estadísticas.");
    }
  }

  function volverAlInicio() {
    Speech.stop();
    setMensaje("");
    setSeccion("inicio");
  }

  const fondo = contraste ? "#111111" : "#F4F7FB";
  const tinta = contraste ? "#FFFFFF" : "#182334";
  const card = contraste ? "#242424" : "#FFFFFF";

  const boton = (
    etiqueta: string,
    accion: () => void,
    secundario = false,
    deshabilitado = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={accion}
      style={[
        styles.button,
        secundario && styles.secondary,
        deshabilitado && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secundario && styles.secondaryText,
          deshabilitado && styles.disabledText,
        ]}
      >
        {etiqueta}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: fondo }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.logo, { color: tinta }]}>Lectura+</Text>

        {seccion === "inicio" && (
          <>
            <Text style={[styles.title, { color: tinta }]}>
              Hola, {nombre || "bienvenido/a"} 👋
            </Text>
            <Text style={[styles.subtitle, { color: tinta }]}>
              Herramientas para leer, estudiar y organizar la información a tu ritmo.
            </Text>

            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.cardTitle, { color: tinta }]}>📄 Adaptar una lectura</Text>
              <Text style={[styles.body, { color: tinta }]}>
                Pegá o escribí un texto, ajustá su presentación y escuchalo en voz alta.
              </Text>
              {boton("Abrir adaptador", () => setSeccion("adaptar"))}
            </View>

            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.cardTitle, { color: tinta }]}>🧠 Comprensión y atención</Text>
              <Text style={[styles.body, { color: tinta }]}>
                Practicá con consignas breves, sin presión por el tiempo.
              </Text>
              {boton("Empezar desafío", () => setSeccion("desafios"))}
            </View>

            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.cardTitle, { color: tinta }]}>📊 Mi progreso</Text>
              <Text style={[styles.body, { color: tinta }]}>
                Consultá tus actividades y respuestas correctas.
              </Text>
              {boton("Ver mi progreso", () => setSeccion("progreso"))}
            </View>

            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.cardTitle, { color: tinta }]}>📷 Leer un texto con la cámara</Text>
              <Text style={[styles.body, { color: tinta }]}>
                Fotografíá una página o un texto impreso para reconocerlo y escucharlo.
              </Text>
              {boton("Abrir cámara", onCamara)}
            </View>
          </>
        )}

        {seccion === "adaptar" && (
          <>
            <Text style={[styles.title, { color: tinta }]}>📄 Adaptar un texto</Text>
            <Text style={[styles.subtitle, { color: tinta }]}>
              Pegá un texto propio. Los cambios afectan a la vista de lectura.
            </Text>

            <TextInput
              multiline
              value={texto}
              onChangeText={(valor) => {
                setTexto(valor);
                setMensaje("");
              }}
              placeholder="Escribí o pegá aquí tu texto…"
              placeholderTextColor={contraste ? "#BBBBBB" : "#697386"}
              accessibilityLabel="Texto para adaptar y escuchar"
              style={[
                styles.input,
                {
                  color: tinta,
                  backgroundColor: card,
                  borderColor: contraste ? "#FFFFFF" : "#CCD5E1",
                },
              ]}
            />

            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.cardTitle, { color: tinta }]}>Vista de lectura</Text>
              <Text
                selectable
                style={{
                  color: tinta,
                  fontSize: tamano,
                  lineHeight: tamano + espaciado,
                  letterSpacing: 0.3,
                }}
              >
                {texto || "Tu texto aparecerá aquí."}
              </Text>
            </View>

            <Text style={[styles.controlTitle, { color: tinta }]}>Tamaño de letra: {tamano}</Text>
            <View style={styles.row}>
              {boton("A−", () => setTamano((valor) => Math.max(17, valor - 2)), true)}
              {boton("A+", () => setTamano((valor) => Math.min(34, valor + 2)), true)}
            </View>

            <Text style={[styles.controlTitle, { color: tinta }]}>Espacio entre líneas</Text>
            <View style={styles.row}>
              {boton("Más compacto", () => setEspaciado((valor) => Math.max(4, valor - 2)), true)}
              {boton("Más amplio", () => setEspaciado((valor) => Math.min(20, valor + 2)), true)}
            </View>

            {boton(
              contraste ? "☀️ Desactivar alto contraste" : "🌙 Activar alto contraste",
              () => setContraste((valor) => !valor),
              true,
            )}
            {boton("🔊 Escuchar texto", () => hablar())}
            {boton("⏹ Detener audio", () => Speech.stop(), true)}
            {boton("💾 Guardar texto en este dispositivo", () => void guardarTexto())}

            {!!mensaje && (
              <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: tinta }]}>
                {mensaje}
              </Text>
            )}
            {boton("← Volver al menú", volverAlInicio, true)}
          </>
        )}

        {seccion === "desafios" && (
          <>
            <Text style={[styles.title, { color: tinta }]}>🧠 Comprensión lectora</Text>
            <Text style={[styles.subtitle, { color: tinta }]}>
              Leé el texto y elegí la respuesta. Podés escucharlo si te ayuda.
            </Text>

            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.body, { color: tinta }]}>{pregunta.texto}</Text>
              {boton("🔊 Escuchar texto", () => hablar(pregunta.texto), true)}
              <Text style={[styles.cardTitle, { color: tinta }]}>{pregunta.pregunta}</Text>

              {pregunta.opciones.map((opcion) => {
                const elegida = respuesta === opcion;
                const esCorrecta = opcion === pregunta.correcta;
                return (
                  <Pressable
                    key={opcion}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !!respuesta }}
                    onPress={() => responder(opcion)}
                    disabled={!!respuesta}
                    style={[
                      styles.option,
                      elegida && {
                        borderColor: esCorrecta ? "#16834A" : "#B93838",
                        backgroundColor: contraste ? "#333333" : "#EDF3FA",
                      },
                      !!respuesta && esCorrecta && { borderColor: "#16834A", borderWidth: 2 },
                    ]}
                  >
                    <Text style={[styles.optionText, { color: tinta }]}>{opcion}</Text>
                  </Pressable>
                );
              })}

              {!!respuesta && (
                <Text style={[styles.feedback, { color: tinta }]}>
                  {respuesta === pregunta.correcta
                    ? "¡Muy bien! Respuesta correcta."
                    : `Seguimos practicando. La respuesta correcta es: ${pregunta.correcta}.`}
                </Text>
              )}
            </View>

            {boton("Siguiente pregunta →", siguiente, false, !respuesta)}
            {boton("← Volver al menú", volverAlInicio, true)}
          </>
        )}

        {seccion === "progreso" && (
          <>
            <Text style={[styles.title, { color: tinta }]}>📊 Mi progreso</Text>
            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.metric, { color: tinta }]}>{hechas}</Text>
              <Text style={[styles.body, { color: tinta }]}>actividades respondidas</Text>
              <Text style={[styles.metric, { color: tinta }]}>{correctas}</Text>
              <Text style={[styles.body, { color: tinta }]}>respuestas correctas</Text>
              <Text style={[styles.metric, { color: tinta }]}>{porcentaje}%</Text>
              <Text style={[styles.body, { color: tinta }]}>de aciertos</Text>
              <Text style={[styles.note, { color: tinta }]}>
                El progreso se guarda en este dispositivo. Cada práctica es una oportunidad para aprender; no es una evaluación clínica.
              </Text>
              {boton("Reiniciar estadísticas", () => void reiniciarEstadisticas(), true)}
            </View>
            {!!mensaje && (
              <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: tinta }]}>
                {mensaje}
              </Text>
            )}
            {boton("← Volver al menú", volverAlInicio, true)}
          </>
        )}

        {seccion !== "inicio" && (
          <View style={[styles.footerHint, { borderColor: contraste ? "#666666" : "#DDE4ED" }]}>
            <Text style={[styles.note, { color: tinta }]}>
              Podés tomarte el tiempo que necesites. No hay límite de tiempo.
            </Text>
          </View>
        )}

        {boton(
          "← Cambiar perfil",
          () => {
            Speech.stop();
            onVolver();
          },
          true,
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 36, gap: 14 },
  logo: { fontSize: 29, fontWeight: "900", textAlign: "center", marginBottom: 4 },
  title: { fontSize: 27, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 17, lineHeight: 25, textAlign: "center", marginBottom: 8 },
  card: { borderRadius: 18, padding: 17, gap: 12, borderWidth: 1, borderColor: "#DDE4ED" },
  cardTitle: { fontSize: 20, fontWeight: "800" },
  body: { fontSize: 17, lineHeight: 26 },
  button: {
    backgroundColor: "#235DB5",
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    flex: 1,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", textAlign: "center" },
  secondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#7B8BA2" },
  secondaryText: { color: "#235DB5" },
  disabled: { opacity: 0.45 },
  disabledText: { color: "#FFFFFF" },
  input: {
    minHeight: 130,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    textAlignVertical: "top",
    fontSize: 17,
    lineHeight: 25,
  },
  controlTitle: { fontSize: 17, fontWeight: "700", marginTop: 4 },
  row: { flexDirection: "row", gap: 10 },
  option: { borderWidth: 1.5, borderColor: "#9AA8BA", borderRadius: 12, padding: 14 },
  optionText: { fontSize: 17, lineHeight: 24 },
  feedback: { fontSize: 17, fontWeight: "800", lineHeight: 25 },
  metric: { fontSize: 34, fontWeight: "900", textAlign: "center" },
  note: { fontSize: 15, lineHeight: 23 },
  footerHint: { borderTopWidth: 1, paddingTop: 12 },
});
