import type { AppEvent, AppEventType } from '../types';

// Callback type for event listeners
type EventCallback<T = unknown> = (event: AppEvent<T>) => void;

export class EventBus {
  private listeners: Map<AppEventType, EventCallback[]> = new Map();

  // Subscribe to an event
  on<T>(type: AppEventType, callback: EventCallback<T>): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback as EventCallback);
  }

  // Unsubscribe from an event
  off<T>(type: AppEventType, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(type);
    if (!callbacks) return;
    this.listeners.set(
      type,
      callbacks.filter((cb) => cb !== callback)
    );
  }

  // Emit an event to all listeners
  emit<T>(type: AppEventType, payload: T): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const callbacks = this.listeners.get(type) ?? [];
    callbacks.forEach((cb) => cb(event as AppEvent));
  }

  // Remove all listeners for a given event type
  clear(type?: AppEventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }
}

// Singleton instance — use this throughout the app
export const eventBus = new EventBus();
