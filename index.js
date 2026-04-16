const express = require('express');
const fs = require('fs');
const app = express();

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require('qrcode');

let qrGlobal = "";

async function startWhats() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true // 🔥 importante
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { qr, connection } = update;

        if (qr) {
            console.log("QR GERADO");
            qrGlobal = await QRCode.toDataURL(qr);
        }

        if (connection === "open") {
            console.log("WhatsApp conectado!");
        }

        if (connection === "close") {
            console.log("Conexão fechada, tentando reconectar...");
            startWhats();
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const texto = msg.message.conversation || "";
        const numero = msg.key.remoteJid;

        console.log("Lead:", numero, texto);

        await sock.sendMessage(numero, {
            text: "Olá! Digite:\n1 - INSS\n2 - Trabalhista"
        });
    });
}

startWhats();

app.get("/", (req, res) => {
    res.send("Sistema rodando");
});

app.get("/qr", (req, res) => {
    if (!qrGlobal) {
        return res.send("QR ainda não gerado, aguarde...");
    }
    res.send(`<img src="${qrGlobal}" />`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando");
});
