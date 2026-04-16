const express = require('express');
const app = express();
app.use(express.json());

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

let sock;

async function startWhats() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    sock = makeWASocket({
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const texto = msg.message.conversation || "";
        const numero = msg.key.remoteJid;

        console.log("Novo lead:", numero, texto);

        // RESPOSTA AUTOMÁTICA
        await sock.sendMessage(numero, {
            text: "Olá! Recebemos sua mensagem. Digite:\n1 - Previdenciário\n2 - Trabalhista"
        });
    });
}

startWhats();

app.get("/", (req, res) => {
    res.send("CRM + WhatsApp rodando");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando");
});
