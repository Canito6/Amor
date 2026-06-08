const fs = require('fs');
const path = require('path');

// Helper recursivo para encontrar ficheiros que terminam com um determinado sufixo
function scanFiles(dir, suffix) {
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

const featuresDir = path.join(__dirname, 'features');

// 1. Instanciar todos os Repositórios
const repoFiles = scanFiles(featuresDir, '.repository.js');
const repositories = {};
for (const file of repoFiles) {
  const RepoClass = require(file);
  const baseName = path.basename(file, '.repository.js');
  const repoInstanceName = baseName + 'Repository';
  repositories[repoInstanceName] = new RepoClass();
}

// 2. Instanciar todos os Serviços (com dependência do Repositório correspondente)
const serviceFiles = scanFiles(featuresDir, '.service.js');
const services = {};
for (const file of serviceFiles) {
  const ServiceClass = require(file);
  const baseName = path.basename(file, '.service.js');
  const serviceInstanceName = baseName + 'Service';
  const repoInstanceName = baseName + 'Repository';
  
  const repoInstance = repositories[repoInstanceName];
  if (!repoInstance) {
    throw new Error(`Repositório não encontrado para o serviço: ${baseName}`);
  }
  services[serviceInstanceName] = new ServiceClass(repoInstance);
}

// 3. Instanciar os Controladores (com dependências dinâmicas)
const controllerFiles = scanFiles(featuresDir, '.controller.js');
const controllers = {};
for (const file of controllerFiles) {
  const ControllerClass = require(file);
  
  // Garantir que é uma classe (alguns controladores usam exports diretos em vez de classes)
  if (typeof ControllerClass !== 'function' || !ControllerClass.prototype || !ControllerClass.prototype.constructor) {
    continue;
  }
  
  const baseName = path.basename(file, '.controller.js');
  const controllerInstanceName = baseName + 'Controller';
  const serviceInstanceName = baseName + 'Service';
  const repoInstanceName = baseName + 'Repository';

  const repoInstance = repositories[repoInstanceName];
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
