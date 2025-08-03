import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
// import { useNavigate } from "react-router-dom";

import BarraMenu from "../components/barraMenu";

const Profile = () => {
  const [datosUser, setdatosUser] = useState(null);
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
  if (!datosUser || !datosUser.perfil) {
    return <div>Cargando...</div>; // O puedes poner un spinner
  }
  return (
    <div>
      <h1>Perfil</h1>
      <img src={datosUser.perfil?.image_url} alt="foto de usuario" />
      <br />
      <h2>Bienvenido, {datosUser.perfil.name || datosUser.email}</h2>
      <br />
      <BarraMenu />
      <br />
    </div>
  );
};

export default Profile;
