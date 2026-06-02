import type { ReaderPlugin } from '../types';
import { eventBus } from '../events/EventBus';

export class PluginManager {
  private plugins: Map<string, ReaderPlugin> = new Map();

  // Register a new plugin
  register(plugin: ReaderPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered.`);
      return;
    }

    this.plugins.set(plugin.name, plugin);

    eventBus.emit('plugin:registered', {
      name: plugin.name,
      version: plugin.version,
      supportedFormats: plugin.supportedFormats,
    });

    console.log(`Plugin registered: ${plugin.name} v${plugin.version}`);
  }

  // Unregister a plugin by name
  unregister(name: string): void {
    this.plugins.delete(name);
  }

  // Find a plugin that can handle the given file
  getPluginForFile(filePath: string): ReaderPlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.canRead(filePath)) {
        return plugin;
      }
    }
    return undefined;
  }

  // Get all registered plugins
  getAll(): ReaderPlugin[] {
    return Array.from(this.plugins.values());
  }

  // Check if a plugin is registered
  has(name: string): boolean {
    return this.plugins.has(name);
  }
}

// Singleton instance — use this throughout the app
export const pluginManager = new PluginManager();
