import { WebSocketServer } from "ws";


const wss = new WebSocketServer({port: 7070});

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});


export async function sendAlert(data) {
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}