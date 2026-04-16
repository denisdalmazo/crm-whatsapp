const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require('qrcode');

let sock;

// 📥 SALVAR LEAD
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

// 🚀 INICIAR WHATSAPP
async function startWhats() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    sock = makeWASocket({
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔥 GERAR QR CODE
    sock.ev.on("connection.update", async (update) => {
        const { qr } = update;

        if (qr) {
            console.log("QR GERADO");

            const qrImage = await QRCode.toDataURL(qr);

            app.get("/qr", (req, res) => {
                res.send(`<img src="${qrImage}" />`);
            });
        }
    });

    // 📩 RECEBER MENSAGENS
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const texto = msg.message.conversation || "";
        const numero = msg.key.remoteJid;

        console.log("Lead:", numero, texto);

        // 💾 SALVA NO "CRM"
        salvarLead(numero, texto);

        // 🤖 RESPOSTA AUTOMÁTICA
        await sock.sendMessage(numero, {
            text: "Olá! Atendimento Dalmazo & Co.\n\nDigite:\n1 - INSS\n2 - Trabalhista\n3 - Falar com humano"
        });
    });
}

startWhats();

// 🌐 ROTA PRINCIPAL
app.get("/", (req, res) => {
    res.send("Sistema rodando");
});

// 📊 VER LEADS
app.get("/leads", (req, res) => {
    try {
        const leads = JSON.parse(fs.readFileSync('leads.json'));
        res.json(leads);
    } catch (e) {
        res.json([]);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando");
});
