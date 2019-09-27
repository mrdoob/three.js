const handlers = {
  onDropFile: () => {},
};

export function setup(options) {
  const html = `
  <style>
    .dragInfo {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .9);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dragInfo>div {
        padding: 1em;
        background: blue;
        color: white;
        pointer-events: none;
    }
    .dragerror div {
        background: red !important;
        font-weight: bold;
        color: white;
    }
  </style>
  <div class="dragInfo" style="display: none;">
    <div>
       ${options.msg}
    </div>
  </div>
  `;

  const elem = document.createElement('div');
  elem.innerHTML = html;
  document.body.appendChild(elem);

  const dragInfo = document.querySelector('.dragInfo');
  function showDragInfo(show) {
    dragInfo.style.display = show ? '' : 'none';
  }

  document.body.addEventListener('dragenter', () => {
    showDragInfo(true);
  });

  const dragElem = dragInfo;

  dragElem.addEventListener('dragover', (e) => {
    e.preventDefault();
    return false;
  });

  dragElem.addEventListener('dragleave', () => {
    showDragInfo(false);
    return false;
  });

  dragElem.addEventListener('dragend', () => {
    showDragInfo(false);
    return false;
  });

  dragElem.addEventListener('drop', (e) => {
    e.preventDefault();
    showDragInfo(false);
    if (e.dataTransfer.items && e.dataTransfer.items) {
      let fileNdx = 0;
      for (let i = 0; i < e.dataTransfer.items.length; ++i) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          handlers.onDropFile(item.getAsFile(), fileNdx++);
        }
      }
    }

    return false;
  });

}

export function onDropFile(fn) {
  handlers.onDropFile = fn;
}

