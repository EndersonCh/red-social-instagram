import { supabase } from "../services/supabase";
import { v4 as uuidv4 } from "uuid";

export async function subirMediaUser(file, userId) {
    
    let extencionArch = file.name.split(".");
    extencionArch = extencionArch.pop();
    const filePath= `${userId}/-${uuidv4()}.${extencionArch}`
    const{data: subirData, error: errorSubir} = await supabase
    .storage
    .from('usuarios-media')
    .upload(filePath,file);

    if(errorSubir){
        throw new Error(`Error al subir el archivo: ${errorSubir.message}`);
    }

    const {data:publicURL} = supabase.storage
        .from('usuarios-media')
        .getPublicUrl(filePath)
    
        // const imagenUrl = publicURL.publicUrl;
    
    const imagenUrl = publicURL.publicUrl;

    const {error: refernError} = await supabase
    .from('media')
    .insert({
        user_id:userId,
        url: imagenUrl
    })

    if(refernError){
        throw new Error(`Error al guardar en base de datos: ${refernError.message}`)
    }

    return filePath;
    
}