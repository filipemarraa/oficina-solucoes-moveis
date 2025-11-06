#!/bin/bash
# Script para aplicar a migration de keywords
# Execute este script na raiz do projeto Backend

echo "🔄 Aplicando migration de keywords..."
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório Backend"
    exit 1
fi

# Verificar se o arquivo de migration existe
if [ ! -f "migrations/add_keywords_column.sql" ]; then
    echo "❌ Erro: Arquivo migrations/add_keywords_column.sql não encontrado"
    exit 1
fi

echo "📋 Migration a ser aplicada:"
cat migrations/add_keywords_column.sql
echo ""
echo "----------------------------------------"
echo ""

# Solicitar confirmação
read -p "Deseja aplicar esta migration? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    # Aplicar migration usando psql
    # Nota: Ajuste as variáveis de conexão conforme seu ambiente
    
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-veritas}
    DB_USER=${DB_USER:-postgres}
    
    echo "🔌 Conectando ao banco de dados..."
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   User: $DB_USER"
    echo ""
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/add_keywords_column.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration aplicada com sucesso!"
        echo ""
        echo "📝 Próximos passos:"
        echo "   1. Reinicie o servidor backend se estiver rodando"
        echo "   2. Teste a funcionalidade no app React Native"
        echo ""
    else
        echo ""
        echo "❌ Erro ao aplicar migration"
        echo "   Verifique suas credenciais de banco de dados"
        echo ""
    fi
else
    echo "❌ Migration cancelada pelo usuário"
fi
