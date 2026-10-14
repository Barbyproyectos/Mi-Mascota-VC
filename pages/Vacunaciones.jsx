import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

function Vacunaciones({ volver }) {
  const [vacuna, setVacuna] = useState("");
  const [fecha, setFecha] = useState("");
  const [proxima, setProxima] = useState("");

  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] =
    useState("");

  const [cargandoMascotas, setCargandoMascotas] =
    useState(true);

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarMascotas() {
      setCargandoMascotas(true);

      const { data, error } = await supabase
        .from("mascotas")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(
          "Error al cargar mascotas:",
          error
        );

        setMensaje(
          "❌ No se pudieron cargar las mascotas desde la base de datos."
        );

        setCargandoMascotas(false);

        return;
      }

      setMascotas(data || []);
      setCargandoMascotas(false);
    }

    cargarMascotas();
  }, []);

  async function guardarVacuna(e) {
    e.preventDefault();

    setMensaje("");

    const { error } = await supabase
      .from("vacunas")
      .insert([
        {
          mascota: mascotaSeleccionada,
          vacuna: vacuna,
          fecha: fecha,
          proxima: proxima || null,
        },
      ]);

    if (error) {
      console.error(
        "Error al guardar vacunación en Supabase:",
        error
      );

      setMensaje(
        "❌ No se pudo guardar la vacunación en la base de datos."
      );

      return;
    }

    setMensaje(
      "✅ Vacunación registrada correctamente."
    );

    setMascotaSeleccionada("");
    setVacuna("");
    setFecha("");
    setProxima("");
  }

  return (
    <main>
      <button
        type="button"
        className="boton-volver"
        onClick={volver}
      >
        ← Volver al inicio
      </button>

      <h1>Registrar vacunación</h1>

      <p className="descripcion-registro">
        Registrá las vacunas aplicadas a cada mascota.
      </p>

      <form onSubmit={guardarVacuna}>
        <section className="seccion-formulario">
          <div className="titulo-seccion">
            <h2>💉 Datos de la vacunación</h2>
          </div>

          <div>
            <div className="campo">
              <label>Mascota</label>

              <select
                value={mascotaSeleccionada}
                onChange={(e) =>
                  setMascotaSeleccionada(e.target.value)
                }
                required
              >
                <option value="">
                  {cargandoMascotas
                    ? "Cargando mascotas..."
                    : "Seleccionar..."}
                </option>

                {mascotas.map((m) => (
                  <option
                    key={m.id}
                    value={m.nombre}
                  >
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Vacuna</label>

              <input
                type="text"
                value={vacuna}
                onChange={(e) =>
                  setVacuna(e.target.value)
                }
                required
              />
            </div>

            <div className="campo">
              <label>Fecha aplicada</label>

              <input
                type="date"
                value={fecha}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
                required
              />
            </div>

            <div className="campo">
              <label>Próxima dosis</label>

              <input
                type="date"
                value={proxima}
                onChange={(e) =>
                  setProxima(e.target.value)
                }
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="boton-registrar"
          disabled={cargandoMascotas}
        >
          Guardar vacunación
        </button>
      </form>

      {mensaje && (
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {mensaje}
        </p>
      )}
    </main>
  );
}

export default Vacunaciones;