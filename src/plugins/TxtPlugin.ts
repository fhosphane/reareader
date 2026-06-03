import { invoke } from '@tauri-apps/api/core';
import type { ReaderPlugin } from '../core/types';

export const TxtPlugin: ReaderPlugin = {
  name: 'txt-plugin',
  version: '1.0.0',
  supportedFormats: ['txt'],

  // Check if this plugin can handle the given file
  canRead(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.txt');
  },

  // Read the content of a TXT file via Tauri backend
  async readContent(filePath: string): Promise<string> {
    const content = await invoke<string>('read_text_file', { filePath });
    return content;
  },
};
