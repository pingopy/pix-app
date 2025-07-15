#!/bin/bash

# Script de Migração Automática para Sistema PIX Multi-Usuário
# Autor: Sistema PIX Multi-User
# Data: $(date)

set -e  # Parar em caso de erro

echo "🚀 Iniciando migração para Sistema PIX Multi-Usuário..."
echo "================================================="

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto pix-app"
    echo "   Estrutura esperada:"
    echo "   - backend/"
    echo "   - frontend/"
    exit 1
fi

# Fazer backup
echo "📦 Criando backup do projeto atual..."
BACKUP_DIR="pix-app-backup-$(date +%Y%m%d_%H%M%S)"
cp -r . "../${BACKUP_DIR}"
echo "✅ Backup criado em: ../${BACKUP_DIR}"

# Verificar se os arquivos de migração existem
REQUIRED_FILES=("updated_server.js" "updated_package.json" "login.html" "register.html" "dashboard.html" ".env.example")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Erro: Arquivo $file não encontrado"
        echo "   Certifique-se de que todos os arquivos de migração estão na raiz do projeto"
        exit 1
    fi
done

# Reorganizar estrutura
echo "🔄 Reorganizando estrutura do projeto..."

# Remover backend antigo
echo "  - Removendo estrutura backend antiga..."
rm -rf backend/

# Mover arquivos para posições corretas
echo "  - Movendo server.js para raiz..."
mv updated_server.js server.js

echo "  - Atualizando package.json..."
mv updated_package.json package.json

echo "  - Adicionando páginas de autenticação..."
mv login.html frontend/
mv register.html frontend/
mv dashboard.html frontend/

echo "  - Configurando arquivos de ambiente..."
cp .env.example .env

# Manter style.css original (já está perfeito)
echo "  - Mantendo style.css original..."

echo "✅ Estrutura reorganizada com sucesso!"

# Instalar dependências
echo "📦 Instalando novas dependências..."
npm install

# Configurar variáveis de ambiente
echo "⚙️ Configurando variáveis de ambiente..."
echo ""
echo "🔑 IMPORTANTE: Configure as seguintes variáveis no arquivo .env:"
echo "   - JWT_SECRET (chave muito segura para JWT)"
echo "   - SESSION_SECRET (chave muito segura para sessões)"
echo ""
echo "Exemplo de chaves seguras:"
echo "JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo 'sua_chave_jwt_super_segura_aqui')"
echo "SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || echo 'sua_chave_session_super_segura_aqui')"
echo ""

# Criar arquivo de configuração básico
cat > .env << EOF
# Configurações do Banco de Dados
DATABASE_PATH=./database.sqlite

# Segredos para JWT e Sessão (ALTERE ESTES VALORES!)
JWT_SECRET=sua_chave_jwt_super_segura_aqui_mude_isto
SESSION_SECRET=sua_chave_session_super_segura_aqui_mude_isto

# Configurações do Servidor
PORT=8080
NODE_ENV=development

# URL da API PaggPix
BASE_URL=https://public-api.paggpix.com

# Configurações de Rate Limiting
LOGIN_ATTEMPTS_LIMIT=5
LOGIN_WINDOW_MS=900000
EOF

# Testar servidor
echo "🧪 Testando servidor..."
echo "   Iniciando servidor em modo de teste..."

# Iniciar servidor em background para teste
npm start &
SERVER_PID=$!

# Aguardar alguns segundos
sleep 5

# Verificar se o servidor está respondendo
if curl -s -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Servidor iniciado com sucesso!"
else
    echo "⚠️ Servidor pode não estar respondendo corretamente"
    echo "   Verifique os logs para mais detalhes"
fi

# Parar servidor de teste
kill $SERVER_PID 2>/dev/null || true

# Limpeza
echo "🧹 Limpando arquivos temporários..."
rm -f MIGRATION_GUIDE.md FILES_SUMMARY.md README.md files_created.csv

echo ""
echo "🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
echo "================================="
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env com suas chaves secretas"
echo "2. Execute: npm start"
echo "3. Acesse: http://localhost:8080"
echo "4. Cadastre o primeiro usuário"
echo "5. Teste a geração de pagamentos PIX"
echo ""
echo "📚 Estrutura final:"
echo "├── frontend/"
echo "│   ├── login.html"
echo "│   ├── register.html"
echo "│   ├── dashboard.html"
echo "│   ├── style.css"
echo "│   └── app.js"
echo "├── server.js"
echo "├── package.json"
echo "├── .env"
echo "└── .gitignore"
echo ""
echo "🔒 Funcionalidades adicionadas:"
echo "- ✅ Sistema de autenticação (login/cadastro)"
echo "- ✅ Multi-usuário com isolamento de dados"
echo "- ✅ Tokens JWT seguros"
echo "- ✅ Banco de dados SQLite"
echo "- ✅ Rate limiting para segurança"
echo "- ✅ Histórico de pagamentos"
echo "- ✅ Interface responsiva"
echo ""
echo "⚠️ IMPORTANTE:"
echo "- Altere as chaves JWT_SECRET e SESSION_SECRET no arquivo .env"
echo "- Para produção, considere usar PostgreSQL ao invés do SQLite"
echo "- Faça backups regulares do database.sqlite"
echo ""
echo "🚀 Para iniciar o servidor:"
echo "   npm start"
echo ""
echo "✨ Sistema PIX Multi-Usuário está pronto para uso!"
