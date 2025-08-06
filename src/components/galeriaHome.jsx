import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";
import "../styles/galeriaHome.css";
import { CiChat1, CiTurnL1, CiLocationArrow1 } from "react-icons/ci";

const HomeGallery = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [imgSeleccion, setImgSeleccion] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const getImagesHome = async () => {
      try {
        const enlacesImagenes = [];
        const idsSeguidos = [userId];
        const { data: seguidos, error: errorSeguidos } = await supabase
          .from("seguidores")
          .select("seguido_id")
          .eq("seguidor_id", userId);
        if (errorSeguidos) {
          throw errorSeguidos;
        }

        if (seguidos && seguidos.length > 0) {
          seguidos.map((seg) => {
            idsSeguidos.push(seg.seguido_id);
          });
        }

        const { data: imagenes, error: errorImagenes } = await supabase
          .from("media")
          .select("url , created_at,key")
          .in("user_id", idsSeguidos)
          .order("created_at", { ascending: false });

        if (errorImagenes) {
          throw errorImagenes;
        }

        if (imagenes) {
          imagenes.map((img) => {
            enlacesImagenes.push(img);
          });
          setImages(enlacesImagenes || []);
        }
      } catch (error) {
        console.error("Error cargando imagenes: ", error.message);
      } finally {
        setCargando(false);
      }
    };
    getImagesHome();
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
      .select("texto,autor_id,created_at,profiles(username, image_url)")
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
    <div className="container-padre">
      {images.map((image, i) => (
        <div key={i} className="publicacion">
          <img
            src={image.url}
            alt={`Imagen ${i + 1}`}
            className="publicacion-imagen"
            loading="lazy"
          />
          <p className="fecha-publicacion">
            {new Date(image.created_at).toLocaleString()}
          </p>{" "}
          <div className="espacio-boton">
            <button onClick={() => abrirModal(image)}>
              <CiChat1 /> Comentarios
            </button>
          </div>
          <div className="cuadro-texto">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={() => enviarMensaje(image.key)}>
              <CiLocationArrow1 /> Enviar
            </button>
          </div>
        </div>
      ))}
      {mostrarModal && imgSeleccion && (
        <div className="modal">
          <div className="modal-chico">
            <img className="modal-imagen" src={imgSeleccion.url} alt="Imagen" />
            <div className="modal-bloque-data">
              <h4>Comentarios</h4>
              <div>
                {comentarios.map((comentario, i) => (
                  <div className="modal-comentarios" key={i}>
                    <img
                      className="modal-comentarios-img"
                      src={comentario.profiles.image_url}
                      alt={`${comentario.profiles.username} avatar`}
                    />
                    <div className="modal-comentario-texto">
                      <div>
                        <strong>{comentario.profiles.username}:</strong>{" "}
                        {comentario.texto}
                      </div>
                      <small>
                        {new Date(comentario.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-botones">
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
                <button onClick={cerrarModal}>
                  <CiTurnL1 /> Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeGallery;
