import { useState } from "react";
import { FaPaw, FaUser } from "react-icons/fa";
import { supabase } from "../src/lib/supabaseClient";

function RegistroMascota({ volver }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    especie: "Perro",
    raza: "",
    fechaNacimiento: "",
    propietario: "",
    telefono: "",
    direccion: "",
  });

  const [mensaje, setMensaje] = useState("");

  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  async function registrarMascota(e) {
    e.preventDefault();
    setMensaje("");

    const { error } = await supabase
      .from("mascotas")
      .insert([
        {
          nombre: formulario.nombre,
          especie: formulario.especie,
          raza: formulario.raza,
          fecha_nacimiento: formulario.fechaNacimiento || null,
          propietario: formulario.propietario,
          telefono: formulario.telefono,
          direccion: formulario.direccion,
        },
      ]);

    if (error) {
      console.error(
        "Error al guardar en Supabase:",
        error
      );

      setMensaje(
        "❌ No se pudo guardar la mascota en la base de datos."
      );

      return;
    }

    setMensaje(
      "✅ Mascota registrada correctamente."
    );

    setFormulario({
      nombre: "",
      especie: "Perro",
      raza: "",
      fechaNacimiento: "",
      propietario: "",
      telefono: "",
      direccion: "",
    });
  }

  return (
    <div className="contenedor-registro">
      <button
        className="boton-volver"
        onClick={volver}
        style={{ marginBottom: "25px" }}
      >
        ← Volver al inicio
      </button>

      <h1>Registrar Mascota</h1>

      <p className="descripcion-registro">
        Registrá una nueva mascota y los datos de su propietario.
      </p>

      <form onSubmit={registrarMascota}>
        <section className="seccion-formulario">
          <div className="titulo-seccion">
            <FaPaw />
            <h2>Datos de la mascota</h2>
          </div>

          <div className="campos-mascota">
            <div className="campo">
              <label>Nombre de la mascota</label>

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
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
                <option>Otro</option>
              </select>
            </div>

            <div className="campo">
              <label>Raza</label>

              <input
                type="text"
                name="raza"
                value={formulario.raza}
                onChange={manejarCambio}
              />
            </div>

            <div className="campo">
              <label>Fecha de nacimiento</label>

              <input
                type="date"
                name="fechaNacimiento"
                value={formulario.fechaNacimiento}
                onChange={manejarCambio}
              />
            </div>
          </div>
        </section>

        <section className="seccion-formulario">
          <div className="titulo-seccion">
            <FaUser />
            <h2>Datos del propietario</h2>
          </div>

          <div className="campos-propietario">
            <div className="campo">
              <label>Nombre completo</label>

              <input
                type="text"
                name="propietario"
                value={formulario.propietario}
                onChange={manejarCambio}
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
                required
              />
            </div>

            <div className="campo">
              <label>Dirección</label>

              <input
                type="text"
                name="direccion"
                value={formulario.direccion}
                onChange={manejarCambio}
                required
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="boton-registrar"
        >
          <FaPaw />
          Registrar mascota
        </button>

        {mensaje && (
          <p className="mensaje">
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}

export default RegistroMascota;