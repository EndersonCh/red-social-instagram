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
  const [contSeguidores, setContSeguidores] = useState(0);
  const [contSeguidos, setContSeguidos] = useState(0);

  const actualizarContadores = async (userId) => {
    try {
      const { count: seguidores } = await supabase
        .from("seguidores")
        .select("*", { count: "exact" })
        .eq("seguido_id", userId);

      const { count: seguidos } = await supabase
        .from("seguidores")
        .select("*", { count: "exact" })
        .eq("seguidor_id", userId);

      setContSeguidores(seguidores || 0);
      setContSeguidos(seguidos || 0);
    } catch (error) {
      console.error("Error actualizando contadores:", error);
    }
  };

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
      await actualizarContadores(id);
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
    await actualizarContadores(datosUser.id);
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
    await actualizarContadores(datosUser.id);
  };
  return (
    <div>
      <h1>Perfil</h1>

      <img
        src={datosUser.perfil?.image_url}
        alt="foto de usuario"
        style={{ width: 150, borderRadius: "50%" }}
      />
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
      <h4>Seguidores {contSeguidores}</h4>
      <h4>Seguidos {contSeguidos}</h4>
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
