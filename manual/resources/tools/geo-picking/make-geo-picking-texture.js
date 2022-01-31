'use strict';

/* global shapefile */

/* eslint no-console: off */
/* eslint no-unused-vars: off */

async function main() {
  const size = 4096;
  const pickCtx = document.querySelector('#pick').getContext('2d');
  pickCtx.canvas.width = size;
  pickCtx.canvas.height = size;

  const outlineCtx = document.querySelector('#outline').getContext('2d');
  outlineCtx.canvas.width = size;
  outlineCtx.canvas.height = size;
  outlineCtx.translate(outlineCtx.canvas.width / 2, outlineCtx.canvas.height / 2);
  outlineCtx.scale(outlineCtx.canvas.width / 360, outlineCtx.canvas.height / -180);
  outlineCtx.strokeStyle = '#FFF';

  const workCtx = document.createElement('canvas').getContext('2d');
  workCtx.canvas.width = size;
  workCtx.canvas.height = size;

  let id = 1;
  const countryData = {};
  const countriesById = [];
  let min;
  let max;

  function resetMinMax() {
    min = [ 10000,  10000];
    max = [-10000, -10000];
  }

  function minMax(p) {
    min[0] = Math.min(min[0], p[0]);
    min[1] = Math.min(min[1], p[1]);
    max[0] = Math.max(max[0], p[0]);
    max[1] = Math.max(max[1], p[1]);
  }

  const geoHandlers = {
    'MultiPolygon': multiPolygonArea,
    'Polygon': polygonArea,
  };

  function multiPolygonArea(ctx, geo, drawFn) {
    const {coordinates} = geo;
    for (const polygon of coordinates) {
      ctx.beginPath();
      for (const ring of polygon) {
        ring.forEach(minMax);
        ctx.moveTo(...ring[0]);
        for (let i = 0; i < ring.length; ++i) {
          ctx.lineTo(...ring[i]);
        }
        ctx.closePath();
      }
      drawFn(ctx);
    }
  }

  function polygonArea(ctx, geo, drawFn) {
    const {coordinates} = geo;
    ctx.beginPath();
    for (const ring of coordinates) {
      ring.forEach(minMax);
      ctx.moveTo(...ring[0]);
      for (let i = 0; i < ring.length; ++i) {
        ctx.lineTo(...ring[i]);
      }
      ctx.closePath();
    }
    drawFn(ctx);
  }

  function fill(ctx) {
    ctx.fill('evenodd');
  }

  // function stroke(ctx) {
  //   ctx.save();
  //   ctx.setTransform(1, 0, 0, 1, 0, 0);
  //   ctx.stroke();
  //   ctx.restore();
  // }

  function draw(area) {
    const {properties, geometry} = area;
    const {type} = geometry;
    const name = properties.NAME;

    console.log(name);

    if (!countryData[name]) {
      const r = (id >>  0) & 0xFF;
      const g = (id >>  8) & 0xFF;
      const b = (id >> 16) & 0xFF;

      countryData[name] = {
        color: [r, g, b],
        id: id++,
      };
      countriesById.push({name});
    }
    const countryInfo = countriesById[countryData[name].id - 1];

    const handler = geoHandlers[type];
    if (!handler) {
      throw new Error('unknown geometry type.');
    }

    resetMinMax();

    workCtx.save();
    workCtx.clearRect(0, 0, workCtx.canvas.width, workCtx.canvas.height);
    workCtx.fillStyle = '#000';
    workCtx.strokeStyle = '#000';
    workCtx.translate(workCtx.canvas.width / 2, workCtx.canvas.height / 2);
    workCtx.scale(workCtx.canvas.width / 360, workCtx.canvas.height / -180);

    handler(workCtx, geometry, fill);

    workCtx.restore();

    countryInfo.min = min;
    countryInfo.max = max;
    countryInfo.area = properties.AREA;
    countryInfo.lat = properties.LAT;
    countryInfo.lon = properties.LON;
    countryInfo.population = {
      '2005': properties.POP2005,
    };

    //
    const left   = Math.floor(( min[0] + 180) * workCtx.canvas.width  / 360);
    const bottom = Math.floor((-min[1] +  90) * workCtx.canvas.height / 180);
    const right  = Math.ceil( ( max[0] + 180) * workCtx.canvas.width  / 360);
    const top    = Math.ceil( (-max[1] +  90) * workCtx.canvas.height / 180);
    const width  = right - left + 1;
    const height = Math.max(1, bottom - top + 1);

    const color = countryData[name].color;
    const src = workCtx.getImageData(left, top, width, height);
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const off = (y * width + x) * 4;
        if (src.data[off + 3]) {
          src.data[off + 0] = color[0];
          src.data[off + 1] = color[1];
          src.data[off + 2] = color[2];
          src.data[off + 3] = 255;
        }
      }
    }
    workCtx.putImageData(src, left, top);
    pickCtx.drawImage(workCtx.canvas, 0, 0);

//    handler(outlineCtx, geometry, stroke);
  }

  const source = await shapefile.open('TM_WORLD_BORDERS-0.3.shp');
  const areas = [];
  for (let i = 0; ; ++i) {
    const {done, value} = await source.read();
    if (done) {
      break;
    }
    areas.push(value);
    draw(value);
    if (i % 20 === 19) {
      await wait();
    }
  }
  console.log(JSON.stringify(areas));

  console.log('min', min);
  console.log('max', max);

  console.log(JSON.stringify(countriesById, null, 2));

  const pick = pickCtx.getImageData(0, 0, pickCtx.canvas.width, pickCtx.canvas.height);
  const outline = outlineCtx.getImageData(0, 0, outlineCtx.canvas.width, outlineCtx.canvas.height);

  function getId(imageData, x, y) {
    const off = (((y + imageData.height) % imageData.height) * imageData.width + ((x + imageData.width) % imageData.width)) * 4;
    return imageData.data[off + 0] +
           imageData.data[off + 1] * 256 +
           imageData.data[off + 2] * 256 * 256 +
           imageData.data[off + 3] * 256 * 256 * 256;
  }

  function putPixel(imageData, x, y, color) {
    const off = (y * imageData.width + x) * 4;
    imageData.data.set(color, off);
  }


  for (let y = 0; y < pick.height; ++y) {
    for (let x = 0; x < pick.width; ++x) {
      const s = getId(pick, x, y);
      const r = getId(pick, x + 1, y);
      const d = getId(pick, x, y + 1);
      let v = 0;
      if (s !== r || s !== d) {
        v = 255;
      }
      putPixel(outline, x, y, [v, v, v, v]);
    }
  }

  for (let y = 0; y < outline.height; ++y) {
    for (let x = 0; x < outline.width; ++x) {
      const s = getId(outline, x, y);
      const l = getId(outline, x - 1, y);
      const u = getId(outline, x, y - 1);
      const r = getId(outline, x + 1, y);
      const d = getId(outline, x, y + 1);
      //const rd = getId(outline, x + 1, y + 1);
      let v = s;
      if ((s && r && d) ||
          (s && l && d) ||
          (s && r && u) ||
          (s && l && u)) {
        v = 0;
      }
      putPixel(outline, x, y, [v, v, v, v]);
    }
  }

  outlineCtx.putImageData(outline, 0, 0);
}

function wait(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main();
