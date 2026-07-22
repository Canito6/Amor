# Guia Completo: Backup Manual e Restauro da Base de Dados (MongoDB)

Este documento contém todas as instruções necessárias para criar cópias de segurança (backups) manuais e restaurar dados na base de dados MongoDB Atlas do projeto **O Nosso Cantinho**.

---

## 🛠️ Pré-requisitos no Windows

Para executar os comandos de backup e restauro na tua máquina Windows (PowerShell), precisas das seguintes ferramentas instaladas:

1. **MongoDB Database Tools** (`mongodump` e `mongorestore`)
   - Caminho habitual no Windows: `C:\Program Files\MongoDB\Tools\100\bin`
2. **OpenSSL** (para encriptação/desencriptação)
   - Caminho habitual no Windows: `C:\Program Files\OpenSSL-Win64\bin`
3. **tar** (incluído nativamente no Windows 10/11)

> **💡 Dica para carregar as ferramentas no PowerShell atual:**
> ```powershell
> $env:Path += ";C:\Program Files\OpenSSL-Win64\bin;C:\Program Files\MongoDB\Tools\100\bin"
> ```

---

## 📦 PARTE 1: Criar um Backup Manual

Podes criar backups de duas formas: usando a automação do GitHub ou executando diretamente no teu computador.

### Opção A: Via GitHub Actions (Recomendado)
1. Acede ao repositório no GitHub.
2. Vai à aba **Actions** e seleciona a workflow **MongoDB Atlas Backup**.
3. Clica em **Run workflow** > escolhe o branch `main` e confirma.
4. O backup será gerado, comprimido, encriptado e guardado automaticamente no branch **`backups`** com a nomenclatura `amor-backup-YYYY-MM-DD.tar.gz.enc`.

---

### Opção B: Via Linha de Comandos (Localmente)

Se quiseres fazer o backup manualmente a partir do teu terminal:

#### 1. Exportar os dados (`mongodump`)
Obtém a `MONGO_URI` do ficheiro `backend/.env` e executa:

```powershell
mongodump --uri="SUA_MONGO_URI" --out=./dump
```
*(Isto cria a pasta `./dump/site_namorados` com todos os ficheiros `.bson` e `.metadata.json`)*

#### 2. Comprimir a pasta dump
```powershell
tar -czf amor-backup-manual.tar.gz dump
```

#### 3. Encriptar o arquivo
Utiliza a tua palavra-passe/chave guardada no segredo `BACKUP_ENCRYPTION_KEY` do GitHub:

```powershell

openssl enc -aes-256-cbc -pbkdf2 -salt -in amor-backup-manual.tar.gz -out amor-backup-manual.tar.gz.enc -pass "pass:$BACKUP_ENCRYPTION_KEY"
```


#### 4. Limpar ficheiros temporários
```powershell
Remove-Item -Path "amor-backup-manual.tar.gz" -Force
Remove-Item -Path "dump" -Recurse -Force
```

---

## 🔄 PARTE 2: Restaurar um Backup na Base de Dados

Para restaurar um backup existente na base de dados MongoDB Atlas, segue estes passos:

### Passo 1: Obter o ficheiro de backup encriptado

Se o backup estiver no branch `backups` do GitHub, descarrega-o para o teu projeto executando:

```powershell
# Atualizar as referências remotas do git
git fetch origin backups

# Baixar o ficheiro do backup desejado (exemplo: backup do dia 2026-07-22)
git checkout origin/backups -- amor-backup-2026-07-22.tar.gz.enc
```

---

### Passo 2: Desencriptar o arquivo (`.enc` -> `.tar.gz`)

Utiliza o OpenSSL com a tua chave `BACKUP_ENCRYPTION_KEY` (definida nos segredos do repositório GitHub Secrets).

No PowerShell:

```powershell
# Define a tua chave de encriptação (BACKUP_ENCRYPTION_KEY do GitHub Secrets)
$BACKUP_ENCRYPTION_KEY = 'SUA_CHAVE_DE_ENCRIPTACAO_AQUI'

# Desencriptar
& "C:\Program Files\OpenSSL-Win64\bin\openssl.exe" enc -d -aes-256-cbc -pbkdf2 -in amor-backup-2026-07-22.tar.gz.enc -out backup.tar.gz -pass "pass:$BACKUP_ENCRYPTION_KEY"
```


---

### Passo 3: Descompactar o arquivo (`.tar.gz` -> pasta `dump`)

```powershell
tar -xzf backup.tar.gz
```
*(Isto extrai a pasta `./dump/site_namorados` contendo todas as coleções)*

---

### Passo 4: Importar para a base de dados (`mongorestore`)

Obtém a `MONGO_URI` no ficheiro `backend/.env`.

**Importante:** Aponta o `mongorestore` especificamente para a subpasta da base de dados (`dump/site_namorados`):

```powershell
& "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --uri="SUA_MONGO_URI" dump/site_namorados
```

Exemplo com a URI completa:
```powershell
& "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --uri="mongodb+srv://Canito:***REMOVIDO***@cluster0.cvli76g.mongodb.net/site_namorados?retryWrites=true&w=majority" dump/site_namorados
```

*(Se quiseres substituir/sobrescrever completamente dados existentes, podes adicionar a flag `--drop` no final do comando acima).*

---

### Passo 5: Limpeza de ficheiros temporários

Após confirmar o sucesso da restauração, elimina os ficheiros temporários gerados:

```powershell
Remove-Item -Path "amor-backup-*.tar.gz.enc", "backup.tar.gz" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dump" -Recurse -Force -ErrorAction SilentlyContinue
```

---

---

## 🆘 Cenário de Emergência: Restauro em Caso de Perda da Base de Dados

Se a base de dados for apagada, corrompida ou precisares de reinstalar tudo do zero a partir do backup mais recente, executa o seguinte bloco **no PowerShell**:

```powershell
# 1. Carregar ferramentas no PATH
$env:Path += ";C:\Program Files\OpenSSL-Win64\bin;C:\Program Files\MongoDB\Tools\100\bin"

# 2. Atualizar lista de backups do GitHub
git fetch origin backups

# 3. Baixar o arquivo de backup desejado
git checkout origin/backups -- amor-backup-2026-07-22.tar.gz.enc

# 4. Definir a palavra-passe e desencriptar
$BACKUP_ENCRYPTION_KEY = 'SUA_CHAVE_DE_ENCRIPTACAO_AQUI'
openssl enc -d -aes-256-cbc -pbkdf2 -in amor-backup-2026-07-22.tar.gz.enc -out backup.tar.gz -pass "pass:$BACKUP_ENCRYPTION_KEY"

# 5. Extrair os dados
tar -xzf backup.tar.gz

# 6. Restaurar limpando coleções antigas/corrompidas (--drop)
mongorestore --uri="mongodb+srv://Canito:***REMOVIDO***@cluster0.cvli76g.mongodb.net/site_namorados?retryWrites=true&w=majority" --drop dump/site_namorados

# 7. Limpar ficheiros temporários locais
Remove-Item -Path "amor-backup-*.tar.gz.enc", "backup.tar.gz" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dump" -Recurse -Force -ErrorAction SilentlyContinue
```

