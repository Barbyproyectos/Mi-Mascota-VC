import {
  FaPaw,
  FaHome,
  FaDog,
  FaSyringe,
  FaClipboardList,
} from "react-icons/fa";

function Navbar({
  irInicio,
  irRegistro,
  irHistorial,
  irVacunaciones,
}) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="logo-icon">
          <FaPaw />
        </div>

        <div className="logo-text">
          <strong>Mi Mascota VC</strong>
          <span>Villa Constitución</span>
        </div>
      </div>

      <div className="navbar-menu">
        <button onClick={irInicio}>
          <FaHome />
          <span>Inicio</span>
        </button>

        <button onClick={irRegistro}>
          <FaDog />
          <span>Registrar Mascota</span>
        </button>

        <button onClick={irVacunaciones}>
          <FaSyringe />
          <span>Vacunación</span>
        </button>

        <button onClick={irHistorial}>
          <FaClipboardList />
          <span>Historial</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;