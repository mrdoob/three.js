mod core;
mod math;
mod id;
mod geometry;
mod material;
mod light;
mod renderer;
#[allow(dead_code, unused_imports, non_snake_case)]
mod command_generated;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn init_core() {
    console_error_panic_hook::set_once();
    core::init_store();
}

#[wasm_bindgen]
pub fn create_object() -> u32 {
    core::with_store(|s| s.create_object())
}

#[wasm_bindgen]
pub fn set_object_position(id: u32, x: f32, y: f32, z: f32) {
    core::with_store(|s| s.set_position(id, x, y, z))
}

#[wasm_bindgen]
pub fn set_object_rotation(id: u32, x: f32, y: f32, z: f32, order: u8) {
    let order = math::RotationOrder::from_u8(order);
    core::with_store(|s| s.set_rotation(id, x, y, z, order))
}

#[wasm_bindgen]
pub fn set_object_scale(id: u32, x: f32, y: f32, z: f32) {
    core::with_store(|s| s.set_scale(id, x, y, z))
}

#[wasm_bindgen]
pub fn add_object_child(parent: u32, child: u32) {
    core::with_store(|s| s.add_child(parent, child))
}

#[wasm_bindgen]
pub fn update_matrix_world(force: bool) {
    core::with_store(|s| s.update_matrix_world(force))
}

#[wasm_bindgen]
pub fn get_object_world_matrix(id: u32) -> Vec<f32> {
    core::with_store(|s| {
        let obj = s.get_object(id);
        obj.matrix_world.elements.to_vec()
    })
}

#[wasm_bindgen]
pub fn get_object_position(id: u32) -> Vec<f32> {
    core::with_store(|s| {
        let obj = s.get_object(id);
        vec![obj.position.x, obj.position.y, obj.position.z]
    })
}

#[wasm_bindgen]
pub fn get_object_world_matrix_needs_update(id: u32) -> bool {
    core::with_store(|s| {
        let obj = s.get_object(id);
        obj.matrix_world_needs_update
    })
}

/// Batched geometry + position + material + UV setup in one WASM call.
#[wasm_bindgen]
pub fn create_geometries_batch(
    vert_data: Vec<f32>, vert_offsets: Vec<u32>,
    idx_data: Vec<u32>, idx_offsets: Vec<u32>,
    obj_ids: Vec<u32>,
    pos_data: Vec<f32>,
    mat_data: Vec<f32>,
    parent_ids: Vec<u32>,
    uv_data: Vec<f32>, uv_offsets: Vec<u32>, has_uv: Vec<u8>,
) {
    core::with_store(|s| {
        for i in 0..obj_ids.len() {
            let oid = obj_ids[i];
            // Position
            let pi = i * 3;
            s.set_position(oid, pos_data[pi], pos_data[pi+1], pos_data[pi+2]);
            // Material
            let mi = i * 9;
            let color = [mat_data[mi], mat_data[mi+1], mat_data[mi+2], mat_data[mi+3]];
            let specular = [mat_data[mi+4], mat_data[mi+5], mat_data[mi+6]];
            let shininess = mat_data[mi+7];
            let mt = if mat_data[mi+8] > 0.5 { crate::material::MaterialType::Phong } else { crate::material::MaterialType::Basic };
            let mat_id = s.create_material(color, specular, shininess, mt);
            s.set_object_material(oid, mat_id);
            // Geometry with UVs
            let vi = i * 2; let ii = i * 2;
            let v_start = vert_offsets[vi] as usize;
            let v_count = vert_offsets[vi+1] as usize;
            let i_start = idx_offsets[ii] as usize;
            let i_count = idx_offsets[ii+1] as usize;
            let verts = vert_data[v_start..v_start+v_count].to_vec();
            let idxs = if i_count > 0 { idx_data[i_start..i_start+i_count].to_vec() } else { Vec::new() };
            // UVs for this object
            let ui = i * 2;
            let u_start = uv_offsets[ui] as usize;
            let u_count = uv_offsets[ui+1] as usize;
            let uvs = if u_count > 0 && u_start + u_count <= uv_data.len() {
                uv_data[u_start..u_start+u_count].to_vec()
            } else { Vec::new() };
            let geo_id = s.create_geometry_with_uvs(verts, idxs, uvs);
            s.set_object_geometry(oid, geo_id);
            // Parent
            s.add_child(parent_ids[i], oid);
        }
        s.update_matrix_world(true);
    });
}

/// Set scene lights directly (bypasses FlatBuffers LightData parsing issue).
/// Data layout: [type, r, g, b, intensity, dir_x, dir_y, dir_z] repeated per light.
#[wasm_bindgen]
pub fn set_scene_lights(data: Vec<f32>) {
    core::with_store(|s| {
        let mut lights: Vec<crate::light::Light> = Vec::new();
        for chunk in data.chunks(8) {
            if chunk.len() < 8 { break; }
            let light_type = chunk[0] as u8;
            let color = [chunk[1], chunk[2], chunk[3]];
            let intensity = chunk[4];
            let direction = [chunk[5], chunk[6], chunk[7]];
            match light_type {
                0 => lights.push(crate::light::Light::new_ambient(color, intensity)),
                1 => lights.push(crate::light::Light::new_directional(color, intensity, direction)),
                _ => {}
            }
        }
        s.set_lights_direct(lights);
    });
}

/// Get GL bytecode directly (avoids FlatBuffers ResponseBatch parsing overhead)
#[wasm_bindgen]
pub fn get_gl_commands() -> Vec<u8> {
    unsafe { core::GL_BUFFER.clone() }
}

/// Process a batch of commands encoded as a FlatBuffers CommandBatch.
/// GL bytecode is written to the shared buffer (read via get_gl_buffer_ptr/len).
/// Returns FlatBuffers ResponseBatch bytes (results only, no gl_commands copy).
/// Rendering is triggered internally when CAMERA_VIEW ReadRequest is present.
#[wasm_bindgen]
pub fn process_commands(data: Vec<u8>) -> Vec<u8> {
    core::with_store(|s| s.process_commands(&data))
}
