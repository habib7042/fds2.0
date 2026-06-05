'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  text: string;
  senderId: string;
  timestamp: string;
}

export default function SocketDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Protocol handling (ws vs wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/websocket`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages(prev => [...prev, msg]);
      } catch (e) {
        setMessages(prev => [...prev, {
          text: event.data,
          senderId: 'system',
          timestamp: new Date().toISOString()
        }]);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && inputMessage.trim()) {
      const msg = {
        text: inputMessage.trim(),
        senderId: 'user',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, msg]);
      ws.current.send(JSON.stringify(msg));
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Cloudflare Pages WebSocket Demo
            <span className={`text-sm px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-80 w-full border rounded-md p-4">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {msg.senderId}
                        </p>
                        <p className="text-gray-900">{msg.text}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!isConnected || !inputMessage.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
