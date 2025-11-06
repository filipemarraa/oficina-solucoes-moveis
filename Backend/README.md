# 🔧 Backend - Veritas API

Servidor Express.js com PostgreSQL para o aplicativo Veritas.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco de dados
createdb veritas

# 3. Aplicar schema
psql -U postgres -d veritas -f database.sql

# 4. Aplicar migrations
psql -U postgres -d veritas -f migrations/add_keywords_column.sql

# 5. Configurar .env
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=seu_secret_jwt_super_seguro_aqui_123456
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://10.0.2.2:8081
EOF

# 6. Iniciar servidor
npm start
```

## 📁 Estrutura

```
Backend/
├── src/
│   ├── index.js              # Entrada principal
│   ├── config/
│   │   └── db.js             # Configuração PostgreSQL
│   ├── middleware/
│   │   └── auth.js           # Autenticação JWT
│   ├── models/
│   │   ├── User.js           # Modelo de usuário
│   │   ├── Alert.js          # Modelo de alerta
│   │   └── Favorite.js       # Modelo de favoritos
│   └── routes/
│       ├── auth.js           # Autenticação
│       ├── profile.js        # Perfil do usuário
│       ├── alerts.js         # Alertas
│       └── favorites.js      # Favoritos
├── database.sql              # Schema do banco
├── migrations/
│   └── add_keywords_column.sql # Migration de keywords
├── package.json
└── .env                       # Configurações (não commitar)
```

## 🗄️ Banco de Dados

### Schema Principal
- `users` - Usuários do app
- `favorites` - Projetos favoritos
- `alerts` - Notificações/Alertas

### Campos da Tabela `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  avatar_url TEXT,
  interests TEXT[],        -- Array de categorias
  keywords TEXT[],         -- Array de palavras-chave personalizadas
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔐 Autenticação

### Endpoints Públicos (sem autenticação)
- `POST /auth/register` - Criar conta
- `POST /auth/login` - Fazer login

### Endpoints Privados (requer token JWT)
- `GET /profile` - Obter perfil
- `PUT /profile` - Atualizar perfil
- `GET /favorites` - Listar favoritos
- `POST /favorites` - Adicionar favorito
- `DELETE /favorites/:id` - Remover favorito
- `GET /alerts` - Listar alertas

### Usar Token
```javascript
// Header
Authorization: Bearer <seu_token_jwt>
```

## 📡 Endpoints

### Autenticação

#### Registrar
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}

Response:
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "token": "jwt_token_aqui"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}

Response:
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "token": "jwt_token_aqui"
}
```

### Perfil

#### Obter Perfil
```bash
GET /profile
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "email": "joao@example.com",
  "name": "João Silva",
  "avatar_url": null,
  "interests": ["Saúde", "Educação"],
  "keywords": ["aposentadoria", "imposto"]
}
```

#### Atualizar Perfil
```bash
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João da Silva",
  "interests": ["Saúde", "Educação", "Trabalho"],
  "keywords": ["aposentadoria", "imposto", "previdência"]
}

Response:
{
  "id": "uuid",
  "email": "joao@example.com",
  "name": "João da Silva",
  "avatar_url": null,
  "interests": ["Saúde", "Educação", "Trabalho"],
  "keywords": ["aposentadoria", "imposto", "previdência"]
}
```

### Favoritos

#### Listar Favoritos
```bash
GET /favorites
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "project_id": "1234",
    "project_data": { ... },
    "created_at": "2025-10-29T14:46:00Z"
  }
]
```

#### Adicionar Favorito
```bash
POST /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "1234",
  "project_data": {
    "title": "PL 1234/2024",
    "summary": "Sobre saúde pública"
  }
}

Response:
{
  "id": "uuid",
  "project_id": "1234",
  "created_at": "2025-10-29T14:46:00Z"
}
```

#### Remover Favorito
```bash
DELETE /favorites/1234
Authorization: Bearer <token>

Response:
{
  "message": "Favorito removido com sucesso"
}
```

## 🔍 Variáveis de Ambiente

```properties
# Servidor
NODE_ENV=development        # development ou production
PORT=3001                   # Porta do servidor

# Banco de Dados
DB_HOST=localhost           # Host do PostgreSQL
DB_PORT=5432                # Porta do PostgreSQL
DB_NAME=veritas             # Nome do banco
DB_USER=postgres            # Usuário do banco
DB_PASSWORD=postgres        # Senha do banco

# Segurança
JWT_SECRET=seu_secret       # Secret para assinar JWT

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://10.0.2.2:8081
```

## 📦 Dependências

```json
{
  "express": "^4.18.2",
  "pg": "^8.8.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "express-validator": "^7.0.0"
}
```

## 🧪 Testes

### Testar Endpoints com curl

```bash
# Registrar
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"senha123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'

# Obter Perfil (substituir TOKEN)
curl -X GET http://localhost:3001/profile \
  -H "Authorization: Bearer TOKEN"
```

### Testar com Postman
1. Importe `postman_collection.json` (se existir)
2. Configure a URL base: `http://localhost:3001`
3. Execute as requisições

## 🐛 Debug

### Ver logs do PostgreSQL
```bash
# macOS
tail -f /usr/local/var/log/postgres.log

# Linux
sudo tail -f /var/log/postgresql/postgresql.log
```

### Resetar banco de dados
```bash
# ⚠️ CUIDADO: Isso deleta todos os dados!
dropdb veritas
createdb veritas
psql -U postgres -d veritas -f database.sql
psql -U postgres -d veritas -f migrations/add_keywords_column.sql
```

### Conectar ao banco diretamente
```bash
psql -U postgres -d veritas

# Ver tabelas
\dt

# Ver usuários
SELECT * FROM users;

# Ver favoritos
SELECT * FROM favorites;
```

## 🚨 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
brew services list

# Reiniciar PostgreSQL
brew services restart postgresql

# Ou via terminal
psql -U postgres -c "SELECT 1;"
```

### Erro: "Port 3001 already in use"
```bash
# Liberar porta
lsof -i :3001
kill -9 <PID>

# Ou usar outra porta
PORT=3002 npm start
```

### Erro: "JWT Secret not found"
Verifique se `.env` tem:
```properties
JWT_SECRET=seu_secret_aqui
```

### Erro: "CORS blocked"
Atualize `CORS_ORIGIN` no `.env` com o endereço do frontend

## 📝 Padrões de Código

### Estrutura de Resposta
```javascript
// Sucesso
{
  "data": { ... },
  "error": null
}

// Erro
{
  "data": null,
  "error": "Mensagem de erro"
}
```

### Autenticação em Rotas
```javascript
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, (req, res) => {
  // req.userId está disponível aqui
});
```

## 🔒 Segurança

- ✅ Senhas com hash bcrypt
- ✅ Autenticação JWT
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ Proteção contra SQL injection (pg parameterizado)

## 📞 Suporte

Problemas? Verifique:
1. PostgreSQL está rodando
2. `.env` está configurado
3. Banco `veritas` foi criado
4. Migrations foram aplicadas
5. Porta 3001 está disponível

---

**Desenvolvido com ❤️ para Veritas**

Última atualização: 29 de outubro de 2025
