Plano Técnico para Implementação de Algoritmo de Matching Inteligente
Este guia fornece um passo a passo técnico e completo para implementar em Python um algoritmo de matching inteligente em um marketplace de serviços híbrido, utilizando histórico de decisões do usuário. Seguiremos as etapas de recall (geração de candidatos) e precision (re-ranqueamento) integrando ferramentas de NLP e machine learning, bem como considerações de arquitetura de software. Cada seção inclui explicações claras, exemplos de código em Python e referências às tecnologias envolvidas.
1. Geração de Candidatos (Recall)
No estágio de recall, o objetivo é obter uma lista inicial de profissionais potencialmente relevantes para a busca do usuário, combinando busca semântica por similaridade (via embeddings) com filtros tradicionais (localização, preço, categoria etc.). Esta etapa garante que nenhum candidato relevante seja perdido, ainda que à custa de incluir alguns resultados menos precisos, os quais serão refinados posteriormente.
a. Conversão da busca do usuário em vetor (embedding) – Utilizaremos os embeddings de texto da OpenAI para representar a consulta do usuário como um vetor denso em um espaço semântico. Em particular, o modelo text-embedding-3-small (modelo de embedding "pequeno" da OpenAI) gera vetores de 1536 dimensões por texto de entrada[1]. Esse modelo fornece um bom equilíbrio entre custo e acurácia, sendo adequado para busca vetorial de propósito geral[2]. Para gerar o embedding no backend em Python, podemos usar a API da OpenAI conforme o exemplo abaixo:
import openai

openai.api_key = "SUA_API_KEY"  # Defina sua chave da OpenAI
consulta_usuario = "eletricista residencial em São Paulo"

# Gera embedding (vetor) de 1536 dimensões para a consulta
resposta = openai.Embedding.create(
    model="text-embedding-3-small",
    input=[consulta_usuario]
)
vetor_consulta = resposta["data"][0]["embedding"]  # lista de floats representando o texto
print(len(vetor_consulta))  # deve exibir 1536
Nesse código, chamamos o endpoint de embeddings da OpenAI para transformar a string de busca do usuário em um vetor numérico. Armazenamos o vetor resultante em vetor_consulta. Cada profissional terá um vetor semelhante armazenado no banco (ver próximo passo) para permitir comparação de similaridade.
b. Indexação de perfis profissionais com dense_vector no Elasticsearch – Para realizar busca vetorial eficiente, os perfis dos profissionais serão armazenados em um índice Elasticsearch (ou OpenSearch) contendo campos tradicionais (nome, descrição, localização, preço, categoria etc.) e um campo especial de vetor denso para o embedding. Devemos configurar o mapeamento do índice com o tipo dense_vector especificando a dimensionalidade do vetor. Por exemplo, um mapeamento JSON mínimo para o índice poderia ser:
PUT /profissionais_index
{
  "mappings": {
    "properties": {
      "nome":       { "type": "text" },
      "categoria":  { "type": "keyword" },
      "localizacao":{ "type": "geo_point" }, 
      "preco_hora": { "type": "float" },
      "embedding": {
        "type": "dense_vector",
        "dims": 1536,
        "index": true,
        "similarity": "cosine"
      }
    }
  }
}
No campo embedding, definimos dims: 1536 (deve corresponder ao tamanho do vetor do modelo escolhido) e habilitamos indexação vetorial com métrica de similaridade do cosseno. A configuração do similarity: "cosine" presume que os vetores serão normalizados; alternativamente, poderíamos usar dot_product se normalizarmos os vetores de consulta e documentos antecipadamente[3]. Após criar o índice, cada documento de profissional deve ser inserido com seu vetor de embedding pré-calculado. Por exemplo:
from sentence_transformers import SentenceTransformer
modelo_embed = SentenceTransformer('all-mpnet-base-v2')  # modelo local apenas para exemplo
perfil = {
    "nome": "Ana Souza",
    "categoria": "Eletricista",
    "localizacao": { "lat": -23.5505, "lon": -46.6333 },
    "preco_hora": 120.0
}
# Gera embedding da descrição ou histórico do profissional (exemplo)
perfil_descricao = "Eletricista com 10 anos de experiência em instalações residenciais."
vetor = modelo_embed.encode(perfil_descricao)  # vetor de dimensão 768 no exemplo do mpnet
perfil["embedding"] = vetor.tolist()
es.index(index="profissionais_index", document=perfil)
No exemplo acima, utilizamos um modelo local (all-mpnet-base-v2) para gerar um vetor de exemplo e indexamos um documento contendo esse vetor. Em produção, porém, deve-se usar o mesmo modelo de embeddings da OpenAI tanto para as consultas quanto para os perfis, garantindo consistência semântica[4]. Os embeddings de todos os profissionais podem ser pré-computados (por exemplo, via uma rotina offline ou durante o cadastro/atualização do perfil) e armazenados no campo embedding.
c. Combinação de filtros tradicionais com busca vetorial – Com os dados indexados, realizamos a busca inicial unindo filtros booleanos tradicionais (estrutura de consulta bool com cláusulas must/filter) e a consulta vetorial k-NN. O Elasticsearch 8+ suporta consultas k-nearest neighbors nativamente via o parâmetro knn na query. Podemos, por exemplo, recuperar os top 50 profissionais mais similares semanticamente à consulta do usuário e que satisfaçam filtros de localização, preço e categoria. Uma query ilustrativa em Elasticsearch (formato JSON) seria:
POST profissionais_index/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [/* vetor_consulta gerado acima */],
    "k": 50,
    "num_candidates": 100,
    "filter": {
      "bool": {
        "must": [
          { "term": { "categoria": "Eletricista" }}, 
          { "range": { "preco_hora": { "lte": 150.0 }}} ,
          { "geo_distance": { 
                "distance": "50km", 
                "localizacao": { "lat": -23.55, "lon": -46.63 } 
          }}
        ]
      }
    }
  }
}
Nesta consulta, query_vector é o vetor da busca do usuário; k: 50 pede até 50 resultados aproximados; num_candidates: 100 define que o algoritmo de aproximação considere os 100 mais similares antes de aplicar filtros e retornar os top 50 finais; e o bloco filter contém os critérios tradicionais: categoria igual a Eletricista, preço por hora até 150, e localização num raio de 50 km da latitude/longitude fornecida (por exemplo, centro de São Paulo). O motor primeiro realiza a busca vetorial e então aplica os filtros, o que significa que em alguns casos o número de resultados retornados pode ser menor que k se poucos candidatos satisfizerem os critérios de filtro[5]. (Exemplo: se k=50 mas apenas 3 profissionais daquela categoria estão dentro do raio de distância, apenas esses 3 serão retornados.)
Após essa etapa de recall, temos uma lista inicial de candidatos com seus respectivos scores de similaridade semântica retornados pelo Elasticsearch (baseados na distância coseno ou dot-product, conforme configuração). Esses candidatos atendem aos requisitos básicos solicitados (filtros) e possuem alta probabilidade de relevância semântica em relação à consulta.
2. Re-Ranking dos Candidatos (Precisão)
Com os candidatos em mãos, passamos ao estágio de precisão, onde refinamos a ordenação por meio de um score final composto que considera não apenas a relevância semântica da busca, mas também diversos sinais de qualidade e engajamento de cada profissional. O objetivo é que, no topo da lista, apareçam os profissionais não só mais semanticamente alinhados à busca, mas também mais confiáveis e ativos na plataforma, oferecendo a melhor experiência ao usuário.
a. Componentes de pontuação (features) – Vamos calcular vários sub-scores para cada profissional candidato, normalizados em uma escala comum (por exemplo 0 a 1), que comporão o Score Final:
	Score de Relevância Semântica: mede quão relevante é o perfil em relação à busca do usuário. Podemos usar diretamente a similaridade de cosseno entre o vetor da consulta e o vetor do profissional como métrica. O Elasticsearch já retorna um score para a consulta vetorial – se estivermos usando cosine com vetores normalizados, esse score estará entre 0 e 1 (1 = perfeitamente similar). Caso contrário, podemos normalizar o dot-product para um intervalo conveniente. Este será o nosso score_rel.
	Score de Confiança: reflete a credibilidade profissional baseada em fatores externos e de verificação. Exemplos de atributos que podem compor este score:
	Verificações de documentos ou certificações profissionais realizadas (verificado via RG, CNPJ, diplomas, etc).
	Reputação externa: presença e avaliações em outras plataformas (se integrado via API, por ex. estrelas no Google Places para aquele profissional ou empresa).
	Experiência: anos de atuação ou projetos concluídos relevantes.
Podemos combinar esses fatores em um número único score_conf. Por exemplo, um profissional com todas verificações concluídas, +5 anos de experiência e reputação externa alta poderia ter score_conf próximo de 1, enquanto um iniciante sem verificações teria valor menor.
	Score de Engajamento na Plataforma: pontuação de atividade e responsividade do profissional dentro do marketplace. Sinais possíveis:
	Frequência de login ou recente atividade (se um profissional não acessa há meses, sua chance de responder pode ser menor).
	Tempo de resposta às mensagens dos clientes (responde rapidamente = pontuação alta).
	Completude do perfil (perfil 100% preenchido com informações, foto, portfólio, etc, sugere maior engajamento).
	Taxa de resposta a solicitações (quantas propostas ele respondeu vs. recebeu).
Consolidamos esses dados em um score_eng (por ex: poderíamos dar peso maior à atividade recente e à taxa de resposta).
	Score de Avaliação Interna: considera a satisfação dos clientes na plataforma, usando as avaliações internas:
	Média das notas recebidas em avaliações (estrelas de 1 a 5, convertidas para 0 a 1).
	Volume de avaliações (um profissional com 50 avaliações de 4.8 estrelas é mais confiável que outro com 1 avaliação de 5.0; podemos refletir isso dando um incremento de score conforme o número de avaliações, ex.: via uma função logarítmica ou limites).
Geramos assim um score_eval. Por exemplo, podemos calcular score_eval = média_avaliações/5 * min(1, log10(1 + num_aval))/log10(1+T)) para incorporar volume até um teto T (e evitar privilegiar exageradamente quem tem números massivos).
b. Cálculo do Score Final (fórmula ponderada) – Com os sub-scores acima, definimos uma fórmula linear ponderada configurável para combinar tudo em um único ScoreFinal. Os pesos podem ser ajustados via configuração no banco de dados ou painel admin, permitindo calibragem rápida sem necessidade de reimplantar código. Por exemplo, inicialmente poderíamos adotar pesos iguais ou baseados em heurística de negócios. Uma fórmula genérica:
$$\text{ScoreFinal} = w_{\text{rel}}\cdot score_{\text{rel}} + w_{\text{conf}}\cdot score_{\text{conf}} + w_{\text{eng}}\cdot score_{\text{eng}} + w_{\text{eval}}\cdot score_{\text{eval}}$$
Onde w_"rel" +w_"conf" +w_"eng" +w_"eval" =1 (normalização dos pesos, não obrigatório mas facilita). Em código Python, ficaria:
# Pesos configuráveis (exemplo, poderiam vir de um DB ou arquivo de config)
W_REL, W_CONF, W_ENG, W_EVAL = 0.4, 0.2, 0.2, 0.2

# Supõe-se que já temos os sub-scores calculados para um dado profissional candidato:
score_rel  = calc_score_relevancia(vetor_consulta, vetor_perfil)       # similaridade de cosseno, por ex.
score_conf = calc_score_confianca(profissional)  # função definindo regras de confiança
score_eng  = calc_score_engajamento(profissional) # função para engajamento
score_eval = calc_score_avaliacao(profissional)   # função para avaliação interna

# Cálculo do Score Final ponderado
ScoreFinal = (W_REL * score_rel 
              + W_CONF * score_conf 
              + W_ENG * score_eng 
              + W_EVAL * score_eval)
No exemplo acima, atribuimos um peso maior para relevância semântica (40%) assumindo que alinhar habilidade/serviço com o pedido do usuário é o fator mais importante. Os demais fatores têm 20% cada no início, mas esses valores podem (e devem) ser ajustados com base em experimentos ou aprendizados de máquina posteriores.
c. Ordenação e seleção final – Para cada profissional nos candidatos de recall, calculamos o ScoreFinal e então ordenamos os candidatos decrescentemente por esse valor. Podemos limitar os resultados finais a, por exemplo, os top 10 ou 20 profissionais com maior ScoreFinal para exibir ao usuário. Nesta fase de re-ranqueamento, estamos priorizando precisão: garantir que os primeiros resultados sejam os melhores possíveis. Muitos candidatos sem destaque suficiente (score final baixo) serão rebaixados ou excluídos, mesmo que tivessem passado pelo filtro semântico inicial.
Vale notar que, inicialmente, a definição de w_i e mesmo das funções de sub-score é baseada em heurística de negócio. Contudo, adiante, abordaremos como treinar automaticamente um modelo de Learning-to-Rank para otimizar esses pesos e componentes de forma supervisionada (seção 6), a partir de dados de interação real dos usuários.
3. Módulos NLP Auxiliares (sem Fine-Tuning)
Nesta seção, integrarmos técnicas de Processamento de Linguagem Natural (NLP) para extrair informações úteis das entradas de texto (tanto da consulta do usuário quanto dos perfis) que possam melhorar o matching e enriquecer as features usadas no ranking. Importante: faremos uso de modelos prontos (off-the-shelf), evitando a necessidade de treinar modelos de linguagem do zero.
a. Extração de Entidades Nomeadas com spaCy – A biblioteca spaCy oferece modelos pré-treinados em português (por exemplo, pt_core_news_lg) capazes de identificar entidades nomeadas em textos. Entidades nomeadas incluem nomes de pessoas, locais, organizações, entre outros. Ao analisar a consulta do usuário, podemos detectar palavras-chave importantes. Por exemplo, se o usuário busca "advogado Maria em Rio de Janeiro", um modelo de NER poderia extrair: - "Maria" como PER (Pessoa), indicando que o usuário mencionou possivelmente o nome de um profissional específico. - "Rio de Janeiro" como LOC (Localização), indicando o lugar de interesse.
Identificar essas entidades nos permite refinar os filtros: no exemplo, poderíamos dar preferência a profissionais chamados Maria ou localizados no Rio de Janeiro. Similarmente, ao processar descrições de profissionais, podemos detectar certificados, instituições ou localidades mencionadas e armazená-las como atributos pesquisáveis.
Uso básico do spaCy em português para NER:
import spacy
# Carrega o modelo de linguagem em português (news, large)
nlp = spacy.load("pt_core_news_lg")

texto_busca = "Maria, advogada trabalhista em Rio de Janeiro"
doc = nlp(texto_busca)
entidades = [(ent.text, ent.label_) for ent in doc.ents]
print(entidades)
# Possível saída: [("Maria", "PER"), ("Rio de Janeiro", "LOC")]
Após obter as entidades (doc.ents), podemos tratar cada tipo conforme necessário. Por exemplo, se um nome de pessoa (PER) foi identificado na busca, isso pode indicar intenção de encontrar aquele profissional específico – poderíamos dar um boost nos resultados correspondentes. Se um local (LOC) for identificado na consulta, além do filtro de localização via mapa que já aplicamos, poderíamos considerar correspondências textuais (ex: profissional cujo endereço contém "Rio de Janeiro" caso a geocoordenada não estivesse disponível, etc.).
O spaCy facilita essa extração de forma eficiente e sem precisar treinar um modelo customizado para nosso caso[6][7]. Além de NER, o modelo pt_core_news_lg inclui componentes de análise gramatical, vetores lexicais etc., que podem ser explorados se necessário (por exemplo, para lemmatização ou normalização de texto de entrada antes de gerar embeddings).
b. Uso de modelo MiniLM para embeddings auxiliares (CPU-only) – Além das soluções de embeddings da OpenAI (que fornecem alta qualidade, porém via API externa paga), é interessante ter um modelo de embedding local, leve e rápido para tarefas auxiliares ou de menor escala, funcionando apenas em CPU. Uma ótima opção é utilizar um modelo da família MiniLM disponibilizado via Sentence Transformers. Por exemplo, o modelo all-MiniLM-L6-v2 gera embeddings de 384 dimensões e é ~5x mais rápido que modelos maiores, mantendo boa qualidade[8]. Esse modelo (ou similares, como distilBERT) pode ser usado para:
	Busca semântica local complementar: se quisermos ter uma busca vetorial local offline (por exemplo, como fallback se a API externa falhar ou para dados específicos).
	Cálculo de similaridades auxiliares: ex.: comparar a sinopse do usuário com descrições curtas de categoria do serviço ou rótulos, para inferir a categoria principal da busca.
	Extração de features adicionais: podemos gerar embeddings de partes específicas do perfil (por exemplo, título profissional, tags de habilidades) e da consulta, e derivar features como "similaridade entre títulos" ou "similaridade entre habilidades e consulta".
Uso do modelo MiniLM com sentence-transformers:
from sentence_transformers import SentenceTransformer
modelo_minilm = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
texts = [
    "Reparo elétrico residencial em apartamento",
    "Eletricista especializado em reparos residenciais"
]
embeddings = modelo_minilm.encode(texts, normalize_embeddings=True)
cos_sim = lambda u, v: float((u @ v.T))  # dot product de vetores normalizados equivale ao cosseno
print(cos_sim(embeddings[0], embeddings[1]))
# saída: valor alto próximo de 1 indicando alta similaridade semântica
No snippet acima, comparamos duas frases semânticamente similares usando o MiniLM (que roda rapidamente somente na CPU). Os embeddings resultantes têm dimensionalidade 384, bem menor que os 1536 do modelo da OpenAI, mas ainda conseguem captar relação semântica importante. O uso de normalize_embeddings=True facilita o cálculo direto do cosseno via produto interno.
Em produção, não fine-tunamos o MiniLM nos dados específicos; usamos tal como fornecido. Isso simplifica a integração e manutenção. Ressaltamos que, embora menos preciso que modelos maiores (como MPNet ou os próprios embeddings da OpenAI), o MiniLM pode servir para pré-filtragens rápidas ou como parte do cálculo de alguma feature de similaridade, praticamente sem custo (pois evita chamadas externas e roda local). Por exemplo, poderíamos usar MiniLM para sugerir automaticamente a categoria da busca do usuário: gerar embedding da query e comparar com embeddings de descrições padronizadas de cada categoria de serviço, escolhendo a categoria cujo vetor for mais similar. Isso pode alimentar uma feature binária "categoria coincide com predição NLP" para o modelo de ranking.
Em resumo, a combinação de spaCy para análise textual (extração de entidades, possivelmente frases-chave) e MiniLM para embeddings locais forma um módulo NLP auxiliar valioso. Esses recursos complementam o algoritmo de matching principal, ajudando a estruturar melhor os dados textuais e fornecer sinais adicionais ao sistema de recomendação, sem a complexidade de treinar modelos proprietários do zero.
4. Enriquecimento de Dados Externos
Para melhorar o perfil de cada profissional e a qualidade do matching, podemos integrar dados externos ao nosso sistema. Isso inclui consumir APIs públicas e privadas, além de realizar scraping controlado de informações disponíveis publicamente. Esses dados adicionais aumentam o contexto sobre cada profissional, permitindo filtros e ordenação mais inteligentes. Abaixo, detalhamos algumas fontes e métodos de enriquecimento:
a. APIs de terceiros (Google Places, etc.) – Serviços como Google Maps/Places API permitem obter informações sobre estabelecimentos e profissionais através de buscas por nome, endereço ou número de telefone. Por exemplo, se o profissional possui um escritório ou negócio registrado no Google, poderíamos consultar: - Google Places Details: dados como endereço completo, horário de funcionamento, avaliação média do local no Google, quantidade de avaliações, site, telefone, etc. - Google Search API (Custom Search): buscar menções do nome do profissional/empresa na web para encontrar, por exemplo, presença em diretórios ou outras plataformas.
Uso hipotético do Google Places API (via biblioteca googlemaps):
import googlemaps
gmaps = googlemaps.Client(key="SUA_API_KEY_GOOGLE")
# Buscar local pelo nome e cidade do profissional
resultados = gmaps.find_place(input="Eletricista Ana Souza São Paulo", 
                               input_type="textquery",
                               fields=["place_id", "rating", "user_ratings_total"])
if resultados.get("candidates"):
    place_id = resultados["candidates"][0]["place_id"]
    detalhes = gmaps.place(place_id=place_id, fields=["rating", "user_ratings_total", "url", "formatted_address"])
    print(detalhes["result"].get("rating"), detalhes["result"].get("user_ratings_total"))
    # -> ex: 4.8, 21 (classificação e número de avaliações do local no Google)
No exemplo, procuramos um lugar que corresponda ao nome do profissional e cidade. Se encontrado, pedimos detalhes como rating e número de avaliações. Esses dados podem alimentar nosso Score de Confiança ou serem exibidos no perfil (ex.: "Avaliação no Google: 4.8/5 de 21 avaliações"). Tenha cuidado com limites de uso da API e requisitos de display (conforme termos do Google).
b. Dados de registros oficiais (Receita Federal, etc.) – No contexto brasileiro, é importante verificar e enriquecer perfis empresariais (CNPJ) ou mesmo MEIs. A Receita Federal disponibiliza algumas informações de empresas (razão social, situação cadastral, CNAE, nome fantasia) através de serviços online. Por exemplo, a iniciativa Minha Receita oferece uma API pública gratuita para consulta de CNPJs[9]. Podemos usar essa API ou similares (como receitaws):
import requests, json
cnpj = "19131243000197"  # exemplo de CNPJ
resp = requests.get(f"https://www.receitaws.com.br/v1/cnpj/{cnpj}")
if resp.status_code == 200:
    dados = resp.json()
    print(dados.get("nome"), "-", dados.get("situacao"))
    # -> por ex: "EMPRESA X LTDA - ATIVA"
No exemplo, usamos a API receitaws (que encapsula dados da Receita) para obter o nome e situação cadastral de um CNPJ. Podemos automatizar para cada profissional que forneceu CNPJ (ou CPF via outra API) e armazenar: - Confirmação de nome oficial (para detectar fraudes ou divergências). - Situação = ativa/inativa. - Idade da empresa (data de abertura) – como proxy de experiência. - Natureza jurídica e atividade principal (pode enriquecer categorias ou tags no perfil).
Esses dados não apenas aumentam a confiança do usuário na plataforma (ex.: exibindo selo "CNPJ verificado"), mas também alimentam o score_conf (um CNPJ ativo e antigo poderia elevar confiança).
c. Integração com LinkedIn (ou similares) – O LinkedIn é uma fonte valiosa de informações profissionais: experiências, formações, recomendações. Embora o LinkedIn não tenha uma API pública ampla (a não ser via parcerias ou o API de login com permissões limitadas), pode-se implementar: - Login social via LinkedIn para o profissional, obtendo acesso autorizado a alguns dados de perfil (nome, foto, cargo atual). - Scraping do perfil público do profissional no LinkedIn, caso ele informe o URL (respeitando termos de uso e usando métodos que não sobrecarreguem o site, possivelmente via ferramentas como Selenium ou serviços terceiros). Ao extrair dados como histórico de experiências e habilidades, podemos validar e complementar as informações fornecidas pelo profissional no cadastro.
Por exemplo, se o profissional "Ana Souza" fornece que seu LinkedIn é linkedin.com/in/ana-souza-123, podemos escrever um scraper que pegue suas experiências relevantes (ex.: "Engenheira Eletricista na Empresa Y (2010-2015)") e automaticamente preencha campos no perfil ou gere tags de habilidade. Também poderíamos extrair contagem de conexões ou recomendações como sinal de networking (embora seja indireto).
d. Scraping controlado de fontes públicas – Além de APIs, muita informação útil está disponível em sites públicos (páginas amarelas, conselhos profissionais, sites de reclamações, etc.). Exemplo: Para advogados, consultar o site da OAB para verificar inscrição; para médicos, o CRM; para encanadores ou autônomos, sites de reclamação tipo ReclameAqui (para ver se há muitas queixas). Podemos desenvolver scrapers específicos para cada caso de uso: - Rotação de Proxies: Ao fazer scraping, é vital não exceder limites dos sites e evitar bloqueios. Configure um pool de proxies e user-agents variados para distribuir as requisições. - Respeitar robots.txt e políticas: Priorize fontes que permitam a raspagem ou ofereçam endpoints oficiais. Mantenha uma frequência baixa de requisições (ex.: um perfil por minuto, escalonado ao longo do dia) para não sobrecarregar servidores de terceiros. - Parsing de HTML: Use bibliotecas como BeautifulSoup para extrair os campos desejados. Por ex., no site da OAB buscar pelo nome do advogado e obter número de registro e situação (ativo/pendente).
e. Normalização e Deduplicação de perfis – Com os dados externos agregados, devemos integrá-los de forma consistente: - Normalização: unificar formatos (ex.: telefones no formato +55 DDD...; endereços quebrados em rua, cidade, UF; nomes com capitalização apropriada). Remove acentos e variações quando for para comparação. - Deduplicação: caso tenhamos perfis duplicados (dois cadastros para o mesmo profissional) ou o mesmo profissional aparecendo em múltiplas fontes, é preciso detectá-los e consolidar. Podemos comparar chaves como CPF/CNPJ (ideal), e-mails, ou nomes com alta similaridade combinados com proximidade de localização. Técnicas de fuzzy matching (via difflib ou RapidFuzz) auxiliam a identificar strings similares que não são idênticas.
Exemplo de normalização simples em código:
import unicodedata, re

def normalizar_nome(nome):
    # Remover acentuação
    nfkd = unicodedata.normalize('NFKD', nome)
    nome_sem_acento = "".join([c for c in nfkd if not unicodedata.combining(c)])
    # Remover não-letras e deixar em caixa baixa
    nome_limpo = re.sub(r'[^a-zA-Z ]', '', nome_sem_acento)
    return nome_limpo.strip().lower()

# Deduplicação básica por nome e cidade
from difflib import SequenceMatcher
def nomes_similares(nome1, nome2, threshold=0.9):
    return SequenceMatcher(None, normalizar_nome(nome1), normalizar_nome(nome2)).ratio() >= threshold
O código acima normaliza nomes e usa uma similaridade de sequência para comparar. Em produção, deduplicação pode usar algoritmos mais robustos (clusterização de similares, etc.) e considerar múltiplos campos (nome + profissão + cidade). Deduplicar evita recomender o mesmo profissional repetidas vezes e concentra as avaliações e histórico num único registro.
Em resumo, o enriquecimento de dados externos eleva a qualidade do nosso matching ao fornecer: - Maior confiança (verificações oficiais, avaliações externas). - Perfis mais completos (importação de informações profissionais). - Melhor qualidade de busca (dados normalizados permitem buscas e comparações mais eficazes).
Entretanto, deve-se cuidar com atualização desses dados (sincronizar periodicamente, já que dados externos mudam) e LGPD/privacidade (informar usuários e obter consentimento quando necessário para coletar dados de terceiros sobre eles).
5. Coleta e Uso de Dados de Interação dos Usuários
Um dos ativos mais importantes para aprimorar continuamente o algoritmo de matching é o registro das interações dos usuários com a plataforma. Ao instrumentar corretamente o sistema para coletar esses dados, podemos tanto medir a eficácia atual das recomendações quanto treinar modelos supervisionados para melhorar o ranking (ver seção 6). Aqui definimos que e como coletar, e como transformar interações em sinais de relevância:
a. Eventos de impressão e clique – Cada vez que uma lista de profissionais é mostrada a um usuário (ex.: resultados de uma busca), deve-se registrar um evento de impressão para cada profissional exibido. Os campos mínimos a salvar: - ID do usuário que fez a busca (ou anônimo/ID de sessão se aplicável). - Timestamp (data/hora) da impressão. - IDs dos profissionais mostrados e posição em que foram mostrados (posição 1, 2, 3... na lista). - Talvez o ID ou texto da consulta buscada, ou categoria filtrada.
Da mesma forma, quando o usuário clica no perfil de um profissional a partir de uma lista (indicando interesse), registramos um evento de clique: - ID do usuário, timestamp. - ID do profissional clicado. - Contexto do clique: por exemplo, se veio da página de busca X, qual posição aquele profissional ocupava quando clicado (para podermos calcular CTRs por posição). - Podemos também registrar que esse clique veio após uma certa busca ou filtros específicos.
Esses eventos podem ser registrados no banco de dados relacional (ex: tabela Interactions com colunas tipo user_id, professional_id, event_type, timestamp, context...), mas uma abordagem escalável é enviá-los para um índice no OpenSearch/Elasticsearch dedicado a logs de interação (por ex., logs_interacoes), pois isso facilita agregar e filtrar por campos e usar scroll para análise de grandes volumes posteriormente.
Exemplo simplificado de registro de impressão e clique (em pseudocódigo Django):
# models.py
class InteractionLog(models.Model):
    user = models.ForeignKey(User, null=True)
    professional = models.ForeignKey(Professional)
    event_type = models.CharField(max_length=20)  # e.g. "impression", "click"
    query_text = models.CharField(max_length=255, null=True)
    position = models.IntegerField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

# Ao gerar resultados (views.py)
for pos, prof in enumerate(resultados_profissionais, start=1):
    InteractionLog.objects.create(user=request.user, professional=prof, 
                                  event_type="impression",
                                  query_text=consulta, position=pos)

# Quando um perfil é clicado:
InteractionLog.objects.create(user=request.user, professional=prof, 
                              event_type="click",
                              query_text=consulta, position=posicao_na_lista)
(Podemos substituir o uso de DB pelo uso direto de Elasticsearch: enviar documento via cliente Python a cada evento, o que elimina sobrecarga do relacional em grandes volumes. A escolha depende da arquitetura de dados do sistema.)
b. Eventos de mensagem/contato e contratação – Além de cliques, devemos rastrear eventos de conversão mais fortes: - Mensagem enviada: se o marketplace permite que o usuário envie mensagem ou solicite orçamento ao profissional através da plataforma, esse evento indica um nível de interesse maior. Registre com event_type="message" (ou "contact"). - Contratação/negócio fechado: se o usuário efetivamente contrata o profissional (por exemplo, marcando um serviço como contratado, ou efetuando pagamento via plataforma), é o sinal máximo de sucesso para aquela busca. Registre event_type="hire" (ou "conversion") com os IDs envolvidos.
Estes eventos possivelmente estão ligados a outras entidades (ex.: ao criar um Pedido/Job no sistema, já sabemos que um profissional foi contratado por um usuário). Ainda assim, para fins de aprendizado de ranking, convém duplicar essa informação num log consolidado de interações.
c. Criação de labels de relevância (gradual) – Tendo coletado diversos eventos, podemos inferir quão relevante cada profissional era para uma determinada busca do usuário. A ideia é atribuir rótulos de relevância graduais aos pares (consulta, profissional) com base nas interações do usuário:
	Se o profissional foi contratado após a busca, consideramos relevância máxima (p. ex. atribuir label = 3 numa escala 0-3).
	Se houve mensagem/interação forte mas não contratação, ainda é um sinal de alta relevância (label = 2).
	Se apenas clique no perfil ocorreu (mas nenhuma ação posterior), é um sinal de leve interesse (label = 1).
	Se o profissional foi exibido mas ignorado (nenhum clique), podemos tratar como irrelevante naquela busca (label = 0).
Essa escala [0,1,2,3] é um exemplo de relevância graduada (graded relevance) que será útil para treinar modelos de ranking supervisionados[10]. Os eventos têm natureza implícita (não perguntamos diretamente ao usuário a relevância), mas assumimos que contratar >>> clicar. Podemos armazenar esses labels resultantes em um conjunto de treinamento: por exemplo, construir uma tabela ou dataframe onde cada linha é:
consulta_id, profissional_id, label_relevancia, features...
(Incluiremos features na próxima seção, agora focamos no label.)
Dilema dos dados implícitos: Note que impressões ignoradas como "0" relevância podem incluir tanto casos de irrelevância quanto casos em que o resultado não foi visto (ex.: estava na página 2 e o usuário nem rolou até lá). Isso introduz viés de posição. Técnicas avançadas podem reponderar ou ignorar certos dados, mas numa primeira abordagem podemos tratar todos não clicados como 0, cientes dessa limitação.
d. Exemplo de geração de labels – Suponha que um usuário buscou "encanador banheiro vazamento" e viu 5 resultados (A, B, C, D, E nessa ordem). Ele clicou nos resultados B e D, conversou com D via chat, e acabou contratando D. Do nosso log: - A: impresso, não clicado -> label 0 (provavelmente irrelevante para este usuário/consulta). - B: impresso, clicado mas não houve contato/contratação -> label 1 (algum interesse). - C: impresso, não clicado -> label 0. - D: impresso, clicado, mensagem, contratado -> podemos dar label 3 (máxima relevância). - E: impresso, não clicado -> label 0.
Para treinamento, montaríamos exemplos (consulta, profissional) com esses rótulos.
e. Aproveitamento para métricas online – Além do uso em ML, esses dados permitem calcular métricas de qualidade do ranking ao longo do tempo: CTR (Click-through rate) por posição, taxa de conversão por consulta, etc. Por exemplo, podemos monitorar CTR@1 (porcentagem de vezes que o primeiro resultado é clicado) ou ConversionRate@5 (quantas buscas resultam em contratação dentre top 5). Isso nos dá feedback contínuo se alterações no algoritmo melhoram ou pioram a qualidade.
f. Privacidade – É fundamental deixar claro para o usuário (via política de privacidade) que tais dados de interações são coletados para melhorar o serviço. Tudo deve ser armazenado de forma segura e, se possível, anonimizada (pelo menos para análises offline não precisamos identificar o usuário, apenas agregá-lo).
Em suma, registrar impressões, cliques, contatos e contratações nos fornece a base para aprender com o comportamento real dos usuários. Esse aprendizado será aplicado no próximo passo, onde treinaremos automaticamente um modelo de Learning to Rank (LTR) usando esses logs como base.
6. Treinamento Automático do Modelo de Learning to Rank
Após acumular um volume suficiente de dados de interação (como descrito na seção anterior), podemos passar do modelo heurístico estático de ranking para um modelo supervisionado que aprende a ordenar os resultados de acordo com o que efetivamente leva a melhores resultados (cliques, contratações). Usaremos XGBoost para treinar um modelo de Learning-to-Rank (LTR), aproveitando sua implementação eficiente de algoritmos como LambdaMART[11]. A ideia geral: 1. Preparar um conjunto de treinamento a partir dos logs, com features e labels. 2. Configurar o XGBoost para tarefa de ranking (objetivo rank:pairwise ou rank:ndcg). 3. Treinar o modelo (de forma escalável, já que potencialmente são muitos logs). 4. Avaliar em métricas de ranking (nDCG@10, por ex) e implementar mecanismo de rollback se a nova versão for pior que a antiga. 5. Automatizar esse processo para rodar periodicamente (ex: diariamente via Celery Beat).
a. Preparação dos dados de treino (features e grupos) – Cada instância de treino corresponde a um profissional candidato em uma determinada busca do usuário, descrito por: - Features: podemos usar todos os componentes calculados na seção 2 como features de entrada do modelo: - Similaridade da consulta vs perfil (score_rel). - Pontuação de confiança (score_conf). - Pontuação de engajamento (score_eng). - Pontuação de avaliações (score_eval). - Outras features derivadas de NLP ou regras, se desejarmos (ex: "mesma cidade?" 0/1, "mesmo nome mencionado?" 0/1, etc.). - Podemos incluir também a posição original que o item ocupou no resultado de recall (mesmo que isso não deva idealmente influenciar relevância, pode ajudar o modelo a corrigir vieses). - Label de relevância: o valor 0,1,2,3 conforme definido na seção 5 para aquele par (busca, profissional).
Crucial é agrupar as instâncias por consulta (ou busca) específica. Em XGBoost LTR, fornecemos um array de qid (query ID) para indicar quais itens pertencem à mesma consulta, de modo que o modelo só compare ordens dentro do mesmo grupo[10][12]. Se usamos como qid um identificador de busca ou sessão de busca, garantimos que, por exemplo, todos candidatos da busca "encanador banheiro vazamento" pertencem ao mesmo grupo e serão avaliados relativamente.
Exemplo de construção de dataset (pseudocódigo):
import pandas as pd

# Supondo que temos uma lista de logs processados em memoria ou via scroll
logs = obter_logs_interacoes()  # recuperar de OpenSearch via scroll API
treino_data = []
for consulta_id, eventos in agrupar_por_consulta(logs):
    for ev in eventos:
        prof_id = ev['professional_id']
        # Extrair ou calcular features para este prof e consulta
        features = extrair_features(consulta_id, prof_id)  # ex.: [score_rel, score_conf, ...]
        label = atribuir_label(ev)  # baseado no evento de maior peso para aquele prof: hire=3, message=2...
        treino_data.append((consulta_id, prof_id, features, label))
# Montar DataFrame para análise ou diretamente arrays numpy para XGBoost
b. Uso do Scroll API para logs volumosos – Se o índice de logs de interações no OpenSearch for grande (milhões de eventos), é mais eficiente usar a API de scroll para iterar pelos resultados gradualmente sem sobrecarregar a memória[13]. Por exemplo, usando o cliente Python:
from opensearchpy import OpenSearch
os = OpenSearch("https://meucluster:9200", http_auth=('user','pass'), ssl_show_warn=False)

data_inicial = "2025-06-01"
query_logs = {
  "query": {
    "range": { "timestamp": { "gte": data_inicial } }
  }
}
# Inicializa scroll
resp = os.search(index="logs_interacoes", body=query_logs, size=10000, scroll="5m")
scroll_id = resp["_scroll_id"]
resultados = resp["hits"]["hits"]
while resultados:
    for hit in resultados:
        processa_hit(hit)  # extrai features/label conforme acima
    resp = os.scroll(scroll_id=scroll_id, scroll="5m")
    resultados = resp["hits"]["hits"] if resp and resp["hits"]["hits"] else []
No exemplo, buscamos todos logs a partir de 1º Jun 2025 em lote de 10 mil por vez. Usamos scroll=5m para manter a janela de busca aberta enquanto iteramos. Dentro do loop, para cada hit (evento) convertimos nos dados de treino conforme discutido. Ao final, encerramos ou expiramos o scroll (poderíamos chamar os.clear_scroll).
c. Treinamento do modelo XGBoost (LambdaMART) – Com os dados prontos (feature matrix X, label vector y e grupo array qid), configuramos o XGBoost para ranking. Usaremos o objetivo rank:pairwise ou rank:ndcg. A diferença: - rank:pairwise otimiza indiretamente o ordenamento aprendendo a preferir documentos relevantes sobre não relevantes em cada par. - rank:ndcg é um objetivo que diretamente tenta otimizar a métrica NDCG (costuma utilizar o framework LambdaRank). Por padrão, XGBoost usa LambdaMART para rank:ndcg[11]. Podemos usar esse direto para favorecer acertos nos top results.
Exemplo com XGBRanker (interface sklearn do XGBoost para ranking):
import xgboost as xgb
from sklearn.model_selection import train_test_split

# X: matriz de features, y: labels, qid: array de grupo para cada instancia em X
X_train, X_val, y_train, y_val, qid_train, qid_val = train_test_split(
    X, y, qid, test_size=0.1, random_state=42)

ranker = xgb.XGBRanker(
    objective="rank:ndcg",
    tree_method="hist",  # histograma para rapidez
    learning_rate=0.1,
    n_estimators=100,
    eval_metric="ndcg@10"  # avaliar NDCG@10 em cada iteração
)
ranker.fit(X_train, y_train, group=qid_train,
           eval_set=[(X_val, y_val)], eval_group=[qid_val],
           early_stopping_rounds=10)
Neste código, dividimos os dados em treino/validação (opcional mas recomendado para avaliar). Configuramos o XGBRanker para usar a métrica ndcg@10 nas avaliações durante treino. O modelo treinará até 100 árvores ou até 10 iterações sem melhora em ndcg@10 da validação (parada antecipada). O resultado é um modelo de ensemble de árvores de decisão que recebe as features de um candidato e produz um escore (não necessariamente interpretável diretamente, mas consistente para ordenar).
d. Deploy do modelo treinado no sistema de busca – Uma vez treinado, temos algumas opções para utilizar esse modelo no ranqueamento online: - Aplicar o modelo em Python: carregar o objeto ranker ou salvar em arquivo (ranker.save_model("ltr_model.json")) e carregá-lo em memória na aplicação web. Então, para cada busca do usuário, após gerar os candidatos (recall), montar o vetor de features para cada candidato e chamar ranker.predict(X_candidates) para obter scores e ordenar. Essa abordagem demanda ter as features calculáveis rapidamente online (muitas já temos; algumas como score_rel vêm do ES; outras como score_conf/eng/eval podem vir pré-calculadas no perfil ou calculadas on the fly). - Integração via plugin LTR do Elasticsearch: OpenSearch e Elasticsearch oferecem plugins de LTR onde podemos fazer upload de modelos treinados (em formato XGBoost .json ou RankLib) e referenciá-los numa query de re-rank. Por exemplo, o plugin de LTR do OpenSearch suporta modelos XGBoost e reordena os resultados considerando features logadas[14][15]. Nesse caso, precisaríamos também definir um Extrator de Features para que o Elasticsearch saiba como obter cada feature do documento ou do contexto da query. Algumas features nossas podem estar indexadas diretamente (ex: avaliação média poderia estar em um campo do documento; similaridade coseno pode ser recalculada ou logada; outras como "foi recomendado externamente" teriam que ser calculadas no momento da indexação como campos booleanos/numericos).
A vantagem de usar o plugin é realizar o re-ranking já no lado do ES, ao invés de trazer 50 resultados e ordenar na aplicação. Entretanto, a implementação do plugin e a serialização das features adiciona complexidade. No curto prazo, a reordenação em Python pode ser mais simples de implementar.
Independentemente da abordagem, o modelo deve ser versãoado – podemos manter por exemplo um campo na base com a versão do modelo ou data do treinamento, e salvar cada modelo treinado em armazenamento (S3, banco, etc.) para possibilitar auditoria e rollback.
e. Avaliação e métricas (nDCG@10) – Para verificar se o novo modelo LTR de fato melhora a qualidade, utilizamos métricas de ranking. A métrica recomendada é NDCG@K (Normalized Discounted Cumulative Gain) nos resultados do modelo comparada ao baseline. NDCG mede o quão perto da ordenação ideal (baseada nos labels de relevância) está a ordenação feita pelo modelo, dando maior peso às posições mais altas[16]. NDCG varia de 0 a 1 (1 = ordem perfeita)[17]. Em nosso caso, como usamos labels graduados, NDCG leva em conta ganhos maiores para recomendações com label 3 vs label 1, por exemplo, e decai o ganho se esses itens relevantes aparecem mais para baixo na lista.
Para cálculo offline, podemos usar o próprio XGBoost (que já reporta ndcg@10 no eval_metric durante treino) ou usar a implementação do scikit-learn:
from sklearn.metrics import ndcg_score
# Digamos que y_true_val são os relevâncias verdadeiras e y_pred_model são os scores preditos do modelo
ndcg_10 = ndcg_score([y_true_val], [y_pred_model], k=10)
print("NDCG@10 =", ndcg_10)
Também podemos calcular nDCG@10 no conjunto de teste que separamos, ou via cross-validation. Se o nDCG do novo modelo for consistentemente maior que o do modelo anterior (ou do método de pesos manuais), é um indicativo de melhora.
f. Estratégia de Rollback – Caso o modelo treinado não apresente ganho ou apresente piora (por exemplo, nDCG igual ou inferior, ou ainda em métricas online a taxa de cliques caiu), precisamos ter uma forma de voltar ao modelo anterior: - Mantenha sempre uma versão estável do modelo em produção (por ex, como current_model.pkl). Quando treinar um novo (new_model.pkl), não substitua imediatamente; primeiro avalie offline e possivelmente em um teste A/B controlado. - Se offline o modelo novo é pior, aborte a implantação e agende re-treino para uma data futura (ou investigue dados). - Se for melhor offline, implante de forma gradual: por exemplo, use Feature Flags ou uma porcentagem de tráfego (10% dos usuários usam o novo modelo e medimos CTR/contratações real). Se após um tempo o novo supera o velho nos indicadores-chave, então faça o switch completo. Esse procedimento diminui riscos de regressão.
Caso não seja possível teste A/B, ao menos monitore atentamente as métricas logo após implantar. Implementar um rápido toggle de emergência (config no admin para voltar ao "modo básico/pesos fixos") também é recomendado.
g. Automação do treinamento diário – Utilizando Celery Beat (o agendador de tarefas periódicas do Celery), podemos orquestrar a execução diária do treinamento. Por exemplo, configurar uma tarefa treinar_modelo_ltr que roda toda madrugada, quando o sistema está em baixa utilização. Em celery.py ou no scheduler:
from celery.schedules import crontab

app.conf.beat_schedule = {
    'treino-ltr-diario': {
        'task': 'app.tasks.treinar_modelo_ltr',
        'schedule': crontab(hour=3, minute=0),
    },
}
No código da task treinar_modelo_ltr, implementar as etapas: extrair logs (talvez dos últimos N dias ou desde último treinamento), gerar dataset, treinar XGBoost, salvar modelo e atualizar ponteiros/flags de versão. É importante que essa tarefa seja idempotente e robusta a falhas (ex: se falhar no meio, não deixar sistema em estado inconsistente). Também considere logar a saída do treinamento, tempo gasto, e resultados de métrica para acompanhamento.
h. Escalabilidade – O volume de logs de interação pode ser muito grande. Estratégias: - Amostragem: talvez não seja necessário usar todos os logs históricos diariamente. Podemos usar janelas deslizantes (ex: últimos 3 meses) ou amostra estratificada. Isso reduz tempo de treino. - Distribuição: XGBoost permite distribuir training, mas, inicialmente, treinar em 1 máquina pode ser suficiente se os dados couberem em memória. Use o tree_method="hist" ou até "approx" para acelerar. - Feature Store: Pré-calcular e armazenar as features de cada (consulta, profissional) pode ser complexo porque consultas são muito variadas. Em vez disso, calcule on-the-fly durante o preparo do dataset.
No final, o resultado desse pipeline será um modelo de ranking atualizado regularmente, que se adapta ao comportamento dos usuários ao longo do tempo. Isso garante que, conforme novas tendências surgem (ex.: usuários começando a preferir profissionais com resposta rápida), o modelo aprenderá a capturar esses sinais, ajustando os pesos além do que faríamos manualmente.
7. Considerações de Arquitetura e Implantação
Para suportar todas as funcionalidades acima com confiabilidade e desempenho, é fundamental projetar uma arquitetura robusta, escalável e segura. A seguir, delineamos as principais decisões arquiteturais:
a. Stack principal (Django + Celery + Elasticsearch) – Utilizaremos o Django como framework web para construir o backend do marketplace, expondo APIs ou renderizando páginas, conforme o caso. O Django acomodará: - Lógica de negócios (ex: criação de pedidos, cadastro de usuários e profissionais). - Integrações com APIs externas (via services ou tasks). - Chamadas ao Elasticsearch/OpenSearch para buscar e filtrar profissionais (utilizando libs como elasticsearch-py ou opensearch-py). - Armazenamento de dados relacionais (por ex, PostgreSQL para dados transacionais e consistentes como contas, transações, etc).
Celery será empregado para tarefas assíncronas e agendadas: - Processamento de embeddings (poderíamos enfileirar uma task para gerar embedding quando um profissional edita o perfil, evitando travar requisição web). - Enriquecimento de dados externos (consultas a APIs e scraping podem ser feitos em segundo plano para não impactar a experiência do usuário). - Treinamento do modelo LTR diário (como detalhado). - Envio de emails/notifications, etc, também podem usar Celery.
O Elasticsearch/OpenSearch atuará como banco de buscas: - Índice de profissionais com campos estruturados e vetoriais para suporte ao matching inteligente. - Índice de logs (se decidirmos logar interações ali) para analytics e treino. - Possível índice de outras entidades se buscáveis (ex: jobs abertos, etc, dependendo do escopo do marketplace).
Essa divisão de responsabilidades permite escalar cada componente independentemente (web, async, search) conforme demanda.
b. Contêineres (Docker) e separação de serviços – Em produção, a aplicação será conteinerizada usando Docker. Podemos definir um Docker Compose (ou Kubernetes manifests posteriormente) com serviços separados: - Web App: rodando Django + Gunicorn (ou Uvicorn/ASGI se for tempo real) para servir as requisições web/HTTP. Configuramos Gunicorn com número de trabalhadores adequados (e.g. 2-4 por CPU) para atender concorrência. - Celery Worker: um ou mais contêineres rodando celery -A projeto worker para executar as tasks em background. Podemos escalar o número de workers conforme carga de tarefas (e.g., um para tarefas CPU-bound como embeddings ou training; outro para I/O-bound como chamadas de API). - Celery Beat: um contêiner rodando o agendador celery -A projeto beat que dispara as tarefas periódicas (treinamento diário, atualizações de caches, etc). - Elasticsearch/OpenSearch: podemos ter o serviço de busca rodando também em contêiner (por simplicidade em dev, um único nó; em prod consideraria um cluster dedicado talvez gerenciado). Certifique de ajustar memória JVM e volume de dados persistente para este contêiner. - Banco de Dados: se usar PostgreSQL local, também um contêiner, ou pode ser um serviço gerenciado externo. - Broker do Celery: geralmente Redis ou RabbitMQ. Um contêiner redis:alpine pode servir de broker de mensagens para o Celery (e armazenar resultados se necessário).
Essa orquestração isola cada parte. Por exemplo, o web app não realiza heavy lifting – delega ao Celery. Um template de docker-compose.yml incluiria serviços para cada, e volumes nomeados para persistência (BD, ES data).
c. Boas práticas de implantação Django: - Configurar Gunicorn para servir a app com um timeout generoso para buscas mais longas, porém não muito alto (p.ex 30s). - Usar nginx na frente como proxy reverso para servir conteúdo estático e fazer balanceamento entre múltiplas instâncias web (se escalar horizontalmente). - Ativar cache para respostas de busca se aplicável (ex: repetição da mesma query popular).
d. Segurança do Elasticsearch – Não podemos esquecer de proteger o serviço de busca, dado que conterá dados sensíveis (inclusive logs de uso): - Habilitar TLS/SSL nas conexões HTTP do Elasticsearch, para criptografar o tráfego entre Django e ES e entre nós ES (se aplicável). Em produção, idealmente todo tráfego interno já é em rede isolada, mas ainda assim, ativar TLS impede inspeção de dados[18]. - Ativar autenticação no Elasticsearch: usar um usuário e senha (ou API key) para que apenas a aplicação acesse. ES/OpenSearch out-of-the-box (versões recentes) permitem configurar um usuário elastic com senha. Podemos armazenar essas credenciais em variáveis de ambiente e configurá-las no cliente (como visto no snippet do scroll acima, usamos http_auth). Com TLS + auth, evitamos acessos não autorizados. - Firewalls e restrição de acesso: se deploy em cloud, colocar o ES em rede privada, somente acessível pelo backend. Nunca expor porta 9200 abertamente. - Controle de índices: aplicar menores privilégios necessários – o backend talvez só precise ler/escrever no índice de profissionais e logs, então poderia usar um usuário com permissões restritas a esses índices.
e. Escalabilidade e tolerância: - Deploy com Docker facilita escalar horizontal: podemos subir várias instâncias do web app atrás de um load balancer; vários workers Celery concorrentes consumindo da fila (Redis facilita isso). - Para alta disponibilidade, rodar pelo menos 2 instâncias de cada componente crítico (2 web, 2 workers, e ES cluster com 2+ nós em configurações de múltiplas AZ, etc). - Monitoramento: incorporar ferramentas de logging centralizado (ex: enviar logs do Django e Celery para ELK/OpenSearch, usar APM se necessário) e monitorar métricas (CPU, memória, latência das buscas, fila Celery backlog, etc). - Backup: garantir backup das datasources – o BD relacional e possivelmente snapshots regulares do índice Elasticsearch (ou reindexação a partir do BD se for replicável). - Conforme o projeto cresce, considerar extrair a parte de search para um serviço dedicado (micro-serviço) se couber, mas inicialmente a stack monolítica modular dá conta.
f. Desenvolvimento e CI/CD: - Configurar ambiente .env para segredos (API keys, senhas) não ficarem hardcoded. - Escrever testes unitários/integração para componentes críticos (ex: teste de que a fórmula ScoreFinal ordena conforme esperado, ou que a integração de embedding retorna vetor de tamanho correto). - Pipeline CI para rodar testes e talvez implantar automaticamente no container registry. - CD (deploy contínuo) com cuidado, talvez manjado via Docker image e Compose update ou Kubernetes RollingUpdate.
Resumindo, a arquitetura proposta alavanca tecnologias maduras: - Django + Gunicorn para servir rapidamente as requisições web e APIs. - Celery + Redis para tarefas pesadas e agendadas, assegurando responsividade. - Elasticsearch/OpenSearch para busca textual e vetorial avançada. - Docker para isolar e replicar ambientes, facilitando escalar componentes separadamente. - Segurança aplicada em todos pontos, principalmente no acesso ao cluster de busca, usando TLS e autenticação[18], além de boas práticas gerais de proteção de dados (LGPD compliance).
Com essa fundação, o algoritmo de matching inteligente pode operar em produção de forma eficiente e segura, permitindo iterações rápidas nos modelos e técnicas conforme o marketplace cresce e aprende com seus usuários. Cada componente pode ser ajustado ou substituído conforme necessidade (por ex: migrar de XGBoost para LightGBM ou rede neural no futuro, ou de OpenAI API para um modelo proprietário, etc.), sem alterar drasticamente os outros – garantindo uma arquitetura flexível e escalável.
 
Referências Utilizadas: Ferramentas e conceitos baseados na documentação do OpenAI embeddings[1], exemplos de uso de busca vetorial e filtros no Elasticsearch[3][5], técnicas de LTR com XGBoost[10][11], recursos de NLP spaCy[6][7] e Sentence-Transformers[8], integração de dados governamentais[9], e melhores práticas de segurança em Elasticsearch[18], entre outros. Estas referências apoiam as escolhas técnicas apresentadas neste guia.
 
[1] [2] The guide to text-embedding-3-small | OpenAI
https://zilliz.com/ai-models/text-embedding-3-small
[3] [4] [5] How to combine vector search with filtering in ElasticSearch | by Fatihsati | Medium
https://medium.com/@fatihsati/how-to-combine-vector-search-with-filtering-in-elasticsearch-b938ec78d179
[6] [7] Entity Extraction with spaCy
https://sematext.com/blog/entity-extraction-with-spacy/
[8] Pretrained Models — Sentence Transformers documentation
https://www.sbert.net/docs/sentence_transformer/pretrained_models.html
[9] Obtendo dados de CNPJ's com a API Minha Receita - DEV Community
https://dev.to/camilacrdoso/obtendo-dados-de-cnpj-s-com-a-api-minha-receita-2hcd
[10] [11] [12] Learning to Rank — xgboost 3.0.3 documentation
https://xgboost.readthedocs.io/en/stable/tutorials/learning_to_rank.html
[13] Scroll - OpenSearch Documentation
https://docs.opensearch.org/latest/api-reference/search-apis/scroll/
[14] Learning to Rank - OpenSearch Documentation
https://docs.opensearch.org/3.0/search-plugins/ltr/index/
[15] Uploading trained models - OpenSearch Documentation
https://docs.opensearch.org/latest/search-plugins/ltr/training-models/
[16] [17] Normalized Discounted Cumulative Gain (NDCG) explained
https://www.evidentlyai.com/ranking-metrics/ndcg-metric
[18]  Day 21: Securing Elasticsearch in Production | by Vinoth Subbiah | Medium
https://medium.com/@vinoji2005/day-21-securing-elasticsearch-in-production-4eb8a1bd8d91
