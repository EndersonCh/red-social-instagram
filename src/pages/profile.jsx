import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import BarraMenu from "../components/barraMenu";
import UserGallery from "../components/galeriaMedia";
import { useParams } from "react-router-dom";

const Profile = () => {
  const [datosUser, setDatosUser] = useState(null);
  const { userId } = useParams();
  const [miPerfil, setMiPerfil] = useState(false);
  const [id_auth, setId_auth] = useState("");
  const [seguido, setSeguido] = useState(false);
  useEffect(() => {
    const cargarPerfil = async () => {
      const {
        data: { user: authUser },
        error: errorAuth,
      } = await supabase.auth.getUser();

      if (!authUser || errorAuth) {
        console.error("Error con el usuario", errorAuth);
        return;
      }

      const id = userId || authUser.id;
      setId_auth(authUser.id);
      if (id == authUser.id) {
        setMiPerfil(true);
      }

      const { data: perfil, error: errorPerfil } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)
        .single();

      if (errorPerfil) {
        console.error("Error cargando el perfil");
        return;
      }
      setDatosUser({ id, perfil });
    };
    cargarPerfil();
  }, [userId]);
  useEffect(() => {
    if (!datosUser?.id || !id_auth) {
      return;
    }
    const verificarSeguidor = async () => {
      const { data: seguiData, error: seguiError } = await supabase
        .from("seguidores")
        .select("*")
        .eq("seguido_id", datosUser.id)
        .eq("seguidor_id", id_auth);

      if (seguiError) {
        console.error("Error verificando seguidor");
        return;
      }
      if (seguiData.length > 0) {
        setSeguido(true);
      } else {
        setSeguido(false);
      }
    };
    verificarSeguidor();
  }, [id_auth, datosUser?.id]);

  if (!datosUser || !datosUser.perfil) {
    return <div>Cargardo perfil...</div>;
  }

  const handleSeguirClick = async () => {
    const { error: seguiError } = await supabase.from("seguidores").insert({
      seguidor_id: id_auth,
      seguido_id: datosUser.id,
    });

    if (seguiError) {
      console.error(`Error al guardar seguidos`);
      return;
    }
    setSeguido(true);
  };
  const handleDejarClick = async () => {
    const { error } = await supabase
      .from("seguidores")
      .delete()
      .eq("seguidor_id", id_auth)
      .eq("seguido_id", datosUser.id);

    if (error) {
      console.error(`Error al dejar de seguir`);
      return;
    }
    setSeguido(false);
  };
  return (
    <div>
      <h1>Perfil</h1>
      {!miPerfil && (
        <>
          <div>
            <button onClick={handleSeguirClick} hidden={seguido}>
              Seguir
            </button>
            <button onClick={handleDejarClick} hidden={!seguido}>
              Dejar de Seguir
            </button>
            <button>Mensaje</button>
          </div>
        </>
      )}
      <img
        src={datosUser.perfil?.image_url}
        alt="foto de usuario"
        style={{ width: 150, borderRadius: "50%" }}
      />
      <br />
      <h2>{datosUser.perfil.name || datosUser.perfil.email}</h2>
      <br />
      <UserGallery userId={datosUser.id} />
      <BarraMenu />
      <br />
    </div>
  );
};

export default Profile;
