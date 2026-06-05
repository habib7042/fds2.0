import type { PagesFunction } from "@cloudflare/workers-types";
export const onRequest: PagesFunction = async ({ request }) => {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  server.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data as string);

      server.send(JSON.stringify({
        text: `Echo: ${data.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      server.send(JSON.stringify({
        text: `Echo: ${event.data}`,
        senderId: 'system',
        timestamp: new Date().toISOString()
      }));
    }
  });

  server.addEventListener('close', () => {
    console.log('WebSocket connection closed');
  });

  server.send(JSON.stringify({
    text: 'Welcome to Cloudflare Pages WebSocket Echo Server!',
    senderId: 'system',
    timestamp: new Date().toISOString()
  }));

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};
