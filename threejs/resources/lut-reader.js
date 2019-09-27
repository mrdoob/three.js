function splitOnSpaceHandleQuotesWithEscapes(str, splits = ' \t\n\r') {
  const strs = [];
  let quoteType;
  let escape;
  let s = [];
  for (let i = 0; i < str.length; ++i) {
    const c = str[i];
    if (escape) {
      escape = false;
      s.push(c);
    } else {
      if (quoteType) {  // we're inside quotes
        if (c === quoteType) {
          quoteType = undefined;
          strs.push(s.join(''));
          s = [];
        } else if (c === '\\') {
          escape = true;
        } else {
          s.push(c);
        }
      } else {  // we're not in quotes
        if (splits.indexOf(c) >= 0) {
          if (s.length) {
            strs.push(s.join(''));
            s = [];
          }
        } else if (c === '"' || c === '\'') {
          if (s.length) {  // its in th middle of a word
            s.push(c);
          } else {
            quoteType = c;
          }
        } else {
          s.push(c);
        }
      }
    }
  }
  if (s.length || strs.length === 0) {
    strs.push(s.join(''));
  }
  return strs;
}

export function parse(str) {
  const data = [];
  const lut = {
    name: 'unknonw',
    type: '1D',
    size: 0,
    data,
    min: [0, 0, 0],
    max: [1, 1, 1],
  };

  const lines = str.split('\n');
  for (const origLine of lines) {
    const hashNdx = origLine.indexOf('#');
    const line = hashNdx >= 0 ? origLine.substring(0, hashNdx) : origLine;
    const parts = splitOnSpaceHandleQuotesWithEscapes(line);
    switch (parts[0].toUpperCase()) {
      case 'TITLE':
        lut.name = parts[1];
        break;
      case 'LUT_1D_SIZE':
        lut.size = parseInt(parts[1]);
        lut.type = '1D';
        break;
      case 'LUT_3D_SIZE':
        lut.size = parseInt(parts[1]);
        lut.type = '3D';
        break;
      case 'DOMAIN_MIN':
        lut.min = parts.slice(1).map(parseFloat);
        break;
      case 'DOMAIN_MAX':
        lut.max = parts.slice(1).map(parseFloat);
        break;
      default:
        if (parts.length === 3) {
          data.push(...parts.map(parseFloat));
        }
        break;
    }
  }

  if (!lut.min) {
    lut.min = data.slice(0, 3);
    lut.max = data.slice(data.length - 3, data.length);
  }

  if (!lut.size) {
    lut.size = data.length / 3;
  }

  return lut;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lut1Dto3D(lut) {
  let src = lut.data;
  if (src.length / 3 !== lut.size) {
    src = [];
    for (let i = 0; i < lut.size; ++i) {
      const u = i / lut.size * lut.data.length;
      const i0 = (u | 0) * 3;
      const i1 = i0 + 3;
      const t = u % 1;
      src.push(
        lerp(lut.data[i0 + 0], lut.data[i1 + 0], t),
        lerp(lut.data[i0 + 0], lut.data[i1 + 1], t),
        lerp(lut.data[i0 + 0], lut.data[i1 + 2], t),
      );
    }
  }
  const data = [];
  for (let i = 0; i < lut.size * lut.size; ++i) {
    data.push(...src);
  }
  return Object.assign({}, lut, {data});
}

export function lutTo2D3Drgb8(lut) {
  if (lut.type === '1D') {
    lut = lut1Dto3D(lut);
  }
  const min = lut.min;
  const max = lut.max;
  const range = min.map((min, ndx) => {
    return max[ndx] - min;
  });
  const src = lut.data;
  const data = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i += 3) {
    data[i + 0] = (src[i + 0] - min[0]) / range[0] * 255;
    data[i + 1] = (src[i + 1] - min[1]) / range[1] * 255;
    data[i + 2] = (src[i + 2] - min[2]) / range[2] * 255;
  }
  return Object.assign({}, lut, {data});
}
