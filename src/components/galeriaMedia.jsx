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
          <button onClick={() => abrirModal(image)}>Comentarios</button>
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
      {mostrarModal && imgSeleccion && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              maxWidth: "90%",
              maxHeight: "90%",
              display: "flex",
              gap: "20px",
              overflow: "auto",
            }}
          >
            <img
              src={imgSeleccion.url}
              alt="Imagen Ampliada"
              style={{ maxHeight: "80vh", maxWidth: "50vw" }}
            />
            <div style={{ flex: 1 }}>
              <h3>Comentarios</h3>
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {comentarios.map((comentario, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: "10px", color: "#000000" }}
                  >
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
                style={{ width: "100%", marginTop: "10px" }}
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
