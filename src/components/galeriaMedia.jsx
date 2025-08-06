import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";
import "../styles/galeriaMedia.css";
import { CiChat1, CiTurnL1, CiLocationArrow1 } from "react-icons/ci";
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
      .select("texto,autor_id,created_at,profiles(username,image_url)")
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
    <div className="contenedor-galeria2">
      {images.map((image, i) => (
        <div key={i} className="publicacion-2">
          <div className="publicacion-imagen2">
            <img src={image.url} alt={`Imagen ${i + 1}`} loading="lazy" />
          </div>
          <div className="fecha-publicacion">
            <p className="fecha-publicacion-p">
              {new Date(image.created_at).toLocaleString()}
            </p>
          </div>
          <div className="comentarios">
            <button onClick={() => abrirModal(image)}>
              <CiChat1 />
              Comentarios
            </button>
          </div>
          <div className="envira-mensajes">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={() => enviarMensaje(image.key)}>
              <CiLocationArrow1 /> enviar
            </button>
          </div>
        </div>
      ))}
      {mostrarModal && imgSeleccion && (
        <div className="modal-grande-perfil">
          <div className="modal-pequeño-perfil">
            <div className="imagen-modal2">
              <img src={imgSeleccion.url} alt="Imagen" />
            </div>
            <div className="datos-modal2">
              <h3>Comentarios</h3>
              <div className="comentarios-modal2">
                {comentarios.map((comentario, i) => (
                  <>
                    <div key={i}>
                      <strong>{comentario.profiles.username}:</strong>{" "}
                      {comentario.texto}
                      <br />
                      <small>
                        {new Date(comentario.created_at).toLocaleString()}
                      </small>
                    </div>
                  </>
                ))}
              </div>
              <div className="botones-fondo">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                />
                <button
                  onClick={() => {
                    enviarMensaje(imgSeleccion.key);
                    abrirModal(imgSeleccion);
                  }}
                >
                  <CiLocationArrow1 /> Enviar
                </button>
                <button onClick={cerrarModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGallery;
