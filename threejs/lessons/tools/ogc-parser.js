'use strict';

const assert = {
  strictEqual(actual, expected, ...args) {
    args = args || [];
    if (actual !== expected) {
      throw new Error(`${actual} (actual) should equal ${expected} (expected): ${[...args].join(' ')}`);
    }
  },
  notStrictEqual(actual, expected, ...args) {
    args = args || [];
    if (actual === expected) {
      throw new Error(`${actual} (actual) should NOT equal ${expected} (expected): ${[...args].join(' ')}`);
    }
  },
}

function dumpBuf(buf) {
  for (let i = 0; i < buf.length; i += 32) {
    const p = [];
    const a = [];
    for (let j = i; j < i + 32 && j < buf.length; ++j) {
      const b = buf[j];
      p.push(b.toString(16).padStart(2, '0'));
      a.push(b >= 32 && b < 128 ? String.fromCharCode(b) : '.');
      if (j % 4 === 3) {
        p.push(' ');
      }
    }
    console.log(i.toString(16).padStart(8, '0'), ':', p.join(''), a.join(''));
  }
}

function parse(buf) {
  assert.strictEqual(buf[0], 0x47, 'bad header');
  assert.strictEqual(buf[1], 0x50, 'bad header');
  assert.strictEqual(buf[2], 0, 'unknown version');  // version
  const flags = buf[3];

  const flag_x         = (flags >> 5) & 1;
  const flag_empty_geo = (flags >> 4) & 1;  // 1 = empty, 0 non-empty
  const flag_byteOrder = (flags >> 0) & 1;  // 1 = little endian, 0 = big
  const flag_envelope  = (flags >> 1) & 7;

  assert.strictEqual(flag_x, 0, 'x must be 0');

  const envelopeSizes = [
    0,  // 0: non
    4,  // 1: minx, maxx, miny, maxy
    6,  // 2: minx, maxx, miny, maxy, minz, maxz
    6,  // 3: minx, maxx, miny, maxy, minm, maxm
    8,  // 4: minx, maxx, miny, maxy, minz, maxz, minm, maxm
  ];

  const envelopeSize = envelopeSizes[flag_envelope];
  assert.notStrictEqual(envelopeSize, undefined);

  const headerSize = 8;
  let cursor = headerSize;

  const dataView = new DataView(buf.buffer);
  /*
  const readBE = {
    getDouble() { const v = buf.readDoubleBE(cursor); cursor += 8 ; return v; },
    getFloat()  { const v = buf.readFloatBE(cursor);  cursor += 4 ; return v; },
    getInt8()   { const v = buf.readInt8(cursor);     cursor += 1 ; return v; },
    getUint8()  { const v = buf.readUInt8(cursor);    cursor += 1 ; return v; },
    getInt16()  { const v = buf.readInt16BE(cursor);  cursor += 2 ; return v; },
    getUint16() { const v = buf.readUInt16BE(cursor); cursor += 2 ; return v; },
    getInt32()  { const v = buf.readInt32BE(cursor);  cursor += 4 ; return v; },
    getUint32() { const v = buf.readUInt32BE(cursor); cursor += 4 ; return v; },
  };

  const readLE = {
    getDouble() { const v = buf.readDoubleLE(cursor); cursor += 8 ; return v; },
    getFloat()  { const v = buf.readFloatLE(cursor);  cursor += 4 ; return v; },
    getInt8()   { const v = buf.readInt8(cursor);     cursor += 1 ; return v; },
    getUint8()  { const v = buf.readUInt8(cursor);    cursor += 1 ; return v; },
    getInt16()  { const v = buf.readInt16LE(cursor);  cursor += 2 ; return v; },
    getUint16() { const v = buf.readUInt16LE(cursor); cursor += 2 ; return v; },
    getInt32()  { const v = buf.readInt32LE(cursor);  cursor += 4 ; return v; },
    getUint32() { const v = buf.readUInt32LE(cursor); cursor += 4 ; return v; },
  };
  */

  let littleEndian;
  let endianStack = [];

  function pushByteOrder(byteOrder) {
    endianStack.push(littleEndian);
    littleEndian = byteOrder;
  }

  function popByteOrder() {
    littleEndian = endianStack.pop();
  }

  const getDouble = () => { const v = dataView.getFloat64(cursor, littleEndian); cursor += 8 ; return v; };
  const getFloat =  () => { const v = dataView.getFloat32(cursor, littleEndian); cursor += 4 ; return v; };
  const getInt8 =   () => { const v = dataView.getInt8(cursor, littleEndian);    cursor += 1 ; return v; };
  const getUint8 =  () => { const v = dataView.getUint8(cursor, littleEndian);   cursor += 1 ; return v; };
  const getInt16 =  () => { const v = dataView.getInt16(cursor, littleEndian);   cursor += 2 ; return v; };
  const getUint16 = () => { const v = dataView.getUint16(cursor, littleEndian);  cursor += 2 ; return v; };
  const getInt32 =  () => { const v = dataView.getInt32(cursor, littleEndian);   cursor += 4 ; return v; };
  const getUint32 = () => { const v = dataView.getUint32(cursor, littleEndian);  cursor += 4 ; return v; };

  pushByteOrder(flag_byteOrder);

  const envelope = [];
  for (let i = 0; i < envelopeSize; ++i) {
    envelope.push(getDouble());
  }

  const primitives = [];

  function getPoints(num) {
    const points = [];
    for (let i = 0; i < num; ++i) {
      points.push(getDouble(), getDouble());
    }
    return points;
  }

  function getRings(num) {
    const rings = [];
    for (let i = 0; i < num; ++i) {
      rings.push(getPoints(getUint32()));
    }
    return rings;
  }

  function pointHandler() {
    return {
      type: 'point',
      point: getPoints(1),
    };
  }

  function lineStringHandler() {
    return {
      type: 'lineString',
      points: getPoints(getUint32()),
    };
  }

  function polygonHandler() {
    return {
      type: 'polygon',
      rings: getRings(getUint32()),
    };
  }

  function multiPointHandler() {
    // WTF?
    const points = [];
    const num = getUint32();
    for (let i = 0; i < num; ++i) {
      pushByteOrder(getInt8());
      const type = getUint32();
      assert.strictEqual(type, 1);  // must be point
      points.push(getDouble(), getDouble());
      popByteOrder();
    }
    return {
      type: 'multiPoint',
      points,
    };
  }

  function multiLineStringHandler() {
    // WTF?
    const lineStrings = [];
    const num = getUint32();
    for (let i = 0; i < num; ++i) {
      pushByteOrder(getInt8());
      const type = getUint32();
      assert.strictEqual(type, 2);  // must be lineString
      lineStrings.push(getPoints(getUint32()));
      popByteOrder();
    }
    return {
      type: 'multiLineString',
      lineStrings,
    };
  }

  function multiPolygonHandler() {
    // WTF?
    const polygons = [];
    const num = getUint32();
    for (let i = 0; i < num; ++i) {
      pushByteOrder(getInt8());
      const type = getUint32();
      assert.strictEqual(type, 3);  // must be polygon
      polygons.push(getRings(getUint32()));
      popByteOrder();
    }
    return {
      type: 'multiPolygon',
      polygons,
    };
  }

  const typeHandlers = [
    undefined,              // 0
    pointHandler,           // 1
    lineStringHandler,      // 2
    polygonHandler,         // 3
    multiPointHandler,      // 4
    multiLineStringHandler, // 5,
    multiPolygonHandler,    // 6,
  ];

  const end = buf.length;
  while (cursor < end) {
    pushByteOrder(getInt8());
    const type = getUint32();
    const handler = typeHandlers[type];
    assert.notStrictEqual(handler, undefined, 'unknown type');
    primitives.push(handler());
    popByteOrder();
  }

  return {
    envelope,
    primitives,
  };
}

window.ogcParser = {parse};

