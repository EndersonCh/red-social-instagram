import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { v4 as uuidv4 } from "uuid";
// import { useNavigate } from "react-router-dom";

import BarraMenu from "../components/barraMenu";

const Settings = () => {
  const [datosUser, setdatosUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [name_n, setName] = useState("");
  const [userName, setUserName] = useState("");
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !datosUser) {
      return;
    }
    setUploading(true);

    let extencionArch = file.name.split(".");
    extencionArch = extencionArch.pop();
    const filePath = `${datosUser.id}-${uuidv4()}.${extencionArch}`;

    const { error: errorSubida } = await supabase.storage
      .from("user")
      .upload(filePath, file, { upsert: true, cacheControl: "3600" });

    if (errorSubida) {
      alert("Error al subir imagen");
      setUploading(false);
      return;
    }

    const { data: publicURL } = supabase.storage
      .from("user")
      .getPublicUrl(filePath);

    const imagenUrl = publicURL.publicUrl;

    const { error: errorActializar } = await supabase
      .from("profiles")
      .update({ image_url: imagenUrl })
      .eq("user_id", datosUser.id);

    if (errorActializar) {
      alert("Error al actualizar foto de perfil");
    } else {
      setdatosUser((prev) => ({
        ...prev,
        perfil: { ...prev.perfil, image_url: imagenUrl },
      }));
      alert("Foto de perfil actualizada");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: existeUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", userName)
        .single();
      if (existeUser) {
        alert("El nombre de usuario ya existe, elije otro");
      } else {
        const { error: errorActializarD } = await supabase
          .from("profiles")
          .update({
            username: userName || datosUser.perfil.username,
            name: name_n || datosUser.perfil.name,
          })
          .eq("user_id", datosUser.id);

        if (errorActializarD) {
          alert("Error al actualizar datos");
        } else {
          setdatosUser((prev) => ({
            ...prev,
            perfil: { ...prev.perfil, username: userName, name: name_n },
          }));
          alert("Datos actualizados");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  return !datosUser || !datosUser.perfil ? (
    <div>Cargando...</div>
  ) : (
    <div>
      <h1>Perfil</h1>
      <img
        className={"Foto_user"}
        src={datosUser.perfil?.image_url}
        alt="foto de usuario"
        style={{ width: 150, borderRadius: "50%" }}
      />
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Subiendo foto</p>}
      <hr />
      <h2>Nombre: {datosUser.perfil.name}</h2>
      <input type="text" name="Nombre" />
      <hr />
      <h2>Usuario: {datosUser.perfil.username}</h2>
      <hr />
      <h2>Correo electronico {datosUser.email}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userName}
          placeholder={datosUser.perfil.username}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="text"
          value={name_n}
          placeholder={datosUser.perfil.name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <br />
      <BarraMenu />
      <br />
    </div>
  );
};

export default Settings;
