# 🤖 Fix: Android não consegue acessar localhost

## Problema
No Android, ao tentar criar conta ou fazer login, aparecia erro: **"Erro ao cadastrar usuário"** ou **"Erro ao fazer login"**.

## Causa Raiz
O Android Emulator roda em uma máquina virtual separada. Quando o app tenta acessar `localhost:3001`, ele está tentando acessar o localhost **do emulador**, não da máquina host onde o backend está rodando.

### Diferenças de Plataforma:
- **iOS Simulator**: Compartilha o mesmo network stack do macOS → `localhost` funciona
- **Android Emulator**: Rede virtualizada separada → `localhost` NÃO funciona
- **Android Device Físico**: Rede WiFi separada → precisa usar IP da máquina

## Solução Implementada

### 1. Detecção Automática de Plataforma
Arquivo: `src/config/api.ts`

```typescript
const getBaseURL = () => {
  if (API_URL && !API_URL.includes('localhost')) {
    return API_URL; // Produção ou IP customizado
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001'; // IP especial do Android Emulator
  }
  
  return 'http://localhost:3001'; // iOS e outros
};
```

### 2. IP Especial do Android
- `10.0.2.2` é um IP especial do Android Emulator
- Ele sempre aponta para o `localhost` da máquina host (seu Mac)
- É automaticamente roteado pelo emulador

## Como Testar

### Desenvolvimento Local (Emuladores)
```bash
# 1. Certifique-se que o backend está rodando
cd Backend
npm start

# 2. Rebuild do app Android
cd ../AppVeritas
npx react-native run-android

# 3. Teste criar conta ou fazer login
# ✅ Deve funcionar agora!
```

### Dispositivo Físico Android
Se estiver testando em um celular físico (não emulador), você precisa:

1. Descobrir o IP local do seu Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Exemplo de output: inet 192.168.1.105
```

2. Atualizar `.env`:
```properties
API_URL=http://192.168.1.105:3001
```

3. Certifique-se que Mac e celular estão na **mesma rede WiFi**

4. Rebuild:
```bash
npx react-native run-android
```

## Troubleshooting

### Erro: "Network request failed" no Android
**Causa**: Backend não está rodando ou firewall bloqueando

**Solução**:
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Se retornar erro, inicie o backend
cd Backend
npm start
```

### Erro: "Unable to resolve host" no Android
**Causa**: Configuração de DNS ou rede do emulador

**Solução**:
```bash
# Reiniciar emulador Android
# Android Studio → AVD Manager → Cold Boot Now
```

### Funciona no emulador mas não no dispositivo físico
**Causa**: Dispositivo em rede diferente ou IP errado

**Solução**:
1. Confirme que estão na mesma WiFi
2. Use IP correto no `.env`
3. Desative firewall temporariamente para teste
4. Certifique-se que porta 3001 não está bloqueada

## URLs de Referência

### Desenvolvimento
- **iOS Simulator**: `http://localhost:3001`
- **Android Emulator**: `http://10.0.2.2:3001` (automático)
- **Dispositivo Físico**: `http://SEU_IP:3001`

### Produção
- Quando fizer deploy, use URL completa:
```properties
API_URL=https://seu-backend.herokuapp.com
```

## Logs de Debug
Para verificar qual URL está sendo usada, veja o console:
```
🌐 API Base URL: http://10.0.2.2:3001
```

Este log aparece ao iniciar o app e confirma a URL correta.

## Arquivos Modificados
- ✅ `src/config/api.ts` - Detecção automática de plataforma
- ✅ `.env` - Documentação atualizada
- ✅ `docs/ANDROID_LOCALHOST_FIX.md` - Este documento

## Referências Técnicas
- [Android Emulator Networking](https://developer.android.com/studio/run/emulator-networking)
- [React Native Platform Module](https://reactnative.dev/docs/platform)
