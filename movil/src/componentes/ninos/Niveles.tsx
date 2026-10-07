import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

type NivelesProps = {
  nivelActual: number;
  nivelesCompletados: number[];
  totalNiveles?: number;
  onSeleccionarNivel: (nivel: number) => void;
  onVolver: () => void;
};

export default function Niveles({
  nivelActual,
  nivelesCompletados,
  totalNiveles = 200,
  onSeleccionarNivel,
  onVolver,
}: NivelesProps) {
  /*
   * Un nivel está desbloqueado si:
   * - ya fue completado
   * - es el nivel actual
   * - o es el siguiente nivel después del último completado
   *
   * Esto evita que el niño tenga que completar los 200 niveles
   * de golpe y mantiene una progresión sencilla.
   */

  const ultimoCompletado =
    nivelesCompletados.length > 0
      ? Math.max(...nivelesCompletados)
      : 0;

  const siguienteDesbloqueado = Math.max(
    nivelActual,
    ultimoCompletado + 1
  );

  const estaCompletado = (nivel: number) => {
    return nivelesCompletados.includes(nivel);
  };

  const estaDesbloqueado = (nivel: number) => {
    return (
      nivel <= siguienteDesbloqueado ||
      nivelesCompletados.includes(nivel)
    );
  };

  const obtenerDificultad = (nivel: number) => {
    if (nivel <= 5) {
      return "⭐ Fácil";
    }

    if (nivel <= 20) {
      return "🌱 Inicial";
    }

    if (nivel <= 50) {
      return "🚀 Intermedio";
    }

    if (nivel <= 100) {
      return "🔥 Avanzado";
    }

    if (nivel <= 150) {
      return "🏆 Experto";
    }

    return "👑 Maestro";
  };

  const obtenerColorNivel = (nivel: number) => {
    if (estaCompletado(nivel)) {
      return styles.nivelCompletado;
    }

    if (nivel === siguienteDesbloqueado) {
      return styles.nivelActual;
    }

    if (estaDesbloqueado(nivel)) {
      return styles.nivelDisponible;
    }

    return styles.nivelBloqueado;
  };

  const obtenerTextoNivel = (nivel: number) => {
    if (estaCompletado(nivel)) {
      return "✓";
    }

    if (!estaDesbloqueado(nivel)) {
      return "🔒";
    }

    return String(nivel);
  };

  return (
    <View style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={onVolver}
          activeOpacity={0.8}
        >
          <Text style={styles.botonVolverTexto}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCentro}>
          <Text style={styles.titulo}>🎮 Mis niveles</Text>
          <Text style={styles.subtitulo}>
            ¡Elegí un nivel y a jugar!
          </Text>
        </View>
      </View>

      {/* PROGRESO */}
      <View style={styles.tarjetaProgreso}>
        <View style={styles.progresoFila}>
          <View>
            <Text style={styles.progresoTitulo}>
              Tu progreso
            </Text>

            <Text style={styles.progresoNumero}>
              {nivelesCompletados.length} / {totalNiveles}
            </Text>
          </View>

          <View style={styles.progresoEstrella}>
            <Text style={styles.estrellaGrande}>⭐</Text>
          </View>
        </View>

        <View style={styles.barraFondo}>
          <View
            style={[
              styles.barraProgreso,
              {
                width: `${Math.min(
                  100,
                  (nivelesCompletados.length / totalNiveles) * 100
                )}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progresoTexto}>
          {nivelesCompletados.length === 0
            ? "¡Empezá por el nivel 1!"
            : nivelesCompletados.length >= totalNiveles
            ? "🎉 ¡Completaste todos los niveles!"
            : `¡Vas muy bien! Tu próximo nivel es el ${siguienteDesbloqueado}.`}
        </Text>
      </View>

      {/* DIFICULTAD */}
      <View style={styles.dificultadActual}>
        <Text style={styles.dificultadTitulo}>
          Nivel actual
        </Text>

        <Text style={styles.dificultadNumero}>
          🎯 Nivel {siguienteDesbloqueado}
        </Text>

        <Text style={styles.dificultadTexto}>
          {obtenerDificultad(siguienteDesbloqueado)}
        </Text>
      </View>

      {/* LISTA DE NIVELES */}
      <ScrollView
        style={styles.lista}
        contentContainerStyle={styles.listaContenido}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.seccionTitulo}>
          Todos los niveles
        </Text>

        <View style={styles.grid}>
          {Array.from(
            { length: totalNiveles },
            (_, indice) => indice + 1
          ).map((nivel) => {
            const completado = estaCompletado(nivel);
            const desbloqueado = estaDesbloqueado(nivel);
            const actual = nivel === siguienteDesbloqueado;

            return (
              <TouchableOpacity
                key={nivel}
                disabled={!desbloqueado}
                activeOpacity={0.75}
                onPress={() => {
                  if (desbloqueado) {
                    onSeleccionarNivel(nivel);
                  }
                }}
                style={[
                  styles.nivel,
                  obtenerColorNivel(nivel),
                  actual && styles.nivelDestacado,
                ]}
              >
                <Text
                  style={[
                    styles.nivelTexto,
                    !desbloqueado &&
                      styles.nivelTextoBloqueado,
                  ]}
                >
                  {obtenerTextoNivel(nivel)}
                </Text>

                {completado && (
                  <Text style={styles.marcaCompletado}>
                    ¡Listo!
                  </Text>
                )}

                {actual && !completado && (
                  <Text style={styles.marcaActual}>
                    JUGAR
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* INFORMACIÓN FINAL */}
        <View style={styles.tarjetaAyuda}>
          <Text style={styles.ayudaTitulo}>
            💡 ¿Cómo funciona?
          </Text>

          <Text style={styles.ayudaTexto}>
            Completá los niveles para conseguir estrellas ⭐
            y desbloquear nuevos desafíos.
          </Text>

          <Text style={styles.ayudaTexto}>
            Cada vez serán un poquito más difíciles. ¡Pero
            vos podés! 💪
          </Text>
        </View>

        <View style={styles.espacioFinal} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E7EAF0",
  },

  botonVolver: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2F7",
  },

  botonVolverTexto: {
    fontSize: 30,
    fontWeight: "700",
  },

  headerCentro: {
    flex: 1,
    marginLeft: 12,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#172033",
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 15,
    color: "#687386",
  },

  tarjetaProgreso: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF1",
  },

  progresoFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progresoTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#687386",
  },

  progresoNumero: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "900",
    color: "#172033",
  },

  progresoEstrella: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7D6",
  },

  estrellaGrande: {
    fontSize: 34,
  },

  barraFondo: {
    height: 12,
    marginTop: 15,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E9EDF3",
  },

  barraProgreso: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#4CAF50",
  },

  progresoTexto: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#596579",
  },

  dificultadActual: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E7FF",
  },

  dificultadTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#63708A",
  },

  dificultadNumero: {
    marginTop: 4,
    fontSize: 21,
    fontWeight: "900",
    color: "#172033",
  },

  dificultadTexto: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    color: "#49617F",
  },

  lista: {
    flex: 1,
    marginTop: 14,
  },

  listaContenido: {
    paddingHorizontal: 16,
  },

  seccionTitulo: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  nivel: {
    width: "30.5%",
    minHeight: 92,
    marginBottom: 12,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    paddingVertical: 8,
  },

  nivelCompletado: {
    backgroundColor: "#E8F7EA",
    borderColor: "#65C66D",
  },

  nivelActual: {
    backgroundColor: "#FFF4D6",
    borderColor: "#F1C75B",
  },

  nivelDisponible: {
    backgroundColor: "#EEF5FF",
    borderColor: "#B8D3FF",
  },

  nivelBloqueado: {
    backgroundColor: "#ECEFF3",
    borderColor: "#D9DEE6",
  },

  nivelDestacado: {
    transform: [{ scale: 1.02 }],
  },

  nivelTexto: {
    fontSize: 25,
    fontWeight: "900",
    color: "#172033",
  },

  nivelTextoBloqueado: {
    fontSize: 22,
    color: "#9AA3B2",
  },

  marcaCompletado: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#3C9445",
  },

  marcaActual: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "900",
    color: "#A27600",
  },

  tarjetaAyuda: {
    marginTop: 10,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF1",
  },

  ayudaTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 8,
  },

  ayudaTexto: {
    fontSize: 15,
    lineHeight: 22,
    color: "#596579",
    marginBottom: 8,
  },

  espacioFinal: {
    height: 30,
  },
});