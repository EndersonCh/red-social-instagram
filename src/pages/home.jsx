import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import BarraMenu from "../components/barraMenu";
import { SubirMedia } from "../components/subirMedia";
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
    <div>
      <img
        src={datosUser.perfil?.image_url}
        alt="foto de usuario"
        style={{ width: 150, borderRadius: "50%" }}
      />
      <br />
      <h2>Bienvenido, {datosUser.perfil.name || datosUser.email}</h2>
      <br />
      <SubirMedia />

      <div>
        <BarraMenu />
      </div>
    </div>
  );
};

export default Home;
