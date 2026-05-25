const GL_ARRAY_BUFFER = 0x8892;
const GL_FLOAT = 0x1406;
const GL_TRIANGLES = 0x0004;
const GL_COLOR_BUFFER_BIT = 0x4000;
const GL_DEPTH_BUFFER_BIT = 0x0100;
const GL_VERTEX_SHADER = 0x8B31;
const GL_FRAGMENT_SHADER = 0x8B30;
const GL_COMPILE_STATUS = 0x8B81;
const GL_LINK_STATUS = 0x8B82;

const VS_SOURCE = `#version 300 es
in vec4 aPosition;
void main() {
    gl_Position = aPosition;
}`;

const FS_SOURCE = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

// Uniform slot → name mapping (must match Rust renderer.rs constants + Three.js naming)
const UNIFORM_NAMES = {
    0: 'projectionMatrix', 1: 'modelViewMatrix', 2: 'normalMatrix',
    3: 'ambientLightColor', 4: 'diffuse', 5: 'specular', 6: 'shininess', 7: 'opacity',
};
for (let i = 0; i < 8; i++) {
    UNIFORM_NAMES[10 + i] = `directionalLightColor[${i}]`;
    UNIFORM_NAMES[20 + i] = `directionalLightDirection[${i}]`;
}
function slotName(slot) { return UNIFORM_NAMES[slot] || `slot${slot}`; }

export class WebGLAdapter {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', {
            antialias: false,
            preserveDrawingBuffer: true,
        });
        if (!this.gl) {
            throw new Error('WebGL2 not supported');
        }
        this.program = null;
        this.buffers = new Map();
        this._programs = new Map(); // pid -> {program, uniforms}
        this._currentPid = 0;
        this.initShaders();
    }

    initShaders() {
        const gl = this.gl;
        const vs = this.compileShader(GL_VERTEX_SHADER, VS_SOURCE);
        const fs = this.compileShader(GL_FRAGMENT_SHADER, FS_SOURCE);
        this.program = this.linkProgram(vs, fs);
        gl.useProgram(this.program);
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, GL_COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compile error: ' + info);
        }
        return shader;
    }

    linkProgram(vs, fs) {
        const gl = this.gl;
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, GL_LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error('Program link error: ' + info);
        }
        return program;
    }

    execute(glCommands) {
        const commands = this.decodeCommands(glCommands);
        const gl = this.gl;
        for (const cmd of commands) {
            this._executeCommand(gl, cmd);
        }
    }

    /// Decode GL bytecode into normalized command objects.
    /// Returns Array<{op, name, args}> suitable for comparison with GLCapture output.
    decodeCommands(glCommands) {
        const commands = [];
        let offset = 0;
        const view = new DataView(glCommands.buffer, glCommands.byteOffset, glCommands.byteLength);

        while (offset < glCommands.length) {
            const opcode = glCommands[offset];
            offset += 1;

            switch (opcode) {
                case 0x01: { // CLEAR_COLOR + CLEAR
                    const r = view.getFloat32(offset, true); offset += 4;
                    const g = view.getFloat32(offset, true); offset += 4;
                    const b = view.getFloat32(offset, true); offset += 4;
                    const a = view.getFloat32(offset, true); offset += 4;
                    commands.push({ op: 0x01, name: 'CLEAR_COLOR', args: [r, g, b, a] });
                    break;
                }
                case 0x04: { // BUFFER_DATA
                    const target = view.getUint32(offset, true); offset += 4;
                    const byteLength = view.getUint32(offset, true); offset += 4;
                    const floatCount = byteLength / 4;
                    const data = new Float32Array(floatCount);
                    for (let i = 0; i < floatCount; i++) {
                        data[i] = view.getFloat32(offset, true);
                        offset += 4;
                    }
                    commands.push({ op: 0x04, name: 'BUFFER_DATA', args: [target, data] });
                    break;
                }
                case 0x05: { // VERTEX_ATTRIB_POINTER
                    const index = view.getUint32(offset, true); offset += 4;
                    const size = view.getUint32(offset, true); offset += 4;
                    const type = view.getUint32(offset, true); offset += 4;
                    const normalized = glCommands[offset]; offset += 1;
                    const stride = view.getUint32(offset, true); offset += 4;
                    const voffset = view.getUint32(offset, true); offset += 4;
                    commands.push({ op: 0x05, name: 'VERTEX_ATTRIB_POINTER', args: [index, size, type, !!normalized, stride, voffset] });
                    break;
                }
                case 0x06: { // ENABLE_VERTEX_ATTRIB_ARRAY
                    const index = view.getUint32(offset, true); offset += 4;
                    commands.push({ op: 0x06, name: 'ENABLE_VERTEX_ATTRIB_ARRAY', args: [index] });
                    break;
                }
                case 0x07: { // DRAW_ARRAYS
                    const mode = view.getUint32(offset, true); offset += 4;
                    const first = view.getUint32(offset, true); offset += 4;
                    const count = view.getUint32(offset, true); offset += 4;
                    commands.push({ op: 0x07, name: 'DRAW_ARRAYS', args: [mode, first, count] });
                    break;
                }
                case 0x02: { // CREATE_VERTEX_SHADER
                    const len = view.getUint32(offset, true); offset += 4;
                    const src = new TextDecoder().decode(glCommands.slice(offset, offset + len));
                    offset += len;
                    commands.push({ op: 0x02, name: 'CREATE_VERTEX_SHADER', args: [src] });
                    break;
                }
                case 0x03: { // CREATE_FRAGMENT_SHADER
                    const len = view.getUint32(offset, true); offset += 4;
                    const src = new TextDecoder().decode(glCommands.slice(offset, offset + len));
                    offset += len;
                    commands.push({ op: 0x03, name: 'CREATE_FRAGMENT_SHADER', args: [src] });
                    break;
                }
                case 0x08: { // UNIFORM_MATRIX4FV
                    const slot = view.getUint32(offset, true); offset += 4;
                    const m = new Float32Array(16);
                    for (let i = 0; i < 16; i++) { m[i] = view.getFloat32(offset, true); offset += 4; }
                    commands.push({ op: 0x08, name: 'UNIFORM_MATRIX4FV', args: [slotName(slot), m] });
                    break;
                }
                case 0x09: { // UNIFORM3FV
                    const slot = view.getUint32(offset, true); offset += 4;
                    const x = view.getFloat32(offset, true); offset += 4;
                    const y = view.getFloat32(offset, true); offset += 4;
                    const z = view.getFloat32(offset, true); offset += 4;
                    commands.push({ op: 0x09, name: 'UNIFORM3FV', args: [slotName(slot), [x, y, z]] });
                    break;
                }
                case 0x0C: { // UNIFORM1I
                    const slot = view.getUint32(offset, true); offset += 4;
                    const v = view.getUint32(offset, true); offset += 4;
                    commands.push({ op: 0x0C, name: 'UNIFORM1I', args: [slotName(slot), v] });
                    break;
                }
                case 0x11: { // UNIFORM_MATRIX3FV
                    const slot = view.getUint32(offset, true); offset += 4;
                    const m = new Float32Array(9);
                    for (let i = 0; i < 9; i++) { m[i] = view.getFloat32(offset, true); offset += 4; }
                    commands.push({ op: 0x11, name: 'UNIFORM_MATRIX3FV', args: [slotName(slot), m] });
                    break;
                }
                case 0x12: { // TEX_IMAGE2D
                    const w = view.getUint32(offset, true); offset += 4;
                    const h = view.getUint32(offset, true); offset += 4;
                    const len = w * h * 4;
                    const data = new Uint8Array(len);
                    for (let i = 0; i < len; i++) data[i] = glCommands[offset + i];
                    offset += len;
                    commands.push({ op: 0x12, name: 'TEX_IMAGE2D', args: [w, h, data] });
                    break;
                }
                case 0x0A: { // UNIFORM1F
                    const slot = view.getUint32(offset, true); offset += 4;
                    const v = view.getFloat32(offset, true); offset += 4;
                    commands.push({ op: 0x0A, name: 'UNIFORM1F', args: [slotName(slot), v] });
                    break;
                }
                case 0x0B: { // UNIFORM4FV
                    const slot = view.getUint32(offset, true); offset += 4;
                    const r = view.getFloat32(offset, true); offset += 4;
                    const g = view.getFloat32(offset, true); offset += 4;
                    const b = view.getFloat32(offset, true); offset += 4;
                    const a = view.getFloat32(offset, true); offset += 4;
                    commands.push({ op: 0x0B, name: 'UNIFORM4FV', args: [slotName(slot), [r, g, b, a]] });
                    break;
                }
                case 0x0F: { // USE_PROGRAM
                    const progId = view.getUint32(offset, true); offset += 4;
                    commands.push({ op: 0x0F, name: 'USE_PROGRAM', args: [progId] });
                    break;
                }
                case 0x10: { // LINK_PROGRAM
                    commands.push({ op: 0x10, name: 'LINK_PROGRAM', args: [] });
                    break;
                }
                case 0x0D: { // BIND_INDEX_BUFFER (u16 indices)
                    const target = view.getUint32(offset, true); offset += 4;
                    const byteLen = view.getUint32(offset, true); offset += 4;
                    const count = byteLen / 2; // u16 = 2 bytes
                    const data = new Uint16Array(count);
                    for (let i = 0; i < count; i++) {
                        data[i] = view.getUint16(offset, true);
                        offset += 2;
                    }
                    commands.push({ op: 0x0D, name: 'BIND_INDEX_BUFFER', args: [target, data] });
                    break;
                }
                case 0x0E: { // DRAW_ELEMENTS
                    const mode = view.getUint32(offset, true); offset += 4;
                    const count = view.getUint32(offset, true); offset += 4;
                    const type = view.getUint32(offset, true); offset += 4;
                    const byteOffset = view.getUint32(offset, true); offset += 4;
                    commands.push({ op: 0x0E, name: 'DRAW_ELEMENTS', args: [mode, count, type, byteOffset] });
                    break;
                }
            }
        }
        return commands;
    }

    _executeCommand(gl, cmd) {
        switch (cmd.op) {
            case 0x01: {
                const [r, g, b, a] = cmd.args;
                gl.clearColor(r, g, b, a);
                gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
                break;
            }
            case 0x04: {
                const [target, data] = cmd.args;
                let buf = this.buffers.get(target);
                if (!buf) {
                    buf = gl.createBuffer();
                    this.buffers.set(target, buf);
                }
                gl.bindBuffer(target, buf);
                gl.bufferData(target, data, gl.STATIC_DRAW);
                break;
            }
            case 0x05: {
                const [index, size, type, normalized, stride, voffset] = cmd.args;
                gl.vertexAttribPointer(index, size, type, normalized, stride, voffset);
                break;
            }
            case 0x06: {
                gl.enableVertexAttribArray(cmd.args[0]);
                break;
            }
            case 0x07: {
                const [mode, first, count] = cmd.args;
                gl.drawArrays(mode, first, count);
                break;
            }
            case 0x0D: {
                const [target, data] = cmd.args;
                let buf = this.buffers.get(target);
                if (!buf) {
                    buf = gl.createBuffer();
                    this.buffers.set(target, buf);
                }
                gl.bindBuffer(target, buf);
                // data is Uint16Array from decodeCommands
                gl.bufferData(target, data, gl.STATIC_DRAW);
                break;
            }
            case 0x0E: {
                const [mode, count, type, byteOffset] = cmd.args;
                gl.drawElements(mode, count, type, byteOffset);
                break;
            }
            case 0x02: { // CREATE_VERTEX_SHADER
                const [src] = cmd.args;
                const shader = gl.createShader(GL_VERTEX_SHADER);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, GL_COMPILE_STATUS)) {
                    console.error('VS compile error:', gl.getShaderInfoLog(shader));
                }
                this._pendingVS = shader;
                break;
            }
            case 0x03: { // CREATE_FRAGMENT_SHADER
                const [src] = cmd.args;
                const shader = gl.createShader(GL_FRAGMENT_SHADER);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, GL_COMPILE_STATUS)) {
                    console.error('FS compile error:', gl.getShaderInfoLog(shader));
                }
                this._pendingFS = shader;
                break;
            }
            case 0x10: { // LINK_PROGRAM
                if (this._pendingVS && this._pendingFS) {
                    const prog = gl.createProgram();
                    gl.bindAttribLocation(prog, 0, 'position');
                    gl.bindAttribLocation(prog, 1, 'normal');
                    gl.bindAttribLocation(prog, 2, 'uv');
                    gl.attachShader(prog, this._pendingVS);
                    gl.attachShader(prog, this._pendingFS);
                    gl.linkProgram(prog);
                    if (!gl.getProgramParameter(prog, GL_LINK_STATUS)) {
                        console.error('Link error:', gl.getProgramInfoLog(prog));
                    }
                    this._pendingProgram = prog;
                    this._pendingVS = null; this._pendingFS = null;
                }
                break;
            }
            case 0x0F: { // USE_PROGRAM
                const pid = cmd.args[0];
                // Check cache first
                const cached = this._programs.get(pid);
                if (cached) {
                    this.program = cached.program;
                    this._uniforms = cached.uniforms;
                } else if (this._pendingProgram) {
                    // New program from preceding LINK_PROGRAM
                    const prog = this._pendingProgram;
                    this._pendingProgram = null;
                    const uniforms = new Map();
                    const names = ['projectionMatrix', 'modelViewMatrix', 'normalMatrix',
                        'ambientLightColor', 'diffuse', 'specular', 'shininess', 'opacity', 'map'];
                    for (const name of names) {
                        const loc = gl.getUniformLocation(prog, name);
                        if (loc) uniforms.set(name, loc);
                    }
                    for (let i = 0; i < 8; i++) {
                        for (const s of [`directionalLightColor[${i}]`, `directionalLightDirection[${i}]`]) {
                            const loc = gl.getUniformLocation(prog, s);
                            if (loc) uniforms.set(s, loc);
                        }
                    }
                    this._programs.set(pid, { program: prog, uniforms });
                    this.program = prog;
                    this._uniforms = uniforms;
                }
                gl.useProgram(this.program);
                // Bind texture unit 0 if map uniform exists
                if (this._texture && this._uniforms.has('map')) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, this._texture);
                    gl.uniform1i(this._uniforms.get('map'), 0);
                }
                break;
            }

            case 0x08: { // UNIFORM_MATRIX4FV — args[0] is already the uniform NAME
                const [name, data] = cmd.args;
                const loc = this._uniforms.get(name);
                if (loc) gl.uniformMatrix4fv(loc, false, data);
                break;
            }
            case 0x09: { // UNIFORM3FV
                const [name, data] = cmd.args;
                const loc = this._uniforms.get(name);
                if (loc) gl.uniform3fv(loc, data);
                break;
            }
            case 0x0A: { // UNIFORM1F
                const [name, val] = cmd.args;
                const loc = this._uniforms.get(name);
                if (loc) gl.uniform1f(loc, val);
                break;
            }
            case 0x0C: { // UNIFORM1I
                const [name, val] = cmd.args;
                const loc = this._uniforms.get(name);
                if (loc) gl.uniform1i(loc, val);
                break;
            }
            case 0x11: { // UNIFORM_MATRIX3FV
                const [name, data] = cmd.args;
                const loc = this._uniforms.get(name);
                if (loc) gl.uniformMatrix3fv(loc, false, data);
                break;
            }
            case 0x12: { // TEX_IMAGE2D
                const [w, h, data] = cmd.args;
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                this._texture = tex;
                break;
            }
            case 0x0B: { // UNIFORM4FV
                const [name, data] = cmd.args;
                const loc = this._uniforms.get(name);
                if (loc) gl.uniform4fv(loc, data);
                break;
            }
        }
    }
}
