const fs = require('fs');

// 📥 salvar lead
function salvarLead(numero, texto) {
    let leads = [];

    try {
        leads = JSON.parse(fs.readFileSync('leads.json'));
    } catch (e) {}

    leads.push({
        numero,
        texto,
        data: new Date()
    });

    fs.writeFileSync('leads.json', JSON.stringify(leads, null, 2));
}
