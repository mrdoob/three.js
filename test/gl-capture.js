// GL command capture and comparison system for Three.js ↔ our implementation.

export const OP_CODES = {
    CLEAR_COLOR: 0x01, CREATE_VERTEX_SHADER: 0x02, CREATE_FRAGMENT_SHADER: 0x03,
    BUFFER_DATA: 0x04, VERTEX_ATTRIB_POINTER: 0x05, ENABLE_VERTEX_ATTRIB_ARRAY: 0x06,
    DRAW_ARRAYS: 0x07, UNIFORM_MATRIX4FV: 0x08, UNIFORM3FV: 0x09,
    UNIFORM1F: 0x0A, UNIFORM4FV: 0x0B, UNIFORM1I: 0x0C,
    BIND_INDEX_BUFFER: 0x0D, DRAW_ELEMENTS: 0x0E, USE_PROGRAM: 0x0F, LINK_PROGRAM: 0x10,
    UNIFORM_MATRIX3FV: 0x11,
};
const OP_NAMES = Object.fromEntries(Object.entries(OP_CODES).map(([k, v]) => [v, k]));
const GL_ARRAY_BUFFER = 0x8892, GL_ELEMENT_ARRAY_BUFFER = 0x8893;
const GL_FLOAT = 0x1406, GL_TRIANGLES = 0x0004;

export class GLCapture {
    constructor() {
        this.commands = [];
        this._enabled = false;
        this._bufTarget = 0;
        this._pendingClear = null;
        this._shaderType = 0;
        this._locationNames = new Map(); // UniformLocation → name (tracked globally)
    }

    wrap(realGL) {
        const self = this;
        return new Proxy(realGL, {
            get(target, prop) {
                const orig = target[prop];
                if (typeof orig !== 'function') return orig;
                return (...args) => {
                    self._track(prop, args, target, orig);
                    const result = orig.apply(target, args);
                    // Track uniform location → name ALWAYS
                    if (prop === 'getUniformLocation' && result) {
                        self._locationNames.set(result, args[1]);
                    }
                    return result;
                };
            }
        });
    }

    start() { this.commands = []; this._enabled = true; this._bufTarget = 0; this._pendingClear = null; }
    stop() { this._enabled = false; return this._normalize(); }

    _track(name, args, gl, orig) {
        switch (name) {
            case 'clearColor': this._pendingClear = [args[0], args[1], args[2], args[3]]; break;
            case 'clear':
                if (this._enabled) {
                    const c = this._pendingClear || gl.getParameter(gl.COLOR_CLEAR_VALUE);
                    this._add(OP_CODES.CLEAR_COLOR, [c[0], c[1], c[2], c[3]]);
                    this._pendingClear = null;
                }
                break;
            case 'bindBuffer': this._bufTarget = args[0]; break;
            case 'bufferData':
                if (!this._enabled) break;
                if (this._bufTarget === GL_ARRAY_BUFFER) {
                    this._add(OP_CODES.BUFFER_DATA, [GL_ARRAY_BUFFER, new Float32Array(args[1] || [])]);
                } else if (this._bufTarget === GL_ELEMENT_ARRAY_BUFFER) {
                    let data = args[1];
                    if (data instanceof Uint16Array) {
                        const u32 = new Uint32Array(data.length);
                        for (let i = 0; i < data.length; i++) u32[i] = data[i];
                        data = u32;
                    }
                    this._add(OP_CODES.BIND_INDEX_BUFFER, [GL_ELEMENT_ARRAY_BUFFER, data]);
                }
                break;
            case 'vertexAttribPointer':
                if (this._enabled)
                    this._add(OP_CODES.VERTEX_ATTRIB_POINTER, [args[0], args[1], args[2], !!args[3], args[4], args[5]]);
                break;
            case 'enableVertexAttribArray':
                if (this._enabled) this._add(OP_CODES.ENABLE_VERTEX_ATTRIB_ARRAY, [args[0]]);
                break;
            case 'drawArrays':
                if (this._enabled) this._add(OP_CODES.DRAW_ARRAYS, [args[0], args[1], args[2]]);
                break;
            case 'drawElements':
                if (this._enabled) this._add(OP_CODES.DRAW_ELEMENTS, [args[0], args[1], args[2], args[3] || 0]);
                break;
            case 'createShader': this._shaderType = args[0]; break;
            case 'shaderSource':
                if (!this._enabled) break;
                if (this._shaderType === 0x8B31) this._add(OP_CODES.CREATE_VERTEX_SHADER, [args[1]]);
                else if (this._shaderType === 0x8B30) this._add(OP_CODES.CREATE_FRAGMENT_SHADER, [args[1]]);
                this._shaderType = 0;
                break;
            case 'linkProgram':
                if (this._enabled) this._add(OP_CODES.LINK_PROGRAM, []);
                break;
            case 'useProgram':
                if (this._enabled) this._add(OP_CODES.USE_PROGRAM, [0]);
                break;
            // Track uniform locations by name ALWAYS (even outside capture window)
            // so that uniform set calls during capture can be resolved to names
            case 'getUniformLocation':
                break; // handled below in post-call tracking

            case 'uniformMatrix4fv':
                if (this._enabled) this._addUniform(OP_CODES.UNIFORM_MATRIX4FV, args[0], new Float32Array(args[1] || []));
                break;
            case 'uniform3fv':
                if (this._enabled) this._addUniform(OP_CODES.UNIFORM3FV, args[0], [args[1][0], args[1][1], args[1][2]]);
                break;
            case 'uniform1f':
                if (this._enabled) this._addUniform(OP_CODES.UNIFORM1F, args[0], args[1]);
                break;
            case 'uniform4fv':
                if (this._enabled) this._addUniform(OP_CODES.UNIFORM4FV, args[0], [args[1][0], args[1][1], args[1][2], args[1][3]]);
                break;
            case 'uniformMatrix3fv':
                if (this._enabled) this._addUniform(OP_CODES.UNIFORM_MATRIX3FV, args[0], new Float32Array(args[1]||[]));
                break;
            case 'uniform1i':
                if (this._enabled) this._addUniform(OP_CODES.UNIFORM1I, args[0], args[1]);
                break;
        }
    }

    _add(op, args) { this.commands.push({ op, args }); }

    _addUniform(op, locationObj, value) {
        const name = this._locationNames.get(locationObj) || `unnamed_${this.commands.length}`;
        this._add(op, [name, value]);
    }

    _normalize() {
        return this.commands.map(c => ({ op: c.op, name: OP_NAMES[c.op] || `OP(${c.op})`, args: c.args }));
    }
}

// Parse GLSL source to extract attribute, uniform, and varying declarations.
// Handles Three.js #define patterns (#define attribute in, #define varying out).
export function parseShaderStructure(src) {
    const attrs = [], uniforms = [], varyings = [];
    // Resolve #define macros
    let resolved = src;
    const defines = {};
    const defRe = /^#define\s+(\w+)\s+(\w+)\s*$/gm;
    let dm;
    while ((dm = defRe.exec(src)) !== null) defines[dm[1]] = dm[2];
    // Replace known Three.js defines with GLSL keywords
    for (const [k, v] of Object.entries(defines)) {
        if (v === 'in' || v === 'out') {
            resolved = resolved.replace(new RegExp('\\b'+k+'\\b', 'g'), v);
        }
    }
    const re = /^\s*(in|out|uniform)\s+(\w+(?:\s*\*)?)\s+(\w+(?:\[\d+\])?)\s*;/gm;
    let m;
    while ((m = re.exec(resolved)) !== null) {
        const [, qual, type, name] = m;
        if (qual === 'in' && type !== 'out') attrs.push({ type: type.trim(), name });
        else if (qual === 'uniform') uniforms.push({ type: type.trim(), name });
        else if (qual === 'out') varyings.push({ type: type.trim(), name });
    }
    return { attrs, uniforms, varyings };
}

// Compare shader structures. Our shader's active declarations must be a subset
// of Three.js's (Three.js includes many unused uniforms as dead code).
export function compareShaderStructure(ourVS, ourFS, refVS, refFS) {
    const diffs = [];
    const our = { vs: parseShaderStructure(ourVS), fs: parseShaderStructure(ourFS) };
    const ref = { vs: parseShaderStructure(refVS), fs: parseShaderStructure(refFS) };

    const refNames = (list) => new Set(list.map(x => `${x.type} ${x.name}`));
    const checkSubset = (label, ourList, refList) => {
        const rNames = refNames(refList);
        for (const x of ourList) {
            const key = `${x.type} ${x.name}`;
            if (!rNames.has(key)) diffs.push(`${label}: our '${key}' not found in ref`);
        }
    };
    checkSubset('VS attr', our.vs.attrs, ref.vs.attrs);
    checkSubset('VS varying', our.vs.varyings, ref.vs.varyings);
    checkSubset('FS uniform', our.fs.uniforms, ref.fs.uniforms);
    checkSubset('FS varying', our.fs.varyings, ref.fs.varyings);
    return { match: diffs.length === 0, diffs };
}

// Compare two command sequences.
// Uniform commands are sorted by name before comparison.
export function compareCommands(ourCmds, refCmds, opts = {}) {
    const eps = opts.floatEpsilon || 1e-4;
    const diffs = [];
    const coreOps = new Set([0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,0x10]);
    const isUniform = (c) => c.op >= 0x08 && c.op <= 0x0C;

    let our = ourCmds.filter(c => coreOps.has(c.op));
    let ref = refCmds.filter(c => coreOps.has(c.op));

    // Sort uniform commands by name for canonical ordering
    const sortUniforms = (cmds) => {
        const u = cmds.filter(isUniform);
        const nu = cmds.filter(c => !isUniform);
        u.sort((a, b) => String(a.args[0]).localeCompare(String(b.args[0])));
        // Re-insert uniforms at their original positions relative to non-uniforms
        const result = [];
        let ui = 0, ni = 0;
        for (const c of cmds) {
            if (isUniform(c)) { result.push(u[ui++]); } else { result.push(nu[ni++]); }
        }
        return result;
    };
    our = sortUniforms(our);
    ref = sortUniforms(ref);

    const toArr = (a) => {
        if (!a && a !== 0) return [0];
        if (a instanceof Float32Array || a instanceof Uint16Array || a instanceof Uint32Array || Array.isArray(a))
            return Array.from(a).map(Number);
        if (typeof a === 'number') return [a];
        if (typeof a === 'boolean') return [a ? 1 : 0];
        if (typeof a === 'string') return [a];
        // Handle Puppeteer-serialized object (numeric keys)
        if (typeof a === 'object') {
            const r = [];
            for (let i = 0; ; i++) { if (i in a) r.push(Number(a[i])); else break; }
            return r.length > 0 ? r : [0];
        }
        return [Number(a) || 0];
    };

    // Pair by opcode sequence, skipping extra ref buffers
    let oi = 0, ri = 0;
    while (oi < our.length && ri < ref.length) {
        if (!our[oi] || !ref[ri]) break;
        const oc = our[oi], rc = ref[ri];
        // Skip extra Three.js BUFFER_DATA
        if (oc.op !== rc.op && rc.op === OP_CODES.BUFFER_DATA && oc.op !== OP_CODES.BUFFER_DATA) { ri++; continue; }
        if (oc.op !== rc.op && oc.op === OP_CODES.BUFFER_DATA && rc.op !== OP_CODES.BUFFER_DATA) { oi++; continue; }
        if (oc.op !== rc.op) {
            diffs.push(`[${oi}] op mismatch: our=${OP_NAMES[oc.op]} ref=${OP_NAMES[rc.op]}`);
            oi++; ri++; continue;
        }
        // Flatten and compare args
        const oa = oc.args.flatMap(toArr);
        const ra = rc.args.flatMap(toArr);
        if (oa.length !== ra.length) {
            diffs.push(`[${oi}] ${OP_NAMES[oc.op]} arg len: our=${oa.length} ref=${ra.length}`);
        } else {
            for (let j = 0; j < oa.length; j++) {
                const a = Number(oa[j]), b = Number(ra[j]);
                if (isNaN(a) || isNaN(b)) { if (oa[j] !== ra[j]) diffs.push(`[${oi}] ${OP_NAMES[oc.op]} arg[${j}]: our=${oa[j]} ref=${ra[j]}`); }
                else if (Math.abs(a - b) > eps) diffs.push(`[${oi}] ${OP_NAMES[oc.op]} arg[${j}]: our=${a.toFixed(6)} ref=${b.toFixed(6)}`);
            }
        }
        oi++; ri++;
    }
    if (oi < our.length) diffs.push(`our extra ${our.length - oi} commands (from ${OP_NAMES[our[oi]?.op] || '?'})`);
    if (ri < ref.length) diffs.push(`ref extra ${ref.length - ri} commands (from ${OP_NAMES[ref[ri]?.op] || '?'})`);

    return { match: diffs.length === 0, diffs };
}
