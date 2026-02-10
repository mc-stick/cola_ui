import { useState } from "react";
import API from "../../services/api";

export const useEditUser = (usuario, restaurarSesion) => {
  const [formulario, setFormulario] = useState({});
  const [value, setValue] = useState(false);
  const [EditOpen, setEditOpen] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const allowedPrefixes = ["809", "829", "849"];
    setValue(false);

    if (inputValue.length <= 10) {
      if (inputValue.length >= 3) {
        const prefix = inputValue.slice(0, 3);

        if (allowedPrefixes.includes(prefix)) {
          setFormulario({
            ...formulario,
            tel: inputValue,
          });
        } else {
          setValue(true);
        }
      } else {
        setFormulario({
          ...formulario,
          tel: inputValue,
        });
      }
    }
  };

  const handleGuardarUsuario = async () => {
    if (formulario.tel?.length < 10) {
      setValue(true);
      return;
    }
    if (formulario.pass?.length < 5) {
      return;
    }
    try {
      await API.updateUsuarioOperator(usuario.id, formulario);

      setFormulario({});
      setEditOpen(false);
      restaurarSesion();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  return {
    formulario,
    setFormulario,
    value,
    setValue,
    EditOpen,
    setEditOpen,
    handleChange,
    handleGuardarUsuario,
  };
};