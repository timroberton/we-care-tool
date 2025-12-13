# Assistente de IA

We Care inclui um assistente de IA alimentado por Claude (Anthropic) para ajudar a analisar cenários, modificar parâmetros e gerar relatórios através de conversação em linguagem natural.

## Como a IA é instruída

**Instruímos explicitamente a IA sobre as limitações críticas do modelo:**

> **Limitações do modelo**: Este modelo fornece uma representação simplificada das vias de cuidados relacionados ao aborto e não reflete toda a complexidade dos sistemas de saúde reais. Use os resultados como indicações para exploração e planejamento, não como previsões definitivas.
>
> **Dados de entrada não confiáveis**: Os dados de entrada podem ser incompletos, desatualizados ou não confiáveis.
>
> **Use cautela**: Todos os resultados devem ser apresentados com as devidas ressalvas e precauções.
>
> **Sinalize extremos**: Cenários com valores de parâmetros extremos (por exemplo, 100%) devem ser explicitamente indicados como irrealistas.

A IA é instruída a reconhecer essas limitações em sua análise e evitar superestimar a confiança nos resultados.

## O que a IA pode fazer

**Analisar e comparar cenários:**

- Explicar diferenças nos resultados de segurança entre cenários
- Identificar os principais fatores de mudança (efeitos em cascata)
- Comparar impactos das intervenções

**Modificar parâmetros:**

- Atualizar valores de parâmetros nos cenários
- Criar novos cenários
- Excluir cenários

**Gerar relatórios:**

- Criar relatórios abrangentes com gráficos incorporados
- Editar relatórios existentes
- Exportar análises com visualizações

**Exemplos de solicitações:**

- "O que está causando a diferença entre a referência e o cenário 1?"
- "Criar um cenário com 90% de necessidades atendidas de planejamento familiar"
- "Gerar um relatório comparando todos os cenários"
- "Qual intervenção tem o maior impacto nos abortos inseguros?"

## O que a IA conhece

A IA recebeu:

- Contexto e recomendações do Guia de Cuidados de Aborto da OMS, Segunda edição (2025)
- Metodologia completa do modelo (cascata de cálculo, barreiras de acesso, classificações de segurança)
- Todas as definições de parâmetros e pressupostos do modelo
- Os resultados e parâmetros do seu projeto atual

## Limitações

A IA não pode:

- Acessar dados externos além do que está na ferramenta
- Determinar a precisão dos dados de entrada
- Modificar parâmetros de referência (apenas cenários)
- Tomar decisões políticas definitivas
- Executar testes estatísticos ou análises de incerteza

## Privacidade

**Armazenamento local**: Todos os cálculos e dados são armazenados no seu navegador
**Interações de IA**: Suas solicitações e resultados do modelo são enviados à API da Anthropic ao usar recursos de IA
**Sem persistência**: As conversas não são armazenadas no servidor; os relatórios salvam apenas o conteúdo gerado localmente
