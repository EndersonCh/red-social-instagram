import React from "react";
import { supabase } from "../services/supabase";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [name, setName] = useState("");
  const image_url =
    "https://ylazueywekhmwffebgke.supabase.co/storage/v1/object/public/user//user.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: existeUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();
      if (existeUser) {
        alert("El nombre de usuario ya existe, elije otro");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              name,
              image_url,
            },
          },
        });
        if (data) {
          console.log(data);
        }
        if (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setLoginExitoso(true);
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="cont_login">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email / Correo electronico"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Clave"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Usuario"
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
      <br />
      <button onClick={() => navigate("/Home")} disable={!loginExitoso}>
        Ir a mi cuenta
      </button>
      <br />
      <button onClick={() => navigate("/login")}>Ya tengo una cuenta</button>
    </div>
  );
};

export default SignUp;
