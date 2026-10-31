import { Response } from 'express';

interface Client {
  id: string;
  res: Response;
  teamId: string;
}

class SseHub {
  private clients: Map<string, Client[]> = new Map();

  addClient(teamId: string, clientId: string, res: Response) {
    const list = this.clients.get(teamId) || [];
    list.push({ id: clientId, res, teamId });
    this.clients.set(teamId, list);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', teamId })}\n\n`);

    // Handle connection close
    res.on('close', () => {
      this.removeClient(teamId, clientId);
    });
  }

  removeClient(teamId: string, clientId: string) {
    const list = this.clients.get(teamId);
    if (!list) return;
    const filtered = list.filter((c) => c.id !== clientId);
    if (filtered.length > 0) {
      this.clients.set(teamId, filtered);
    } else {
      this.clients.delete(teamId);
    }
  }

  broadcast(teamId: string, eventType: string, payload: any) {
    const list = this.clients.get(teamId);
    if (!list || list.length === 0) return;

    const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
    for (const client of list) {
      try {
        client.res.write(`data: ${data}\n\n`);
      } catch (err) {
        console.error('Error writing to SSE client:', err);
      }
    }
  }
}

export const sseHub = new SseHub();
