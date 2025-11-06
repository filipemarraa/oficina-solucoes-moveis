# 🚀 Como Usar a Funcionalidade de Palavras-Chave

## Para o Usuário Final

### 1️⃣ Configurar Palavras-Chave

1. **No primeiro acesso** ou **através do perfil**, acesse a tela de Interesses
2. Além de selecionar categorias, role até **"Palavras-Chaves Personalizadas"**
3. Digite palavras ou termos de seu interesse, separadas por vírgula
   
   **Exemplos:**
   ```
   aposentadoria, salário mínimo, imposto de renda
   ```
   ```
   educação, universidade, ensino superior, ENEM
   ```
   ```
   saúde pública, SUS, hospitais, medicamentos
   ```

4. Clique em **"Salvar Interesses"**

### 2️⃣ Filtrar Projetos por Palavras-Chave

1. Vá para a tela **"Projetos"** (ícone 📋 na navegação inferior)
2. Você verá uma nova aba **"🔍 Palavras-chave"** nos filtros superiores
3. Toque nesta aba
4. Os projetos serão filtrados para mostrar apenas aqueles que contêm suas palavras-chave

### 3️⃣ Visualizar Palavras-Chave Ativas

Quando você seleciona o filtro "Palavras-chave", uma seção amarela aparece mostrando:
- **"🔍 Buscando por:"**
- Badges com cada palavra-chave configurada
- Contador de projetos encontrados

## Para Desenvolvedores

### Setup Inicial

#### 1. Aplicar Migration no Banco de Dados

**Opção A - Usando o script automatizado:**
```bash
cd Backend
./scripts/apply_keywords_migration.sh
```

**Opção B - Manual via Postico ou psql:**
```sql
-- Conectar ao banco 'veritas'
\c veritas

-- Executar
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
```

#### 2. Reiniciar o Backend

```bash
cd Backend
npm start
# ou
node src/index.js
```

#### 3. Rebuild do App React Native

```bash
cd AppVeritas
npx react-native run-ios
# ou
npx react-native run-android
```

### Testes Manuais

#### Teste Básico de Salvamento
```bash
# No terminal do Backend, verifique os logs quando salvar keywords
# Deve aparecer algo como:
# [ProfileService] Atualizando perfil: { keywords: ['aposentadoria', 'trabalho'] }
```

#### Teste de Filtro
1. Configure keywords: `educação, tecnologia`
2. Vá para ProjectsScreen
3. Selecione aba "🔍 Palavras-chave"
4. Verifique console:
```javascript
// Deve filtrar projetos onde título ou resumo contenha as palavras
console.log('Projetos filtrados:', filteredProjects.length);
```

### Arquivos Modificados

**Backend:**
- ✅ `Backend/database.sql` - Schema atualizado
- ✅ `Backend/migrations/add_keywords_column.sql` - Nova migration
- ✅ `Backend/src/models/User.js` - Suporte a keywords no modelo
- ✅ `Backend/src/routes/profile.js` - Aceita keywords no PUT

**Frontend:**
- ✅ `src/contexts/AuthContext.tsx` - Profile type com keywords
- ✅ `src/screens/InterestsScreen.tsx` - Salvamento de keywords
- ✅ `src/screens/ProjectsScreen.tsx` - Filtro por keywords

**Documentação:**
- ✅ `docs/KEYWORDS_FEATURE.md` - Documentação completa
- ✅ `docs/QUICK_START_KEYWORDS.md` - Este arquivo

## Troubleshooting

### Problema: Keywords não aparecem no filtro
**Causa:** Usuário não tem keywords configuradas  
**Solução:** Vá para tela de Interesses e configure pelo menos uma palavra-chave

### Problema: Nenhum projeto é encontrado
**Causa:** Palavras-chave muito específicas ou sem match  
**Solução:** Tente termos mais genéricos ou verifique ortografia

### Problema: Erro ao salvar keywords
**Causa:** Migration não aplicada no banco  
**Solução:** Execute a migration conforme instruções acima

### Problema: Keywords não persistem
**Causa 1:** Backend não está rodando  
**Solução:** Inicie o servidor backend

**Causa 2:** Problemas de autenticação  
**Solução:** Faça logout e login novamente

## Exemplos de Uso

### Caso de Uso 1: Servidor Público
**Interesse:** Aposentadoria e benefícios
**Keywords:** `aposentadoria, pensão, benefícios, INSS, servidor público`

### Caso de Uso 2: Estudante
**Interesse:** Educação e financiamento
**Keywords:** `FIES, ProUni, bolsa, universidade, ensino superior, ENEM`

### Caso de Uso 3: Profissional de Saúde
**Interesse:** Sistema de saúde
**Keywords:** `SUS, médicos, hospitais, saúde pública, medicamentos, vacinas`

### Caso de Uso 4: Empreendedor
**Interesse:** Economia e negócios
**Keywords:** `MEI, microempresa, imposto, crédito, empreendedor, startup`

## Próximas Melhorias Planejadas

- [ ] Autocomplete de keywords populares
- [ ] Histórico de buscas
- [ ] Notificações para novos projetos com keywords
- [ ] Destaque dos termos encontrados no card
- [ ] Sugestões de keywords relacionadas via IA
- [ ] Análise semântica (sinônimos)

## Suporte

Para mais informações, consulte:
- Documentação completa: `docs/KEYWORDS_FEATURE.md`
- Código fonte: `src/screens/ProjectsScreen.tsx`
- Issues: [GitHub do projeto]
