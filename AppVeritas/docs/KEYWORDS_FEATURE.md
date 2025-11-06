# 🔍 Funcionalidade de Palavras-Chave

## Visão Geral
A funcionalidade de palavras-chave permite que os usuários personalizem seus filtros de projetos além das categorias predefinidas. O usuário pode inserir termos específicos de seu interesse, e o sistema buscará projetos que contenham essas palavras em seus títulos ou resumos.

## Como Funciona

### 1. Configuração de Palavras-Chave (InterestsScreen)
- O usuário acessa a tela de interesses (primeira vez ou através do perfil)
- Além de selecionar categorias predefinidas, há um campo de texto para "Palavras-Chaves Personalizadas"
- O usuário pode inserir múltiplas palavras-chave separadas por vírgula
- Exemplos: `aposentadoria, salário mínimo, imposto de renda`

### 2. Armazenamento
- **Frontend**: As keywords são armazenadas no perfil do usuário via AuthContext
- **Backend**: 
  - Novo campo `keywords TEXT[]` na tabela `users`
  - Array de strings normalizado (lowercase, trimmed)
  - Migration disponível em: `/Backend/migrations/add_keywords_column.sql`

### 3. Busca e Filtragem (ProjectsScreen)
- Quando o usuário tem keywords configuradas, uma nova aba "🔍 Palavras-chave" aparece nos filtros
- Ao selecionar esta aba:
  - É exibida uma seção destacada mostrando as palavras-chave ativas
  - Os projetos são filtrados buscando cada keyword no título e resumo (case-insensitive)
  - A contagem de projetos encontrados é atualizada dinamicamente

### 4. Experiência Visual
- **Aba Palavras-chave**: Ícone de lupa (🔍) para identificação rápida
- **Seção de Info**: Fundo amarelo claro (#FFF9E6) com borda amarela
- **Tags de Keywords**: Badges amarelos com borda destacada (#FFA000)
- **Design Responsivo**: Tags se ajustam em múltiplas linhas quando necessário

## Estrutura de Código

### Backend
```javascript
// Backend/src/models/User.js
async update(id, { name, avatar_url, interests, keywords }) {
  // ...
  if (keywords !== undefined) {
    updates.push(`keywords = $${paramIndex++}`);
    values.push(keywords);
  }
  // ...
}
```

### Frontend - Context
```typescript
// src/contexts/AuthContext.tsx
interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  interests: string[];
  keywords?: string[]; // Novo campo
}
```

### Frontend - Salvamento
```typescript
// src/screens/InterestsScreen.tsx
const handleSave = async () => {
  const keywordsList = keywords
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);
  
  await updateProfile({ 
    interests: selectedInterests,
    keywords: keywordsList
  });
};
```

### Frontend - Filtro
```typescript
// src/screens/ProjectsScreen.tsx
const filteredProjects = (() => {
  let filtered = projects;
  
  if (selectedCategory === 'Palavras-chave' && profile?.keywords && profile.keywords.length > 0) {
    filtered = filtered.filter(p => {
      const searchText = `${p.title} ${p.summary}`.toLowerCase();
      return profile.keywords!.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });
  }
  // ...
})();
```

## Próximos Passos de Melhoria

### 1. Busca Avançada
- Adicionar busca no campo `detailedDescription`
- Implementar busca em autores
- Suporte para sinônimos

### 2. IA/ML
- Usar IA para sugerir palavras-chave relacionadas
- Categorização automática baseada em keywords
- Análise semântica (não apenas match exato de string)

### 3. UX Melhorada
- Autocompletar palavras-chave populares
- Histórico de buscas
- Notificações quando novos projetos correspondem às keywords
- Destaque visual dos termos encontrados no card do projeto

### 4. Otimização
- Cache de resultados de busca
- Índice full-text no PostgreSQL para melhor performance
- Debounce na busca em tempo real

## Requisitos para Deploy

### Banco de Dados
Execute a migration antes de fazer deploy:
```sql
-- No Postico ou psql
\c veritas
\i Backend/migrations/add_keywords_column.sql
```

### Backend
Certifique-se de que as mudanças nos seguintes arquivos estão no servidor:
- `Backend/src/models/User.js`
- `Backend/src/routes/profile.js`

### Frontend
Rebuild do app React Native após pull das mudanças:
```bash
cd AppVeritas
npx react-native run-ios
# ou
npx react-native run-android
```

## Casos de Teste

### Teste 1: Salvamento de Keywords
1. Acesse tela de interesses
2. Insira: "aposentadoria, salário, trabalho"
3. Salve
4. Verifique que keywords aparecem no perfil

### Teste 2: Filtro por Keywords
1. Configure keywords: "educação, universidade"
2. Vá para ProjectsScreen
3. Selecione aba "🔍 Palavras-chave"
4. Verifique que apenas projetos com esses termos aparecem

### Teste 3: Case Insensitive
1. Configure keyword: "saúde"
2. Verifique que projetos com "Saúde", "SAÚDE", "saúde" são encontrados

### Teste 4: Múltiplas Keywords
1. Configure: "educação, tecnologia, inovação"
2. Verifique que projetos com QUALQUER uma dessas palavras aparecem (OR lógico)

## Limitações Conhecidas

1. **Busca Simples**: Atualmente usa `String.includes()`, não é busca full-text otimizada
2. **Sem Stemming**: "educação" não encontra "educacional" ou "educar"
3. **Apenas Título e Resumo**: Não busca em campos adicionais como descrição detalhada
4. **Limite de Performance**: Com muitos projetos, a busca pode ser lenta (considerar otimização futura)

## Suporte
Para dúvidas ou problemas com esta funcionalidade, consulte:
- Código fonte: `src/screens/ProjectsScreen.tsx` e `src/screens/InterestsScreen.tsx`
- Backend: `Backend/src/models/User.js`
- Issues: GitHub do projeto
