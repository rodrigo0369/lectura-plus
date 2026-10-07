import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type NinosHomeProps = {
  nombre: string;
  estrellas: number;

  onNiveles: () => void;
  onLeer: () => void;
  onEscuchar: () => void;
  onProgreso: () => void;
  onCambiarPerfil: () => void;

  // Lo dejamos preparado para la cámara,
  // aunque todavía no hace falta conectarla.
  onCamara?: () => void;
};

export default function NinosHome({
  nombre,
  estrellas,
  onNiveles,
  onLeer,
  onEscuchar,
  onProgreso,
  onCambiarPerfil,
  onCamara,
}: NinosHomeProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.hello}>¡Hola!</Text>

            <Text style={styles.name}>
              {nombre && nombre.trim().length > 0
                ? nombre
                : "Amigo/a"}
            </Text>

            <Text style={styles.subtitle}>
              ¿Qué querés hacer hoy?
            </Text>
          </View>

          <View style={styles.starBox}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starNumber}>
              {estrellas}
            </Text>
          </View>
        </View>

        {/* MENSAJE PRINCIPAL */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>🎉</Text>

          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>
              ¡Seguimos aprendiendo!
            </Text>

            <Text style={styles.welcomeText}>
              Elegí una actividad y empezamos.
            </Text>
          </View>
        </View>

        {/* JUEGOS / NIVELES */}
        <Pressable
          onPress={onNiveles}
          style={({ pressed }) => [
            styles.mainButton,
            styles.levelButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.buttonIconCircle}>
            <Text style={styles.buttonEmoji}>🎮</Text>
          </View>

          <View style={styles.buttonTextContainer}>
            <Text style={styles.mainButtonTitle}>
              Mis niveles
            </Text>

            <Text style={styles.mainButtonSubtitle}>
              Jugá y ganá estrellas
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* LEER */}
        <Pressable
          onPress={onLeer}
          style={({ pressed }) => [
            styles.mainButton,
            styles.readButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.buttonIconCircle}>
            <Text style={styles.buttonEmoji}>📖</Text>
          </View>

          <View style={styles.buttonTextContainer}>
            <Text style={styles.mainButtonTitle}>
              Leer
            </Text>

            <Text style={styles.mainButtonSubtitle}>
              Practicá leyendo textos
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* ESCUCHAR */}
        <Pressable
          onPress={onEscuchar}
          style={({ pressed }) => [
            styles.mainButton,
            styles.listenButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.buttonIconCircle}>
            <Text style={styles.buttonEmoji}>🔊</Text>
          </View>

          <View style={styles.buttonTextContainer}>
            <Text style={styles.mainButtonTitle}>
              Escuchar
            </Text>

            <Text style={styles.mainButtonSubtitle}>
              Escuchá palabras y textos
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* PROGRESO */}
        <Pressable
          onPress={onProgreso}
          style={({ pressed }) => [
            styles.mainButton,
            styles.progressButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.buttonIconCircle}>
            <Text style={styles.buttonEmoji}>📊</Text>
          </View>

          <View style={styles.buttonTextContainer}>
            <Text style={styles.mainButtonTitle}>
              Mi progreso
            </Text>

            <Text style={styles.mainButtonSubtitle}>
              Mirá tus estrellas y avances
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* CÁMARA */}
        {onCamara && (
          <Pressable
            onPress={onCamara}
            style={({ pressed }) => [
              styles.mainButton,
              styles.cameraButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.buttonIconCircle}>
              <Text style={styles.buttonEmoji}>📷</Text>
            </View>

            <View style={styles.buttonTextContainer}>
              <Text style={styles.mainButtonTitle}>
                Cámara
              </Text>

              <Text style={styles.mainButtonSubtitle}>
                Sacá una foto y escuchá el texto
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}

        {/* ESTRELLAS */}
        <View style={styles.starsCard}>
          <Text style={styles.starsCardTitle}>
            ⭐ Tus estrellas
          </Text>

          <Text style={styles.starsNumber}>
            {estrellas}
          </Text>

          <Text style={styles.starsDescription}>
            ¡Seguí jugando para conseguir más!
          </Text>
        </View>

        {/* BOTÓN CAMBIAR PERFIL */}
        <Pressable
          onPress={onCambiarPerfil}
          style={({ pressed }) => [
            styles.changeProfileButton,
            pressed && styles.pressedSmall,
          ]}
        >
          <Text style={styles.changeProfileText}>
            ← Cambiar perfil
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E7",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  hello: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5B4B3A",
  },

  name: {
    fontSize: 32,
    fontWeight: "900",
    color: "#2F241B",
    marginTop: 2,
  },

  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: "#6B5A4A",
    marginTop: 5,
  },

  starBox: {
    minWidth: 78,
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#FFF0A8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#F2D45C",
  },

  starIcon: {
    fontSize: 27,
  },

  starNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#5B4B12",
    marginTop: 1,
  },

  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EADFC8",
  },

  welcomeEmoji: {
    fontSize: 38,
    marginRight: 14,
  },

  welcomeTextContainer: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    color: "#33281F",
  },

  welcomeText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#6B5A4A",
    marginTop: 3,
  },

  mainButton: {
    minHeight: 92,
    borderRadius: 24,
    marginBottom: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
  },

  levelButton: {
    backgroundColor: "#E8F4FF",
    borderColor: "#B9DDF8",
  },

  readButton: {
    backgroundColor: "#F0E9FF",
    borderColor: "#D6C5F4",
  },

  listenButton: {
    backgroundColor: "#E7F8ED",
    borderColor: "#BDE7CA",
  },

  progressButton: {
    backgroundColor: "#FFF0D9",
    borderColor: "#F1D09D",
  },

  cameraButton: {
    backgroundColor: "#FFE8EE",
    borderColor: "#F2BBC8",
  },

  buttonIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  buttonEmoji: {
    fontSize: 30,
  },

  buttonTextContainer: {
    flex: 1,
    paddingRight: 6,
  },

  mainButtonTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "900",
    color: "#30261F",
  },

  mainButtonSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: "#66584D",
    marginTop: 2,
  },

  arrow: {
    fontSize: 38,
    lineHeight: 40,
    color: "#6A5A4C",
    fontWeight: "300",
  },

  pressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  starsCard: {
    backgroundColor: "#FFF0A8",
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 4,
    borderWidth: 2,
    borderColor: "#F2D45C",
  },

  starsCardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#5B4B12",
  },

  starsNumber: {
    fontSize: 48,
    lineHeight: 55,
    fontWeight: "900",
    color: "#4D3D0A",
    marginTop: 2,
  },

  starsDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6A5813",
    textAlign: "center",
    marginTop: 2,
  },

  changeProfileButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCCFB9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  changeProfileText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5C5046",
  },

  pressedSmall: {
    opacity: 0.65,
  },

  bottomSpace: {
    height: 20,
  },
});
