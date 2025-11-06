# 📱 Veritas - Guia Completo de Instalação e Execução

Bem-vindo ao **Veritas**! Este é um aplicativo mobile (iOS e Android) para acompanhamento de projetos e alertas do governo brasileiro.

## 📋 Índice
1. [Requisitos](#requisitos)
2. [Setup Backend](#setup-backend)
3. [Setup Frontend](#setup-frontend)
4. [Execução](#execução)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos

### Obrigatórios
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** v8+ (instalado com Node.js)
- **Git** ([Download](https://git-scm.com/))

### Para iOS
- **Mac** com macOS 12+
- **Xcode** 13+ ([App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **CocoaPods** ([Instalar](https://cocoapods.org/))

### Para Android
- **Android Studio** ([Download](https://developer.android.com/studio))
- **JDK 11+** (instalado com Android Studio)
- **Android SDK** (instalado com Android Studio)

### Banco de Dados
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Postico** ou **pgAdmin** (GUI para gerenciar banco)

---

## 🚀 Setup Backend

### 1. Clone o Repositório
```bash
git clone https://github.com/GabrielSLoures/MeuSolucoesMoveis.git
cd MeuSolucoesMoveis/Backend
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Banco de Dados PostgreSQL

#### Crie o banco de dados:
```bash
# Via terminal PostgreSQL
createdb veritas

# OU via interface gráfica (Postico/pgAdmin)
# 1. Abra Postico ou pgAdmin
# 2. Crie um novo banco de dados chamado "veritas"
# 3. Use credenciais padrão (user: postgres, password: postgres)
```

#### Aplique o schema (migrations):
```bash
# Via psql
psql -U postgres -d veritas -f database.sql

# OU via interface gráfica
# 1. Abra Postico
# 2. Conecte ao banco "veritas"
# 3. Abra "database.sql" e execute
```

#### Adicione o campo de keywords (migration):
```bash
psql -U postgres -d veritas -f migrations/add_keywords_column.sql
```

### 4. Configure o Arquivo `.env`

Crie o arquivo `Backend/.env`:
```bash
cat > Backend/.env << 'EOF'
# Servidor
NODE_ENV=development
PORT=3001

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=seu_secret_jwt_super_seguro_aqui_123456

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://10.0.2.2:8081
EOF
```

### 5. Inicie o Backend
```bash
npm start
```

Você deve ver:
```
✅ Servidor iniciado em http://localhost:3001
✅ Banco de dados conectado
```

---

## 📱 Setup Frontend

### 1. Navegue para o Diretório do App
```bash
cd ../AppVeritas
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Instale as Dependências do React Native (CocoaPods para iOS)
```bash
# iOS
cd ios
pod install
cd ..

# Android (automático via Gradle)
```

### 4. Configure o Arquivo `.env`

Já existe em `AppVeritas/.env`. Verifique se está correto:
```properties
API_URL=http://localhost:3001
```

O código detecta automaticamente:
- **iOS Simulator**: usa `localhost:3001`
- **Android Emulator**: usa `10.0.2.2:3001`
- **Dispositivo Físico**: use seu IP local

### 5. Links Simbólicos para as Librarias (se necessário)
```bash
# Se tiver problemas, execute:
npm start -- --reset-cache
```

---

## ▶️ Execução

### Opção 1: iOS Simulator

#### Inicie o Metro Bundler:
```bash
cd AppVeritas
npm start
```

#### Em outro terminal, execute o app:
```bash
npx react-native run-ios
```

ou

```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

**Resultado esperado**: App abre no iOS Simulator

---

### Opção 2: Android Emulator

#### Inicie o Metro Bundler:
```bash
cd AppVeritas
npm start
```

#### Em outro terminal, execute o app:
```bash
npx react-native run-android
```

**Resultado esperado**: App abre no Android Emulator

---

### Opção 3: Dispositivo Físico

#### iOS (Device):
1. Conecte o iPhone via USB
2. Confie no certificado de desenvolvedor no iPhone
3. Execute:
```bash
npx react-native run-ios --device
```

#### Android (Device):
1. Conecte o smartphone via USB
2. Ative "Depuração USB" nas configurações do desenvolvedor
3. Execute:
```bash
npx react-native run-android
```

---

## 🧪 Teste Completo (Zero até App Rodando)

### Pré-requisitos verificados:
- ✅ Node.js instalado: `node --version`
- ✅ PostgreSQL rodando: `psql --version`
- ✅ Xcode ou Android Studio instalados

### Execute este script:
```bash
# 1. Clone o repositório
git clone https://github.com/GabrielSLoures/MeuSolucoesMoveis.git
cd MeuSolucoesMoveis

# 2. Setup Backend
cd Backend
npm install
createdb veritas
psql -U postgres -d veritas -f database.sql
psql -U postgres -d veritas -f migrations/add_keywords_column.sql
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
npm start &

# 3. Setup Frontend
cd ../AppVeritas
npm install
cd ios && pod install && cd ..

# 4. Inicie o app (escolha uma opção)
# iOS:
npx react-native run-ios

# Android:
npx react-native run-android
```

---

## 📖 Fluxo do App

Depois que o app abrir, você pode:

### Primeira Vez
1. **Splash Screen** → Aguarde carregamento
2. **Onboarding** → Conheça o app (deslize e complete)
3. **Tela de Interesses** → Selecione categorias e palavras-chave
4. **Home** → Veja projetos

### Criar Conta
1. Toque em **"Registrar-se"**
2. Preencha: Nome, Email, Senha
3. Toque em **"Criar Conta"**
4. ✅ Auto-login automático
5. ✅ Vai para Onboarding
6. Selecione interesses e palavras-chave
7. ✅ Pronto! Acesso ao app

### Funcionalidades Principais
- 📋 **Projetos**: Veja todos os projetos com filtros
- ⭐ **Favoritos**: Salve projetos favoritos
- 🔥 **Em Alta**: Projetos com mais interações
- 👤 **Perfil**: Configure interesses e palavras-chave
- 🔔 **Notificações**: Receba atualizações sobre projetos
- 🔍 **Palavras-chave**: Busque por termos personalizados

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@react-navigation/native'"
```bash
cd AppVeritas
npm install
npm start -- --reset-cache
```

### Erro: "Pod installation failed" (iOS)
```bash
cd AppVeritas/ios
rm -rf Pods Podfile.lock
pod install
cd ../..
npx react-native run-ios
```

### Erro: "Erro ao fazer login" (Android)
Backend não está acessível do emulador:
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Se falhar, reinicie o backend:
cd Backend
npm start
```

### Erro: "Network request failed"
**Causa**: API_URL incorreta

**Solução iOS**:
```properties
API_URL=http://localhost:3001
```

**Solução Android Emulator**:
- Código detecta automaticamente `10.0.2.2:3001`

**Solução Android Device**:
```properties
API_URL=http://SEU_IP_LOCAL:3001
```
Descubra seu IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Erro: "Port 3001 already in use"
```bash
# Liberar a porta
lsof -i :3001
kill -9 <PID>

# Ou usar outra porta
PORT=3002 npm start
```

### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -d veritas -c "SELECT 1;"

# Se falhar, reinicie PostgreSQL
# macOS:
brew services restart postgresql

# Linux:
sudo systemctl restart postgresql
```

### Emulador não aparece em dispositivos
```bash
# Android - reconectar adb
adb kill-server
adb start-server
adb devices
```

---

## 📚 Documentação Adicional

### Recursos no Projeto
- `docs/KEYWORDS_FEATURE.md` - Guia de funcionalidade de palavras-chave
- `docs/QUICK_START_KEYWORDS.md` - Quick start de keywords
- `docs/ANDROID_LOCALHOST_FIX.md` - Solução do problema localhost no Android

### Tecnologias Utilizadas

#### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Axios** - HTTP client

#### Frontend
- **React Native** - Framework mobile
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação
- **Supabase** - Backend alternativo
- **React Context** - Estado global

---

## 🤝 Suporte

Se encontrar problemas:

1. Verifique o [Troubleshooting](#troubleshooting)
2. Leia a documentação em `docs/`
3. Verifique os logs do console
4. Abra uma issue no GitHub

---

## ✅ Checklist Final

Antes de começar a desenvolver, confirme:

- [ ] Node.js v16+ instalado
- [ ] PostgreSQL rodando
- [ ] Backend rodando em `http://localhost:3001`
- [ ] Frontend (iOS ou Android) abrindo
- [ ] Consegue criar uma conta
- [ ] Consegue fazer login
- [ ] Consegue navegar entre as telas

**Se todos os itens estão marcados, você está pronto para desenvolver! 🎉**

---

## 📝 Observações Importantes

### Desenvolvimento
- O app usa dados do governo brasileiro (câmara e senado)
- Código está em TypeScript com tipagem completa
- Todos os dados são salvos no PostgreSQL

### Segurança
- **NÃO** commite `.env` com dados sensíveis
- Use variáveis de ambiente para configurações sensíveis
- JWT é usado para autenticação de usuários

### Performance
- O Metro Bundler pode ficar lento com muitos arquivos
- Use `npm start -- --reset-cache` para limpar cache
- Feche outros apps para melhor performance do emulador

---

## 📞 Versões

- **React Native**: 0.82.1
- **React Navigation**: 7.x
- **Node.js**: 16+
- **PostgreSQL**: 12+
- **TypeScript**: 5.8.3

---

**Boa sorte com o desenvolvimento! 🚀**

Última atualização: 29 de outubro de 2025
