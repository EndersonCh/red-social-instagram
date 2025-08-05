import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import BarraMenu from "../components/barraMenu";
import { useNavigate } from "react-router-dom";

const Mensajes = () => {
  const navigate = useNavigate();
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [datosUser, setdatosUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const abrirConversacion = (contacto) => {
    console.log(contacto);
  };

  useEffect(() => {
    const infoUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: perfil } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setdatosUser({
        ...user,
        perfil: perfil,
      });
      setUserId(user.id);
    };
    infoUser();
  }, []);

  useEffect(() => {
    if (userId) {
      const buscar = async () => {
        if (busqueda.trim() === "") {
          setResultados([]);
          return;
        }
        const { data: seguidor, error: errorSeguidos } = await supabase
          .from("seguidores")
          .select("seguidor_id")
          .eq("seguido_id", userId);

        if (errorSeguidos) {
          console.error("erros opteniendo seguidores");
          return;
        }

        let idsSeguidores = [];
        seguidor.map((s) => {
          idsSeguidores.push(s.seguidor_id);
        });

        if (idsSeguidores.length === 0) {
          setResultados([]);
          return;
        }

        const { data: perfiles, error: errorPerfiles } = await supabase
          .from("profiles")
          .select("user_id, username, name")
          .ilike("username", `%${busqueda}%`)
          .in("user_id", idsSeguidores);

        if (errorPerfiles) {
          console.error("error opteniendo perfiles de seguidores");
          return;
        }

        setResultados(perfiles);
      };
      buscar();
    }
  }, [busqueda, userId]);

  const handleSeleccionar = (usuario) => {
    setSeleccionado(usuario);
    setBusqueda("");
    setResultados([]);
    navigate(`/mensajes/chat/${usuario.user_id}`);
  };
  return (
    <>
      <div>Mensajes</div>
      <input
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
      <ul>
        {conversaciones.length > 0 ? (
          conversaciones.map((conv) => (
            <li
              key={conv.usuarioId}
              onClick={() => abrirConversacion(conv.usuarioId)}
            >
              <strong>Usuario: {conv.usuarioId}</strong>
              <small>{new Date(conv.fecha).toLocaleString()}</small>
            </li>
          ))
        ) : (
          <div>No hay conversaciones aún.</div>
        )}
      </ul>{" "}
      <BarraMenu userId={userId} />
    </>
  );
};

export default Mensajes;
