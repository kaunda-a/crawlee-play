import fs from 'fs';
import path from 'path';

export class PluginLoader {
  private pluginsDir: string;
  private loadedPlugins: Map<string, any> = new Map();

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  loadPlugins() {
    const files = fs.readdirSync(this.pluginsDir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const pluginPath = path.join(this.pluginsDir, file);
        const plugin = require(pluginPath);
        this.loadedPlugins.set(file.replace('.js', ''), plugin);
      }
    }
  }

  getPlugin(name: string) {
    return this.loadedPlugins.get(name);
  }
}
