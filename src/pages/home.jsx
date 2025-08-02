import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  const [datosUser, setdatosUser] = useState(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        navigate("/");
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
      <img src={datosUser.perfil?.image_url} alt="foto de usuario" />
      <br />
      <h2>Bienvenido, {datosUser.perfil.name || datosUser.email}</h2>
      <br />
      {/* <button onClick=></button> */}
      home
      <button onClick={() => supabase.auth.signOut()}>logout</button>
    </div>
  );
};

export default Home;
