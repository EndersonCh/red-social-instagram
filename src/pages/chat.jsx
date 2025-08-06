import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import BarraMenu from "../components/barraMenu";
import { useParams } from "react-router-dom";
import { CiChat1, CiTurnL1, CiLocationArrow1 } from "react-icons/ci";
import "../styles/chat.css";

const Chat = () => {
  const { id_recep } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [miId, setMiId] = useState(null);
  const [miNombre, setmiNombre] = useState("");
  const [suNombre, setsuNombre] = useState("");

  useEffect(() => {
    const obtenerUserAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error obteniendo usuario:", error);
        return;
      }
      setMiId(data.user.id);
    };
    obtenerUserAuth();
  }, []);

  const cargarMensajes = async () => {
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .or(
        `and(emisor_id.eq.${miId},receptor_id.eq.${id_recep}),and(emisor_id.eq.${id_recep},receptor_id.eq.${miId})`
      )

      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error cargando mensajes: ", error);
    } else {
      setMensajes(data);
    }
  };

  const cargarUsername = async () => {
    if (!miId || !id_recep) {
      return;
    }
    const { data: miNom, error1 } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", miId)
      .single();

    const { data: suNom, error2 } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", id_recep)
      .single();
    if (error1 || error2) {
      console.error("Error al cargar los datos");
    }
    setmiNombre(miNom?.username || "Yo ");
    setsuNombre(suNom?.username || "Ellx ");
  };

  useEffect(() => {
    if (miId && id_recep) {
      cargarUsername();
      cargarMensajes();
    }
  }, [miId, id_recep]);

  const enviarMensaje = async () => {
    const contenido = nuevoMensaje.trim();
    if (contenido === "" || !miId) {
      return;
    }
    const { error } = await supabase
      .from("mensajes")
      .insert([{ emisor_id: miId, receptor_id: id_recep, texto: contenido }]);

    if (error) {
      console.error("Error enviando mensaje a base de datos", error);
    } else {
      setNuevoMensaje("");
      cargarMensajes();
    }
  };

  return (
    <>
      <BarraMenu userId={miId} />
      <div className="chat">
        <h2>Chat</h2>
        <div className="caja-mensajes">
          <ul>
            {mensajes.map((m, i) => (
              <li key={i}>
                <div className="mensaje-flujo">
                  {m.emisor_id === miId ? (
                    <>
                      <div className="minombre-mens">
                        <strong>{miNombre}:</strong>
                        <span>{m.texto}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sunombre-mens">
                        <strong>{suNombre}:</strong>
                        <span>{m.texto}</span>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="herramientas">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button onClick={enviarMensaje}>
            <CiLocationArrow1 />
            Enviar
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;
