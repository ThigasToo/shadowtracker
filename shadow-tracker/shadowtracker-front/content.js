console.log("🕵️‍♂️ Shadow Checker: Aguardando clique no ícone da extensão...");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "iniciar_analise_visual") {
        showBanner("⏳ Inteligência Artificial analisando a tela... (Pode levar 20s)", "#F57C00", true);
        checkShadowPriceIA(request.url, request.userImage);
    }
});

async function checkShadowPriceIA(url, userImageBase64) {
    try {
        const response = await fetch("http://localhost:8000/check-price", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: url, user_image: userImageBase64 }) // Payload corrigido!
        });

        const data = await response.json();

        if (response.ok) {
            const cor = data.is_inflated ? '#d32f2f' : '#2e7d32'; 
            
            const html = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="opacity: 0.9;">Seu Preço:</span>
                    <strong style="font-size: 15px;">R$ ${data.logged_in_price}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="opacity: 0.9;">Preço Anônimo:</span>
                    <strong style="font-size: 15px;">R$ ${data.shadow_price}</strong>
                </div>
                <div style="font-size: 13px; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; margin-top: 5px;">
                    ${data.message}
                </div>
            `;
            showBanner(html, cor, false);
            injectNoise(url); 
        } else {
            showBanner(`❌ Erro: ${data.detail}`, "#d32f2f", false);
        }
    } catch (error) {
        console.error("Erro:", error);
        showBanner("❌ Falha de conexão. O servidor Python está rodando?", "#d32f2f", false);
    }
}

async function injectNoise(url) {
    console.log("🤫 Iniciando ofuscação de dados...");
    
    // Descobre a loja atual para pedir o ruído certo ao Python
    let store = "amazon"; // Padrão
    if (url.includes("mercadolivre")) store = "mercadolivre";
    else if (url.includes("magalu")) store = "magalu";
    else if (url.includes("kabum")) store = "kabum";

    try {
        const response = await fetch(`http://localhost:8000/generate-noise/${store}`);
        const data = await response.json();
        if (data.noise_links) {
            data.noise_links.forEach(link => {
                // Faz a requisição fantasma
                fetch(link, { mode: 'no-cors' }).then(() => console.log(`☢️ Ruído gerado silenciosamente: ${link}`));
            });
        }
    } catch (error) {
        console.log("Erro ao injetar ruído:", error);
    }
}

// Construtor do Banner Flutuante Premium
function showBanner(contentHTML, bgColor, isLoading) {
    let banner = document.getElementById('shadow-checker-banner');
    
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'shadow-checker-banner';
        document.body.appendChild(banner);

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideInRightSC {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            #close-shadow-banner:hover {
                background: rgba(255, 255, 255, 0.25) !important;
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }

    banner.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 2147483647;
        padding: 20px; background-color: ${bgColor}; color: white;
        border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
        min-width: 280px; border: 1px solid rgba(255,255,255,0.15);
        backdrop-filter: blur(8px);
        animation: slideInRightSC 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    `;

    banner.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; letter-spacing: 0.3px;">
            <span style="font-size: 18px;">🕵️‍♂️</span> Shadow Checker <span style="font-size: 11px; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; font-weight: normal;">Vision AI</span>
        </h3>
        <div style="font-size: 14px;">${contentHTML}</div>
        
        ${!isLoading ? `
        <div style="margin-top: 16px; text-align: right;">
            <button id="close-shadow-banner" style="
                background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); 
                color: white; padding: 6px 14px; cursor: pointer; border-radius: 6px;
                font-size: 13px; font-weight: 500; transition: all 0.2s ease;
            ">Fechar</button>
        </div>` : ''}
    `;

    if (!isLoading) {
        document.getElementById('close-shadow-banner').addEventListener('click', () => {
            banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            banner.style.opacity = '0';
            banner.style.transform = 'translateX(20px)';
            setTimeout(() => banner.remove(), 300);
        });
    }
}