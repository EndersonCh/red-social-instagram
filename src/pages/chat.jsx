import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import BarraMenu from "../components/barraMenu";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { id_recep } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [miId, setMiId] = useState(null);

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

  useEffect(() => {
    if (miId && id_recep) {
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
      <div style={{ padding: "20px" }}>
        <h2>Chat</h2>
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            marginBottom: "10px",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mensajes.map((m, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "10px",
                  textAlign: m.emisor_id === miId ? "right" : "left",
                }}
              >
                <span
                  style={{
                    background: m.emisor_id === miId ? "#acf" : "#eee",
                    padding: "5px 10px",
                    borderRadius: "10px",
                    display: "inline-block",
                  }}
                >
                  {m.texto}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ width: "80%", padding: "10px", fontSize: "16px" }}
        />
        <button
          onClick={enviarMensaje}
          style={{ padding: "10px", marginLeft: "10px" }}
        >
          enviar
        </button>
        <BarraMenu userId={miId} />
      </div>
    </>
  );
};

export default Chat;
