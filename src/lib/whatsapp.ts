import {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState as useBaileysAuthState,
    WASocket,
    ConnectionState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Store the socket in a global variable to persist across HMR/API calls in dev
// In production, this works because the process stays alive
let sock: WASocket | null = null;
let qrCode: string | null = null;
let connectionStatus: 'open' | 'connecting' | 'close' = 'close';

const AUTH_FOLDER = path.join(process.cwd(), 'auth_info_baileys');

export async function connectToWhatsApp() {
    if (sock) return sock;

    const { state, saveCreds } = await useBaileysAuthState(AUTH_FOLDER);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Log QR to terminal for server view
        logger: pino({ level: 'silent' }) as unknown as any,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCode = qr;
            console.log('Update QR Code');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            connectionStatus = 'close';
            qrCode = null;

            if (shouldReconnect) {
                // Determine restart
                sock = null;
                setTimeout(connectToWhatsApp, 3000); // Retry in 3s
            } else {
                // Logged out
                if (fs.existsSync(AUTH_FOLDER)) {
                    fs.rmdirSync(AUTH_FOLDER, { recursive: true });
                }
                sock = null;
            }
        } else if (connection === 'open') {
            console.log('Opened connection');
            connectionStatus = 'open';
            qrCode = null;
        } else if (connection === 'connecting') {
            connectionStatus = 'connecting';
        }
    });

    return sock;
}

export const WA = {
    async getStatus() {
        if (!sock) await connectToWhatsApp();
        return {
            status: connectionStatus,
            qr: qrCode
        };
    },

    async sendMessage(to: string, text: string) {
        if (!sock) throw new Error('WA Client not connected');
        // Format ID
        const id = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await sock.sendMessage(id, { text });
        return true;
    },

    // Force strict connect
    init: () => connectToWhatsApp()
};
