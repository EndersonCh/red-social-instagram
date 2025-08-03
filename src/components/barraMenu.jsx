import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";

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
        .ilike("username", `%${busqueda}`);

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
    console.log(`Seleccionado ${usuario.id}`);
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

  return (
    <div>
      <br />
      <dl></dl>
      <h4>Barra menu</h4>
      <button onClick={handleHomeClick}>Home</button>
      <button onClick={handlePerfilClick}>perfil</button>
      <input
        type="text"
        placeholder="Buscar Usuarios"
        onChange={(e) => setBusqueda(e.target.value)}
        value={busqueda}
      />
      {resultados.length > 0 && (
        <ul>
          {resultados.map((usuario) => (
            <li key={usuario.id} onClick={() => handleSeleccionar(usuario)}>
              {usuario.name} ({usuario.username})
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleHomeClick}>Explorar</button>
      <button onClick={handleSettingsClick}>Configuracion</button>
      <button onClick={() => supabase.auth.signOut()}>logout</button>
    </div>
  );
};

export default BarraMenu;
