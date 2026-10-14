import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

function MascotasPerdidas({ volver }) {
  const [mascotas, setMascotas] = useState([]);

  const [formulario, setFormulario] = useState({
    nombreMascota: "",
    especie: "Perro",
    descripcion: "",
    zona: "",
    fecha: "",
    nombreContacto: "",
    telefonoContacto: "",
    observaciones: "",
  });

  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    cargarMascotasPerdidas();
  }, []);

  async function cargarMascotasPerdidas() {
    const { data, error } = await supabase
      .from("mascotas_perdidas")
      .select("*")
      .eq("estado", "Publicado")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar mascotas perdidas:", error);
      setMensaje("❌ No se pudieron cargar las publicaciones.");
      return;
    }

    setMascotas(data || []);
  }

  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  function seleccionarFoto(e) {
    const archivo = e.target.files[0];

    if (!archivo) {
      setFoto(null);
      setVistaPrevia("");
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setMensaje("❌ El archivo seleccionado no es una imagen.");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje("❌ La imagen no puede superar los 5 MB.");
      return;
    }

    setFoto(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
    setMensaje("");
  }

  async function publicarMascota(e) {
    e.preventDefault();

    setMensaje("");
    setEnviando(true);

    let fotoUrl = null;

    try {
      // ==========================================
      // SUBIR FOTO
      // ==========================================

      if (foto) {
        const extension = foto.name.split(".").pop();

        const nombreArchivo = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`;

        const { error: errorFoto } = await supabase.storage
          .from("mascotas-perdidas")
          .upload(nombreArchivo, foto);

        if (errorFoto) {
          console.error("Error al subir la foto:", errorFoto);

          setMensaje(
            "❌ No se pudo subir la foto. Revisá los permisos del Storage."
          );

          setEnviando(false);
          return;
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from("mascotas-perdidas")
          .getPublicUrl(nombreArchivo);

        fotoUrl = urlData.publicUrl;
      }

      // ==========================================
      // GUARDAR AVISO
      // ==========================================

      const { error } = await supabase
        .from("mascotas_perdidas")
        .insert([
          {
            nombre_mascota: formulario.nombreMascota,
            especie: formulario.especie,
            descripcion: formulario.descripcion,
            zona: formulario.zona,
            fecha: formulario.fecha || null,
            foto_url: fotoUrl,
            nombre_contacto: formulario.nombreContacto,
            telefono_contacto: formulario.telefonoContacto,
            observaciones: formulario.observaciones,
            estado: "Publicado",
          },
        ]);

      if (error) {
        console.error("Error al guardar publicación:", error);

        setMensaje(
          "❌ No se pudo publicar el aviso. Revisá la configuración de la base de datos."
        );

        setEnviando(false);
        return;
      }

      setMensaje("✅ Aviso publicado correctamente.");

      setFormulario({
        nombreMascota: "",
        especie: "Perro",
        descripcion: "",
        zona: "",
        fecha: "",
        nombreContacto: "",
        telefonoContacto: "",
        observaciones: "",
      });

      setFoto(null);
      setVistaPrevia("");

      await cargarMascotasPerdidas();
    } catch (error) {
      console.error("Error inesperado:", error);
      setMensaje("❌ Ocurrió un error inesperado.");
    }

    setEnviando(false);
  }

  // ==========================================
  // MARCAR MASCOTA COMO ENCONTRADA
  // ==========================================

  async function marcarComoEncontrada(id) {
    const confirmar = window.confirm(
      "¿La mascota fue encontrada?\n\nEl aviso dejará de aparecer en la lista pública."
    );

    if (!confirmar) {
      return;
    }

    setActualizando(id);
    setMensaje("");

    const { error } = await supabase
      .from("mascotas_perdidas")
      .update({
        estado: "Encontrada",
      })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar aviso:", error);

      setMensaje(
        "❌ No se pudo actualizar el aviso. Revisá los permisos de la base de datos."
      );

      setActualizando(null);
      return;
    }

    setMensaje(
      "✅ Aviso actualizado. La mascota fue marcada como encontrada."
    );

    setActualizando(null);

    await cargarMascotasPerdidas();
  }

  return (
    <main className="pagina-mascotas-perdidas">

      {/* ==========================================
          VOLVER
      ========================================== */}

      <button
        type="button"
        className="boton-volver"
        onClick={volver}
      >
        ← Volver al inicio
      </button>

      <h1>🐾 Mascotas perdidas</h1>

      <p className="descripcion-registro">
        Publicá un aviso para ayudar a una mascota a volver a casa.
      </p>

      {/* ==========================================
          FORMULARIO
      ========================================== */}

      <section className="seccion-formulario">

        <div className="titulo-seccion">
          <span style={{ fontSize: "28px" }}>🐾</span>
          <h2>Publicar aviso</h2>
        </div>

        <form onSubmit={publicarMascota}>

          <div className="campos-mascota">

            <div className="campo">
              <label>Nombre de la mascota</label>

              <input
                type="text"
                name="nombreMascota"
                value={formulario.nombreMascota}
                onChange={manejarCambio}
                placeholder="Ej. Luna"
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
              <label>Zona donde se perdió</label>

              <input
                type="text"
                name="zona"
                value={formulario.zona}
                onChange={manejarCambio}
                placeholder="Ej. Barrio San Miguel"
                required
              />
            </div>

            <div className="campo">
              <label>Fecha</label>

              <input
                type="date"
                name="fecha"
                value={formulario.fecha}
                onChange={manejarCambio}
                required
              />
            </div>

          </div>

          <div className="campo">

            <label>Descripción</label>

            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              placeholder="Describí cómo es la mascota, color, tamaño, collar, características particulares, etc."
              rows="4"
              required
            />

          </div>

          {/* FOTO */}

          <div className="campo campo-foto">

            <label>Foto de la mascota</label>

            <input
              type="file"
              accept="image/*"
              onChange={seleccionarFoto}
            />

            <small>
              Podés subir una imagen de hasta 5 MB.
            </small>

          </div>

          {/* VISTA PREVIA */}

          {vistaPrevia && (
            <div className="vista-previa-mascota">

              <p>Vista previa:</p>

              <img
                src={vistaPrevia}
                alt="Vista previa de la mascota"
              />

            </div>
          )}

          {/* CONTACTO */}

          <div className="campos-propietario">

            <div className="campo">

              <label>Nombre de contacto</label>

              <input
                type="text"
                name="nombreContacto"
                value={formulario.nombreContacto}
                onChange={manejarCambio}
                placeholder="Nombre y apellido"
                required
              />

            </div>

            <div className="campo">

              <label>Teléfono de contacto</label>

              <input
                type="tel"
                name="telefonoContacto"
                value={formulario.telefonoContacto}
                onChange={manejarCambio}
                placeholder="Ej. 3400 123456"
                required
              />

            </div>

          </div>

          <div className="campo">

            <label>Observaciones</label>

            <textarea
              name="observaciones"
              value={formulario.observaciones}
              onChange={manejarCambio}
              placeholder="Información adicional que pueda ayudar a encontrarla."
              rows="3"
            />

          </div>

          <button
            type="submit"
            className="boton-registrar"
            disabled={enviando}
          >
            {enviando
              ? "Publicando..."
              : "🐾 Publicar aviso"}
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

      {/* ==========================================
          PUBLICACIONES
      ========================================== */}

      <section className="seccion-formulario">

        <div className="titulo-seccion">

          <span style={{ fontSize: "28px" }}>
            🔎
          </span>

          <h2>
            Mascotas perdidas recientemente
          </h2>

        </div>

        {mascotas.length === 0 ? (

          <p className="sin-publicaciones">
            No hay avisos de mascotas perdidas publicados actualmente.
          </p>

        ) : (

          <div className="mascotas-perdidas-grid">

            {mascotas.map((mascota) => (

              <article
                key={mascota.id}
                className="tarjeta-mascota-perdida"
              >

                {/* FOTO */}

                {mascota.foto_url ? (

                  <img
                    src={mascota.foto_url}
                    alt={`Foto de ${mascota.nombre_mascota}`}
                    className="foto-mascota-perdida"
                  />

                ) : (

                  <div className="sin-foto-mascota">
                    🐾
                  </div>

                )}

                <div className="contenido-mascota-perdida">

                  <h3>
                    {mascota.nombre_mascota}
                  </h3>

                  <p>
                    <strong>Especie:</strong>{" "}
                    {mascota.especie}
                  </p>

                  <p>
                    <strong>📍 Zona:</strong>{" "}
                    {mascota.zona}
                  </p>

                  <p>
                    <strong>📅 Fecha:</strong>{" "}
                    {mascota.fecha
                      ? new Date(
                          mascota.fecha + "T00:00:00"
                        ).toLocaleDateString("es-AR")
                      : "No especificada"}
                  </p>

                  <p>
                    {mascota.descripcion}
                  </p>

                  {/* CONTACTO */}

                  <div className="contacto-mascota-perdida">

                    <strong>
                      📞 Contacto
                    </strong>

                    <span>
                      {mascota.nombre_contacto}
                    </span>

                    <span>
                      {mascota.telefono_contacto}
                    </span>

                  </div>

                  {/* BOTÓN */}

                  <button
                    type="button"
                    className="btn-mascota-encontrada"
                    onClick={() =>
                      marcarComoEncontrada(mascota.id)
                    }
                    disabled={actualizando === mascota.id}
                  >
                    {actualizando === mascota.id
                      ? "Actualizando..."
                      : "🐾 Mascota encontrada"}
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default MascotasPerdidas;