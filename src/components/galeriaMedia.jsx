import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";

const UserGallery = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const getImagesUsuario = async () => {
      try {
        const { data, error } = await supabase
          .from("media")
          .select("url , created_at")
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
        </div>
      ))}
    </div>
  );
};

export default UserGallery;
