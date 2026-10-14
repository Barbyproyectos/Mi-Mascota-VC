import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

function Historial({ volver, irVacunaciones }) {
  const [mascotas, setMascotas] = useState([]);
  const [vacunas, setVacunas] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [mascotaSeleccionada, setMascotaSeleccionada] =
    useState(null);

  const [mascotaEditando, setMascotaEditando] =
    useState(null);

  const [formularioEdicion, setFormularioEdicion] =
    useState({
      nombre: "",
      especie: "Perro",
      raza: "",
      fechaNacimiento: "",
      propietario: "",
      telefono: "",
      direccion: "",
    });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);

    const { data: mascotasData, error: errorMascotas } =
      await supabase
        .from("mascotas")
        .select("*")
        .order("id", { ascending: true });

    if (errorMascotas) {
      console.error(
        "Error al cargar mascotas:",
        errorMascotas
      );

      setCargando(false);
      return;
    }

    const mascotasAdaptadas = (mascotasData || []).map(
      (mascota) => ({
        ...mascota,
        fechaNacimiento:
          mascota.fecha_nacimiento || "",
      })
    );

    const { data: vacunasData, error: errorVacunas } =
      await supabase
        .from("vacunas")
        .select("*")
        .order("id", { ascending: true });

    if (errorVacunas) {
      console.error(
        "Error al cargar vacunas:",
        errorVacunas
      );
    }

    setMascotas(mascotasAdaptadas);
    setVacunas(vacunasData || []);
    setCargando(false);
  }

  function seleccionarMascota(mascota) {
    setMascotaSeleccionada(mascota);
  }

  function cerrarDetalle() {
    setMascotaSeleccionada(null);
  }

  function abrirEdicion(mascota) {
    setMascotaEditando(mascota.id);

    setFormularioEdicion({
      nombre: mascota.nombre || "",
      especie: mascota.especie || "Perro",
      raza: mascota.raza || "",
      fechaNacimiento:
        mascota.fechaNacimiento || "",
      propietario: mascota.propietario || "",
      telefono: mascota.telefono || "",
      direccion: mascota.direccion || "",
    });
  }

  function cancelarEdicion() {
    setMascotaEditando(null);

    setFormularioEdicion({
      nombre: "",
      especie: "Perro",
      raza: "",
      fechaNacimiento: "",
      propietario: "",
      telefono: "",
      direccion: "",
    });
  }

  function manejarCambioEdicion(e) {
    const { name, value } = e.target;

    setFormularioEdicion({
      ...formularioEdicion,
      [name]: value,
    });
  }

  async function guardarEdicion(e) {
    e.preventDefault();

    const mascotaActual = mascotas.find(
      (mascota) =>
        mascota.id === mascotaEditando
    );

    if (!mascotaActual) {
      alert(
        "No se encontró la mascota que querés editar."
      );

      return;
    }

    const nombreAnterior = mascotaActual.nombre;
    const nombreNuevo = formularioEdicion.nombre;

    const { error } = await supabase
      .from("mascotas")
      .update({
        nombre: nombreNuevo,
        especie: formularioEdicion.especie,
        raza: formularioEdicion.raza,
        fecha_nacimiento:
          formularioEdicion.fechaNacimiento || null,
        propietario:
          formularioEdicion.propietario,
        telefono:
          formularioEdicion.telefono,
        direccion:
          formularioEdicion.direccion,
      })
      .eq("id", mascotaEditando);

    if (error) {
      console.error(
        "Error al actualizar mascota:",
        error
      );

      alert(
        "No se pudo actualizar la mascota en la base de datos."
      );

      return;
    }

    /*
      Si cambia el nombre de la mascota,
      también actualizamos las vacunas asociadas.
    */

    if (nombreAnterior !== nombreNuevo) {
      const { error: errorVacunas } =
        await supabase
          .from("vacunas")
          .update({
            mascota: nombreNuevo,
          })
          .eq("mascota", nombreAnterior);

      if (errorVacunas) {
        console.error(
          "Error al actualizar vacunas asociadas:",
          errorVacunas
        );

        alert(
          "La mascota fue actualizada, pero no se pudieron actualizar sus vacunas asociadas."
        );
      } else {
        setVacunas(
          (vacunasActuales) =>
            vacunasActuales.map((vacuna) =>
              vacuna.mascota === nombreAnterior
                ? {
                    ...vacuna,
                    mascota: nombreNuevo,
                  }
                : vacuna
            )
        );
      }
    }

    const mascotaActualizada = {
      ...mascotaActual,
      nombre: nombreNuevo,
      especie: formularioEdicion.especie,
      raza: formularioEdicion.raza,
      fechaNacimiento:
        formularioEdicion.fechaNacimiento,
      propietario:
        formularioEdicion.propietario,
      telefono:
        formularioEdicion.telefono,
      direccion:
        formularioEdicion.direccion,
    };

    setMascotas(
      (mascotasActuales) =>
        mascotasActuales.map((mascota) =>
          mascota.id === mascotaEditando
            ? mascotaActualizada
            : mascota
        )
    );

    if (
      mascotaSeleccionada &&
      mascotaSeleccionada.id === mascotaEditando
    ) {
      setMascotaSeleccionada(
        mascotaActualizada
      );
    }

    cancelarEdicion();

    alert(
      "Registro de mascota actualizado correctamente."
    );
  }

  async function eliminarMascota(mascota) {
    const confirmar = window.confirm(
      `¿Querés eliminar el registro de ${mascota.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("mascotas")
      .delete()
      .eq("id", mascota.id);

    if (error) {
      console.error(
        "Error al eliminar mascota:",
        error
      );

      alert(
        "No se pudo eliminar la mascota."
      );

      return;
    }

    /*
      Eliminamos también las vacunas asociadas
      para que no queden registros huérfanos.
    */

    const { error: errorVacunas } =
      await supabase
        .from("vacunas")
        .delete()
        .eq("mascota", mascota.nombre);

    if (errorVacunas) {
      console.error(
        "Error al eliminar vacunas asociadas:",
        errorVacunas
      );
    }

    setMascotas(
      (mascotasActuales) =>
        mascotasActuales.filter(
          (m) => m.id !== mascota.id
        )
    );

    setVacunas(
      (vacunasActuales) =>
        vacunasActuales.filter(
          (v) => v.mascota !== mascota.nombre
        )
    );

    if (
      mascotaSeleccionada &&
      mascotaSeleccionada.id === mascota.id
    ) {
      setMascotaSeleccionada(null);
    }

    alert(
      "Mascota eliminada correctamente."
    );
  }

  async function eliminarVacuna(vacuna) {
    const confirmar = window.confirm(
      `¿Querés eliminar la vacunación "${vacuna.vacuna}"?`
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("vacunas")
      .delete()
      .eq("id", vacuna.id);

    if (error) {
      console.error(
        "Error al eliminar vacunación:",
        error
      );

      alert(
        "No se pudo eliminar la vacunación."
      );

      return;
    }

    setVacunas(
      (vacunasActuales) =>
        vacunasActuales.filter(
          (v) => v.id !== vacuna.id
        )
    );

    alert(
      "Vacunación eliminada correctamente."
    );
  }

  function obtenerVacunasMascota(nombreMascota) {
    return vacunas.filter(
      (vacuna) =>
        vacuna.mascota === nombreMascota
    );
  }

  function obtenerEstadoVacuna(proxima) {
    if (!proxima) {
      return {
        texto: "Sin próxima dosis",
        emoji: "⚪",
      };
    }

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    const fechaProxima = new Date(
      `${proxima}T00:00:00`
    );

    const diferencia =
      fechaProxima.getTime() -
      hoy.getTime();

    const diasRestantes = Math.ceil(
      diferencia /
        (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) {
      return {
        texto: "Vencida",
        emoji: "🔴",
      };
    }

    if (diasRestantes <= 30) {
      return {
        texto: "Próxima",
        emoji: "🟡",
      };
    }

    return {
      texto: "Al día",
      emoji: "🟢",
    };
  }

  function mostrarFecha(fecha) {
    if (!fecha) {
      return "No registrada";
    }

    return fecha
      .split("-")
      .reverse()
      .join("/");
  }

  if (cargando) {
    return (
      <main>
        <button
          className="boton-registrar"
          onClick={volver}
          style={{ marginBottom: "25px" }}
        >
          ← Volver al inicio
        </button>

        <h1>Historial de Mascotas</h1>

        <section>
          <article>
            <h2>Cargando registros...</h2>

            <p>
              Esperá un momento mientras se
              cargan las mascotas y sus
              vacunaciones.
            </p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main>

      {/* VOLVER */}

      <button
        className="boton-registrar"
        onClick={volver}
        style={{ marginBottom: "25px" }}
      >
        ← Volver al inicio
      </button>

      <h1>Historial de Mascotas</h1>

      <p
        style={{
          textAlign: "center",
          color: "#475569",
          marginBottom: "30px",
          fontSize: "17px",
        }}
      >
        Consultá y administrá los registros
        almacenados.
      </p>

      <button
        className="boton-registrar"
        onClick={irVacunaciones}
        style={{
          marginBottom: "35px",
        }}
      >
        + Registrar vacunación
      </button>

      {mascotas.length === 0 ? (

        <p
          style={{
            textAlign: "center",
            fontSize: "18px",
          }}
        >
          No hay mascotas registradas todavía.
        </p>

      ) : (

        <section>

          {mascotas.map((mascota) => {

            const vacunasMascota =
              obtenerVacunasMascota(
                mascota.nombre
              );

            return (
              <article
                key={mascota.id}
              >

                {/* DATOS DE LA MASCOTA */}

                <h2>
                  🐾 {mascota.nombre}
                </h2>

                <p>
                  <strong>
                    Especie:
                  </strong>{" "}
                  {mascota.especie}
                </p>

                <p>
                  <strong>
                    Raza:
                  </strong>{" "}
                  {mascota.raza ||
                    "No especificada"}
                </p>

                <p>
                  <strong>
                    Fecha de nacimiento:
                  </strong>{" "}
                  {mostrarFecha(
                    mascota.fechaNacimiento
                  )}
                </p>

                <p>
                  <strong>
                    Propietario:
                  </strong>{" "}
                  {mascota.propietario}
                </p>

                <p>
                  <strong>
                    Teléfono:
                  </strong>{" "}
                  {mascota.telefono}
                </p>

                <p>
                  <strong>
                    Dirección:
                  </strong>{" "}
                  {mascota.direccion}
                </p>

                <hr />

                {/* ACCIONES */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >

                  <button
                    onClick={() =>
                      seleccionarMascota(
                        mascota
                      )
                    }
                  >
                    Ver información
                  </button>

                  <button
                    onClick={() =>
                      abrirEdicion(
                        mascota
                      )
                    }
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      eliminarMascota(
                        mascota
                      )
                    }
                  >
                    Eliminar registro
                  </button>

                </div>

                {/* INFORMACIÓN DETALLADA */}

                {mascotaSeleccionada?.id ===
                  mascota.id && (

                  <div
                    style={{
                      backgroundColor:
                        "#ffffff",
                      border:
                        "1px solid #c7dcff",
                      borderRadius:
                        "12px",
                      padding: "20px",
                      marginBottom:
                        "25px",
                      textAlign: "left",
                    }}
                  >

                    <h3>
                      Información de{" "}
                      {mascota.nombre}
                    </h3>

                    <p>
                      <strong>
                        Nombre:
                      </strong>{" "}
                      {mascota.nombre}
                    </p>

                    <p>
                      <strong>
                        Especie:
                      </strong>{" "}
                      {mascota.especie}
                    </p>

                    <p>
                      <strong>
                        Raza:
                      </strong>{" "}
                      {mascota.raza ||
                        "No especificada"}
                    </p>

                    <p>
                      <strong>
                        Fecha de nacimiento:
                      </strong>{" "}
                      {mostrarFecha(
                        mascota.fechaNacimiento
                      )}
                    </p>

                    <p>
                      <strong>
                        Propietario:
                      </strong>{" "}
                      {mascota.propietario}
                    </p>

                    <p>
                      <strong>
                        Teléfono:
                      </strong>{" "}
                      {mascota.telefono}
                    </p>

                    <p>
                      <strong>
                        Dirección:
                      </strong>{" "}
                      {mascota.direccion}
                    </p>

                    <button
                      onClick={
                        cerrarDetalle
                      }
                    >
                      Cerrar
                    </button>

                  </div>

                )}

                {/* FORMULARIO DE EDICIÓN */}

                {mascotaEditando ===
                  mascota.id && (

                  <form
                    onSubmit={
                      guardarEdicion
                    }
                    style={{
                      backgroundColor:
                        "#f8fbff",
                      border:
                        "2px solid #c7dcff",
                      borderRadius:
                        "14px",
                      padding: "25px",
                      marginBottom:
                        "25px",
                      textAlign: "left",
                    }}
                  >

                    <h3>
                      ✏️ Editar mascota
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(0, 1fr))",
                        gap: "20px",
                      }}
                    >

                      <div className="campo">
                        <label>
                          Nombre
                        </label>

                        <input
                          type="text"
                          name="nombre"
                          value={
                            formularioEdicion.nombre
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                          required
                        />
                      </div>

                      <div className="campo">
                        <label>
                          Especie
                        </label>

                        <select
                          name="especie"
                          value={
                            formularioEdicion.especie
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                        >
                          <option>
                            Perro
                          </option>

                          <option>
                            Gato
                          </option>

                          <option>
                            Otro
                          </option>
                        </select>
                      </div>

                      <div className="campo">
                        <label>
                          Raza
                        </label>

                        <input
                          type="text"
                          name="raza"
                          value={
                            formularioEdicion.raza
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                        />
                      </div>

                      <div className="campo">
                        <label>
                          Fecha de nacimiento
                        </label>

                        <input
                          type="date"
                          name="fechaNacimiento"
                          value={
                            formularioEdicion.fechaNacimiento
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                        />
                      </div>

                      <div className="campo">
                        <label>
                          Propietario
                        </label>

                        <input
                          type="text"
                          name="propietario"
                          value={
                            formularioEdicion.propietario
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                          required
                        />
                      </div>

                      <div className="campo">
                        <label>
                          Teléfono
                        </label>

                        <input
                          type="tel"
                          name="telefono"
                          value={
                            formularioEdicion.telefono
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                          required
                        />
                      </div>

                      <div
                        className="campo"
                        style={{
                          gridColumn:
                            "1 / -1",
                        }}
                      >
                        <label>
                          Dirección
                        </label>

                        <input
                          type="text"
                          name="direccion"
                          value={
                            formularioEdicion.direccion
                          }
                          onChange={
                            manejarCambioEdicion
                          }
                          required
                        />
                      </div>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "center",
                        gap: "12px",
                        marginTop:
                          "25px",
                      }}
                    >

                      <button
                        type="submit"
                        className="boton-registrar"
                      >
                        Guardar cambios
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelarEdicion
                        }
                      >
                        Cancelar
                      </button>

                    </div>

                  </form>

                )}

                {/* HISTORIAL DE VACUNACIÓN */}

                <h3>
                  💉 Historial de vacunación
                </h3>

                {vacunasMascota.length ===
                0 ? (

                  <p>
                    Esta mascota todavía
                    no tiene vacunaciones
                    registradas.
                  </p>

                ) : (

                  <div>

                    {vacunasMascota.map(
                      (vacuna) => {

                        const estado =
                          obtenerEstadoVacuna(
                            vacuna.proxima
                          );

                        return (
                          <div
                            key={
                              vacuna.id
                            }
                            style={{
                              backgroundColor:
                                "#ffffff",
                              border:
                                "1px solid #c7dcff",
                              borderRadius:
                                "12px",
                              padding:
                                "20px",
                              margin:
                                "15px 0",
                              textAlign:
                                "left",
                            }}
                          >

                            <p>
                              <strong>
                                Vacuna:
                              </strong>{" "}
                              {
                                vacuna.vacuna
                              }
                            </p>

                            <p>
                              <strong>
                                Fecha aplicada:
                              </strong>{" "}
                              {mostrarFecha(
                                vacuna.fecha
                              )}
                            </p>

                            <p>
                              <strong>
                                Próxima dosis:
                              </strong>{" "}
                              {mostrarFecha(
                                vacuna.proxima
                              )}
                            </p>

                            <p>
                              <strong>
                                Estado:
                              </strong>{" "}
                              {
                                estado.texto
                              }{" "}
                              {
                                estado.emoji
                              }
                            </p>

                            <button
                              onClick={() =>
                                eliminarVacuna(
                                  vacuna
                                )
                              }
                            >
                              Eliminar vacunación
                            </button>

                          </div>
                        );

                      }
                    )}

                  </div>

                )}

              </article>
            );

          })}

        </section>

      )}

    </main>
  );
}

export default Historial;