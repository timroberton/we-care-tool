# Metodologia do Modelo

> **Limitações do modelo**: Este modelo fornece uma representação simplificada das vias de cuidados relacionados ao aborto e não reflete toda a complexidade dos sistemas de saúde reais. Use os resultados como indicações para exploração e planejamento, não como previsões definitivas.

## Visão geral

We Care implementa um modelo de coorte determinístico que acompanha indivíduos desde um estado de não gravidez até a gravidez, prestação de serviços e resultados finais. O modelo calcula como as intervenções afetam a segurança do aborto modelando a cascata desde o planejamento familiar até a prestação de serviços de aborto e cuidados pós-aborto, fundamentado nas recomendações do Guia de Cuidados de Aborto da OMS, Segunda edição (2025).

O modelo opera através de **etapas de cálculo sequenciais**:

## Planejamento Familiar → Gravidezes Não Intencionais

O planejamento familiar é o ponto de intervenção mais a montante. O acesso melhorado à contracepção e sua eficácia reduz as gravidezes não intencionais e pode reduzir a necessidade de aborto.

**Cálculo:**

- As gravidezes não intencionais de referência são especificadas como entrada
- Proporção não intencional = 1 - (eficácia do método × demanda por PF × demanda atendida de PF)
- O total de gravidezes é calculado retroativamente a partir das gravidezes não intencionais de referência
- Os ajustes de cenário nos parâmetros de PF alteram a proporção de gravidezes não intencionais mantendo **as gravidezes intencionais constantes** (permitindo que o total de gravidezes varie)

**Elemento-chave:** Esta é a categoria de intervenção com maior efeito de alavancagem. Reduzir as gravidezes não intencionais reduz a necessidade de aborto a jusante.

## Demanda → Quem Busca Aborto

A partir das gravidezes não intencionais, o modelo determina quem busca aborto induzido.

**Vias:**

- Algumas gravidezes terminam naturalmente em aborto espontâneo antes da busca por cuidados
- Algumas têm contraindicações médicas que requerem aborto (incluídas com aquelas que buscam aborto induzido)
- Entre as gravidezes não intencionais restantes, uma proporção busca aborto induzido (parâmetro de demanda)
- O restante continua até nascimento vivo

**Saída:** O total que busca aborto induzido passa para a etapa de acesso.

## Busca por Cuidados → Unidade de Saúde vs Fora de Unidade

Entre aquelas que buscam aborto, as pessoas acessam provedores em unidades de saúde e fora de unidades.

**Parâmetro "Aceitabilidade":** Proporção que prefere cuidados em unidades de saúde. Isso reflete fatores sociais e pessoais que afetam a tomada de decisão sobre unidades de saúde.

- Alta aceitabilidade → a maioria busca cuidados em unidades de saúde primeiro
- Baixa aceitabilidade → a maioria vai diretamente a provedores fora de unidades

## Barreiras de Acesso → Quem Alcança os Serviços

As pessoas navegam através das barreiras para alcançar os cuidados. O modelo acompanha as vias em unidades de saúde e fora de unidades separadamente com **lógica de redirecionamento crítico**.

**Barreiras de acesso a unidades de saúde (multiplicativas):**

- Restrições legais (proporção para quem o aborto é legal)
- Disponibilidade de serviços (proporção de unidades que oferecem aborto)
- Barreira combinada de distância e acessibilidade financeira (veja abaixo)

**Barreiras de acesso fora de unidades:**

- Barreira combinada de distância e acessibilidade financeira

**Correlação entre distância e acessibilidade financeira:** O modelo assume correlação parcial entre distância geográfica e barreiras de acessibilidade financeira, refletindo que essas barreiras frequentemente afetam as mesmas populações (por exemplo, populações rurais pobres enfrentam ambas). O modelo usa uma combinação 50/50:

- 50% assume **independência**: as barreiras se multiplicam (Distância × Custo)
- 50% assume **correlação perfeita**: a pior barreira domina (min(Distância, Custo))
- Barreira combinada final = 0,5 × (Distância × Custo) + 0,5 × min(Distância, Custo)

Exemplo com Distância=80%, Custo=60%:

- Independente: 80% × 60% = 48%
- Correlacionado: min(80%, 60%) = 60%
- Final: 0,5 × 48% + 0,5 × 60% = 54%

Isso resulta em taxas de acesso mais altas do que a independência pura (que daria 48%) mas mais baixas do que a correlação pura (que daria 60%), refletindo uma sobreposição parcial realista das barreiras.

**REDIRECIONAMENTO CRÍTICO:** Todas as que falham nas barreiras de acesso a unidades de saúde tentam acessar cuidados fora de unidades (taxa de redirecionamento de 100%). Apenas aquelas que falham nas barreiras fora de unidades ficam sem acesso.

## Prontidão dos Serviços → Quais Componentes Estão Disponíveis

A disponibilidade de componentes determina quais métodos de aborto podem ser fornecidos. O modelo acompanha a prontidão para:

- **Profissionais de saúde competentes** (provedores competentes)
- **Medicamentos:** misoprostol, mifepristona (inclui manejo da dor)
- **Equipamento:** aspiração a vácuo, dilatação e evacuação (D&E), dilatação e curetagem (D&C)
- **Suprimentos:** luvas de látex, antisséptico, antibióticos

Cada método requer combinações específicas de componentes.

## Recebimento de Serviços → Qual Método Recebido

Com base na disponibilidade de componentes, as pessoas recebem métodos específicos classificados pelos padrões de segurança da OMS.

**Método de alocação:** O modelo combina duas abordagens de alocação baseadas na disponibilidade de profissionais de saúde:

- **Alocação por prioridade:** Métodos mais seguros são alocados primeiro (usada quando profissionais de saúde estão presentes)
- **Alocação proporcional:** Serviços são alocados proporcionalmente à disponibilidade (usada quando profissionais de saúde estão ausentes)
- **Peso da combinação:** $1 - p_{healthworker}$ determina a combinação

Maior disponibilidade de profissionais de saúde aumenta o uso de serviços recomendados mais seguros. Disponibilidade zero de profissionais de saúde resulta em distribuição proporcional entre todos os serviços disponíveis.

**Setor de unidades de saúde (em unidades):**

- **Métodos seguros:**
  - Aborto medicamentoso com mifepristona + misoprostol (provedor competente)
  - Aborto medicamentoso com misoprostol apenas (provedor competente)
  - Aspiração a vácuo (provedor competente + equipamento + suprimentos)
  - Dilatação e evacuação - D&E (provedor competente + equipamento + suprimentos)
- **Métodos menos seguros:**
  - Dilatação e curetagem - D&C (método cortante, maior risco)
  - Qualquer método seguro tentado sem provedor competente
- **Métodos menos seguros de todos:**
  - D&C sem provedor competente

**Setor fora de unidades:**

- **Métodos seguros:**
  - Autogestão do aborto medicamentoso com medicamentos de qualidade garantida (misoprostol e mifepristona, ou misoprostol apenas) e acesso a um profissional de saúde competente (que fornece informações precisas, incluindo manejo da dor, e pode facilitar encaminhamento para serviços em unidades de saúde se necessário ou desejado)
- **Métodos menos seguros:**
  - Aborto medicamentoso sem apoio de profissional de saúde competente
- **Métodos menos seguros de todos:**
  - Outros métodos tradicionais ou perigosos

**Pessoas que não recebem "nenhum aborto":** Aquelas que alcançam um provedor mas não podem receber nenhum método (todos os componentes esgotados) resultam em aborto espontâneo ou nascimento vivo.

## Desfechos do Aborto → Classificações de Segurança

Todas as vias se agregam em desfechos de gravidez:

**Abortos induzidos por categoria de segurança:**

- **Seguro:** Método recomendado pela OMS com profissional de saúde competente (em unidade de saúde ou autogerido com apoio de profissional de saúde fornecendo informação, manejo da dor e acesso a encaminhamento)
- **Menos seguro:** Método correto sem apoio de profissional de saúde competente OU método não recomendado (D&C)
- **Menos seguro de todos:** Métodos perigosos

**Nascimentos vivos provenientes de:**

- Nunca buscou aborto (escolheu continuar a gravidez)
- Buscou mas não teve acesso
- Chegou à unidade de saúde mas não recebeu aborto

**Abortos espontâneos provenientes de:**

- Etapa 1: Abortos espontâneos naturais antes da busca por cuidados (início da gravidez)
- Etapa 2: Abortos espontâneos entre aquelas que buscaram aborto mas não tiveram acesso
- Etapa 2: Abortos espontâneos entre aquelas que alcançaram uma unidade de saúde mas não receberam aborto
- Nota: A mesma taxa de aborto espontâneo é aplicada a ambas as etapas (simplificação de modelagem)

## Complicações → Quem Experimenta Complicações

Os serviços de aborto carregam riscos variáveis de complicações. O modelo acompanha seis tipos de complicações baseados na segurança do serviço:

**Complicações moderadas:**

- Aborto incompleto (retenção de produtos da concepção)
- Gravidez em curso (falha do aborto)
- Infecção

**Complicações graves:**

- Trauma uterino/perfuração
- Hemorragia
- Outras complicações graves

**Taxas de complicações específicas por serviço:**

Cada serviço tem taxas de complicações derivadas empiricamente. Métodos seguros (aborto medicamentoso com profissional de saúde competente, aspiração a vácuo) têm taxas de complicações substancialmente mais baixas do que métodos menos seguros (D&C, medicamentos sem apoio de profissional de saúde) ou métodos menos seguros de todos (práticas tradicionais perigosas).

**Cálculo:**

Para cada pessoa que recebe um serviço específico, as complicações são determinadas aplicando a taxa de complicações desse serviço. Total de complicações = complicações moderadas + complicações graves.

**Aquelas sem complicações** retornam a um estado de não gravidez sem necessitar de intervenção médica adicional.

## Cuidados Pós-Aborto → Tratamento de Complicações

Aquelas que experimentam complicações necessitam de cuidados pós-aborto (CPA). O modelo calcula quem recebe tratamento efetivo através das vias de acesso e prontidão.

### Barreiras de Acesso aos CPA

**Diferença crítica do acesso ao aborto:** As restrições legais NÃO SE APLICAM aos CPA. Mesmo onde o aborto é restrito, buscar tratamento para complicações é legal.

**Barreiras de acesso aos CPA:**

- Disponibilidade de serviços (proporção de unidades que oferecem serviços de CPA)
- Barreira combinada de distância e acessibilidade financeira (usa a mesma combinação de correlação 50/50 do acesso ao aborto)

**Nota importante:** Complicações de origem em unidades e fora de unidades enfrentam as mesmas barreiras de acesso aos CPA. Pessoas que acessaram com sucesso unidades de saúde para aborto já demonstraram que podem superar barreiras de distância/custo, então enfrentam a mesma taxa ao buscar CPA.

### Efetividade dos CPA

CPA efetivos requerem diferentes componentes baseados na gravidade das complicações:

**Complicações moderadas** (aborto incompleto, gravidez em curso, infecção):

- Requerem: Profissional de saúde competente × Antibióticos

**Complicações graves** (trauma, hemorragia, outras):

- Requerem: Cuidados Obstétricos e Neonatais de Emergência Completos (CEmONC)

A efetividade dos CPA depende tanto do acesso aos serviços quanto da prontidão (disponibilidade de componentes apropriados), onde a prontidão difere pela gravidade das complicações (moderadas requerem equipe competente básica + antibióticos; graves requerem CEmONC).

**Desfechos finais dos CPA:**

- **Recebendo cuidados efetivos:** Têm acesso E serviços efetivos disponíveis
- **Não recebendo cuidados efetivos:** Falta de acesso OU serviços indisponíveis/inefetivos

---

## Formulação Matemática

**Notação-chave:** $N$ = contagem (número de pessoas), $p$ = proporção (0-1)

### Planejamento Familiar

$$p_{unintended} = 1 - (demand \times met\_demand \times effectiveness)$$

Os cenários mantêm as gravidezes intencionais constantes, então o total de gravidezes se ajusta com base na proporção de gravidezes intencionais.

### Barreiras de Acesso

A barreira combinada de distância/acessibilidade financeira considera a correlação parcial (controlada por $\alpha = 0,5$):

$$Combined(p_{dist}, p_{cost}) = \alpha \times \min(p_{dist}, p_{cost}) + (1-\alpha) \times (p_{dist} \times p_{cost})$$

As barreiras de acesso a unidades de saúde se multiplicam:

$$p_{facility\_arrive} = p_{legal} \times p_{facilities} \times Combined(p_{distance}, p_{cost})$$

Acesso fora de unidades:

$$p_{outOfFacility\_arrive} = Combined(p_{distance}^{OOF}, p_{cost}^{OOF})$$

Aquelas que falham no acesso a unidades de saúde são redirecionadas para tentar acesso fora de unidades (taxa de redirecionamento de 100%).

### Recebimento de Serviços

Os serviços são alocados com base na disponibilidade de componentes. Cada serviço requer combinações específicas de componentes (profissional de saúde, medicamentos, equipamento, suprimentos).

A alocação combina métodos por prioridade e proporcional:

$$\text{peso proporcional} = 1 - p_{healthworker}$$

Maior disponibilidade de profissionais de saúde direciona a alocação para serviços recomendados mais seguros.

### Desfechos do Aborto

$$N_{total} = N_{livebirth} + N_{miscarriage} + N_{abortions}$$

Os abortos são categorizados como seguro, menos seguro ou menos seguro de todos com base no método e tipo de provedor.

### Cuidados Pós-Aborto

O acesso aos CPA exclui restrições legais e usa a mesma barreira combinada de distância/custo:

$$p_{PAC\_access} = p_{facilities\_PAC} \times Combined(p_{distance}, p_{cost})$$

A efetividade dos CPA depende da gravidade das complicações:

$$p_{moderate\_effective} = p_{health\_worker} \times p_{antibiotics}$$

$$p_{severe\_effective} = p_{CEmONC}$$

Desfechos finais:

$$N_{effective\_PAC} = N_{complications} \times p_{PAC\_access} \times p_{effectiveness}$$
