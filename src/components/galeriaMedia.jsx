import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";

const UserGallery = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  useEffect(() => {
    const getImagesUsuario = async () => {
      try {
        const { data, error } = await supabase
          .from("media")
          .select("key,url , created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        } else {
          setImages(data || []);
        }
      } catch (error) {
        console.error("Error cargando imagenes: ", error.message);
      } finally {
        setCargando(false);
      }
    };
    getImagesUsuario();
  }, [userId]);

  if (cargando) {
    return <div>Cargando...</div>;
  }
  if (images.length === 0) {
    return <div>No hay publicaciones aun!</div>;
  }

  const enviarMensaje = async (key_ima) => {
    const contenido = nuevoMensaje.trim();
    if (contenido === "" || !userId) {
      return;
    }
    const { error } = await supabase
      .from("comentarios")
      .insert([{ autor_id: userId, media_key: key_ima, texto: contenido }]);

    if (error) {
      console.error("Error enviando mensaje a base de datos", error);
    } else {
      setNuevoMensaje("");
    }
  };

  return (
    <div>
      {images.map((image, i) => (
        <div key={i} className="publicacion-">
          <img
            src={image.url}
            alt={`Imagen ${i + 1}`}
            className="publicacion-imagen"
            loading="lazy"
            style={{ width: 300 }}
          />
          <p className="fecha-publicacion">
            {new Date(image.created_at).toLocaleString()}
          </p>
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{ width: "80%", padding: "10px", fontSize: "16px" }}
          />
          <button
            onClick={() => enviarMensaje(image.key)}
            style={{ padding: "10px", marginLeft: "10px" }}
          >
            enviar
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserGallery;
