import { supabase } from "../services/supabase";
import { subirMediaUser } from "../lib/media";
import React from "react";
import { useState } from "react";

export function SubirMedia() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [completado, setCompletado] = useState("");

  async function handlePublicar(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setCargando(true);
    setError("");
    setCompletado("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      setError("Usuario no autenticado");
      setCargando(false);
      return;
    }

    try {
      const filePath = await subirMediaUser(file, userId);
      setCompletado(`Archivo subido: ${filePath}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <input type="file" onChange={handlePublicar} disabled={cargando} />
      {cargando && <p>Subiendo...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {completado && <p style={{ color: "green" }}>{completado}</p>}
    </div>
  );
}
