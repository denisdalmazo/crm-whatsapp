const express = require('express');
const app = express();
app.use(express.json());

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require('qrcode');

let sock;

async function startWhats() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    sock = makeWASocket({
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔥 GERAR QR
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

    // 📩 RECEBER MENSAGEM
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const texto = msg.message.conversation || "";
        const numero = msg.key.remoteJid;

        console.log("Lead:", numero, texto);

        // 🤖 RESPOSTA AUTOMÁTICA
        await sock.sendMessage(numero, {
            text: "Olá! Atendimento Dalmazo & Co.\n\nDigite:\n1 - INSS\n2 - Trabalhista\n3 - Falar com humano"
        });
    });
}

startWhats();

app.get("/", (req, res) => {
    res.send("Sistema rodando");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando");
});
