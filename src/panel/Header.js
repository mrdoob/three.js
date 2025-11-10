import React from 'react';

export default function Header({ enabled, onToggle }) {
  return (
    <div className="header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #eee'}}>
      <div style={{fontWeight: 600}}>Three.js DevTools</div>
      <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 12}}>{enabled ? 'Enabled' : 'Disabled'}</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          aria-label="Enable Three.js DevTools"
        />
      </label>
    </div>
  );
}
