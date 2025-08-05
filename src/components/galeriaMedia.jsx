import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";

const UserGallery = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [imgSeleccion, setImgSeleccion] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
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

  const abrirModal = async (imagen) => {
    setImgSeleccion(imagen);
    setMostrarModal(true);

    const { data, error } = await supabase
      .from("comentarios")
      .select("texto,autor_id,created_at,profiles(username)")
      .eq("media_key", imagen.key)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("error al cargar comentarios", error);
    } else {
      setComentarios(data || []);
    }
  };

  const cerrarModal = () => {
    setImgSeleccion(null);
    setMostrarModal(false);
    setComentarios([]);
  };

  return (
    <div className="contenedor-galeria">
      {images.map((image, i) => (
        <div key={i} className="publicacion-">
          <div className="publicacion-imagen">
            <img src={image.url} alt={`Imagen ${i + 1}`} loading="lazy" />
          </div>
          <div className="fecha-publicacion">
            <p className="fecha-publicacion">
              {new Date(image.created_at).toLocaleString()}
            </p>
          </div>
          <div className="comentarios">
            <button onClick={() => abrirModal(image)}>Comentarios</button>
          </div>
          <div className="envira-mensajes">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={() => enviarMensaje(image.key)}>enviar</button>
          </div>
        </div>
      ))}
      {mostrarModal && imgSeleccion && (
        <div className="modal-grande-perfil">
          <div className="modal-pequeño-perfil">
            <div className="imagen-modal">
              <img src={imgSeleccion.url} alt="Imagen" />
            </div>
            <div className="datos-modal">
              <h3>Comentarios</h3>
              <div>
                {comentarios.map((comentario, index) => (
                  <div key={index}>
                    <strong>{comentario.profiles.username}:</strong>{" "}
                    {comentario.texto}
                    <br />
                    <small>
                      {new Date(comentario.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <button
                onClick={() => {
                  enviarMensaje(imgSeleccion.key);
                  abrirModal(imgSeleccion); // recargar comentarios
                }}
                style={{ marginTop: "5px" }}
              >
                Enviar
              </button>
              <button onClick={cerrarModal} style={{ marginTop: "10px" }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGallery;
