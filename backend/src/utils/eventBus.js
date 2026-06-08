const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Aumentar o limite para evitar avisos em caso de muitas rotas/escutas
    this.setMaxListeners(50);
  }
}

// Exporta uma única instância partilhada (Singleton)
module.exports = new EventBus();
