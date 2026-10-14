import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";

import RegistroMascota from "../pages/RegistroMascota";
import Historial from "../pages/Historial";
import Vacunaciones from "../pages/Vacunaciones";
import TurnosCastracion from "../pages/TurnosCastracion";
import MascotasPerdidas from "../pages/MascotasPerdidas";

function App() {
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarVacunaciones, setMostrarVacunaciones] = useState(false);
  const [mostrarTurnos, setMostrarTurnos] = useState(false);
  const [mostrarMascotasPerdidas, setMostrarMascotasPerdidas] =
    useState(false);

  function irInicio() {
    setMostrarRegistro(false);
    setMostrarHistorial(false);
    setMostrarVacunaciones(false);
    setMostrarTurnos(false);
    setMostrarMascotasPerdidas(false);
  }

  function irRegistro() {
    setMostrarRegistro(true);
    setMostrarHistorial(false);
    setMostrarVacunaciones(false);
    setMostrarTurnos(false);
    setMostrarMascotasPerdidas(false);
  }

  function irHistorial() {
    setMostrarRegistro(false);
    setMostrarHistorial(true);
    setMostrarVacunaciones(false);
    setMostrarTurnos(false);
    setMostrarMascotasPerdidas(false);
  }

  function irVacunaciones() {
    setMostrarRegistro(false);
    setMostrarHistorial(false);
    setMostrarVacunaciones(true);
    setMostrarTurnos(false);
    setMostrarMascotasPerdidas(false);
  }

  function irTurnos() {
    setMostrarRegistro(false);
    setMostrarHistorial(false);
    setMostrarVacunaciones(false);
    setMostrarTurnos(true);
    setMostrarMascotasPerdidas(false);
  }

  function irMascotasPerdidas() {
    setMostrarRegistro(false);
    setMostrarHistorial(false);
    setMostrarVacunaciones(false);
    setMostrarTurnos(false);
    setMostrarMascotasPerdidas(true);
  }

  function conocerMas() {
    document.getElementById("servicios")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <div className="app">

      <Navbar
        irInicio={irInicio}
        irRegistro={irRegistro}
        irHistorial={irHistorial}
        irVacunaciones={irVacunaciones}
      />

      {mostrarRegistro ? (

        <RegistroMascota volver={irInicio} />

      ) : mostrarHistorial ? (

        <Historial
          volver={irInicio}
          irVacunaciones={irVacunaciones}
        />

      ) : mostrarVacunaciones ? (

        <Vacunaciones volver={irInicio} />

      ) : mostrarTurnos ? (

        <TurnosCastracion volver={irInicio} />

      ) : mostrarMascotasPerdidas ? (

        <MascotasPerdidas volver={irInicio} />

      ) : (

        <>
          {/* ==========================================
              HERO
          ========================================== */}

          <section className="hero">

            <div className="hero-contenido">

              <div className="hero-texto">

                <div className="hero-etiqueta">
                  <span></span>
                  Municipalidad de Villa Constitución — Santa Fe
                </div>

                <h1>
                  Sistema Municipal de
                  <span>Registro Animal</span>
                </h1>

                <p>
                  Una herramienta digital para registrar,
                  administrar y consultar la información de las
                  mascotas de Villa Constitución de manera rápida,
                  segura y gratuita.
                </p>

                <div className="hero-botones">

                  <button
                    className="btn-hero-principal"
                    onClick={irRegistro}
                  >
                    Registrar mascota
                  </button>

                  <button
                    className="btn-hero-secundario"
                    onClick={conocerMas}
                  >
                    Conocer más →
                  </button>

                </div>

              </div>

              <div className="hero-visual">

                <div className="hero-imagen">

                  <img
                    src="/mascotas.jpg"
                    alt="Perro y gato"
                    className="imagen-mascotas"
                  />

                  <div className="badge-digital">
                    <strong>Digital</strong>
                    <span>Registro</span>
                  </div>

                  <div className="badge-registro">

                    <div className="check">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Información almacenada
                      </strong>

                      <small>
                        Registro centralizado
                      </small>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="hero-estadisticas">

              <div>
                <strong>Digital</strong>
                <span>Registro centralizado</span>
              </div>

              <div>
                <strong>Historial</strong>
                <span>Control de vacunaciones</span>
              </div>

              <div>
                <strong>Gratis</strong>
                <span>Sin costo para el usuario</span>
              </div>

            </div>

          </section>

          {/* ==========================================
              SERVICIOS
          ========================================== */}

          <section
            id="servicios"
            className="seccion-formulario"
          >

            <h2>
              Todo lo necesario para gestionar una mascota
            </h2>

            <div className="tarjetas-inicio">

              <article>

                <div className="icono-tarjeta">
                  🐾
                </div>

                <h3>
                  Registrar mascotas
                </h3>

                <p>
                  Registrá los datos de la mascota y de su
                  propietario para mantener la información
                  organizada.
                </p>

                <button onClick={irRegistro}>
                  Registrar →
                </button>

              </article>

              <article>

                <div className="icono-tarjeta">
                  💉
                </div>

                <h3>
                  Registrar vacunaciones
                </h3>

                <p>
                  Guardá las vacunas aplicadas, la fecha de
                  aplicación y la próxima dosis correspondiente.
                </p>

                <button onClick={irVacunaciones}>
                  Registrar →
                </button>

              </article>

              <article>

                <div className="icono-tarjeta">
                  📋
                </div>

                <h3>
                  Consultar historial
                </h3>

                <p>
                  Consultá los registros de las mascotas y su
                  historial de vacunación desde un mismo lugar.
                </p>

                <button onClick={irHistorial}>
                  Consultar →
                </button>

              </article>

            </div>

          </section>

          {/* ==========================================
              CASTRACIÓN
          ========================================== */}

          <section className="seccion-castracion">

            <div className="castracion-contenido">

              <div className="castracion-texto">

                <span className="castracion-etiqueta">
                  SERVICIO GRATUITO
                </span>

                <h2>
                  Castración responsable para tu mascota
                </h2>

                <p>
                  Accedé a información sobre el servicio
                  municipal de esterilización y registrá una
                  solicitud de turno para tu perro o gato.
                </p>

                <button
                  className="btn-castracion"
                  onClick={irTurnos}
                >
                  Solicitar turno →
                </button>

              </div>

              <div className="castracion-info">

                <div className="info-castracion">

                  <span>📍</span>

                  <div>

                    <strong>
                      Acción Social
                    </strong>

                    <p>
                      Avellaneda y Bolívar 2919
                      <br />
                      Villa Constitución, Santa Fe
                    </p>

                  </div>

                </div>

                <div className="info-castracion">

                  <span>🕐</span>

                  <div>

                    <strong>
                      Entrega de turnos
                    </strong>

                    <p>
                      Lunes de 7:00 a 13:00 h
                    </p>

                  </div>

                </div>

                <div className="info-castracion">

                  <span>🐶</span>

                  <div>

                    <strong>
                      Perros y gatos
                    </strong>

                    <p>
                      Desde los 6 meses de edad
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ==========================================
              MASCOTAS PERDIDAS
          ========================================== */}

          <section className="seccion-mascotas-perdidas-inicio">

            <div className="contenido-mascotas-perdidas-inicio">

              <div className="icono-mascotas-perdidas-inicio">
                🐾
              </div>

              <div className="texto-mascotas-perdidas-inicio">

                <span>
                  COMUNIDAD
                </span>

                <h2>
                  ¿Se perdió una mascota?
                </h2>

                <p>
                  Publicá un aviso con su foto, zona y datos
                  de contacto para ayudar a encontrarla y
                  facilitar su regreso a casa.
                </p>

              </div>

              <button
                className="btn-mascotas-perdidas-inicio"
                onClick={irMascotasPerdidas}
              >
                Ver mascotas perdidas →
              </button>

            </div>

          </section>

          {/* ==========================================
              FOOTER
          ========================================== */}

          <footer className="footer-municipal">

            <div className="footer-contenido">

              <div className="footer-columna">

                <div className="footer-logo">

                  <div className="logo-icon">
                    🐾
                  </div>

                  <div>

                    <strong>
                      Mi Mascota VC
                    </strong>

                    <span>
                      Villa Constitución
                    </span>

                  </div>

                </div>

                <p>
                  Sistema digital orientado al registro y
                  gestión de información de mascotas de
                  Villa Constitución.
                </p>

              </div>

              <div className="footer-columna">

                <h3>
                  Municipalidad
                </h3>

                <p>
                  📍 Av. San Martín 1218
                  <br />
                  Villa Constitución, Santa Fe
                </p>

                <p>
                  ☎️ 03400 474608 / 435500
                </p>

              </div>

              <div className="footer-columna">

                <h3>
                  Desarrollo Humano
                </h3>

                <p>
                  📍 Avellaneda y Bolívar 2919
                </p>

                <p>
                  ☎️ 03400 478584
                </p>

              </div>

            </div>

            <div className="footer-final">

              <span>
                © 2026 Mi Mascota VC
              </span>

              <span>
                Proyecto académico — ISPEL 3
              </span>

            </div>

          </footer>

        </>

      )}

    </div>
  );
}

export default App;