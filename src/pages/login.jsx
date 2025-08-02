import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { Routes, Route, useNavigate } from "react-router-dom"; // ya lo tienes configurado
// No necesitas importar createClient de nuevo

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Puede ser correo o username
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://ylazueywekhmwffebgke.supabase.co/functions/v1/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: email, // Puede ser correo o username
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Error al iniciar sesión:", result.error);
        alert("❌ Error: " + result.error);
        return;
      }

      const { access_token, refresh_token } = result.session;

      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      console.log("✅ Sesión iniciada");
      alert("Bienvenido ✅");
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      alert("Ocurrió un error inesperado.");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="cont_login">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Correo o nombre de usuario"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Clave"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <button onClick={() => navigate("/signUp")}>signUp</button>
    </div>
  );
};

export default Login;
