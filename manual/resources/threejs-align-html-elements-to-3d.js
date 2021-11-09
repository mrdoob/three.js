import {GUI} from '../../examples/jsm/libs/lil-gui.module.min.js';

{
  function outlineText(ctx, msg, x, y) {
    ctx.strokeText(msg, x, y);
    ctx.fillText(msg, x, y);
  }

  function arrow(ctx, x1, y1, x2, y2, start, end, size) {
    size = size || 1;
    const dx = x1 - x2;
    const dy = y1 - y2;
    const rot = -Math.atan2(dx, dy);
    const len = Math.sqrt(dx * dx + dy * dy);
    ctx.save();
    {
      ctx.translate(x1, y1);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -(len - 10 * size));
      ctx.stroke();
    }
    ctx.restore();
    if (start) {
      arrowHead(ctx, x1, y1, rot, size);
    }
    if (end) {
      arrowHead(ctx, x2, y2, rot + Math.PI, size);
    }
  }

  function arrowHead(ctx, x, y, rot, size) {
    ctx.save();
    {
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(size, size);
      ctx.translate(0, -10);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, -2);
      ctx.lineTo(0,  10);
      ctx.lineTo(5, -2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  const THREE = {
    MathUtils: {
      radToDeg(rad) {
        return rad * 180 / Math.PI;
      },
      degToRad(deg) {
        return deg * Math.PI / 180;
      },
    },
  };

  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  function dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
  }

  function distance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function normalize(x, y) {
    const l = distance(0, 0, x, y);
    if (l > 0.00001) {
      return [x / l, y / l];
    } else {
      return [0, 0];
    }
  }

  function resizeCanvasToDisplaySize(canvas, pixelRatio = 1) {
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      canvas.width = width;
      canvas.height = height;
    }
    return needResize;
  }

  const diagrams = {
    dotProduct: {
      create(info) {
        const {elem} = info;
        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.width = '100%';
        div.style.height = '100%';
        elem.appendChild(div);

        const ctx = document.createElement('canvas').getContext('2d');
        div.appendChild(ctx.canvas);
        const settings = {
          rotation: 0.3,
        };

        const gui = new GUI({autoPlace: false});
        gui.add(new DegRadHelper(settings, 'rotation'), 'value', -180, 180).name('rotation').onChange(render);
        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '0';
        gui.domElement.style.right = '0';
        div.appendChild(gui.domElement);

        const darkColors = {
          globe: 'green',
          camera: '#AAA',
          base: '#DDD',
          label: '#0FF',
        };
        const lightColors = {
          globe: '#0C0',
          camera: 'black',
          base: '#000',
          label: 'blue',
        };

        const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');
        darkMatcher.addEventListener('change', render);

        function render() {
          const {rotation} = settings;
          const isDarkMode = darkMatcher.matches;
          const colors = isDarkMode ? darkColors : lightColors;

          const pixelRatio = window.devicePixelRatio;
          resizeCanvasToDisplaySize(ctx.canvas, pixelRatio);

          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.save();
          {
            const width = ctx.canvas.width / pixelRatio;
            const height = ctx.canvas.height / pixelRatio;
            const min = Math.min(width, height);
            const half = min / 2;

            const r = half * 0.4;
            const x = r * Math.sin(-rotation);
            const y = r * Math.cos(-rotation);

            const camDX = x - 0;
            const camDY = y - (half - 40);

            const labelDir = normalize(x, y);
            const camToLabelDir = normalize(camDX, camDY);

            const dp = dot(...camToLabelDir, ...labelDir);

            ctx.scale(pixelRatio, pixelRatio);
            ctx.save();
            {
              {
                ctx.translate(width / 2, height / 2);
                ctx.beginPath();
                ctx.arc(0, 0, half * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = colors.globe;
                ctx.fill();

                ctx.save();
                {
                  ctx.fillStyle = colors.camera;
                  ctx.translate(0, half);
                  ctx.fillRect(-15, -30, 30, 30);
                  ctx.beginPath();
                  ctx.moveTo(0, -25);
                  ctx.lineTo(-25, -50);
                  ctx.lineTo( 25, -50);
                  ctx.closePath();
                  ctx.fill();
                }
                ctx.restore();

                ctx.save();
                {
                  ctx.lineWidth = 4;
                  ctx.strokeStyle = colors.camera;
                  ctx.fillStyle = colors.camera;
                  arrow(ctx, 0, half - 40, x, y, false, true, 2);

                  ctx.save();
                  {
                    ctx.strokeStyle = colors.label;
                    ctx.fillStyle = colors.label;
                    arrow(ctx, 0, 0, x, y, false, true, 2);
                  }
                  ctx.restore();

                  {
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'black';
                    ctx.fillStyle = dp < 0 ? 'white' : 'red';
                    ctx.font = '20px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    outlineText(ctx, 'label', x, y);
                  }
                }
                ctx.restore();

              }
              ctx.restore();
            }

            ctx.lineWidth = 3;
            ctx.font = '24px sans-serif';
            ctx.strokeStyle = 'black';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.save();
            {
              ctx.translate(width / 4, 80);
              const textColor = dp < 0 ? colors.base : 'red';
              advanceText(ctx, textColor, 'dot( ');
              ctx.save();
              {
                ctx.fillStyle = colors.camera;
                ctx.strokeStyle = colors.camera;
                ctx.rotate(Math.atan2(camDY, camDX));
                arrow(ctx, -8, 0, 8, 0, false, true, 1);
              }
              ctx.restore();
              advanceText(ctx, textColor, ' ,  ');
              ctx.save();
              {
                ctx.fillStyle = colors.label;
                ctx.strokeStyle = colors.label;
                ctx.rotate(rotation + Math.PI * 0.5);
                arrow(ctx, -8, 0, 8, 0, false, true, 1);
              }
              ctx.restore();
              advanceText(ctx, textColor, ` ) = ${dp.toFixed(2)}`);
            }
            ctx.restore();
          }
          ctx.restore();
        }
        render();
        window.addEventListener('resize', render);
      },
    },
  };

  function advanceText(ctx, color, str) {
    ctx.fillStyle = color;
    ctx.fillText(str, 0, 0);
    ctx.translate(ctx.measureText(str).width, 0);
  }

  [...document.querySelectorAll('[data-diagram]')].forEach(createDiagram);

  function createDiagram(base) {
    const name = base.dataset.diagram;
    const info = diagrams[name];
    if (!info) {
      throw new Error(`no diagram ${name}`);
    }
    info.create({elem:base});
  }
}


