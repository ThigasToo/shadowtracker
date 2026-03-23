import base64
import json
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from playwright.sync_api import sync_playwright
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"],
)

# 🛑 COLOQUE SUA NOVA CHAVE DA OPENAI AQUI (A anterior foi comprometida!) 🛑
client = OpenAI(api_key="sk-SUA_CHAVE_AQUI")

# Agora o backend espera a URL e a Imagem enviada pela extensão (Fim do Erro 422!)
class PriceCheckRequest(BaseModel):
    url: str
    user_image: str

# --- ARSENAL DE RUÍDO (Expandido!) ---
NOISE_LINKS = {
    "mercadolivre": [
        "https://lista.mercadolivre.com.br/racao-gatos", 
        "https://lista.mercadolivre.com.br/fralda-huggies",
        "https://lista.mercadolivre.com.br/whey-protein",
        "https://lista.mercadolivre.com.br/pneu-aro-15"
    ],
    "amazon": [
        "https://www.amazon.com.br/s?k=fralda+bebe", 
        "https://www.amazon.com.br/s?k=racao+cachorro",
        "https://www.amazon.com.br/s?k=livros+investimento",
        "https://www.amazon.com.br/s?k=cafe+em+graos"
    ],
    "magalu": [
        "https://www.magazineluiza.com.br/busca/fralda+infantil/",
        "https://www.magazineluiza.com.br/busca/suplemento/",
        "https://www.magazineluiza.com.br/busca/pneu/"
    ],
    "kabum": [
        "https://www.kabum.com.br/busca/cafeteira",
        "https://www.kabum.com.br/busca/cadeira-ergonomica",
        "https://www.kabum.com.br/busca/teclado-mecanico"
    ]
}

@app.post("/check-price")
def check_price(request: PriceCheckRequest):
    try:
        # 1. O NAVEGADOR FANTASMA TIRA A FOTO ANÔNIMA
        print("📸 Tirando print anônimo da página...")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            page.goto(request.url, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(3000) # Espera 3 segs para carregar
            screenshot_bytes = page.screenshot()
            browser.close()

        anon_image_base64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
        user_image_base64 = request.user_image # A extensão já manda no formato data:image/...

        # 2. A INTELIGÊNCIA ARTIFICIAL ANALISA AS DUAS FOTOS AO MESMO TEMPO
        print("🧠 Enviando as DUAS imagens para a OpenAI comparar...")
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={ "type": "json_object" },
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "A Imagem 1 é a tela de um usuário logado. A Imagem 2 é uma navegação anônima do mesmo produto. Encontre o preço principal à vista em ambas. Retorne APENAS um JSON no formato: {\"logged_in_price\": 100.50, \"shadow_price\": 105.00}. Se não achar algum, retorne 0."},
                        {"type": "image_url", "image_url": {"url": user_image_base64}}, # Imagem 1
                        {"type": "image_url", "image_url": {"url": anon_image_base64}}  # Imagem 2
                    ]
                }
            ]
        )
        
        # 3. EXTRAI O RESULTADO
        result = json.loads(response.choices[0].message.content)
        user_price = float(result.get("logged_in_price", 0))
        anon_price = float(result.get("shadow_price", 0))

        # 🚨 MENSAGEM NOVA E AMIGÁVEL AQUI 🚨
        if user_price == 0 or anon_price == 0:
             raise HTTPException(
                 status_code=400, 
                 detail="Essa página não parece ser de um produto, ou a IA não conseguiu ler o preço. Entre na página de um produto específico e tente novamente!"
             )

        print(f"🎯 Preço Usuário: R$ {user_price} | Preço Anônimo: R$ {anon_price}")
        
        difference = user_price - anon_price
        is_inflated = difference > 1.0 
        
        return {
            "status": "success",
            "url": request.url,
            "logged_in_price": f"{user_price:.2f}",
            "shadow_price": f"{anon_price:.2f}",
            "is_inflated": is_inflated,
            "message": "🚩 Alerta! Preço inflado pelo seu perfil!" if is_inflated else "✅ Preço justo. Sem distorção no modo anônimo."
        }

    # 🚨 CORREÇÃO DO TRATAMENTO DE ERROS 🚨
    except HTTPException as http_exc:
        # Deixa a nossa mensagem amigável passar direto para o front-end
        raise http_exc
    except Exception as e:
        # Só cai aqui se a OpenAI cair ou o Playwright travar
        print(f"❌ Erro: {str(e)}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao analisar a página.")

@app.get("/generate-noise/{store}")
def generate_noise(store: str):
    links = NOISE_LINKS.get(store, [])
    if links:
        return {"noise_links": random.sample(links, min(2, len(links)))}
    return {"noise_links": []}
