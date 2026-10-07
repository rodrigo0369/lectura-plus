import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import { recognizeText } from "expo-ocr-kit";

type CamaraProps = {
  onVolver: () => void;
};

function adaptarTexto(texto: string) {
  let resultado = texto.trim();

  if (!resultado) {
    return "";
  }

  // Limpiamos espacios repetidos.
  resultado = resultado.replace(/\s+/g, " ");

  // Separamos mejor algunas frases.
  resultado = resultado.replace(/\s*([.!?])\s*/g, "$1\n\n");

  // Agregamos espacios después de comas.
  resultado = resultado.replace(/,\s*/g, ", ");

  // Evitamos demasiados saltos de línea.
  resultado = resultado.replace(/\n{3,}/g, "\n\n");

  return resultado.trim();
}

export default function Camara({ onVolver }: CamaraProps) {
  const [permission, requestPermission] = useCameraPermissions();

  const [foto, setFoto] = useState<string | null>(null);

  const [textoOCR, setTextoOCR] = useState("");
  const [textoAdaptado, setTextoAdaptado] = useState("");

  const [reconociendo, setReconociendo] = useState(false);
  const [errorOCR, setErrorOCR] = useState("");

  const [leyendo, setLeyendo] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>📷 Cámara</Text>

          <Text style={styles.text}>
            Preparando la cámara...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>
            📷 Vamos a usar la cámara
          </Text>

          <Text style={styles.text}>
            Necesitamos permiso para sacar una foto y reconocer
            el texto que aparece en ella.
          </Text>

          <Pressable
            style={styles.primary}
            onPress={requestPermission}
          >
            <Text style={styles.primaryText}>
              📷 PERMITIR CÁMARA
            </Text>
          </Pressable>

          <Pressable
            style={styles.back}
            onPress={onVolver}
          >
            <Text style={styles.backText}>
              ← Volver
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function sacarFoto() {
    if (!cameraRef.current) {
      return;
    }

    try {
      setErrorOCR("");
      setTextoOCR("");
      setTextoAdaptado("");
      setReconociendo(false);

      const resultado =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });

      if (!resultado?.uri) {
        return;
      }

      setFoto(resultado.uri);

      await reconocerTextoDeFoto(resultado.uri);
    } catch (error) {
      console.log("Error al sacar la foto:", error);

      setErrorOCR(
        "No pudimos sacar la foto. Probá nuevamente."
      );
    }
  }

  async function reconocerTextoDeFoto(uri: string) {
    try {
      setReconociendo(true);
      setErrorOCR("");
      setTextoOCR("");
      setTextoAdaptado("");

      const resultado = await recognizeText(uri);

      const texto = resultado?.text?.trim() ?? "";

      if (!texto) {
        setErrorOCR(
          "No encontramos texto en la foto. Probá acercarte un poco más, mejorar la luz y sacar otra foto."
        );

        return;
      }

      const adaptado = adaptarTexto(texto);

      setTextoOCR(texto);
      setTextoAdaptado(adaptado);
    } catch (error) {
      console.log("Error OCR:", error);

      setErrorOCR(
        "No pudimos reconocer el texto de esta foto. Probá con otra imagen más clara."
      );
    } finally {
      setReconociendo(false);
    }
  }

  function hablarTexto() {
    const texto = textoAdaptado || textoOCR;

    if (!texto) {
      return;
    }

    if (leyendo) {
      Speech.stop();
      setLeyendo(false);
      return;
    }

    setLeyendo(true);

    Speech.speak(texto, {
      language: "es-AR",
      rate: 0.75,
      pitch: 1.0,
      onDone: () => {
        setLeyendo(false);
      },
      onStopped: () => {
        setLeyendo(false);
      },
      onError: () => {
        setLeyendo(false);
      },
    });
  }

  function nuevaFoto() {
    Speech.stop();

    setLeyendo(false);
    setFoto(null);
    setTextoOCR("");
    setTextoAdaptado("");
    setErrorOCR("");
    setReconociendo(false);
  }

  if (foto) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            📖 Texto fotografiado
          </Text>

          <Image
            source={{ uri: foto }}
            style={styles.preview}
          />

          {reconociendo ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" />

              <Text style={styles.loadingTitle}>
                🔎 Reconociendo el texto...
              </Text>

              <Text style={styles.loadingText}>
                Estamos leyendo la foto.
                {"\n"}
                Esperá un momento.
              </Text>
            </View>
          ) : null}

          {errorOCR ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                ⚠️ No encontramos el texto
              </Text>

              <Text style={styles.errorText}>
                {errorOCR}
              </Text>
            </View>
          ) : null}

          {textoAdaptado ? (
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>
                📖 Texto preparado para leer
              </Text>

              <Text style={styles.readingText}>
                {textoAdaptado}
              </Text>
            </View>
          ) : null}

          {textoAdaptado ? (
            <Pressable
              style={[
                styles.listenButton,
                leyendo && styles.listenButtonActive,
              ]}
              onPress={hablarTexto}
            >
              <Text style={styles.listenText}>
                {leyendo
                  ? "⏹️ DETENER LECTURA"
                  : "🔊 ESCUCHAR TEXTO"}
              </Text>
            </Pressable>
          ) : null}

          {textoOCR && textoOCR !== textoAdaptado ? (
            <View style={styles.originalBox}>
              <Text style={styles.originalTitle}>
                Texto reconocido
              </Text>

              <Text style={styles.originalText}>
                {textoOCR}
              </Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <Pressable
              style={[styles.secondary, styles.half]}
              onPress={nuevaFoto}
            >
              <Text style={styles.secondaryText}>
                📷 Otra foto
              </Text>
            </Pressable>

            <Pressable
              style={[styles.primary, styles.half]}
              onPress={() => {
                Speech.stop();
                setLeyendo(false);
                onVolver();
              }}
            >
              <Text style={styles.primaryText}>
                ← Volver
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>
          📷 Leer con la cámara
        </Text>

        <Text style={styles.info}>
          Apuntá la cámara al texto y tratá de que quede bien
          iluminado.
          {"\n\n"}
          Después sacá la foto y Lectura+ intentará reconocer
          las palabras.
        </Text>

        <View style={styles.cameraBox}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
          />

          <View style={styles.frame} />

          <View style={styles.cameraHint}>
            <Text style={styles.cameraHintText}>
              Colocá el texto dentro del recuadro
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.capture}
          onPress={sacarFoto}
        >
          <Text style={styles.captureText}>
            📷 SACAR FOTO
          </Text>
        </Pressable>

        <Pressable
          style={styles.back}
          onPress={onVolver}
        >
          <Text style={styles.backText}>
            ← Volver
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  container: {
    flex: 1,
    padding: 18,
    alignItems: "center",
  },

  scroll: {
    padding: 18,
    paddingBottom: 40,
    alignItems: "center",
  },

  center: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  text: {
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
    marginBottom: 24,
  },

  info: {
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 16,
  },

  cameraBox: {
    width: "100%",
    height: 430,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#222",
    marginBottom: 18,
    position: "relative",
  },

  frame: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "22%",
    bottom: "22%",
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 14,
  },

  cameraHint: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  cameraHintText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },

  capture: {
    width: "100%",
    minHeight: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202A44",
    marginBottom: 12,
  },

  captureText: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },

  primary: {
    minHeight: 56,
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: "#202A44",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  secondary: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#E7EAF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  secondaryText: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  back: {
    padding: 12,
  },

  backText: {
    fontSize: 17,
    fontWeight: "700",
  },

  preview: {
    width: "100%",
    height: 300,
    borderRadius: 22,
    marginBottom: 16,
    resizeMode: "cover",
  },

  loadingBox: {
    width: "100%",
    padding: 22,
    borderRadius: 20,
    backgroundColor: "#E9EEF8",
    alignItems: "center",
    marginBottom: 16,
  },

  loadingTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  loadingText: {
    marginTop: 8,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },

  errorBox: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },

  textBox: {
    width: "100%",
    padding: 22,
    borderRadius: 22,
    backgroundColor: "white",
    marginBottom: 16,
  },

  textBoxTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },

  readingText: {
    fontSize: 22,
    lineHeight: 36,
    letterSpacing: 0.5,
  },

  listenButton: {
    width: "100%",
    minHeight: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F6F4A",
    marginBottom: 16,
  },

  listenButtonActive: {
    backgroundColor: "#8B2E2E",
  },

  listenText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  originalBox: {
    width: "100%",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#F0F1F5",
    marginBottom: 16,
  },

  originalTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },

  originalText: {
    fontSize: 17,
    lineHeight: 27,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },
});