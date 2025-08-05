import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import BarraMenu from "../components/barraMenu";
import UserGallery from "../components/galeriaMedia";
import { useParams } from "react-router-dom";
import "../styles/profile.css";

const Profile = () => {
  const [datosUser, setDatosUser] = useState(null);
  const { userId } = useParams();
  const [miPerfil, setMiPerfil] = useState(null);
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
    if (datosUser?.id && id_auth) {
      if (datosUser.id === id_auth) {
        setMiPerfil(true);
      } else {
        setMiPerfil(false);
      }
    }
  }, [datosUser?.id, id_auth]);

  useEffect(() => {
    const verificarSeguidor = async () => {
      if (!datosUser?.id || !id_auth || datosUser.id === id_auth) {
        return;
      }

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

  useEffect(() => {
    if (datosUser?.id) {
      actualizarContadores(datosUser.id);
    }
  }, [datosUser?.id]);

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
    actualizarContadores(datosUser.id);
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
    actualizarContadores(datosUser.id);
  };
  if (datosUser?.id) {
    actualizarContadores(datosUser.id);
  }
  return (
    <>
      <BarraMenu className="contenedor-izquierda" userId={datosUser.id} />
      <div className="contenedorPrincipal2">
        <div className="cabecera-profile">
          <div className="cabecera-izq">
            <img
              className="foto-perfil-2"
              src={datosUser.perfil?.image_url}
              alt="foto de usuario"
            />
          </div>
          <div className="cabecera-der">
            <div className="container-cab-datos">
              <h3>{datosUser.perfil.name}</h3>
              <h4>@{datosUser.perfil.username}</h4>
            </div>
            <div className=" container-cabezera-seguidores">
              <div className="seguidores-c">
                <h3>{contSeguidores}</h3>
                <h4>Seguidores </h4>
              </div>
              <div className="seguidos-c">
                <h3> {contSeguidos}</h3>
                <h4>Seguidos</h4>
              </div>
            </div>
            {miPerfil == false && id_auth && (
              <>
                <div className="container-cabezera-barra-seguir">
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
          </div>
        </div>
        <br />
        <div className="User-galeria">
          <UserGallery userId={datosUser.id} />
        </div>
      </div>
      <br />
    </>
  );
};

export default Profile;
