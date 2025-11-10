import React, { useEffect } from 'react';
import Header from './Header';
import { getEnabled, setEnabled } from '../shared/storage';
export default function PanelRoot() {
  const [enabled, setEnabledState] = React.useState(true);

  useEffect(() => {
    let mounted = true;
    getEnabled().then((v) => { if (mounted) setEnabledState(Boolean(v)); });
    return () => { mounted = false; };
  }, []);

  function handleToggle(next) {
    setEnabledState(next);
    setEnabled(next);
    try {
      chrome.runtime.sendMessage({ type: 'THREEJS_TOOL_ENABLED', enabled: next });
    } catch (err) {
    }
  }

  if (!enabled) {
    return (
      <div style={{padding: 12}}>
        <Header enabled={enabled} onToggle={handleToggle} />
        <div style={{marginTop: 16}}>Three.js DevTools is currently <strong>disabled</strong>. Toggle the switch to re-enable.</div>
      </div>
    );
  }

  return (
    <div>
      <Header enabled={enabled} onToggle={handleToggle} />
      {/* rest of your panel UI goes here */}
      <div style={{padding: 12}}>Tool is enabled — your panel UI goes here.</div>
    </div>
  );
}
EOF
