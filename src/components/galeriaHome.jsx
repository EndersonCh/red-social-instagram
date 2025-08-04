import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";

const HomeGallery = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [cargando, setCargando] = useState(true);

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
          .select("url , created_at")
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

export default HomeGallery;
