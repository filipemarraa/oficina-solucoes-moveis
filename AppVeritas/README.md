# 📱 Frontend - Veritas App

Aplicativo React Native multiplataforma (iOS e Android) para acompanhamento de projetos do governo brasileiro.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Instalar pods (iOS)
cd ios && pod install && cd ..

# 3. Iniciar Metro Bundler
npm start

# 4. Em outro terminal - escolha uma plataforma:
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## 📁 Estrutura

```
AppVeritas/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── AlertCard.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FilterTabs.tsx
│   │   ├── Input.tsx
│   │   ├── ProjectCard.tsx
│   │   └── HeaderWithNotifications.tsx
│   ├── screens/             # Telas do app
│   │   ├── SplashScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── InterestsScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── TrendingScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ProjectDetailsScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── AlertsScreen.tsx
│   ├── navigation/          # Navegação
│   │   ├── RootNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── useNotifications.ts
│   ├── services/            # APIs e serviços
│   │   ├── backendService.ts
│   │   ├── governmentApi.ts
│   │   ├── supabaseService.ts
│   │   ├── aiConfig.ts
│   │   └── aiCategorization.ts
│   ├── contexts/            # Context API
│   │   └── AuthContext.tsx
│   ├── config/              # Configurações
│   │   ├── api.ts
│   │   └── supabase.ts
│   ├── constants/           # Constantes
│   │   ├── theme.ts
│   │   └── mockData.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── docs/                # Documentação
│       ├── KEYWORDS_FEATURE.md
│       ├── QUICK_START_KEYWORDS.md
│       └── ANDROID_LOCALHOST_FIX.md
├── .env                     # Variáveis de ambiente
├── app.json                 # Configuração do app
├── App.tsx                  # Entrada principal
└── package.json
```

## 📱 Telas Principais

### Autenticação
- **SplashScreen** - Carregamento inicial
- **AuthScreen** - Login e Registro
- **OnboardingScreen** - Introdução ao app

### Navegação Principal (5 abas)
- **Projetos** (📋) - Todos os projetos com filtros por categoria
- **Favoritos** (⭐) - Projetos salvos como favoritos
- **Em Alta** (🔥) - Projetos com mais interações
- **Perfil** (👤) - Configurações do usuário

### Telas Adicionais
- **Interesses** - Selecionar categorias e palavras-chave
- **Detalhes do Projeto** - Informações completas
- **Notificações** - Alertas e atualizações
- **Alertas** - Histórico de alertas

## 🔄 Fluxo de Navegação

```
Splash
  ↓
Onboarding (primeira vez)
  ↓
Auth (Login/Registro)
  ↓
Interesses (primeiros passos)
  ↓
MainTabs (App principal)
  ├─ Projetos
  ├─ Favoritos
  ├─ Em Alta
  ├─ Perfil
  └─ (Notificações, ProjectDetails)
```

## 🎨 Temas e Cores

### Cor Primária
- **Cyan**: `#00BCD4` (ações, seleções)
- **Azul Escuro**: `#2B7EBB` (textos principais)

### Status
- **Verde**: `#4CAF50` (sucesso, aprovado)
- **Amarelo**: `#FFC107` (aviso, em andamento)
- **Vermelho**: `#FF5252` (erro, rejeitado)

### Neutras
- **Branco**: `#FFFFFF` (fundo cards)
- **Cinza Claro**: `#F5F5F5` (fundo geral)
- **Cinza Escuro**: `#757575` (texto secundário)

Veja `src/constants/theme.ts` para detalhes completos.

## 🔑 Recursos Principais

### 1. Filtro por Interesses
- Selecione categorias na tela de Interesses
- O filtro "Todos" mostra projetos de suas categorias

### 2. Palavras-Chave Personalizadas
- Configure palavras-chave em "Perfil" → "Meus Interesses"
- Nova aba "🔍 Palavras-chave" aparece automaticamente
- Filtra projetos por termos personalizados

### 3. Favoritos
- Toque a estrela em qualquer card
- Veja todos em "Favoritos"

### 4. Notificações
- Veja alertas sobre projetos em "Notificações"
- Receba alertas de palavras-chave

### 5. Em Alta
- Projetos com mais interações (trending)
- Atualizado em tempo real

## 📦 Dependências Principais

```json
{
  "react": "18.2.0",
  "react-native": "0.82.1",
  "typescript": "5.8.3",
  "@react-navigation/native": "^7.x",
  "@react-navigation/bottom-tabs": "^7.x",
  "@react-navigation/native-stack": "^7.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "@supabase/supabase-js": "^2.76.1",
  "axios": "^1.x"
}
```

## ⚙️ Configuração

### Variáveis de Ambiente (`.env`)

```properties
# Backend API
API_URL=http://localhost:3001

# Notas sobre plataformas:
# - iOS Simulator: usa localhost automaticamente
# - Android Emulator: usa 10.0.2.2 automaticamente
# - Dispositivo físico: use seu IP local
```

### Detectar Plataforma
O código em `src/config/api.ts` detecta automaticamente:
- **iOS**: `http://localhost:3001`
- **Android Emulator**: `http://10.0.2.2:3001`
- **Dispositivo Físico**: Configure manualmente

## 🚀 Execução

### iOS Simulator
```bash
npm start

# Em outro terminal
npx react-native run-ios
```

### Android Emulator
```bash
npm start

# Em outro terminal
npx react-native run-android
```

### Dispositivo Físico

#### iPhone
```bash
npx react-native run-ios --device
```

#### Android Phone
```bash
# 1. Ativar "Depuração USB" no telefone
# 2. Conectar via USB
adb devices  # Verificar conexão
npx react-native run-android
```

## 🧪 Teste Rápido

### Criar Conta de Teste
1. Toque em **"Registrar-se"**
2. Preencha:
   - Nome: `Teste`
   - Email: `teste@example.com`
   - Senha: `senha123`
3. Toque em **"Criar Conta"**
4. ✅ Será feito login automaticamente

### Testar Funcionalidades
1. **Onboarding** - Complete o tutorial
2. **Interesses** - Selecione categorias e palavras-chave
3. **Projetos** - Veja lista e filtre
4. **Favoritos** - Salve projetos (toque a estrela)
5. **Perfil** - Configure dados
6. **Notificações** - Veja alertas

## 🔐 Autenticação

### Como Funciona
1. Usuário faz login com email/senha
2. Backend retorna JWT token
3. Token é salvo em AsyncStorage
4. Token é incluído em todas as requisições

### Logout
- Toque em "Sair" no perfil
- Token é removido do AsyncStorage

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
npm start -- --reset-cache
```

### Erro: "Metro bundler not running"
```bash
# Inicie o Metro
npm start

# Em outro terminal, execute o app
npx react-native run-ios
# ou
npx react-native run-android
```

### Erro: "Network request failed"
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Se Android, verificar URL
# Deve ser http://10.0.2.2:3001 (automático)
```

### Erro: "Pods installation failed" (iOS)
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### Emulador não aparece
```bash
# Android
adb kill-server
adb start-server
adb devices

# iOS
xcrun simctl list devices
```

### Erro: "Erro ao fazer login"
- Backend não está rodando
- API_URL incorreta
- Banco de dados não inicializado

## 📝 Componentes Principais

### ProjectCard
```tsx
<ProjectCard
  project={project}
  onPress={() => navegar()}
  onToggleFavorite={(id) => salvarFavorito()}
  onSupport={(id) => apoiarProjeto()}
  onAgainst={(id) => votar contra}
  onAlert={(id) => ativarAlerta()}
/>
```

### HeaderWithNotifications
```tsx
<HeaderWithNotifications 
  title="Projetos" 
  unreadCount={3} 
/>
```

### Input
```tsx
<Input
  placeholder="Buscar..."
  value={search}
  onChangeText={setSearch}
/>
```

## 🎯 Funcionalidades Futuras

- [ ] Notificações push reais
- [ ] Compartilhamento de projetos
- [ ] Comentários em projetos
- [ ] Análise de tendências
- [ ] Integração com calendário
- [ ] Modo offline
- [ ] Tema escuro

## 📞 Suporte

Problemas? Verifique:
1. Backend está rodando em `http://localhost:3001`
2. `.env` está configurado corretamente
3. App foi rebuilt com `npm start -- --reset-cache`
4. Dispositivo/emulador está conectado

## 📚 Documentação Adicional

- `docs/KEYWORDS_FEATURE.md` - Guia completo de palavras-chave
- `docs/QUICK_START_KEYWORDS.md` - Quick start
- `docs/ANDROID_LOCALHOST_FIX.md` - Solução Android localhost

## 🔧 Desenvolvimento

### Adicionar Nova Tela
1. Criar arquivo em `src/screens/`
2. Adicionar rota em `RootNavigator.tsx` ou `MainTabNavigator.tsx`
3. Importar em `src/screens/index.ts`

### Adicionar Novo Componente
1. Criar arquivo em `src/components/`
2. Exportar em `src/components/index.ts`

### Adicionar Novo Tipo
1. Adicionar em `src/types/index.ts`

---

**Desenvolvido com ❤️ para Veritas**

Última atualização: 29 de outubro de 2025
