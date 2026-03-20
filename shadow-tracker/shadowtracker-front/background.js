// Este script roda invisível em segundo plano
chrome.action.onClicked.addListener(async (tab) => {
    console.log("Ícone clicado! Tentando falar com a aba...", tab.id);
    
    // Tira o print da tela logada
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 60 }, (dataUrl) => {
        // Envia a ordem para o content.js que está injetado na página
        chrome.tabs.sendMessage(tab.id, {
            action: "iniciar_analise_visual",
            userImage: dataUrl,
            url: tab.url
        }).catch(err => console.log("A página ainda não recarregou o content.js. Aperte F5 na loja!", err));
    });
});