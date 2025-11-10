import { getEnabled } from '../shared/storage';
import initializeThreeDevTools from './initialize'; 
getEnabled().then((enabled) => {
  if (!enabled) {
    try {
      chrome.runtime.onMessage.addListener((msg, sender, reply) => {
        if (msg && msg.type === 'THREEJS_TOOL_ENABLED' && msg.enabled) {
          location.reload();
        }
      });
    } catch (e) {
        console.log('Three.js DevTools: unable to set up message listener', e);
    }
    return;
  }
  initializeThreeDevTools();
});
EOF
