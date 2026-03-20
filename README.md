# 🕵️‍♂️ Shadow Tracker (Vision AI)

O **Shadow Tracker** é uma ferramenta de código aberto que utiliza Inteligência Artificial (GPT-4o Vision) para auditar e-commerces e descobrir se você está sendo vítima de **Precificação Dinâmica** (quando a loja cobra mais caro baseada no seu perfil, cookies ou histórico de navegação).

A extensão tira um "print" da sua tela logada, enquanto um servidor em segundo plano abre uma aba fantasma (anônima) e tira outro print. A IA compara as duas imagens e alerta se houver divergência de preços, injetando ruído de navegação na loja para confundir o algoritmo deles.

---

## 🛑 Por que esta extensão não está na Chrome Web Store?

Se você está se perguntando por que não pode simplesmente clicar em "Instalar" na lojinha do Google ou do Edge, a resposta está em como a arquitetura moderna de navegadores funciona:

1. **O "Trabalho Sujo" exige um Servidor Local:** Extensões de navegador não têm permissão para abrir navegadores ocultos independentes na sua máquina para burlar bloqueios. Para isso, usamos o **Playwright** (um robô de automação em Python), que roda no seu computador e faz as requisições anônimas.
2. **Custos de Inteligência Artificial:** A extensão utiliza a API oficial da OpenAI (GPT-4o) para ler as imagens. Se o projeto fosse público na loja, o criador da extensão faliria pagando a conta da IA para milhares de usuários. Rodando localmente, **você usa a sua própria chave da API** e tem controle total dos (baixíssimos) custos.
3. **Privacidade e Segurança:** Ao rodar tudo na sua máquina, garantimos que os prints da sua tela vão direto do seu computador para a OpenAI, sem passar por servidores de terceiros.

---

## ⚙️ Como instalar e rodar (Passo a Passo)

O projeto é dividido em duas partes que conversam entre si: o **Back-end** (O motor em Python) e o **Front-end** (A extensão visual no navegador).

### Pré-requisitos
* Ter o [Python](https://www.python.org/downloads/) instalado na sua máquina.
* Ter uma conta na OpenAI e gerar uma [API Key (Chave de API)](https://platform.openai.com/api-keys).

### Passo 1: Preparando o Back-end (O Motor Python)
1. Faça o clone ou o download deste repositório para o seu computador.
2. Abra o terminal e navegue até a pasta do back-end:
   ```bash
   cd shadowtracker-back
   ```
3. Instale as bibliotecas necessárias:
   ```
   pip install -r requirements.txt
   ```
4. Instale o navegador fantasma playwright:
   ```
   playwright install chromium
   ```
   
5. Abra o arquivo main.py em um editor de texto, procure a linha client = OpenAI(api_key="SUA_NOVA_CHAVE_AQUI") e cole a sua chave real da OpenAI.

6. Ligue o servidor rodando o comando:
   ```
   uvicorn main:app --reload
   ```
   Deixe esta janela preta aberta rodando no fundo!

### Passo 2: Instalando o Front-end (A Extensão)

1. Abra o seu navegador (Chrome, Edge, Brave, etc).
2. Digite na barra de endereços: chrome://extensions/ (ou edge://extensions/).
3. No canto superior direito, ative o Modo do Desenvolvedor.
4. Clique no botão "Carregar sem compactação" (ou Load unpacked).
5. Selecione a pasta shadowtracker-front que você baixou.
6. Pronto! O ícone do detetive 🕵️‍♂️ vai aparecer no topo do seu navegador.

## Como usar
- Entre em uma página de produto específico na Amazon, Mercado Livre, KaBuM! ou Magalu (Não use na página inicial, vá até a página onde o botão "Comprar" aparece).
- Clique no ícone do detetive 🕵️‍♂️ no seu navegador.
- Um banner laranja aparecerá informando que a IA está analisando a tela.
- Aguarde de 10 a 20 segundos.
- Receba o veredito!
  - Verde: Preço justo.
  - Vermelho: Preço inflado (neste caso, o sistema já iniciou silenciosamente a injeção de ruído para limpar o seu perfil no algoritmo da loja).

## ⚠️ Aviso Legal
Este projeto é estritamente educacional. O objetivo é demonstrar como técnicas de Visão Computacional e automação podem ser usadas para auditoria de algoritmos e transparência de preços.
