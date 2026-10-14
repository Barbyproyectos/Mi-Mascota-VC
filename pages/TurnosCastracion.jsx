import { useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

function TurnosCastracion({ volver }) {
  const [formulario, setFormulario] = useState({
    nombrePropietario: "",
    telefono: "",
    nombreMascota: "",
    especie: "Perro",
    edad: "",
    fechaPreferida: "",
    observaciones: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Consulta de solicitud
  const [telefonoBusqueda, setTelefonoBusqueda] = useState("");
  const [mascotaBusqueda, setMascotaBusqueda] = useState("");
  const [turnoEncontrado, setTurnoEncontrado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Reprogramación
  const [modoReprogramar, setModoReprogramar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");

  // Cancelación
  const [modoCancelar, setModoCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  // =========================================
  // SOLICITAR TURNO
  // =========================================

  async function solicitarTurno(e) {
    e.preventDefault();

    setMensaje("");
    setEnviando(true);

    const { error } = await supabase
      .from("turnos_castracion")
      .insert([
        {
          nombre_propietario: formulario.nombrePropietario,
          telefono: formulario.telefono,
          nombre_mascota: formulario.nombreMascota,
          especie: formulario.especie,
          edad: formulario.edad,
          fecha_preferida: formulario.fechaPreferida || null,
          observaciones: formulario.observaciones,
          estado: "Pendiente",
        },
      ]);

    if (error) {
      console.error("Error al guardar solicitud:", error);

      setMensaje(
        "❌ No se pudo enviar la solicitud. Intentá nuevamente."
      );

      setEnviando(false);
      return;
    }

    setMensaje(
      "✅ Solicitud enviada correctamente. Quedó registrada para su revisión."
    );

    setFormulario({
      nombrePropietario: "",
      telefono: "",
      nombreMascota: "",
      especie: "Perro",
      edad: "",
      fechaPreferida: "",
      observaciones: "",
    });

    setEnviando(false);
  }

  // =========================================
  // BUSCAR SOLICITUD
  // =========================================

  async function buscarTurno(e) {
    e.preventDefault();

    setMensaje("");
    setTurnoEncontrado(null);
    setBuscando(true);

    const { data, error } = await supabase
      .from("turnos_castracion")
      .select("*")
      .eq("telefono", telefonoBusqueda)
      .eq("nombre_mascota", mascotaBusqueda)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error al buscar solicitud:", error);

      setMensaje(
        "❌ No se pudo consultar la solicitud."
      );

      setBuscando(false);
      return;
    }

    if (!data) {
      setMensaje(
        "❌ No encontramos una solicitud con esos datos."
      );

      setBuscando(false);
      return;
    }

    setTurnoEncontrado(data);
    setBuscando(false);
  }

  // =========================================
  // REPROGRAMAR
  // =========================================

  async function reprogramarTurno() {
    if (!turnoEncontrado || !nuevaFecha) {
      setMensaje("❌ Seleccioná una nueva fecha.");
      return;
    }

    setMensaje("");

    const { error } = await supabase
      .from("turnos_castracion")
      .update({
        estado: "Reprogramar",
        fecha_reprogramada: nuevaFecha,
      })
      .eq("id", turnoEncontrado.id);

    if (error) {
      console.error(
        "Error al solicitar reprogramación:",
        error
      );

      setMensaje(
        "❌ No se pudo solicitar la reprogramación."
      );

      return;
    }

    setTurnoEncontrado({
      ...turnoEncontrado,
      estado: "Reprogramar",
      fecha_reprogramada: nuevaFecha,
    });

    setNuevaFecha("");
    setModoReprogramar(false);

    setMensaje(
      "✅ La solicitud de reprogramación fue registrada correctamente."
    );
  }

  // =========================================
  // CANCELAR
  // =========================================

  async function cancelarTurno() {
    if (!turnoEncontrado) return;

    setMensaje("");

    const { error } = await supabase
      .from("turnos_castracion")
      .update({
        estado: "Cancelado",
        motivo_cancelacion:
          motivoCancelacion ||
          "Cancelación solicitada por el usuario.",
      })
      .eq("id", turnoEncontrado.id);

    if (error) {
      console.error(
        "Error al cancelar solicitud:",
        error
      );

      setMensaje(
        "❌ No se pudo cancelar la solicitud."
      );

      return;
    }

    setTurnoEncontrado({
      ...turnoEncontrado,
      estado: "Cancelado",
      motivo_cancelacion:
        motivoCancelacion ||
        "Cancelación solicitada por el usuario.",
    });

    setModoCancelar(false);
    setMotivoCancelacion("");

    setMensaje(
      "✅ La solicitud fue cancelada correctamente."
    );
  }

  // =========================================
  // FORMATO DE FECHA
  // =========================================

  function mostrarFecha(fecha) {
    if (!fecha) {
      return "No especificada";
    }

    const partes = fecha.split("-");

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return (
    <main>
      {/* =========================
          VOLVER
      ========================= */}

      <button
        type="button"
        className="boton-volver"
        onClick={volver}
        style={{ marginBottom: "25px" }}
      >
        ← Volver al inicio
      </button>

      <h1>Solicitar turno de castración</h1>

      <p className="descripcion-registro">
        Completá los datos para registrar una solicitud de castración
        gratuita para tu mascota.
      </p>

      {/* =========================
          NUEVA SOLICITUD
      ========================= */}

      <section className="seccion-formulario">
        <div className="titulo-seccion">
          <span style={{ fontSize: "28px" }}>🐾</span>
          <h2>Datos de la solicitud</h2>
        </div>

        <form onSubmit={solicitarTurno}>
          <div className="campos-propietario">
            <div className="campo">
              <label>Nombre completo</label>

              <input
                type="text"
                name="nombrePropietario"
                value={formulario.nombrePropietario}
                onChange={manejarCambio}
                placeholder="Nombre y apellido"
                required
              />
            </div>

            <div className="campo">
              <label>Teléfono</label>

              <input
                type="tel"
                name="telefono"
                value={formulario.telefono}
                onChange={manejarCambio}
                placeholder="Ej. 3400 123456"
                required
              />
            </div>
          </div>

          <div className="campos-mascota">
            <div className="campo">
              <label>Nombre de la mascota</label>

              <input
                type="text"
                name="nombreMascota"
                value={formulario.nombreMascota}
                onChange={manejarCambio}
                placeholder="Nombre de la mascota"
                required
              />
            </div>

            <div className="campo">
              <label>Especie</label>

              <select
                name="especie"
                value={formulario.especie}
                onChange={manejarCambio}
              >
                <option>Perro</option>
                <option>Gato</option>
              </select>
            </div>

            <div className="campo">
              <label>Edad</label>

              <input
                type="text"
                name="edad"
                value={formulario.edad}
                onChange={manejarCambio}
                placeholder="Ej. 2 años"
                required
              />
            </div>

            <div className="campo">
              <label>Fecha preferida</label>

              <input
                type="date"
                name="fechaPreferida"
                value={formulario.fechaPreferida}
                onChange={manejarCambio}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="campo">
            <label>Observaciones</label>

            <textarea
              name="observaciones"
              value={formulario.observaciones}
              onChange={manejarCambio}
              placeholder="Podés agregar información adicional sobre la mascota."
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="boton-registrar"
            disabled={enviando}
          >
            {enviando
              ? "Enviando solicitud..."
              : "Solicitar turno"}
          </button>
        </form>

        {mensaje && (
          <p
            className="mensaje"
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {mensaje}
          </p>
        )}
      </section>

      {/* =========================
          CONSULTAR SOLICITUD
      ========================= */}

      <section className="seccion-formulario">
        <div className="titulo-seccion">
          <span style={{ fontSize: "28px" }}>🔎</span>
          <h2>Consultar mi solicitud</h2>
        </div>

        <p
          style={{
            color: "#475569",
            marginBottom: "25px",
          }}
        >
          Ingresá el teléfono y el nombre de la mascota utilizados
          al realizar la solicitud.
        </p>

        <form onSubmit={buscarTurno}>
          <div className="campos-propietario">
            <div className="campo">
              <label>Teléfono</label>

              <input
                type="tel"
                value={telefonoBusqueda}
                onChange={(e) =>
                  setTelefonoBusqueda(e.target.value)
                }
                placeholder="Ej. 3400 123456"
                required
              />
            </div>

            <div className="campo">
              <label>Nombre de la mascota</label>

              <input
                type="text"
                value={mascotaBusqueda}
                onChange={(e) =>
                  setMascotaBusqueda(e.target.value)
                }
                placeholder="Nombre de la mascota"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="boton-registrar"
            disabled={buscando}
          >
            {buscando
              ? "Buscando..."
              : "Consultar solicitud"}
          </button>
        </form>

        {/* =========================
            SOLICITUD ENCONTRADA
        ========================= */}

        {turnoEncontrado && (
          <div
            style={{
              marginTop: "30px",
              padding: "25px",
              background: "#f8fbff",
              border: "2px solid #c7dcff",
              borderRadius: "14px",
            }}
          >
            <h3
              style={{
                color: "#2563eb",
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              Solicitud encontrada
            </h3>

            <p>
              <strong>Mascota:</strong>{" "}
              {turnoEncontrado.nombre_mascota}
            </p>

            <p>
              <strong>Especie:</strong>{" "}
              {turnoEncontrado.especie}
            </p>

            <p>
              <strong>Edad:</strong>{" "}
              {turnoEncontrado.edad}
            </p>

            <p>
              <strong>Fecha solicitada:</strong>{" "}
              {mostrarFecha(
                turnoEncontrado.fecha_preferida
              )}
            </p>

            {turnoEncontrado.fecha_reprogramada && (
              <p>
                <strong>
                  Nueva fecha solicitada:
                </strong>{" "}
                {mostrarFecha(
                  turnoEncontrado.fecha_reprogramada
                )}
              </p>
            )}

            <p>
              <strong>Estado:</strong>{" "}
              {turnoEncontrado.estado}
            </p>

            {/* =========================
                ACCIONES
            ========================= */}

            {turnoEncontrado.estado !== "Cancelado" && (
              <div
                style={{
                  marginTop: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="boton-registrar"
                    style={{
                      margin: 0,
                    }}
                    onClick={() => {
                      setModoReprogramar(
                        !modoReprogramar
                      );
                      setModoCancelar(false);
                    }}
                  >
                    ↻ Reprogramar
                  </button>

                  <button
                    type="button"
                    className="boton-registrar"
                    style={{
                      margin: 0,
                      backgroundColor: "#dc2626",
                    }}
                    onClick={() => {
                      setModoCancelar(
                        !modoCancelar
                      );
                      setModoReprogramar(false);
                    }}
                  >
                    ✕ Cancelar solicitud
                  </button>
                </div>

                {/* =========================
                    REPROGRAMAR
                ========================= */}

                {modoReprogramar && (
                  <div
                    style={{
                      marginTop: "25px",
                      padding: "20px",
                      background: "white",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <div className="campo">
                      <label>
                        Nueva fecha preferida
                      </label>

                      <input
                        type="date"
                        value={nuevaFecha}
                        onChange={(e) =>
                          setNuevaFecha(
                            e.target.value
                          )
                        }
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="boton-registrar"
                      onClick={reprogramarTurno}
                    >
                      Solicitar reprogramación
                    </button>
                  </div>
                )}

                {/* =========================
                    CANCELAR
                ========================= */}

                {modoCancelar && (
                  <div
                    style={{
                      marginTop: "25px",
                      padding: "20px",
                      background: "white",
                      borderRadius: "10px",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <div className="campo">
                      <label>
                        Motivo de cancelación
                        (opcional)
                      </label>

                      <textarea
                        value={motivoCancelacion}
                        onChange={(e) =>
                          setMotivoCancelacion(
                            e.target.value
                          )
                        }
                        placeholder="Podés indicar el motivo de la cancelación."
                        rows="3"
                      />
                    </div>

                    <button
                      type="button"
                      className="boton-registrar"
                      style={{
                        backgroundColor: "#dc2626",
                      }}
                      onClick={cancelarTurno}
                    >
                      Confirmar cancelación
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================
          INFORMACIÓN
      ========================= */}

      <section className="seccion-formulario">
        <div className="titulo-seccion">
          <span style={{ fontSize: "28px" }}>📍</span>

          <h2>
            Información sobre las castraciones
          </h2>
        </div>

        <p>
          El Municipio de Villa Constitución brinda el servicio
          gratuito de esterilización para perros y gatos a partir
          de los 6 meses de edad.
        </p>

        <p>
          Actualmente, los turnos se otorgan los días lunes de
          7:00 a 13:00 h en la sede de Acción Social, ubicada en
          Avellaneda y Bolívar 2919.
        </p>

        <p>
          La solicitud realizada desde esta plataforma queda
          registrada como <strong>pendiente</strong> y no representa
          una confirmación automática del turno.
        </p>
      </section>
    </main>
  );
}

export default TurnosCastracion;