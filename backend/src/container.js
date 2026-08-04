const fs = require('fs');
const path = require('path');

// Helper recursivo para encontrar ficheiros que terminam com um determinado sufixo
function scanFiles(dir, suffix) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(scanFiles(filePath, suffix));
    } else if (file.endsWith(suffix)) {
      results.push(filePath);
    }
  }
  return results;
}

const repoDir = path.join(__dirname, 'repositories');
const serviceDir = path.join(__dirname, 'services');
const controllerDir = path.join(__dirname, 'controllers');

// 1. Instanciar todos os Repositórios
const repoFiles = scanFiles(repoDir, 'Repository.js');
const repositories = {};
for (const file of repoFiles) {
  const RepoClass = require(file);
  const baseName = path.basename(file, 'Repository.js');
  const repoInstanceName = baseName + 'Repository';
  repositories[repoInstanceName] = new RepoClass();
}

// 2. Instanciar todos os Serviços (com dependência do Repositório correspondente)
const serviceFiles = scanFiles(serviceDir, 'Service.js');
const services = {};
for (const file of serviceFiles) {
  const ServiceClass = require(file);
  const baseName = path.basename(file, 'Service.js');
  const serviceInstanceName = baseName + 'Service';
  const repoInstanceName = baseName + 'Repository';
  
  const repoInstance = repositories[repoInstanceName] || repositories['gameSessionRepository'];
  if (repoInstance) {
    if (typeof ServiceClass === 'function') {
      services[serviceInstanceName] = new ServiceClass(repoInstance);
    } else {
      services[serviceInstanceName] = ServiceClass;
    }
  } else {
    if (typeof ServiceClass === 'function') {
      services[serviceInstanceName] = new ServiceClass();
    } else {
      services[serviceInstanceName] = ServiceClass;
    }
  }
}

// 3. Instanciar os Controladores (com dependências dinâmicas)
const controllerFiles = scanFiles(controllerDir, 'Controller.js');
const controllers = {};
for (const file of controllerFiles) {
  const ControllerClass = require(file);
  
  // Garantir que é uma classe (alguns controladores usam exports diretos em vez de classes)
  if (typeof ControllerClass !== 'function' || !ControllerClass.prototype || !ControllerClass.prototype.constructor) {
    continue;
  }
  
  const baseName = path.basename(file, 'Controller.js');
  if (baseName === 'base' || baseName === 'authHelper') {
    continue;
  }
  const controllerInstanceName = baseName + 'Controller';
  const serviceInstanceName = baseName + 'Service';
  const repoInstanceName = baseName + 'Repository';

  const repoInstance = repositories[repoInstanceName] || repositories['gameSessionRepository'];
  const serviceInstance = services[serviceInstanceName];

  // Caso especial: AlbumController necessita do albumRepository e photoRepository
  if (baseName === 'album') {
    const photoRepo = repositories['photoRepository'];
    controllers[controllerInstanceName] = new ControllerClass(repoInstance, photoRepo);
  } else if (serviceInstance) {
    controllers[controllerInstanceName] = new ControllerClass(serviceInstance, repoInstance);
  } else {
    controllers[controllerInstanceName] = new ControllerClass(repoInstance);
  }
}

module.exports = {
  ...repositories,
  ...services,
  ...controllers
};
