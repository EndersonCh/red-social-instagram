import { supabase } from "../services/supabase";
import { subirMediaUser } from "../lib/media";
import { useState, useRef, useEffect } from "react";
import "../styles/subirMedia.css";
import { CiMedicalCross } from "react-icons/ci";
export function SubirMedia() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [completado, setCompletado] = useState("");
  const subirArcRef = useRef(null);

  const handleClick = () => {
    subirArcRef.current.click();
  };

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
  useEffect(() => {
    if (error) {
      window.alert(`Error: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (completado) {
      window.alert(completado);
    }
  }, [completado]);

  return (
    <div className="contenedor-subir">
      <button
        className="button-subir"
        onClick={handleClick}
        disabled={cargando}
      >
        {cargando ? "Subiendo..." : "Subir archivo"} <CiMedicalCross />
      </button>

      <input
        type="file"
        ref={subirArcRef}
        onChange={handlePublicar}
        style={{ display: "none" }}
        disabled={cargando}
      />
    </div>
  );
}
