import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { Routes, Route, useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginExitoso, setLoginExitoso] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://ylazueywekhmwffebgke.supabase.co/functions/v1/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: email,
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Error al iniciar sesión:", result.error);
        alert("Error: " + result.error);
        return;
      }

      const { access_token, refresh_token } = result.session;

      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      console.log("Sesión iniciada");
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Ocurrió un error inesperado.");
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
      <img
        className="logo-logo"
        src={
          "https://ylazueywekhmwffebgke.supabase.co/storage/v1/object/public/recursos//logo.png"
        }
        alt="logo"
      />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Correo o nombre de usuario"
          onChange={(e) => setEmail(e.target.value)}
          disabled={loginExitoso}
        />
        <input
          type="password"
          placeholder="Clave"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loginExitoso}
        />
        <button type="submit">Entrar</button>
      </form>
      <button onClick={() => navigate("/signUp")}>signUp</button>
    </div>
  );
};

export default Login;
