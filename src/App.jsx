import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { pluginManager } from './core/plugins/PluginManager';
import { TxtPlugin } from './plugins/TxtPlugin';
import { initDatabase, savePosition, loadPosition } from './core/db/database';

// Register plugins
pluginManager.register(TxtPlugin);

export default function App() {
  const [content, setContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [dbReady, setDbReady] = useState(false);

  // Initialize database on startup
  useEffect(() => {
    initDatabase().then(() => setDbReady(true));
  }, []);

  // Open file dialog and read selected file
  async function handleOpenFile() {
    const selected = await open({
      filters: [{ name: 'Text Files', extensions: ['txt'] }],
    });

    if (!selected) return;

    const path = typeof selected === 'string' ? selected : selected[0];
    const plugin = pluginManager.getPluginForFile(path);

    if (!plugin) {
      alert('No plugin found for this file type.');
      return;
    }

    const text = await plugin.readContent(path);
    setFilePath(path);
    setContent(text);

    // Load saved position if exists
    if (dbReady) {
      const pos = await loadPosition(path);
      if (pos) {
        const el = document.getElementById('reader');
        if (el) {
          el.scrollTop = (pos.percentage / 100) * el.scrollHeight;
        }
      }
    }
  }

  // Save position on scroll
  async function handleScroll(e) {
    if (!filePath || !dbReady) return;
    const el = e.target;
    const percent = (el.scrollTop / el.scrollHeight) * 100;
    setScrollPercent(Math.round(percent));

    await savePosition({
      bookId: filePath,
      position: el.scrollTop,
      percentage: percent,
      updatedAt: Date.now(),
    });
  }

  // Close the current file
  function handleClose() {
    setContent('');
    setFilePath('');
    setScrollPercent(0);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a1a', color: '#e0e0e0', fontFamily: 'Georgia, serif' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 16px', background: '#2a2a2a', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={handleOpenFile} style={btnStyle}>Open File</button>
        {filePath && (
          <>
            <span style={{ fontSize: '13px', opacity: 0.6, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {filePath}
            </span>
            <span style={{ fontSize: '13px', opacity: 0.6 }}>{scrollPercent}%</span>
            <button onClick={handleClose} style={btnStyle}>Close</button>
          </>
        )}
      </div>

      {/* Reader */}
      {content ? (
        <div
          id="reader"
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '40px 15%', lineHeight: '1.8', fontSize: '18px', whiteSpace: 'pre-wrap' }}
        >
          {content}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
          Open a .txt file to start reading
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '6px 14px',
  background: '#3a3a3a',
  color: '#e0e0e0',
  border: '1px solid #555',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
};
