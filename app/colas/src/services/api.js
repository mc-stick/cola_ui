const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class API {
  async getConfiguracion() {
    const response = await fetch(`${API_URL}/configuracion`);
    return response.json();
  }
  
  async updateConfiguracion(id, data) {
    const response = await fetch(`${API_URL}/configuracion/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
 // Medios - Métodos actualizados
async getMedios() {
  const response = await fetch(`${API_URL}/medios`);
  if (!response.ok) {
    throw new Error('Error al obtener medios');
  }
  return response.json();
}

async getMedio(id) {
  const response = await fetch(`${API_URL}/medios/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener medio');
  }
  return response.json();
}

async createMedio(data) {
  console.log('📤 Enviando medio al servidor...');
  
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
}

async updateMedio(id, data) {
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
}

async deleteMedio(id) {
  const response = await fetch(`${API_URL}/medios/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar medio');
  }
  
  return response.json();
}
  
  async getServicios() {
    const response = await fetch(`${API_URL}/servicios`);
    return response.json();
  }
  
  async createServicio(data) {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async updateServicio(id, data) {
    const response = await fetch(`${API_URL}/servicios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async deleteServicio(id) {
    const response = await fetch(`${API_URL}/servicios/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
  
  async getPuestos() {
    const response = await fetch(`${API_URL}/puestos`);
    return response.json();
  }
  
  async createPuesto(data) {
    const response = await fetch(`${API_URL}/puestos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async updatePuesto(id, data) {
    const response = await fetch(`${API_URL}/puestos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  }
  
  async getUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`);
    return response.json();
  }
  
  async createUsuario(data) {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async updateUsuario(id, data) {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async createTicket(data) {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async getTicketsEspera() {
    const response = await fetch(`${API_URL}/tickets/espera`);
    return response.json();
  }
  
  async getTicketsLlamados() {
    const response = await fetch(`${API_URL}/tickets/llamados`);
    return response.json();
  }
  
  async getTicketsByOperador(usuarioId) {
    const response = await fetch(`${API_URL}/tickets/operador/${usuarioId}`);
    return response.json();
  }
  
  async llamarTicket(id, usuarioId, puestoId) {
    const response = await fetch(`${API_URL}/tickets/${id}/llamar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioId, puesto_id: puestoId })
    });
    return response.json();
  }
  
  async atenderTicket(id, usuarioId) {
    const response = await fetch(`${API_URL}/tickets/${id}/atender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioId })
    });
    return response.json();
  }
  
  async finalizarTicket(id, usuarioId, estado) {
    const response = await fetch(`${API_URL}/tickets/${id}/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioId, estado })
    });
    return response.json();
  }
  
  async getHistorial(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/historial?${queryString}`);
    return response.json();
  }
  
  async getEstadisticas(fecha = null) {
    const queryString = fecha ? `?fecha=${fecha}` : '';
    const response = await fetch(`${API_URL}/estadisticas${queryString}`);
    return response.json();
  }
}

export default new API();