use std::collections::HashMap;
use crate::core::Store;
use crate::math::Matrix4;
use crate::light::Light;
use crate::material::MaterialType;

pub const OP_CLEAR_COLOR: u8 = 0x01;
pub const OP_CREATE_VERTEX_SHADER: u8 = 0x02;
pub const OP_CREATE_FRAGMENT_SHADER: u8 = 0x03;
pub const OP_BUFFER_DATA: u8 = 0x04;
pub const OP_VERTEX_ATTRIB_POINTER: u8 = 0x05;
pub const OP_ENABLE_VERTEX_ATTRIB_ARRAY: u8 = 0x06;
pub const OP_DRAW_ARRAYS: u8 = 0x07;
pub const OP_UNIFORM_MATRIX4FV: u8 = 0x08;
pub const OP_UNIFORM3FV: u8 = 0x09;
pub const OP_UNIFORM1F: u8 = 0x0A;
pub const OP_UNIFORM4FV: u8 = 0x0B;
pub const OP_UNIFORM1I: u8 = 0x0C;
pub const OP_BIND_INDEX_BUFFER: u8 = 0x0D;
pub const OP_DRAW_ELEMENTS: u8 = 0x0E;
pub const OP_USE_PROGRAM: u8 = 0x0F;
pub const OP_LINK_PROGRAM: u8 = 0x10;
pub const OP_UNIFORM_MATRIX3FV: u8 = 0x11;
pub const OP_TEX_IMAGE2D: u8 = 0x12;

const GL_ARRAY_BUFFER: u32 = 0x8892;
const GL_ELEMENT_ARRAY_BUFFER: u32 = 0x8893;
const GL_FLOAT: u32 = 0x1406;
const GL_TRIANGLES: u32 = 0x0004;
const GL_UNSIGNED_SHORT: u32 = 0x1403;

pub const U_PROJECTION: u32 = 0;
pub const U_MODELVIEW: u32 = 1;
pub const U_AMBIENT: u32 = 3;
pub const U_DIFFUSE: u32 = 4;
pub const U_SPECULAR: u32 = 5;
pub const U_SHININESS: u32 = 6;
pub const U_OPACITY: u32 = 7;
pub const U_LIGHT_COLOR: u32 = 10;
pub const U_LIGHT_DIR: u32 = 20;
pub const U_NORMAL: u32 = 2;

fn pu32(b: &mut Vec<u8>, v: u32) { b.extend_from_slice(&v.to_le_bytes()); }
fn pf32(b: &mut Vec<u8>, v: f32) { b.extend_from_slice(&v.to_le_bytes()); }
fn pu16(b: &mut Vec<u8>, v: u16) { b.extend_from_slice(&v.to_le_bytes()); }

fn normal_of(v0: (f32,f32,f32), v1: (f32,f32,f32), v2: (f32,f32,f32)) -> [f32;3] {
    let u = (v1.0-v0.0, v1.1-v0.1, v1.2-v0.2);
    let v = (v2.0-v0.0, v2.1-v0.1, v2.2-v0.2);
    let (nx, ny, nz) = (u.1*v.2-u.2*v.1, u.2*v.0-u.0*v.2, u.0*v.1-u.1*v.0);
    let l = (nx*nx+ny*ny+nz*nz).sqrt();
    if l < 1e-10 { return [0.,1.,0.]; }
    [nx/l, ny/l, nz/l]
}

fn flatten_with_normals(verts: &[f32], indices: &[u32]) -> Vec<f32> {
    if indices.is_empty() {
        let mut out = Vec::with_capacity(verts.len() * 2);
        for tri in verts.chunks(9) {
            let n = normal_of((tri[0],tri[1],tri[2]),(tri[3],tri[4],tri[5]),(tri[6],tri[7],tri[8]));
            for i in 0..3 { let b=i*3; out.push(tri[b]); out.push(tri[b+1]); out.push(tri[b+2]); out.push(n[0]); out.push(n[1]); out.push(n[2]); }
        }
        return out;
    }
    let mut out = Vec::new();
    for tri in indices.chunks(3) {
        if tri.len() < 3 { continue; }
        let i0=tri[0] as usize*3; let i1=tri[1] as usize*3; let i2=tri[2] as usize*3;
        let max_idx = i0.max(i1).max(i2) + 2;
        let n = if max_idx < verts.len() { normal_of((verts[i0],verts[i0+1],verts[i0+2]),(verts[i1],verts[i1+1],verts[i1+2]),(verts[i2],verts[i2+1],verts[i2+2])) } else { [0.,1.,0.] };
        for &idx in &[i0,i1,i2] { out.push(verts[idx]); out.push(verts[idx+1]); out.push(verts[idx+2]); out.push(n[0]); out.push(n[1]); out.push(n[2]); }
    }
    out
}

fn compute_normals(verts: &[f32], indices: &[u32]) -> Vec<f32> {
    let vcount = verts.len() / 3;
    let mut norms = vec![0.0f32; vcount * 3];
    for tri in indices.chunks(3) {
        if tri.len() < 3 { continue; }
        let i0=tri[0] as usize*3; let i1=tri[1] as usize*3; let i2=tri[2] as usize*3;
        let max_idx = i0.max(i1).max(i2) + 2;
        if max_idx >= verts.len() { continue; } // Skip out-of-bounds indices
        let n = normal_of((verts[i0],verts[i0+1],verts[i0+2]),(verts[i1],verts[i1+1],verts[i1+2]),(verts[i2],verts[i2+1],verts[i2+2]));
        for &i in &[i0,i1,i2] { norms[i]=n[0]; norms[i+1]=n[1]; norms[i+2]=n[2]; }
    }
    norms
}

fn transform_verts(v: &[f32], m: &Matrix4) -> Vec<f32> {
    let e = &m.elements; let mut r = Vec::with_capacity(v.len());
    for c in v.chunks(3) {
        let (x,y,z) = (c[0],c[1],c[2]);
        let w = e[3]*x+e[7]*y+e[11]*z+e[15];
        r.push((e[0]*x+e[4]*y+e[8]*z+e[12])/w);
        r.push((e[1]*x+e[5]*y+e[9]*z+e[13])/w);
        r.push((e[2]*x+e[6]*y+e[10]*z+e[14])/w);
    }
    r
}

fn inv_transpose_3x3(m: &Matrix4) -> [f32;9] {
    let a = &m.elements;
    let det = a[0]*(a[5]*a[10]-a[6]*a[9])-a[1]*(a[4]*a[10]-a[6]*a[8])+a[2]*(a[4]*a[9]-a[5]*a[8]);
    if det.abs()<1e-10 { return [1.,0.,0.,0.,1.,0.,0.,0.,1.]; }
    let id=1.0/det;
    [(a[5]*a[10]-a[6]*a[9])*id,(a[2]*a[9]-a[1]*a[10])*id,(a[1]*a[6]-a[2]*a[5])*id,
     (a[6]*a[8]-a[4]*a[10])*id,(a[0]*a[10]-a[2]*a[8])*id,(a[2]*a[4]-a[0]*a[6])*id,
     (a[4]*a[9]-a[5]*a[8])*id,(a[1]*a[8]-a[0]*a[9])*id,(a[0]*a[5]-a[1]*a[4])*id]
}

fn emit_m4(gl: &mut Vec<u8>, s: u32, m: &Matrix4) { gl.push(OP_UNIFORM_MATRIX4FV); pu32(gl,s); for v in &m.elements { pf32(gl,*v); } }
fn emit_3f(gl: &mut Vec<u8>, s: u32, x:f32,y:f32,z:f32) { gl.push(OP_UNIFORM3FV); pu32(gl,s); pf32(gl,x); pf32(gl,y); pf32(gl,z); }
fn emit_1f(gl: &mut Vec<u8>, s: u32, v: f32) { gl.push(OP_UNIFORM1F); pu32(gl,s); pf32(gl,v); }
fn emit_4f(gl: &mut Vec<u8>, s: u32, r:f32,g:f32,b:f32,a:f32) { gl.push(OP_UNIFORM4FV); pu32(gl,s); pf32(gl,r); pf32(gl,g); pf32(gl,b); pf32(gl,a); }
fn emit_1i(gl: &mut Vec<u8>, s: u32, v: u32) { gl.push(OP_UNIFORM1I); pu32(gl,s); pu32(gl,v); }
fn emit_m3(gl: &mut Vec<u8>, s: u32, m: &[f32;9]) { gl.push(OP_UNIFORM_MATRIX3FV); pu32(gl,s); for v in m { pf32(gl,*v); } }

struct Renderable {
    verts: Vec<f32>, norms: Vec<f32>, uvs: Vec<f32>, indices: Vec<u32>,
    color: [f32;4], specular: [f32;3], shininess: f32, mat_type: MaterialType,
    has_tex: bool,
}

pub struct ShaderGenerator { cache: HashMap<u64,(String,String,u32)>, next_id: u32, emitted: Vec<u64> }
impl ShaderGenerator {
    pub fn new() -> Self { ShaderGenerator { cache: HashMap::new(), next_id: 1, emitted: Vec::new() } }
    fn hash(lights: &[Light], mt: &MaterialType) -> u64 {
        let mut h:u64 = match mt { MaterialType::Basic=>0, MaterialType::Phong=>1 };
        for l in lights { h=h.wrapping_mul(31).wrapping_add(match l { Light::Ambient{..}=>0, Light::Directional{..}=>1 }); }
        h
    }
    pub fn generate(&mut self, lights: &[Light], mt: &MaterialType, has_uv: bool) -> (String,String,u32,bool) {
        let h=Self::hash(lights,mt).wrapping_add(if has_uv { 1 } else { 0 });
        let is_new = !self.emitted.contains(&h);
        if is_new { self.emitted.push(h); }
        if let Some((vs,fs,pid)) = self.cache.get(&h) { return (vs.clone(),fs.clone(),*pid,is_new); }
        let pid = self.next_id; self.next_id += 1;
        let vs=Self::vs(lights,mt,has_uv); let fs=Self::fs(lights,mt,has_uv);
        self.cache.insert(h,(vs.clone(),fs.clone(),pid));
        self.emitted.push(h);
        (vs,fs,pid,true)
    }
    pub fn reset_pass(&mut self) { self.emitted.clear(); }
    fn vs(lights: &[Light], mt: &MaterialType, has_uv: bool) -> String {
        let has_dir=lights.iter().any(|l|matches!(l,Light::Directional{..}));
        let needs_normals = has_dir && *mt == MaterialType::Phong;
        let mut s=String::from("#version 300 es\nin vec3 position;\n");
        if needs_normals { s.push_str("in vec3 normal;\n"); }
        if has_uv { s.push_str("in vec2 uv;\nout vec2 vUv;\n"); }
        s.push_str("uniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\n");
        if needs_normals { s.push_str("uniform mat3 normalMatrix;\nout vec3 vNormal;\n"); }
        s.push_str("out vec3 vViewPosition;\nvoid main(){\nvec4 mvPos=modelViewMatrix*vec4(position,1.0);\ngl_Position=projectionMatrix*mvPos;\nvViewPosition=-mvPos.xyz;\n");
        if has_uv { s.push_str("vUv=uv;\n"); }
        if needs_normals { s.push_str("vNormal=normalize(normalMatrix*normal);\n"); }
        s.push_str("}\n"); s
    }
    fn fs(lights: &[Light], mt: &MaterialType, has_uv: bool) -> String {
        let has_amb=lights.iter().any(|l|matches!(l,Light::Ambient{..}));
        let dirs:Vec<_>=lights.iter().filter(|l|matches!(l,Light::Directional{..})).collect();
        let ph=*mt==MaterialType::Phong;
        let mut s=String::from("#version 300 es\nprecision highp float;\n");
        if ph && !dirs.is_empty() { s.push_str("in vec3 vNormal;\n"); }
        if has_uv { s.push_str("in vec2 vUv;\nuniform sampler2D map;\n"); }
        s.push_str("in vec3 vViewPosition;\nout vec4 fragColor;\n");
        if has_amb { s.push_str("uniform vec3 ambientLightColor;\n"); }
        if !has_uv { s.push_str("uniform vec3 diffuse;\n"); }
        if ph { s.push_str("uniform vec3 specular;\nuniform float shininess;\n"); }
        for(i,_) in dirs.iter().enumerate() {
            s.push_str(&format!("uniform vec3 directionalLightColor[{}];\n",i+1));
            s.push_str(&format!("uniform vec3 directionalLightDirection[{}];\n",i+1));
        }
        s.push_str("void main(){\nvec3 baseColor=");
        if has_uv { s.push_str("texture(map,vUv).rgb"); }
        else { s.push_str("diffuse"); }
        s.push_str(";\nvec3 color=");
        if has_amb {
            s.push_str("ambientLightColor*baseColor");
        } else if ph && !dirs.is_empty() {
            s.push_str("vec3(0.0)");
        } else {
            s.push_str("baseColor");
        }
        s.push_str(";\n");
        if ph && !dirs.is_empty() {
            s.push_str("vec3 normal=normalize(vNormal);\nvec3 viewDir=normalize(vViewPosition);\n");
            for(i,_) in dirs.iter().enumerate() {
                s.push_str(&format!("vec3 ld{}=normalize(directionalLightDirection[{}]);\n",i,i));
                s.push_str(&format!("color+=directionalLightColor[{}]*baseColor*max(dot(normal,ld{}),0.0);\n",i,i));
                if ph {
                    s.push_str(&format!("vec3 hv{}=normalize(ld{}+viewDir);\n",i,i));
                    s.push_str(&format!("color+=directionalLightColor[{}]*specular*pow(max(dot(normal,hv{}),0.0),shininess);\n",i,i));
                }
            }
        }
        s.push_str("fragColor=vec4(color,1.0);\n}\n"); s
    }
}

/// Render with Three.js-compatible command ordering:
/// Phase 1: all vertex/index buffers → Phase 2: clear → Phase 3: per-object (shader+uniforms+attrib+draw)
pub fn render(store: &Store, root_id: u32, clear_color: Option<[f32;4]>, sg: &mut ShaderGenerator) -> Vec<u8> {
    let lights = store.get_lights();
    let mut gl = Vec::new();
    let cc = clear_color.unwrap_or([0.,0.,0.,1.]);

    let mut ra: Vec<Renderable> = Vec::new();
    collect(store, root_id, None, &mut ra);
    if ra.is_empty() { return gl; }

    // Find camera: walk scene children, use object positioned away from origin
    let root = store.get_object(root_id);
    let mut cam_wm = Matrix4::identity();
    for &cid in &root.children {
        let obj = store.get_object(cid);
        let p = &obj.position;
        // Camera has non-zero Z position (or non-zero position in general) and no geometry
        if (p.x != 0.0 || p.y != 0.0 || p.z != 0.0) && obj.geometry_id.is_none() {
            cam_wm = obj.matrix_world.clone();
            break;
        }
    }
    // Fallback: first child
    if cam_wm.elements.iter().all(|&v| v == 0.0 || (v == 1.0 && cam_wm.elements[15] == 1.0 && cam_wm.elements[0] == 1.0)) {
        if let Some(&cid) = root.children.first() {
            cam_wm = store.get_object(cid).matrix_world.clone();
        }
    }
    let view = cam_wm.inverse();
    let proj = Matrix4::perspective(60.0_f32.to_radians(), 1.0, 0.1, 100.0);
    let has_dir = lights.iter().any(|l|matches!(l,Light::Directional{..}));

    // Phase 1: ALL vertex + normal + index buffers (Three.js order)
    for r in &ra {
        // Position buffer (stride=12, tightly packed 3 floats)
        gl.push(OP_BUFFER_DATA); pu32(&mut gl, GL_ARRAY_BUFFER);
        pu32(&mut gl, (r.verts.len()*4) as u32);
        for v in &r.verts { pf32(&mut gl, *v); }
    }
    if has_dir {
        for r in &ra {
            // Normal buffer (stride=12, tightly packed 3 floats)
            gl.push(OP_BUFFER_DATA); pu32(&mut gl, GL_ARRAY_BUFFER);
            pu32(&mut gl, (r.norms.len()*4) as u32);
            for n in &r.norms { pf32(&mut gl, *n); }
        }
    }

    // Phase 2: Clear
    gl.push(OP_CLEAR_COLOR); pf32(&mut gl, cc[0]); pf32(&mut gl, cc[1]); pf32(&mut gl, cc[2]); pf32(&mut gl, cc[3]);

    // Emit texture data if any object uses UVs
    let any_tex = ra.iter().any(|r| r.has_tex);
    if any_tex {
        // 2x2 checkerboard: red, green, blue, white
        let tex: [u8; 16] = [255,0,0,255, 0,255,0,255, 0,0,255,255, 255,255,255,255];
        gl.push(OP_TEX_IMAGE2D); pu32(&mut gl, 2); pu32(&mut gl, 2); // 2x2 RGBA
        gl.extend_from_slice(&tex);
    }

    // Phase 3: Per-object sorted by (material_type, has_tex, geometry_hash) matching Three.js order
    let mut order: Vec<usize> = (0..ra.len()).collect();
    order.sort_by_key(|&i| {
        let r = &ra[i];
        let mt = match r.mat_type { MaterialType::Basic=>0u8, MaterialType::Phong=>1u8 };
        let tex = if r.has_tex { 0u8 } else { 1u8 };
        let geo_hash = (r.verts.len() as u64).wrapping_mul(31).wrapping_add(r.indices.len() as u64);
        (mt, tex, geo_hash)
    });

    for &idx in &order {
        let r = &ra[idx];
        let mt = &r.mat_type;
        let model = Matrix4::identity();
        let mv = Matrix4::multiply_matrices(&view, &model);
        let nm = if has_dir { inv_transpose_3x3(&mv) } else { [1.,0.,0.,0.,1.,0.,0.,0.,1.] };

        // Shader per material
        let has_uv = r.has_tex;
        let (vs, fs, pid, is_new) = sg.generate(lights, mt, has_uv);
        if is_new {
            gl.push(OP_CREATE_VERTEX_SHADER); pu32(&mut gl, vs.len() as u32); gl.extend_from_slice(vs.as_bytes());
            gl.push(OP_CREATE_FRAGMENT_SHADER); pu32(&mut gl, fs.len() as u32); gl.extend_from_slice(fs.as_bytes());
            gl.push(OP_LINK_PROGRAM);
        }
        gl.push(OP_USE_PROGRAM); pu32(&mut gl, pid);

        // Uniforms matching Three.js order per material
        emit_m4(&mut gl, U_PROJECTION, &proj);
        emit_m4(&mut gl, U_MODELVIEW, &mv);
        if has_dir {
            emit_m3(&mut gl, U_NORMAL, &nm);
        }

        // Material uniforms
        emit_3f(&mut gl, U_DIFFUSE, r.color[0], r.color[1], r.color[2]);
        if *mt == MaterialType::Phong {
            emit_3f(&mut gl, U_SPECULAR, r.specular[0], r.specular[1], r.specular[2]);
            emit_1f(&mut gl, U_SHININESS, r.shininess);
        }
        emit_1f(&mut gl, U_OPACITY, r.color[3]);

        // Light uniforms
        let mut amb=[0.0f32;3]; let mut di=0u32;
        for l in lights {
            match l {
                Light::Ambient{color,intensity} => { amb=[color[0]*intensity,color[1]*intensity,color[2]*intensity]; }
                Light::Directional{color,intensity,direction} => {
                    emit_3f(&mut gl, U_LIGHT_COLOR+di, color[0]*intensity, color[1]*intensity, color[2]*intensity);
                    emit_3f(&mut gl, U_LIGHT_DIR+di, direction[0], direction[1], direction[2]);
                    di+=1;
                }
            }
        }
        emit_3f(&mut gl, U_AMBIENT, amb[0], amb[1], amb[2]);

        // Per-object interleaved vertex buffer: [px,py,pz, nx,ny,nz, (u,v)]
        let stride = if has_uv { 32u32 } else if has_dir { 24u32 } else { 12u32 };
        let vert_count = r.verts.len() / 3;
        let mut interleaved = Vec::with_capacity(vert_count * (stride as usize / 4));
        for vi in 0..vert_count {
            let vbase = vi * 3; let nbase = vi * 3;
            interleaved.push(r.verts[vbase]); interleaved.push(r.verts[vbase+1]); interleaved.push(r.verts[vbase+2]);
            if has_dir && vi < r.norms.len()/3 { interleaved.push(r.norms[nbase]); interleaved.push(r.norms[nbase+1]); interleaved.push(r.norms[nbase+2]); }
            else if has_dir { interleaved.push(0.0); interleaved.push(1.0); interleaved.push(0.0); }
            if has_uv { let ub = vi * 2; interleaved.push(r.uvs[ub]); interleaved.push(r.uvs[ub+1]); }
        }
        gl.push(OP_BUFFER_DATA); pu32(&mut gl, GL_ARRAY_BUFFER);
        pu32(&mut gl, (interleaved.len() * 4) as u32);
        for v in &interleaved { pf32(&mut gl, *v); }

        // Index buffer
        if !r.indices.is_empty() {
            gl.push(OP_BIND_INDEX_BUFFER); pu32(&mut gl, GL_ELEMENT_ARRAY_BUFFER);
            pu32(&mut gl, (r.indices.len()*2) as u32);
            for idx in &r.indices { pu16(&mut gl, *idx as u16); }
        }

        // Position attribute
        gl.push(OP_ENABLE_VERTEX_ATTRIB_ARRAY); pu32(&mut gl, 0);
        gl.push(OP_VERTEX_ATTRIB_POINTER);
        pu32(&mut gl, 0); pu32(&mut gl, 3); pu32(&mut gl, GL_FLOAT); gl.push(0); pu32(&mut gl, stride); pu32(&mut gl, 0);

        // Normal attribute (if lighting)
        if has_dir {
            gl.push(OP_ENABLE_VERTEX_ATTRIB_ARRAY); pu32(&mut gl, 1);
            gl.push(OP_VERTEX_ATTRIB_POINTER);
            pu32(&mut gl, 1); pu32(&mut gl, 3); pu32(&mut gl, GL_FLOAT); gl.push(0); pu32(&mut gl, stride); pu32(&mut gl, 12);
        }

        // UV attribute (if texture)
        if has_uv {
            gl.push(OP_ENABLE_VERTEX_ATTRIB_ARRAY); pu32(&mut gl, 2);
            gl.push(OP_VERTEX_ATTRIB_POINTER);
            pu32(&mut gl, 2); pu32(&mut gl, 2); pu32(&mut gl, GL_FLOAT); gl.push(0); pu32(&mut gl, stride); pu32(&mut gl, 24);
        }

        // Draw (indexed)
        if !r.indices.is_empty() {
            gl.push(OP_DRAW_ELEMENTS); pu32(&mut gl, GL_TRIANGLES); pu32(&mut gl, r.indices.len() as u32); pu32(&mut gl, GL_UNSIGNED_SHORT); pu32(&mut gl, 0);
        } else {
            gl.push(OP_DRAW_ARRAYS); pu32(&mut gl, GL_TRIANGLES); pu32(&mut gl, 0); pu32(&mut gl, (r.verts.len()/3) as u32);
        }
    }
    gl
}

fn collect(store: &Store, obj_id: u32, pm: Option<&Matrix4>, out: &mut Vec<Renderable>) {
    let obj = store.get_object(obj_id);
    let wm = if let Some(p) = pm { Matrix4::multiply_matrices(p, &obj.matrix) } else { obj.matrix.clone() };
    if let (Some(gid), Some(mid)) = (obj.geometry_id, obj.material_id) {
        if let (Some(g), Some(m)) = (store.get_geometry(gid), store.get_material(mid)) {
            let verts = transform_verts(&g.vertices, &wm);
            let norms = if !g.indices.is_empty() { compute_normals(&g.vertices, &g.indices) } else { vec![] };
            let has_tex = !g.uvs.is_empty();
            out.push(Renderable {
                verts, norms, uvs: g.uvs.clone(), indices: g.indices.clone(),
                color: m.color, specular: m.specular, shininess: m.shininess, mat_type: m.material_type.clone(),
                has_tex,
            });
        }
    }
    for &c in &obj.children.clone() { collect(store, c, Some(&wm), out); }
}
