import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";
import "../styles/barraMenu.css";
const BarraMenu = () => {
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    const buscar = async () => {
      if (busqueda.trim() === "") {
        setResultados([]);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${busqueda}%`);

      if (error) {
        console.error("Error al buscar", error);
      } else {
        setResultados(data);
      }
    };
    buscar();
  }, [busqueda]);

  const handleSeleccionar = (usuario) => {
    setSeleccionado(usuario);
    setBusqueda("");
    setResultados([]);
    navigate(`/profile/${usuario.user_id}`);
  };
  const handlePerfilClick = () => {
    navigate("/profile");
  };
  const handleHomeClick = () => {
    navigate("/");
  };
  const handleSettingsClick = () => {
    navigate("/settings");
  };
  const handleMensajesClick = () => {
    navigate("/mensajes");
  };

  return (
    <div className="contenedor">
      <br />
      <div className="logo">
        <img
          src={
            "https://ylazueywekhmwffebgke.supabase.co/storage/v1/object/public/recursos//logo.png"
          }
          alt="logo"
        />
      </div>

      <button className="button" onClick={handleHomeClick}>
        Home
      </button>
      <button className="button" onClick={handlePerfilClick}>
        perfil
      </button>
      <input
        className="inputbuscar"
        type="text"
        placeholder="Buscar Usuarios"
        onChange={(e) => setBusqueda(e.target.value)}
        value={busqueda}
      />
      {resultados.length > 0 && (
        <ul>
          {resultados.map((usuario) => (
            <li
              key={usuario.user_id}
              onClick={() => handleSeleccionar(usuario)}
            >
              {usuario.name} ({usuario.username})
            </li>
          ))}
        </ul>
      )}
      <button className="button" onClick={handleMensajesClick}>
        Mensajes
      </button>
      <button className="button" onClick={handleSettingsClick}>
        Configuracion
      </button>
      <button className="buttonlogout" onClick={() => supabase.auth.signOut()}>
        logout
      </button>
    </div>
  );
};

export default BarraMenu;
