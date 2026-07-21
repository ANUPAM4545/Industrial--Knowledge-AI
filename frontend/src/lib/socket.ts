// NEXO Enterprise SSE Client
import { api } from './api';

type EventHandler = (data: any) => void;

export class NotificationClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('nexo_token');
    const workspaceId = localStorage.getItem('nexo_workspace_id');
    
    // Pass auth via query params for EventSource
    const url = new URL(`${api.getBaseUrl()}/notifications/stream`);
    if (token) url.searchParams.append('token', token);
    if (workspaceId) url.searchParams.append('workspace_id', workspaceId);

    this.eventSource = new EventSource(url.toString());

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        if (data.type) {
          this.emit(data.type, data.payload || data);
        }
      } catch (e) {
        console.error('Error parsing SSE message', e);
      }
    };

    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.emit('connected', null);
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.eventSource.onerror = (error) => {
      this.isConnected = false;
      this.emit('error', error);
      this.eventSource?.close();
      
      // Auto-reconnect
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    };
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    if (this.handlers.has(event)) {
      this.handlers.get(event)!.delete(handler);
    }
  }

  private emit(event: string, data: any) {
    if (this.handlers.has(event)) {
      this.handlers.get(event)!.forEach(handler => handler(data));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }
}

export const notificationClient = new NotificationClient();
