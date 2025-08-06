import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import BarraMenu from "../components/barraMenu";
import { SubirMedia } from "../components/subirMedia";
import HomeGallery from "../components/galeriaHome";
import "../styles/home.css";
const Home = () => {
  const navigate = useNavigate();
  const [datosUser, setdatosUser] = useState(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const infoUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setdatosUser({
        ...user,
        perfil: perfil,
      });
    };
    infoUser();
  }, []);

  if (!datosUser) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className="contendor-izq">
        <BarraMenu userId={datosUser.id} />
      </div>
      <div className="contenedorPrincipal">
        <>
          <div className="contenedor-med">
            <>
              <SubirMedia />
              <hr />
              <div className="feed">
                <h2>
                  <strong>Feed</strong>
                </h2>
              </div>

              <HomeGallery userId={datosUser.id} />
            </>
          </div>
        </>
      </div>
      <div className="contenedor-der">
        <>
          <img
            className="foto-usuario"
            src={datosUser.perfil?.image_url}
            alt="foto de usuario"
          />
          <div className="datos-user">
            <h2>{datosUser.perfil.name}</h2>
            <h3>@{datosUser.perfil.username}</h3>
            <h5>{datosUser.email}</h5>
          </div>
        </>
      </div>
    </>
  );
};

export default Home;
