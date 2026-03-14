

# Quiz de Qualificação — Locação Corporativa Alphaville

## Visão Geral
Quiz de 5 etapas para qualificação de leads interessados em andar comercial em Alphaville (R$30k/mês). Design minimalista preto e branco, inspiração arquitetônica.

## Design
- Fundo preto (#000), texto branco (#FFF), acentos cinza (#CCC), bordas (#222)
- Container centralizado `max-w-[640px]`, espaçamento generoso
- Tipografia Inter/Geist Sans, labels uppercase com tracking amplo
- Inputs com border-bottom only, sem placeholders
- Botões brancos com texto preto, efeito de inversão no hover
- Barra de progresso fina (2px) fixa no topo
- Transições suaves com Framer Motion entre etapas
- Mobile-first, responsivo

## Estrutura (5 Etapas)

### Etapa 1 — Landing
- Título: "Este andar comercial em Alphaville é adequado para sua empresa?"
- Metadata: "LOCAÇÃO CORPORATIVA // ALPHAVILLE — SP"
- Botão: "FAZER AVALIAÇÃO RÁPIDA"

### Etapa 2 — Dados do Lead
- Campos: Nome, Email, WhatsApp (inputs com border-bottom)
- Validação obrigatória com regex para email e telefone

### Etapa 3 — Perfil da Empresa
- Radio cards verticais com 5 opções (proprietário, diretor, administrativo, corretor, pesquisando)
- Estado ativo: fundo branco, texto preto

### Etapa 4 — Momento da Locação
- Radio cards com 4 opções (urgente, 30 dias, próximos meses, pesquisando)

### Etapa 5 — Compatibilidade de Investimento
- Valor destacado: R$30.000/mês
- 3 opções: Sim / Não / Outro cenário
- Campo textarea expansível se "Outro cenário" selecionado
- Campos de confirmação de dados (auto-preenchidos da Etapa 2)
- Botão: "ENVIAR AVALIAÇÃO"

### Resultado Final
- Título: "Seu perfil é compatível com este imóvel"
- Lista de próximos passos
- Botão: "QUERO RECEBER AS INFORMAÇÕES"

## Técnico
- Estado gerenciado com `useState` (currentStep + formData)
- Framer Motion para transições (fade + slide)
- Dados salvos em localStorage inicialmente (pronto para integração com Supabase/webhook futuramente)
- Estrutura de dados: lead_name, lead_email, lead_whatsapp, company_profile, relocation_moment, investment_match, custom_message

