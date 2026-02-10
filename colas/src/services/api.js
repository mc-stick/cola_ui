const API_URL = import.meta.env.VITE_API_URL;
const API_PRINT = import.meta.env.VITE_API_PRINT;

import { toast } from "react-toastify";

class API {
  
  // ============================================
  // HELPER: Obtener headers con autorización
  // ============================================
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // ============================================
  // HELPER: Manejar errores de autorización
  // ============================================
  handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      // Opcional: redirigir al login
      // window.location.href = '/login';
      return true;
    }
    return false;
  }
 
  // ============================================
  // CONFIGURACIÓN
  // ============================================
 
  async getConfiguracion() {
    try {
      const response = await fetch(`${API_URL}/configuracion`);
      if (!response.ok) {
        toast.error('Error al obtener configuración');
        throw new Error('Error al obtener configuración');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getConfiguracion:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar configuración');
      }
      throw error;
    }
  }
  
  async updateConfiguracion(id, data) {
    try {
      const response = await fetch(`${API_URL}/configuracion/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar configuración');
        throw new Error(result.error || 'Error al actualizar configuración');
      }
      
      toast.success('Configuración actualizada correctamente');
      return result;
    } catch (error) {
      console.error('Error en updateConfiguracion:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al actualizar configuración');
      }
      throw error;
    }
  }
  
  // ============================================
  // MEDIOS
  // ============================================
 
  async getMedios() {
    try {
      const response = await fetch(`${API_URL}/medios`);
      if (!response.ok) {
        toast.error('Error al obtener medios');
        throw new Error('Error al obtener medios');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getMedios:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar medios');
      }
      throw error;
    }
  }

  async getMedio(id) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}`);
      if (!response.ok) {
        toast.error('Error al obtener medio');
        throw new Error('Error al obtener medio');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getMedio:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar medio');
      }
      throw error;
    }
  }

  async createMedio(data) {
    try {
      const response = await fetch(`${API_URL}/medios`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al crear medio');
        throw new Error(result.error || 'Error al crear medio');
      }
      
      toast.success('Medio creado correctamente');
      return result;
    } catch (error) {
      console.error('Error en createMedio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al crear medio');
      }
      throw error;
    }
  }

  async updateMedio(id, data) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar medio');
        throw new Error(result.error || 'Error al actualizar medio');
      }
      
      toast.success('Medio actualizado correctamente');
      return result;
    } catch (error) {
      console.error('Error en updateMedio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al actualizar medio');
      }
      throw error;
    }
  }

  async deleteMedio(id) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar medio');
        throw new Error(result.error || 'Error al eliminar medio');
      }
      
      toast.success('Medio eliminado correctamente');
      return result;
    } catch (error) {
      console.error('Error en deleteMedio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al eliminar medio');
      }
      throw error;
    }
  }

  async SwitchMedio(id) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}/switch`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al modificar medio');
        throw new Error(result.error || 'Error al modificar medio');
      }
      
      return result;
    } catch (error) {
      console.error('Error en switchMedio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al modificar medio');
      }
      throw error;
    }
  }
  
  // ============================================
  // SERVICIOS
  // ============================================
 
  async getServicios() {
    try {
      const response = await fetch(`${API_URL}/servicios`);
      if (!response.ok) {
        toast.error('Error al obtener servicios');
        throw new Error('Error al obtener servicios');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getServicios:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar servicios');
      }
      throw error;
    }
  }
  
  async createServicio(data) {
    try {
      const response = await fetch(`${API_URL}/servicios`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al crear servicio');
        throw new Error(result.error || 'Error al crear servicio');
      }
      
      toast.success('Servicio creado correctamente');
      return result;
    } catch (error) {
      console.error('Error en createServicio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al crear servicio');
      }
      throw error;
    }
  }
  
  async updateServicio(id, data) {
    try {
      const response = await fetch(`${API_URL}/servicios/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar servicio');
        throw new Error(result.error || 'Error al actualizar servicio');
      }
      
      toast.success('Servicio actualizado correctamente');
      return result;
    } catch (error) {
      console.error('Error en updateServicio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al actualizar servicio');
      }
      throw error;
    }
  }
  
  async deleteServicio(id) {
    try {
      const response = await fetch(`${API_URL}/servicios/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar servicio');
        throw new Error(result.error || 'Error al eliminar servicio');
      }
      
      toast.success('Servicio eliminado correctamente');
      return result;
    } catch (error) {
      console.error('Error en deleteServicio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al eliminar servicio');
      }
      throw error;
    }
  }

  async switchServicio(id) {
    try {
      const response = await fetch(`${API_URL}/servicios/${id}/switch`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al cambiar estado del servicio');
        throw new Error(result.error || 'Error al cambiar estado del servicio');
      }
      
      return result;
    } catch (error) {
      console.error('Error activando/desactivando servicio:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al cambiar estado del servicio');
      }
      throw error;
    }
  }
  
  // ============================================
  // PUESTOS
  // ============================================
 
  async getPuestos() {
    try {
      const response = await fetch(`${API_URL}/puestos`);
      if (!response.ok) {
        toast.error('Error al obtener puestos');
        throw new Error('Error al obtener puestos');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getPuestos:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar puestos');
      }
      throw error;
    }
  }
  
  async createPuesto(data) {
    try {
      const response = await fetch(`${API_URL}/puestos`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (this.handleAuthError(response)) {
        return { success: false };
      }

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Error al crear puesto');
        return { success: false };
      }

      toast.success('Puesto creado correctamente');
      return { success: true, data: result };

    } catch (error) {
      console.error('Error en createPuesto:', error);
      toast.error('Error al crear puesto');
      return { success: false };
    }
  }
  
  async updatePuesto(id, data) {
    try {
      const response = await fetch(`${API_URL}/puestos/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar puesto');
        throw new Error(result.error || 'Error al actualizar puesto');
      }
      
      toast.success('Puesto actualizado correctamente');
      return result;
    } catch (error) {
      console.error('Error en updatePuesto:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al actualizar puesto');
      }
      throw error;
    }
  }

  async switchPuesto(id) {
    try {
      const response = await fetch(`${API_URL}/puestos/${id}/switch`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Error al cambiar estado del puesto');
        throw new Error(result.error || 'Error al cambiar estado del puesto');
      }

      toast.success('Puesto actualizado correctamente');
      return result;

    } catch (error) {
      console.error('Error en switchPuesto:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al cambiar estado del puesto');
      }
      throw error;
    }
  }
  
  // ============================================
  // USUARIOS Y AUTENTICACIÓN
  // ============================================
 
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      console.log("API JS: LOGIN: ", data)
      
      if (!response.ok) {
        toast.error(data.error || 'Error en login');
        return { success: false, error: data.error || 'Error en login' };
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      toast.success('Iniciando sesión');
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión');
      return { success: false, error: error.message };
    }
  }
  
  async getUsuarios() {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (!response.ok) {
        toast.error('Error al obtener usuarios');
        throw new Error('Error al obtener usuarios');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getUsuarios:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar usuarios');
      }
      throw error;
    }
  }

  async getUsuariosForgot(user) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${user}`);
      if (!response.ok) {
        toast.error('Error');
        throw new Error('Error');
      }      
      return response.json();
    } catch (error) {
      console.error('Error', error);
      if (!error.message.includes('toast')) {
        toast.error('Error');
      }
      throw error;
    }
  }

  async getUsuariosForgotPass(user, pass) {
    try {
      const resp = await fetch(`${API_URL}/usuarios/${user}/change`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password: pass })
      });

      if (this.handleAuthError(resp)) {
        throw new Error('No autorizado');
      }

      if (!resp.ok) {
        toast.error('Error');
        throw new Error('Error');
      }      
      return resp.json();
    } catch (error) {
      console.error('Error', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error');
      }
      throw error;
    }
  }
  
  async createUsuario(data) {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al crear usuario');
        throw new Error(result.error || 'Error al crear usuario');
      }
      
      toast.success('Usuario creado correctamente');
      return result;
    } catch (error) {
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al crear usuario');
      }
      throw error;
    }
  }
  
  async updateUsuario(id, data) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar usuario');
        throw new Error(result.error || 'Error al actualizar usuario');
      }
      
      toast.success('Usuario actualizado correctamente');
      return result;
    } catch (error) {
      console.error('Error en updateUsuario:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al actualizar usuario');
      }
      throw error;
    }
  }

  async updateUsuarioOperator(id, data) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}/operator`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar operador');
        throw new Error(result.error || 'Error al actualizar operador');
      }
      
      toast.success('Operador actualizado correctamente');
      return result;
    } catch (error) {
      console.error('Error en updateOperator:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al actualizar operador');
      }
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar usuario');
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      toast.success('Usuario eliminado correctamente');
      return result;

    } catch (error) {
      console.error('Error en deleteUser:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al eliminar usuario');
      }
      throw error;
    }
  }
  
  async switchUser(id) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}/switch`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Error al cambiar estado del usuario');
        throw new Error(result.error || 'Error al cambiar estado del usuario');
      }

      toast.success('Usuario actualizado correctamente');
      return result;

    } catch (error) {
      console.error('Error en switchUser:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al cambiar estado del usuario');
      }
      throw error;
    }
  }

  // ============================================
  // PERMISOS
  // ============================================

  async getPermisosUsuario(usuarioId) {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/${usuarioId}/permisos`
      );

      if (!response.ok) {
        toast.error('Error al obtener permisos del usuario');
        throw new Error('Error al obtener permisos del usuario');
      }

      return response.json();
    } catch (error) {
      console.error('Error en getPermisosUsuario:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar permisos del usuario');
      }
      throw error;
    }
  }

  async getTodosPermisosUsuarios() {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/permisos/todos`
      );

      if (!response.ok) {
        toast.error('Error al obtener lista de permisos');
        throw new Error('Error al obtener lista de permisos');
      }

      return response.json();
    } catch (error) {
      console.error('Error en getTodosPermisosUsuario:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar permisos');
      }
      throw error;
    }
  }

  async asignarPermiso(usuarioId, permisoId) {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/permisos`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            usuario_id: usuarioId,
            permiso_id: permisoId
          })
        }
      );

      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        toast.error('Error al asignar permiso');
        throw new Error('Error al asignar permiso');
      }

      toast.success('Permiso asignado correctamente');
      return response.json();
    } catch (error) {
      console.error('Error en asignarPermiso:', error);
      if (!error.message.includes('autorizado')) {
        throw error;
      }
    }
  }

  async actualizarPermiso(usuarioId, permisoId, activo) {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/${usuarioId}/permisos/${permisoId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ activo })
        }
      );

      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        toast.error('Error al actualizar permiso');
        throw new Error('Error al actualizar permiso');
      }

      toast.success('Permiso actualizado');
      return response.json();
    } catch (error) {
      console.error('Error en actualizarPermiso:', error);
      if (!error.message.includes('autorizado')) {
        throw error;
      }
    }
  }

  async quitarPermiso(usuarioId, permisoId) {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/${usuarioId}/permisos/${permisoId}`,
        { 
          method: 'DELETE',
          headers: this.getAuthHeaders()
        }
      );

      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        toast.error('Error al quitar permiso');
        throw new Error('Error al quitar permiso');
      }

      toast.success('Permiso removido del usuario');
      return response.json();
    } catch (error) {
      console.error('Error en quitarPermiso:', error);
      if (!error.message.includes('autorizado')) {
        throw error;
      }
    }
  }

  // ============================================
  // OPERADOR-SERVICIOS
  // ============================================
 
  async getOperadorServicios(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/operadores/${usuarioId}/servicios`);
      if (!response.ok) {
        toast.error('Error al obtener servicios del operador');
        throw new Error('Error al obtener servicios del operador');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getOperadorServicios:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar servicios del operador');
      }
      throw error;
    }
  }

  async asignarServicioOperador(usuarioId, servicioId) {
    try {
      const response = await fetch(`${API_URL}/operadores/${usuarioId}/servicios/${servicioId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al asignar servicio');
        throw new Error(result.error || 'Error al asignar servicio');
      }
      
      return result;
    } catch (error) {
      console.error('Error en asignarServicioOperador:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al asignar servicio');
      }
      throw error;
    }
  }

  async desasignarServicioOperador(usuarioId, servicioId) {
    try {
      const response = await fetch(`${API_URL}/operadores/${usuarioId}/servicios/${servicioId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al desasignar servicio');
        throw new Error(result.error || 'Error al desasignar servicio');
      }
      
      return result;
    } catch (error) {
      console.error('Error en desasignarServicioOperador:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al desasignar servicio');
      }
      throw error;
    }
  }

  async getOperadoresConServicios() {
    try {
      const response = await fetch(`${API_URL}/operadores-servicios`);
      if (!response.ok) {
        toast.error('Error al obtener operadores con servicios');
        throw new Error('Error al obtener operadores con servicios');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getOperadoresConServicios:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar operadores');
      }
      throw error;
    }
  }
  
  // ============================================
  // TICKETS
  // ============================================
 
  async createTicket(data) {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al crear ticket');
        throw new Error(result.error || 'Error al crear ticket');
      }
      
      toast.success('Ticket creado correctamente');
      return result;
    } catch (error) {
      console.error('Error en createTicket:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al crear ticket');
      }
      throw error;
    }
  }
  
  async getTicketsEspera() {
    try {
      const response = await fetch(`${API_URL}/tickets/espera`);
      if (!response.ok) {
        toast.error('Error al obtener tickets en espera');
        throw new Error('Error al obtener tickets en espera');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getTicketsEspera:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar tickets en espera');
      }
      throw error;
    }
  }
  
  async getTicketsLlamados() {
    try {
      const response = await fetch(`${API_URL}/tickets/llamados`);
      if (!response.ok) {
        toast.error('Error al obtener tickets llamados');
        throw new Error('Error al obtener tickets llamados');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getTicketsLlamados:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar tickets llamados');
      }
      throw error;
    }
  }
  async getTicketsEvaluadoTotal() {
    try {
      const response = await fetch(`${API_URL}/tickets/evaluado-stats`);
      if (!response.ok) {
        toast.error('Error al obtener tickets  evaluado');
        throw new Error('Error al obtener tickets  evaluado');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getTickets evaluado:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar tickets  evaluado');
      }
      throw error;
    }
  }

  async getTicketsEvaluadoUser() {
    try {
      const response = await fetch(`${API_URL}/tickets/evaluado-user`);
      if (!response.ok) {
        toast.error('Error al obtener tickets  evaluado user');
        throw new Error('Error al obtener tickets  evaluado user');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getTickets evaluado user:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar tickets  evaluado user');
      }
      throw error;
    }
  }
  
  async getTicketsByOperador(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/tickets/operador/${usuarioId}`);
      if (!response.ok) {
        toast.error('Error al obtener tickets del operador');
        throw new Error('Error al obtener tickets del operador');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getTicketsByOperador:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar tickets del operador');
      }
      throw error;
    }
  }
  
  async llamarTicket(id, usuarioId, puestoId) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/llamar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ usuario_id: usuarioId, puesto_id: puestoId })
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al llamar ticket');
        throw new Error(result.error || 'Error al llamar ticket');
      }
      
      toast.success('Ticket llamado correctamente');
      return result;
    } catch (error) {
      console.error('Error en llamarTicket:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al llamar ticket');
      }
      throw error;
    }
  }

  async llamarVolver(id) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/volver`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al llamar ticket');
        throw new Error(result.error || 'Error al llamar ticket');
      }
      
      toast.success('Ticket llamado correctamente');
      return result;
    } catch (error) {
      console.error('Error en llamarTicket:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al llamar ticket');
      }
      throw error;
    }
  }

  async SendEvaluation(ticketId, rating) {
  try {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/evaluar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ evaluation: rating }),
    });

    if (this.handleAuthError(response)) {
      throw new Error('No autorizado');
    }

    const result = await response.json();

    if (!response.ok) {
      // manejamos expirado o ya evaluado
      if (result.message === 'Ticket expirado') {
        return { success: false, expirado: true, message: result.message };
      } 
      if (result.message === 'Ticket ya evaluado') {
        return { success: false, yaEvaluado: true, message: result.message };
      }

      toast.error(result.message || 'No se pudo enviar la evaluación');
      throw new Error(result.message || 'Error al enviar evaluación');
    }

    toast.success('Evaluación enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error en SendEvaluation:', error);

    if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
      toast.error('Error al enviar la evaluación');
    }

    throw error;
  }
}

async GetTicketEvaluationState(ticketId) {
  try {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/estado-evaluacion`, {
      headers: this.getAuthHeaders(),
    });
    const data = await response.json();
    
    return {
      expirado: data.expirado || false,
      yaEvaluado: data.yaEvaluado || false,
      notfound: data.notfound || false,
    };
  } catch (error) {
    //console.error('Error en GetTicketEvaluationState:', error);
    return { expirado: true, yaEvaluado: false }; // asumimos expirado si hay error
  }
}


  
  async atenderTicket(id, usuarioId) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/atender`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ usuario_id: usuarioId })
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al atender ticket');
        throw new Error(result.error || 'Error al atender ticket');
      }
      
      toast.success('Ticket atendido correctamente');
      return result;
    } catch (error) {
      console.error('Error en atenderTicket:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al atender ticket');
      }
      throw error;
    }
  }
  
  async finalizarTicket(id, usuarioId, estado, comentario) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/finalizar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ usuario_id: usuarioId, estado, comentario })
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al finalizar ticket');
        throw new Error(result.error || 'Error al finalizar ticket');
      }
      
      toast.success('Ticket finalizado correctamente');
      return result;
    } catch (error) {
      console.error('Error en finalizarTicket:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al finalizar ticket');
      }
      throw error;
    }
  }

  async transferirTicket(ticketactual, servicio_id, comentario, servicio_nm) {
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketactual.id}/transferir`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ servicio_id: servicio_id, comentario: comentario, serv_ant:ticketactual.servicio_nombre, servicio_nm:servicio_nm })
      });
      
      if (this.handleAuthError(response)) {
        throw new Error('No autorizado');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al transferir ticket');
        throw new Error(result.error || 'Error al transferir ticket');
      }
      
      toast.success('Ticket transferido correctamente');
      return result;
    } catch (error) {
      console.error('Error en transferir:', error);
      if (!error.message.includes('toast') && !error.message.includes('autorizado')) {
        toast.error('Error al transferir ticket');
      }
      throw error;
    }
  }
  
  // ============================================
  // HISTORIAL Y ESTADÍSTICAS
  // ============================================
 
  async getHistorial(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/historial?${queryString}`);
      if (!response.ok) {
        toast.error('Error al obtener historial');
        throw new Error('Error al obtener historial');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getHistorial:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar historial');
      }
      throw error;
    }
  }
  
  async getEstadisticas(fecha = null) {
    try {
      const queryString = fecha ? `?fecha=${fecha}` : '';
      const response = await fetch(`${API_URL}/estadisticas${queryString}`);
      if (!response.ok) {
        toast.error('Error al obtener estadísticas');
        throw new Error('Error al obtener estadísticas');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar estadísticas');
      }
      throw error;
    }
  }

  async getEstadisticasRango(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/rango?${params}`);
      if (!response.ok) {
        toast.error('Error al obtener estadísticas por rango');
        throw new Error('Error al obtener estadísticas por rango');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasRango:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar estadísticas');
      }
      throw error;
    }
  }

  async getEstadisticasServicios(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/servicios?${params}`);
      if (!response.ok) {
        toast.error('Error al obtener estadísticas por servicio');
        throw new Error('Error al obtener estadísticas por servicio');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasServicios:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar estadísticas de servicios');
      }
      throw error;
    }
  }

  async getEstadisticasOperadores(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/operadores?${params}`);
      if (!response.ok) {
        toast.error('Error al obtener estadísticas por operador');
        throw new Error('Error al obtener estadísticas por operador');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasOperadores:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar estadísticas de operadores');
      }
      throw error;
    }
  }

  async getEstadisticasHoras(fecha) {
    try {
      const queryString = fecha ? `?fecha=${fecha}` : '';
      const response = await fetch(`${API_URL}/estadisticas/horas${queryString}`);
      if (!response.ok) {
        toast.error('Error al obtener estadísticas por hora');
        throw new Error('Error al obtener estadísticas por hora');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasHoras:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar estadísticas por hora');
      }
      throw error;
    }
  }

  async getEstadisticasResumen(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/resumen?${params}`);
      if (!response.ok) {
        toast.error('Error al obtener resumen de estadísticas');
        throw new Error('Error al obtener resumen de estadísticas');
      }
      return response.json();
    } catch (error) {
      console.error('Error en getEstadisticasResumen:', error);
      if (!error.message.includes('toast')) {
        toast.error('Error al cargar resumen de estadísticas');
      }
      throw error;
    }
  }

 

  async getAuditoria(params={}) {
    
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/auditoria?${queryString}`);

    if (!response.ok) {
      toast.error('Error al obtener auditoría');
      throw new Error('Error al obtener auditoría');
    }

    return response.json();
  } catch (error) {
    console.error('Error en getAuditoria:', error);
    if (!error.message.includes('toast')) {
      toast.error('Error al cargar auditoría');
    }
    throw error;
  }
}


  // ============================================
  // IMPRESIÓN
  // ============================================

  async PrintTicket(ticket, servicio) {
    try {
      const response = await fetch(`${API_PRINT}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, servicio })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Error al imprimir ticket');
        return { success: false, error: result.error || 'Error al imprimir ticket' };
      }
      
      toast.success('Ticket impreso correctamente');
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en PrintTicket:', error);
      toast.error('Error al conectar con la impresora');
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // VERIFICAR SESIÓN
  // ============================================

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, user: data };
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          return { success: false, error: 'Token inválido o expirado', unauthorized: true };
        }
        return { success: false, error: data.error || 'Error obteniendo usuario', status: response.status };
      }
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      return { success: false, error: 'Error de conexión', networkError: true };
    }
  }
}

export default new API();