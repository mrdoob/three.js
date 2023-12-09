class Panel {
  constructor(name, fg, bg) {
    this.name = name;
    this.fg = fg;
    this.bg = bg;
    this.PR = Math.round(window.devicePixelRatio || 1);
    this.WIDTH = 90 * this.PR;
    this.HEIGHT = 48 * this.PR;
    this.TEXT_X = 3 * this.PR;
    this.TEXT_Y = 2 * this.PR;
    this.GRAPH_X = 3 * this.PR;
    this.GRAPH_Y = 15 * this.PR;
    this.GRAPH_WIDTH = 84 * this.PR;
    this.GRAPH_HEIGHT = 30 * this.PR;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 90 * this.PR;
    this.canvas.height = 48 * this.PR;
    this.canvas.style.width = "90px";
    this.canvas.style.position = "absolute";
    this.canvas.style.height = "48px";
    this.canvas.style.cssText = "width:90px;height:48px";
    this.context = this.canvas.getContext("2d");
    if (this.context) {
      this.context.font = "bold " + 9 * this.PR + "px Helvetica,Arial,sans-serif";
      this.context.textBaseline = "top";
      this.context.fillStyle = this.bg;
      this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.fillStyle = this.fg;
      this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y);
      this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
      this.context.fillStyle = this.bg;
      this.context.globalAlpha = 0.9;
      this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
    }
  }
  update(value, valueGraph, maxValue, maxGraph, decimals = 0) {
    let min = Infinity, max = 0;
    if (!this.context)
      return;
    min = Math.min(min, value);
    max = Math.max(maxValue, value);
    maxGraph = Math.max(maxGraph, valueGraph);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
    this.context.fillStyle = this.fg;
    this.context.fillText(value.toFixed(decimals) + " " + this.name + " (" + min.toFixed(decimals) + "-" + parseFloat(max.toFixed(decimals)) + ")", this.TEXT_X, this.TEXT_Y);
    this.context.drawImage(this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);
    this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, (1 - valueGraph / maxGraph) * this.GRAPH_HEIGHT);
  }
}
;
const _Stats = class _Stats {
  constructor({ logsPerSecond = 20, samplesLog = 100, samplesGraph = 10, precision = 2, minimal = false, horizontal = true, mode = 0 } = {}) {
    this.totalCpuDuration = 0;
    this.totalGpuDuration = 0;
    this.totalFps = 0;
    this.gpuQueries = [];
    this.renderCount = 0;
    this.mode = mode;
    this.horizontal = horizontal;
    this.dom = document.createElement("div");
    this.dom.style.cssText = "position:fixed;top:0;left:0;opacity:0.9;z-index:10000;";
    if (minimal) {
      this.dom.style.cssText += "cursor:pointer";
    }
    this.gl = null;
    this.query = null;
    this.minimal = minimal;
    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.prevCpuTime = this.beginTime;
    this.frames = 0;
    this.renderCount = 0;
    this.threeRendererPatched = false;
    this.averageCpu = {
      logs: [],
      graph: []
    };
    this.averageGpu = {
      logs: [],
      graph: []
    };
    this.queryCreated = false;
    this.fpsPanel = this.addPanel(new _Stats.Panel("FPS", "#0ff", "#002"), 0);
    this.msPanel = this.addPanel(new _Stats.Panel("CPU", "#0f0", "#020"), 1);
    this.gpuPanel = null;
    this.samplesLog = samplesLog;
    this.samplesGraph = samplesGraph;
    this.precision = precision;
    this.logsPerSecond = logsPerSecond;
    if (this.minimal) {
      this.dom.addEventListener("click", (event) => {
        event.preventDefault();
        this.showPanel(++this.mode % this.dom.children.length);
      }, false);
      this.mode = mode;
      this.showPanel(this.mode);
    } else {
      window.addEventListener("resize", () => {
        this.resizePanel(this.fpsPanel, 0);
        this.resizePanel(this.msPanel, 1);
        if (this.gpuPanel) {
          this.resizePanel(this.gpuPanel, 2);
        }
      });
    }
  }
  patchThreeRenderer(renderer) {
    const originalRenderMethod = renderer.render;
    const statsInstance = this;
    renderer.render = function(scene, camera) {
      statsInstance.begin();
      originalRenderMethod.call(this, scene, camera);
      statsInstance.end();
    };
    this.threeRendererPatched = true;
  }
  resizePanel(panel, offset) {
    panel.canvas.style.position = "absolute";
    if (this.minimal) {
      panel.canvas.style.display = "none";
    } else {
      panel.canvas.style.display = "block";
      if (this.horizontal) {
        panel.canvas.style.top = "0px";
        panel.canvas.style.left = offset * panel.WIDTH / panel.PR + "px";
      } else {
        panel.canvas.style.left = "0px";
        panel.canvas.style.top = offset * panel.HEIGHT / panel.PR + "px";
      }
    }
  }
  addPanel(panel, offset) {
    if (panel.canvas) {
      this.dom.appendChild(panel.canvas);
      this.resizePanel(panel, offset);
    }
    return panel;
  }
  showPanel(id) {
    for (let i = 0; i < this.dom.children.length; i++) {
      const child = this.dom.children[i];
      child.style.display = i === id ? "block" : "none";
    }
    this.mode = id;
  }
  init(canvasOrGL) {
    if (!canvasOrGL) {
      console.error('Stats: The "canvas" parameter is undefined.');
      return;
    }
    if (canvasOrGL.isWebGLRenderer && !this.threeRendererPatched) {
      const canvas = canvasOrGL;
      this.patchThreeRenderer(canvas);
      this.gl = canvas.getContext();
    }
    if (!this.gl && canvasOrGL instanceof WebGL2RenderingContext) {
      this.gl = canvasOrGL;
    } else if (!this.gl && canvasOrGL instanceof HTMLCanvasElement || canvasOrGL instanceof OffscreenCanvas) {
      this.gl = canvasOrGL.getContext("webgl2");
      if (!this.gl) {
        console.error("Stats: Unable to obtain WebGL2 context.");
        return;
      }
    } else if (!this.gl) {
      console.error("Stats: Invalid input type. Expected WebGL2RenderingContext, HTMLCanvasElement, or OffscreenCanvas.");
      return;
    }
    this.ext = this.gl.getExtension("EXT_disjoint_timer_query_webgl2");
    if (this.ext) {
      this.gpuPanel = this.addPanel(new _Stats.Panel("GPU", "#ff0", "#220"), 2);
    }
  }
  begin() {
    this.beginProfiling("cpu-started");
    if (!this.gl || !this.ext)
      return;
    const query = this.gl.createQuery();
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, query);
    this.gpuQueries.push({ query, startTime: (performance || Date).now() });
  }
  end() {
    this.renderCount++;
    this.endProfiling("cpu-started", "cpu-finished", "cpu-duration", this.averageCpu);
    if (this.gl && this.ext && this.gpuQueries.length > 0) {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    }
  }
  processGpuQueries() {
    if (!this.gl || !this.ext)
      return;
    this.gpuQueries = this.gpuQueries.filter((queryInfo) => {
      if (this.gl) {
        const available = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT_AVAILABLE);
        const disjoint = this.gl.getParameter(this.ext.GPU_DISJOINT_EXT);
        if (available && !disjoint) {
          const elapsed = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT);
          const duration = elapsed * 1e-6;
          this.totalGpuDuration += duration;
          this.gl.deleteQuery(queryInfo.query);
          return false;
        }
        return true;
      }
    });
  }
  update() {
    this.processGpuQueries();
    this.addToAverage(this.totalCpuDuration, this.averageCpu);
    this.addToAverage(this.totalGpuDuration, this.averageGpu);
    this.renderCount = 0;
    this.totalCpuDuration = 0;
    this.totalGpuDuration = 0;
    this.totalFps = 0;
    this.beginTime = this.endInternal();
  }
  endInternal() {
    this.frames++;
    const time = (performance || Date).now();
    if (time >= this.prevCpuTime + 1e3 / this.logsPerSecond) {
      this.updatePanel(this.msPanel, this.averageCpu);
      this.updatePanel(this.gpuPanel, this.averageGpu);
      this.prevCpuTime = time;
    }
    if (time >= this.prevTime + 1e3) {
      const fps = this.frames * 1e3 / (time - this.prevTime);
      this.fpsPanel.update(fps, fps, 100, 100, 0);
      this.prevTime = time;
      this.frames = 0;
    }
    return time;
  }
  addToAverage(value, averageArray) {
    averageArray.logs.push(value);
    if (averageArray.logs.length > this.samplesLog * this.renderCount) {
      averageArray.logs.shift();
    }
    averageArray.graph.push(value);
    if (averageArray.graph.length > this.samplesGraph * this.renderCount) {
      averageArray.graph.shift();
    }
  }
  beginProfiling(marker) {
    if (window.performance) {
      window.performance.mark(marker);
    }
  }
  endProfiling(startMarker, endMarker, measureName, averageArray) {
    if (window.performance && endMarker) {
      window.performance.mark(endMarker);
      const cpuMeasure = performance.measure(measureName, startMarker, endMarker);
      this.totalCpuDuration += cpuMeasure.duration;
    }
  }
  updatePanel(panel, averageArray) {
    if (averageArray.logs.length > 0) {
      let sumLog = 0;
      let max = 0.01;
      for (let i = 0; i < averageArray.logs.length; i++) {
        sumLog += averageArray.logs[i];
        if (averageArray.logs[i] > max) {
          max = averageArray.logs[i];
        }
      }
      let sumGraph = 0;
      let maxGraph = 0.01;
      for (let i = 0; i < averageArray.graph.length; i++) {
        sumGraph += averageArray.graph[i];
        if (averageArray.graph[i] > maxGraph) {
          maxGraph = averageArray.graph[i];
        }
      }
      if (panel) {
        panel.update(sumLog / Math.min(averageArray.logs.length, this.samplesLog), sumGraph / Math.min(averageArray.graph.length, this.samplesGraph), max, maxGraph, this.precision);
      }
    }
  }
  get domElement() {
    return this.dom;
  }
  get container() {
    console.warn("Stats: Deprecated! this.container as been replaced to this.dom ");
    return this.dom;
  }
};
_Stats.Panel = Panel;
let Stats = _Stats;
export {
  Stats as default
};
//# sourceMappingURL=main.js.map
