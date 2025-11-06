# 🔄 Atualização de Status em Tempo Real

## Visão Geral

O sistema agora busca a situação atualizada de cada projeto diretamente das APIs oficiais da Câmara dos Deputados e do Senado Federal, garantindo informações sempre atualizadas.

## Como Funciona

### APIs Utilizadas

#### 1. Câmara dos Deputados
- **Endpoint**: `https://dadosabertos.camara.leg.br/api/v2/proposicoes/{id}`
- **Campo chave**: `statusProposicao.codSituacao`
- **Retorno**: JSON com informações completas do status

**Exemplo de resposta:**
```json
{
  "dados": {
    "statusProposicao": {
      "codSituacao": 1223,
      "descricaoSituacao": "Aguardando Despacho - Requerimentos",
      "dataHora": "2025-10-28T11:03",
      "descricaoTramitacao": "..."
    }
  }
}
```

#### 2. Senado Federal
- **Endpoint**: `https://legis.senado.leg.br/dadosabertos/plenario/resultado/{data}?v=2`
- **Campos chave**: `<codigoItem>` e `<textoResultado>`
- **Retorno**: XML com resultados das sessões plenárias

**Exemplo de estrutura XML:**
```xml
<Item>
  <codigoMateria>160711</codigoMateria>
  <textoResultado>
    Resultado da matéria: Aprovado o projeto.
    A matéria vai à sanção.
  </textoResultado>
  <descricaoDeliberacao>Apreciado</descricaoDeliberacao>
</Item>
```

## Funcionalidades Implementadas

### 1. Busca Individual de Status
```typescript
import { fetchProjectStatusWithCache } from '../services/realTimeStatusService';

const result = await fetchProjectStatusWithCache(project);
console.log('Status atualizado:', result.status);
```

### 2. Atualização em Lote
```typescript
import { batchUpdateProjectsStatus } from '../services/realTimeStatusService';

const results = await batchUpdateProjectsStatus(
  projects,
  (current, total) => {
    console.log(`Progresso: ${current}/${total}`);
  }
);
```

### 3. Cache Inteligente
- **TTL**: 5 minutos
- **Evita requisições desnecessárias**
- **Pode ser limpo manualmente**

```typescript
import { clearStatusCache, getStatusCacheStats } from '../services/realTimeStatusService';

// Limpar cache
clearStatusCache();

// Ver estatísticas
const stats = getStatusCacheStats();
console.log(`Cache: ${stats.valid} válidos, ${stats.expired} expirados`);
```

## Uso na UI

### Botão "Atualizar Status"
Na tela de projetos (`ProjectsScreen`), há um botão "🔄 Atualizar Status" que:
1. Busca o status atualizado de todos os projetos visíveis
2. Mostra progresso em tempo real
3. Atualiza a lista automaticamente
4. Exibe notificação de sucesso

### Indicadores Visuais
- **Loading**: Spinner animado durante atualização
- **Progresso**: Contador "X/Y projetos"
- **Badge**: Status colorido em cada card

## Mapeamento de Status

### Códigos da Câmara → Status App
Os códigos `codSituacao` são mapeados para os rótulos amigáveis:

| Código | Nome Original | Status App |
|--------|--------------|------------|
| 1140 | Transformado em Norma Jurídica | Aprovado |
| 923 | Arquivada | Arquivado |
| 937 | Vetado totalmente | Vetado |
| 950 | Retirado pelo(a) Autor(a) | Retirado |
| 924 | Pronta para Pauta | Em votação |
| 915 | Aguardando Parecer | Em análise |
| ... | ... | Em tramitação |

Veja o arquivo `governmentApi.ts` para a lista completa de códigos.

### Senado → Status App
O status é inferido do campo `textoResultado`:

| Texto | Status App |
|-------|------------|
| "Aprovado" / "vai à sanção" | Aprovado |
| "Arquivado" | Arquivado |
| "Vetado" | Vetado |
| "Retirado de Pauta" | Retirado |
| "Votação" / "Deliberação" | Em votação |
| Padrão | Em tramitação |

## Fluxo de Atualização

```
┌─────────────────┐
│ Usuário clica   │
│ "Atualizar"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verificar cache │
│ (5 min TTL)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Válido? │
    └────┬────┘
         │
    ┌────┴────────┐
    │             │
   SIM           NÃO
    │             │
    ▼             ▼
┌───────┐   ┌─────────────┐
│Retorna│   │Busca da API │
│cache  │   │(Câmara/Sen.)│
└───────┘   └──────┬──────┘
                   │
                   ▼
            ┌──────────────┐
            │ Mapeia status│
            │ com codMap   │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │Atualiza cache│
            │e retorna     │
            └──────────────┘
```

## Limitações e Melhorias Futuras

### Limitações Atuais
1. **Senado**: Requer data da sessão para buscar resultado do plenário
2. **Rate Limiting**: Batch de 5 projetos por vez com delay de 500ms
3. **XML Parsing**: Parser simplificado (regex) para o Senado

### Melhorias Planejadas
- [ ] Parser XML robusto para API do Senado
- [ ] WebSocket para atualizações push em tempo real
- [ ] Histórico de mudanças de status
- [ ] Notificações quando status mudar
- [ ] Sincronização em background

## Testando

### Teste Manual
1. Abra o app e vá para a tela "Projetos"
2. Clique no botão "🔄 Atualizar Status"
3. Observe o progresso
4. Verifique se os status foram atualizados

### Teste via curl

**Câmara:**
```bash
curl -s "https://dadosabertos.camara.leg.br/api/v2/proposicoes/2577576" | \
  jq '.dados.statusProposicao | {codSituacao, descricaoSituacao, dataHora}'
```

**Senado:**
```bash
curl -s "https://legis.senado.leg.br/dadosabertos/plenario/resultado/20241015?v=2" | \
  grep -A 5 "codigoMateria"
```

## Arquivos Modificados

- ✅ `src/services/governmentApi.ts` - Funções de busca em tempo real
- ✅ `src/services/realTimeStatusService.ts` - Serviço com cache e batch
- ✅ `src/screens/ProjectsScreen.tsx` - UI com botão de atualização
- ✅ `docs/REAL_TIME_STATUS.md` - Esta documentação

## Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador/app para logs detalhados
2. Network tab para ver requisições à API
3. Códigos de erro retornados pelas APIs
