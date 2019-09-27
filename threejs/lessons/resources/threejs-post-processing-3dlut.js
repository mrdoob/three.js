{
    class Waiter {
      constructor() {
        this.promise = new Promise((resolve) => {
          this.resolve = resolve;
        });
      }
    }

    async function getSVGDocument(elem) {
      const data = elem.data;
      elem.data = '';
      elem.data = data;
      const waiter = new Waiter();
      elem.addEventListener('load', waiter.resolve);
      await waiter.promise;
      return elem.getSVGDocument();
    }

  const diagrams = {
    lookup: {
      async init(elem) {
        const svg = await getSVGDocument(elem);
        const partsByName = {};
        [
          '[id$=-Input]',
          '[id$=-Output]',
          '[id$=-Result]',
        ].map((selector) => {
          [...svg.querySelectorAll('[id^=Effect]')].forEach((elem) => {
            // because affinity designer doesn't export blend modes (T_T)
            // and because I'd prefer not to have to manually fix things as I edit.
            // I suppose I could add a build process.
            elem.style.mixBlendMode = elem.id.split('-')[1];
          });
          [...svg.querySelectorAll(selector)].forEach((elem) => {
            const [name, type] = elem.id.split('-');
            partsByName[name] = partsByName[name] || {};
            partsByName[name][type] = elem;
            elem.style.visibility = 'hidden';
          });
        });
        const parts = Object.keys(partsByName).sort().map(k => partsByName[k]);
        let ndx = 0;
        let step = 0;
        let delay = 0;
        setInterval(() => {
          const part = parts[ndx];
          switch (step) {
            case 0:
              part.Input.style.visibility = '';
              ++step;
              break;
            case 1:
              part.Output.style.visibility = '';
              ++step;
              break;
            case 2:
              part.Result.style.visibility = '';
              ++step;
              break;
            case 3:
              part.Input.style.visibility = 'hidden';
              part.Output.style.visibility = 'hidden';
              ndx = (ndx + 1) % parts.length;
              if (ndx === 0) {
                step = 4;
                delay = 4;
              } else {
                step = 0;
              }
              break;
            case 4:
              --delay;
              if (delay <= 0) {
                for (const part of parts) {
                  for (const elem of Object.values(part)) {
                    elem.style.visibility = 'hidden';
                  }
                }
                step = 0;
              }
              break;
          }
        }, 500);
      },
    },
  };

  [...document.querySelectorAll('[data-diagram]')].forEach(createDiagram);

  function createDiagram(base) {
    const name = base.dataset.diagram;
    const info = diagrams[name];
    if (!info) {
      throw new Error(`no diagram ${name}`);
    }
    info.init(base);
  }
}

