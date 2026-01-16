const API_URL = import.meta.env.VITE_API_URL;
const API_PRINT = import.meta.env.VITE_API_PRINT;

class API {
 
  // CONFIGURACIÓN
 
  async getConfiguracion() {
    try {
      const response = await fetch(`${API_URL}/configuracion`);
      if (!response.ok) throw new Error('Error al obtener configuración');
      return response.json();
    } catch (error) {
      console.error(' Error en getConfiguracion:', error);
      throw error;
    }
  }
  
  async updateConfiguracion(id, data) {
    try {
      const response = await fetch(`${API_URL}/configuracion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar configuración');
      return response.json();
    } catch (error) {
      console.error(' Error en updateConfiguracion:', error);
      throw error;
    }
  }
  
 
  // MEDIOS
 
  async getMedios() {
    try {
      const response = await fetch(`${API_URL}/medios`);
      if (!response.ok) throw new Error('Error al obtener medios');
      return response.json();
    } catch (error) {
      console.error(' Error en getMedios:', error);
      throw error;
    }
  }

  async getMedio(id) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}`);
      if (!response.ok) throw new Error('Error al obtener medio');
      return response.json();
    } catch (error) {
      console.error(' Error en getMedio:', error);
      throw error;
    }
  }

  async createMedio(data) {
    try {
      const response = await fetch(`${API_URL}/medios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear medio');
      }
      
      return response.json();
    } catch (error) {
      console.error(' Error en createMedio:', error);
      throw error;
    }
  }

  async updateMedio(id, data) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar medio');
      }
      
      return response.json();
    } catch (error) {
      console.error(' Error en updateMedio:', error);
      throw error;
    }
  }

  async deleteMedio(id) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar medio');
      
      return response.json();
    } catch (error) {
      console.error(' Error en deleteMedio:', error);
      throw error;
    }
  }

  async SwitchMedio(id) {
    try {
      const response = await fetch(`${API_URL}/medios/${id}/switch`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al modificar switch medio');
      
      return response.json();
    } catch (error) {
      console.error(' Error en switchMedio:', error);
      throw error;
    }
  }
  
 
  // SERVICIOS
 
  async getServicios() {
    try {
      const response = await fetch(`${API_URL}/servicios`);
      if (!response.ok) throw new Error('Error al obtener servicios');
      return response.json();
    } catch (error) {
      console.error(' Error en getServicios:', error);
      throw error;
    }
  }
  
  async createServicio(data) {
    try {
      
      const response = await fetch(`${API_URL}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al crear servicio');
      return response.json();
    } catch (error) {
      console.error(' Error en createServicio:', error);
      throw error;
    }
  }
  
  async updateServicio(id, data) {
    try {
      const response = await fetch(`${API_URL}/servicios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar servicio');
      return response.json();
    } catch (error) {
      console.error(' Error en updateServicio:', error);
      throw error;
    }
  }
  
  async deleteServicio(id) {
    try {
      const response = await fetch(`${API_URL}/servicios/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar servicio');
      return response.json();
    } catch (error) {
      console.error(' Error en deleteServicio:', error);
      throw error;
    }
  }
  async switchServicio(id) {
    try {
      const response = await fetch(`${API_URL}/servicios/${id}/switch`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar servicio');
      return response.json();
    } catch (error) {
      console.error(' Error Activando/desactivando servicio:', error);
      throw error;
    }
  }
  
 
  // PUESTOS
 
  async getPuestos() {
    try {
      const response = await fetch(`${API_URL}/puestos`);
      if (!response.ok) throw new Error('Error al obtener puestos');
      return response.json();
    } catch (error) {
      console.error(' Error en getPuestos:', error);
      throw error;
    }
  }
  
  async createPuesto(data) {
    try {
      const response = await fetch(`${API_URL}/puestos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al crear puesto');
      return response.json();
    } catch (error) {
      console.error(' Error en createPuesto:', error);
      throw error;
    }
  }
  
  async updatePuesto(id, data) {
    try {
      const response = await fetch(`${API_URL}/puestos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar puesto');
      return response.json();
    } catch (error) {
      console.error(' Error en updatePuesto:', error);
      throw error;
    }
  }
  
 
  // USUARIOS Y AUTENTICACIÓN
 
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en login');
      }
      
      return data;
    } catch (error) {
      console.error(' Error en login:', error);
      throw error;
    }
  }
  
  async getUsuarios() {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (!response.ok) throw new Error('Error al obtener usuarios');
      return response.json();
    } catch (error) {
      console.error(' Error en getUsuarios:', error);
      throw error;
    }
  }
  
  async createUsuario(data) {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al crear usuario');
      return response.json();
    } catch (error) {
      console.error(' Error en createUsuario:', error);
      throw error;
    }
  }
  
  async updateUsuario(id, data) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar usuario');
      return response.json();
    } catch (error) {
      console.error(' Error en updateUsuario:', error);
      throw error;
    }
  }
  
 
  // OPERADOR-SERVICIOS
 
  async getOperadorServicios(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/operadores/${usuarioId}/servicios`);
      if (!response.ok) throw new Error('Error al obtener servicios del operador');
      return response.json();
    } catch (error) {
      console.error(' Error en getOperadorServicios:', error);
      throw error;
    }
  }

  async asignarServicioOperador(usuarioId, servicioId) {
    try {
      const response = await fetch(`${API_URL}/operadores/${usuarioId}/servicios/${servicioId}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Error al asignar servicio');
      return response.json();
    } catch (error) {
      console.error(' Error en asignarServicioOperador:', error);
      throw error;
    }
  }

  async desasignarServicioOperador(usuarioId, servicioId) {
    try {
      const response = await fetch(`${API_URL}/operadores/${usuarioId}/servicios/${servicioId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al desasignar servicio');
      return response.json();
    } catch (error) {
      console.error(' Error en desasignarServicioOperador:', error);
      throw error;
    }
  }

  async getOperadoresConServicios() {
    try {
      const response = await fetch(`${API_URL}/operadores-servicios`);
      if (!response.ok) throw new Error('Error al obtener operadores con servicios');
      return response.json();
    } catch (error) {
      console.error(' Error en getOperadoresConServicios:', error);
      throw error;
    }
  }
  
 
  // TICKETS
 
  async createTicket(data) {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al crear ticket');
      return response.json();
    } catch (error) {
      console.error(' Error en createTicket:', error);
      throw error;
    }
  }
  
  async getTicketsEspera() {
    try {
      const response = await fetch(`${API_URL}/tickets/espera`);
      if (!response.ok) throw new Error('Error al obtener tickets en espera');
      return response.json();
    } catch (error) {
      console.error(' Error en getTicketsEspera:', error);
      throw error;
    }
  }
  
  async getTicketsLlamados() {
    try {
      const response = await fetch(`${API_URL}/tickets/llamados`);
      if (!response.ok) throw new Error('Error al obtener tickets llamados');
      return response.json();
    } catch (error) {
      console.error(' Error en getTicketsLlamados:', error);
      throw error;
    }
  }
  
  async getTicketsByOperador(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/tickets/operador/${usuarioId}`);
      if (!response.ok) throw new Error('Error al obtener tickets del operador');
      return response.json();
    } catch (error) {
      console.error(' Error en getTicketsByOperador:', error);
      throw error;
    }
  }
  
  async llamarTicket(id, usuarioId, puestoId) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/llamar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, puesto_id: puestoId })
      });
      if (!response.ok) throw new Error('Error al llamar ticket');
      return response.json();
    } catch (error) {
      console.error(' Error en llamarTicket:', error);
      throw error;
    }
  }
  
  async atenderTicket(id, usuarioId) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/atender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId })
      });
      if (!response.ok) throw new Error('Error al atender ticket');
      return response.json();
    } catch (error) {
      console.error(' Error en atenderTicket:', error);
      throw error;
    }
  }
  
  async finalizarTicket(id, usuarioId, estado) {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, estado })
      });
      if (!response.ok) throw new Error('Error al finalizar ticket');
      return response.json();
    } catch (error) {
      console.error(' Error en finalizarTicket:', error);
      throw error;
    }
  }
  
 
  // HISTORIAL Y ESTADÍSTICAS
 
  async getHistorial(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/historial?${queryString}`);
      if (!response.ok) throw new Error('Error al obtener historial');
      return response.json();
    } catch (error) {
      console.error(' Error en getHistorial:', error);
      throw error;
    }
  }
  
  async getEstadisticas(fecha = null) {
    try {
      const queryString = fecha ? `?fecha=${fecha}` : '';
      const response = await fetch(`${API_URL}/estadisticas${queryString}`);
      if (!response.ok) throw new Error('Error al obtener estadísticas');
      return response.json();
    } catch (error) {
      console.error(' Error en getEstadisticas:', error);
      throw error;
    }
  }

  async getEstadisticasRango(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/rango?${params}`);
      if (!response.ok) throw new Error('Error al obtener estadísticas por rango');
      return response.json();
    } catch (error) {
      console.error(' Error en getEstadisticasRango:', error);
      throw error;
    }
  }

  async getEstadisticasServicios(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/servicios?${params}`);
      if (!response.ok) throw new Error('Error al obtener estadísticas por servicio');
      return response.json();
    } catch (error) {
      console.error(' Error en getEstadisticasServicios:', error);
      throw error;
    }
  }

  async getEstadisticasOperadores(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/operadores?${params}`);
      if (!response.ok) throw new Error('Error al obtener estadísticas por operador');
      return response.json();
    } catch (error) {
      console.error(' Error en getEstadisticasOperadores:', error);
      throw error;
    }
  }

  async getEstadisticasHoras(fecha) {
    try {
      const queryString = fecha ? `?fecha=${fecha}` : '';
      const response = await fetch(`${API_URL}/estadisticas/horas${queryString}`);
      if (!response.ok) throw new Error('Error al obtener estadísticas por hora');
      return response.json();
    } catch (error) {
      console.error(' Error en getEstadisticasHoras:', error);
      throw error;
    }
  }

  async getEstadisticasResumen(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const response = await fetch(`${API_URL}/estadisticas/resumen?${params}`);
      if (!response.ok) throw new Error('Error al obtener resumen de estadísticas');
      return response.json();
    } catch (error) {
      console.error(' Error en getEstadisticasResumen:', error);
      throw error;
    }
  }

  async PrintTicket(ticket, servicio) {
    try {
      
      const response = await fetch(`${API_PRINT}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, servicio })
      });
      
      if (!response.ok) throw new Error('Error al imprimir ticket');
      
      return response.json();
    } catch (error) {
      console.error(' Error en PrintTicket:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new API();