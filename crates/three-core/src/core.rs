use std::collections::HashMap;
use crate::math::{Matrix4, Vector3, Euler, Quaternion, RotationOrder};
use crate::geometry::GeometryStore;
use crate::material::{MaterialStore, MaterialType};
use crate::light::LightStore;
use crate::renderer::{self, ShaderGenerator};
use crate::id;
use crate::command_generated::three_core::{
    root_as_command_batch, PropPath, Method, ReadResult, ResponseBatch,
    ReadResultArgs, ResponseBatchArgs, Value, LightType,
};

/// Shared GL bytecode buffer accessor (set by process_commands, read by JS via get_gl_buffer_ptr/len)
pub static mut GL_BUFFER: Vec<u8> = Vec::new();

pub struct Object3D {
    pub id: u32,
    pub parent_id: Option<u32>,
    pub children: Vec<u32>,
    pub position: Vector3,
    pub rotation: Euler,
    pub quaternion: Quaternion,
    pub scale: Vector3,
    pub matrix: Matrix4,
    pub matrix_world: Matrix4,
    pub matrix_world_needs_update: bool,
    pub geometry_id: Option<u32>,
    pub material_id: Option<u32>,
}

impl Object3D {
    fn new(id: u32) -> Self {
        Object3D {
            id,
            parent_id: None,
            children: Vec::new(),
            position: Vector3::new(0.0, 0.0, 0.0),
            rotation: Euler::new(0.0, 0.0, 0.0, RotationOrder::XYZ),
            quaternion: Quaternion::identity(),
            scale: Vector3::new(1.0, 1.0, 1.0),
            matrix: Matrix4::identity(),
            matrix_world: Matrix4::identity(),
            matrix_world_needs_update: false,
            geometry_id: None,
            material_id: None,
        }
    }
}

pub struct Store {
    objects: HashMap<u32, Object3D>,
    geometries: GeometryStore,
    materials: MaterialStore,
    lights: LightStore,
    shader_gen: ShaderGenerator,
}

static mut STORE: Option<Store> = None;

pub fn init_store() {
    unsafe {
        id::init_id_allocator();
        STORE = Some(Store {
            objects: HashMap::new(),
            geometries: GeometryStore::new(),
            materials: MaterialStore::new(),
            lights: LightStore::new(),
            shader_gen: ShaderGenerator::new(),
        });
    }
}

pub fn with_store<F, R>(f: F) -> R
where
    F: FnOnce(&mut Store) -> R,
{
    unsafe { f(STORE.as_mut().unwrap()) }
}

impl Store {
    pub fn create_object(&mut self) -> u32 {
        let id = id::alloc_id();
        self.objects.insert(id, Object3D::new(id));
        id
    }

    pub fn get_object(&self, id: u32) -> &Object3D {
        self.objects.get(&id).expect("Object not found")
    }

    pub fn get_object_mut(&mut self, id: u32) -> &mut Object3D {
        self.objects.get_mut(&id).expect("Object not found")
    }

    pub fn get_geometry(&self, id: u32) -> Option<&crate::geometry::Geometry> {
        self.geometries.get(id)
    }

    pub fn get_material(&self, id: u32) -> Option<&crate::material::Material> {
        self.materials.get(id)
    }

    pub fn set_position(&mut self, id: u32, x: f32, y: f32, z: f32) {
        let obj = self.get_object_mut(id);
        obj.position.set(x, y, z);
        obj.matrix_world_needs_update = true;
    }

    pub fn set_rotation(&mut self, id: u32, x: f32, y: f32, z: f32, order: RotationOrder) {
        let obj = self.get_object_mut(id);
        obj.rotation.set(x, y, z, order);
        obj.quaternion.set_from_euler(&obj.rotation);
        obj.matrix_world_needs_update = true;
    }

    pub fn set_scale(&mut self, id: u32, x: f32, y: f32, z: f32) {
        let obj = self.get_object_mut(id);
        obj.scale.set(x, y, z);
        obj.matrix_world_needs_update = true;
    }

    pub fn add_child(&mut self, parent_id: u32, child_id: u32) {
        let old_parent_id = {
            let child = self.get_object_mut(child_id);
            child.parent_id
        };
        if let Some(old_pid) = old_parent_id {
            if old_pid != parent_id {
                let old_parent = self.get_object_mut(old_pid);
                old_parent.children.retain(|&c| c != child_id);
            }
        }

        {
            let child = self.get_object_mut(child_id);
            child.parent_id = Some(parent_id);
            child.matrix_world_needs_update = true;
        }
        let parent = self.get_object_mut(parent_id);
        if !parent.children.contains(&child_id) {
            parent.children.push(child_id);
        }
    }

    pub fn update_matrix_world(&mut self, force: bool) {
        let root_ids: Vec<u32> = self
            .objects
            .values()
            .filter(|obj| obj.parent_id.is_none())
            .map(|obj| obj.id)
            .collect();

        for root_id in root_ids {
            self.update_matrix_world_recursive(root_id, force);
        }
    }

    fn update_matrix_world_recursive(&mut self, id: u32, force: bool) {
        let (needs_update, matrix_world_opt, parent_matrix_world_opt) = {
            let obj = self.get_object_mut(id);
            let needs_update = force || obj.matrix_world_needs_update;
            if needs_update {
                obj.matrix.compose(&obj.position, &obj.quaternion, &obj.scale);
                obj.matrix_world_needs_update = false;
            }
            let matrix_world_copy = if needs_update { Some(obj.matrix.clone()) } else { None };
            let parent_id = obj.parent_id;
            let parent_mw = parent_id.map(|pid| self.get_object(pid).matrix_world.clone());
            (needs_update, matrix_world_copy, parent_mw)
        };

        if needs_update {
            let obj = self.get_object_mut(id);
            if let Some(ref parent_mw) = parent_matrix_world_opt {
                let new_world = Matrix4::multiply_matrices(parent_mw, matrix_world_opt.as_ref().unwrap());
                obj.matrix_world.copy(&new_world);
            } else {
                obj.matrix_world.copy(matrix_world_opt.as_ref().unwrap());
            }
        }

        let children: Vec<u32> = self.get_object(id).children.clone();
        for child_id in children {
            self.update_matrix_world_recursive(child_id, force);
        }
    }

    pub fn get_world_matrix(&self, id: u32) -> &Matrix4 {
        &self.get_object(id).matrix_world
    }

    pub fn create_geometry(&mut self, vertices: Vec<f32>, indices: Vec<u32>) -> u32 {
        self.geometries.create(vertices, indices)
    }

    pub fn create_geometry_with_uvs(&mut self, vertices: Vec<f32>, indices: Vec<u32>, uvs: Vec<f32>) -> u32 {
        self.geometries.create_with_uvs(vertices, indices, uvs)
    }

    pub fn create_material(&mut self, color: [f32; 4], specular: [f32; 3], shininess: f32, mat_type: MaterialType) -> u32 {
        self.materials.create(color, specular, shininess, mat_type)
    }

    pub fn get_lights(&self) -> &[crate::light::Light] {
        self.lights.get_lights()
    }

    pub fn set_lights_direct(&mut self, lights: Vec<crate::light::Light>) {
        self.lights.set_lights(lights);
    }

    pub fn set_object_geometry(&mut self, obj_id: u32, geo_id: u32) {
        let obj = self.get_object_mut(obj_id);
        obj.geometry_id = Some(geo_id);
    }

    pub fn set_object_material(&mut self, obj_id: u32, mat_id: u32) {
        let obj = self.get_object_mut(obj_id);
        obj.material_id = Some(mat_id);
    }

    /// Walk the scene and render: generates GL bytecode
    /// Render scene — called internally from process_commands when CAMERA_VIEW is read.
    /// Walks the scene from root_id to find renderables. The view matrix is the inverse
    /// of the first PerspectiveCamera child's world matrix.
    fn render_scene_internal(&mut self, root_id: u32) -> Vec<u8> {
        self.update_matrix_world(true);
        let shader_gen_ptr: *mut ShaderGenerator = &mut self.shader_gen;
        let shader_gen = unsafe { &mut *shader_gen_ptr };
        shader_gen.reset_pass(); // Clear per-pass emission tracking
        renderer::render(self, root_id, Some([0.0, 0.0, 0.0, 1.0]), shader_gen)
    }

    /// Process a batch of commands encoded as a FlatBuffers CommandBatch.
    /// Returns the bytes of a FlatBuffers ResponseBatch.
    pub fn process_commands(&mut self, data: &[u8]) -> Vec<u8> {
        let batch = root_as_command_batch(data).expect("Invalid CommandBatch");

        // -- Process SetProperty commands --
        if let Some(sets) = batch.sets() {
            for i in 0..sets.len() {
                let set = sets.get(i);
                let obj_id = set.object_id();
                let prop = set.prop_path();
                match prop {
                    PropPath::POSITION => {
                        if let Some(v) = set.value_as_vec_3() {
                            self.set_position(obj_id, v.x(), v.y(), v.z());
                        }
                    }
                    PropPath::ROTATION => {
                        if let Some(v) = set.value_as_euler_value() {
                            let order = RotationOrder::from_u8(v.order());
                            self.set_rotation(obj_id, v.x(), v.y(), v.z(), order);
                        }
                    }
                    PropPath::SCALE => {
                        if let Some(v) = set.value_as_vec_3() {
                            self.set_scale(obj_id, v.x(), v.y(), v.z());
                        }
                    }
                    PropPath::QUATERNION => {
                        if let Some(v) = set.value_as_quat_value() {
                            let obj = self.get_object_mut(obj_id);
                            obj.quaternion = Quaternion::new(v.x(), v.y(), v.z(), v.w());
                            obj.matrix_world_needs_update = true;
                        }
                    }
                    PropPath::GEOMETRY => {
                        if let Some(gd) = set.value_as_geometry_data() {
                            let vertices: Vec<f32> = gd.vertices()
                                .map(|v| v.iter().collect()).unwrap_or_default();
                            let indices: Vec<u32> = gd.indices()
                                .map(|v| v.iter().collect()).unwrap_or_default();
                            let geo_id = self.create_geometry(vertices, indices);
                            self.set_object_geometry(obj_id, geo_id);
                        }
                    }
                    PropPath::MATERIAL => {
                        if let Some(md) = set.value_as_material_data() {
                            let color: Vec<f32> = md.color()
                                .map(|v| v.iter().collect()).unwrap_or(vec![1.0; 4]);
                            let c = [color.get(0).copied().unwrap_or(1.0),
                                     color.get(1).copied().unwrap_or(1.0),
                                     color.get(2).copied().unwrap_or(1.0),
                                     color.get(3).copied().unwrap_or(1.0)];
                            let specular: Vec<f32> = md.specular()
                                .map(|v| v.iter().collect()).unwrap_or(vec![0.0; 3]);
                            let s = [specular.get(0).copied().unwrap_or(0.0),
                                     specular.get(1).copied().unwrap_or(0.0),
                                     specular.get(2).copied().unwrap_or(0.0)];
                            let shininess = md.shininess();
                            let mat_type = if md.material_type() == 1 { MaterialType::Phong } else { MaterialType::Basic };
                            let mat_id = self.create_material(c, s, shininess, mat_type);
                            self.set_object_material(obj_id, mat_id);
                        }
                    }
                    PropPath::SCENE_LIGHTS => {
                        if let Some(ld) = set.value_as_light_data() {
                            let color: Vec<f32> = ld.color()
                                .map(|v| v.iter().collect()).unwrap_or(vec![1.0; 3]);
                            let c = [color.get(0).copied().unwrap_or(1.0),
                                     color.get(1).copied().unwrap_or(1.0),
                                     color.get(2).copied().unwrap_or(1.0)];
                            let intensity = ld.intensity();
                            let light_type = ld.light_type();
                            match light_type {
                                LightType::AMBIENT => {
                                    self.lights.set_lights(vec![
                                        crate::light::Light::new_ambient(c, intensity)
                                    ]);
                                }
                                LightType::DIRECTIONAL => {
                                    let direction: Vec<f32> = ld.direction()
                                        .map(|v| v.iter().collect()).unwrap_or(vec![0.0, -1.0, 0.0]);
                                    let d = [direction.get(0).copied().unwrap_or(0.0),
                                             direction.get(1).copied().unwrap_or(-1.0),
                                             direction.get(2).copied().unwrap_or(0.0)];
                                    // Combine with existing lights
                                    let mut lights = self.lights.get_lights().to_vec();
                                    lights.push(crate::light::Light::new_directional(c, intensity, d));
                                    self.lights.set_lights(lights);
                                }
                                _ => {}
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        // -- Process CallMethod commands --
        let mut render_root_id: Option<u32> = None;

        if let Some(calls) = batch.calls() {
            for i in 0..calls.len() {
                let call = calls.get(i);
                let obj_id = call.object_id();
                let method = call.method();
                match method {
                    Method::ADD_CHILD => {
                        // First arg is the child object ID
                        if let Some(args) = call.args() {
                            for j in 0..args.len() {
                                let arg = args.get(j);
                                if arg.value_type() == Value::FloatV {
                                    if let Some(fv) = arg.value_as_float_v() {
                                        self.add_child(obj_id, fv.v() as u32);
                                    }
                                }
                            }
                        }
                    }
                    Method::UPDATE_MATRIX_WORLD => {
                        let force = if let Some(args) = call.args() {
                            if args.len() > 0 {
                                let arg = args.get(0);
                                if arg.value_type() == Value::FloatV {
                                    arg.value_as_float_v().map(|fv| fv.v() != 0.0).unwrap_or(true)
                                } else {
                                    true
                                }
                            } else {
                                true
                            }
                        } else {
                            true
                        };
                        self.update_matrix_world(force);
                    }
                    Method::CREATE_OBJECT => {
                        self.create_object();
                    }
                    // CREATE_GEOMETRY / CREATE_MATERIAL / SET_OBJECT_* are now handled
                    // via SetProperty with PropPath::GEOMETRY / PropPath::MATERIAL.
                    // These Method variants are retained in schema for forward compatibility.
                    Method::CREATE_GEOMETRY
                    | Method::CREATE_MATERIAL
                    | Method::SET_OBJECT_GEOMETRY
                    | Method::SET_OBJECT_MATERIAL => {}
                    _ => {}
                }
            }
        }

        // -- Process ReadRequest commands --
        let mut read_results: Vec<(u32, Vec<f32>)> = Vec::new();

        if let Some(reads) = batch.reads() {
            for i in 0..reads.len() {
                let read = reads.get(i);
                let token = read.token();
                let obj_id = read.object_id();
                let prop = read.prop_path();

                let data: Vec<f32> = match prop {
                    PropPath::POSITION => {
                        let obj = self.get_object(obj_id);
                        vec![obj.position.x, obj.position.y, obj.position.z]
                    }
                    PropPath::ROTATION => {
                        let obj = self.get_object(obj_id);
                        vec![obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.order as u8 as f32]
                    }
                    PropPath::SCALE => {
                        let obj = self.get_object(obj_id);
                        vec![obj.scale.x, obj.scale.y, obj.scale.z]
                    }
                    PropPath::QUATERNION => {
                        let obj = self.get_object(obj_id);
                        vec![obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w]
                    }
                    PropPath::MATRIX_WORLD => {
                        let obj = self.get_object(obj_id);
                        obj.matrix_world.elements.to_vec()
                    }
                    PropPath::GEOMETRY => {
                        // Return geometry vertex count as a hint
                        if let Some(gid) = self.get_object(obj_id).geometry_id {
                            if let Some(geo) = self.geometries.get(gid) {
                                vec![gid as f32, geo.vertices.len() as f32]
                            } else {
                                vec![0.0, 0.0]
                            }
                        } else {
                            vec![0.0, 0.0]
                        }
                    }
                    PropPath::CAMERA_VIEW => {
                        // Trigger render: set the render root and return a marker
                        render_root_id = Some(obj_id);
                        vec![1.0]
                    }
                    _ => vec![],
                };
                read_results.push((token, data));
            }
        }

        // Generate GL commands if render was requested
        let gl_commands: Vec<u8> = if let Some(root_id) = render_root_id {
            self.render_scene_internal(root_id)
        } else {
            Vec::new()
        };

        // Store in shared buffer for direct WASM access
        unsafe { GL_BUFFER = gl_commands.clone(); }

        // -- Build ResponseBatch (results only, gl_commands via shared buffer) --
        let mut builder = flatbuffers::FlatBufferBuilder::new();

        let mut result_offsets: Vec<flatbuffers::WIPOffset<_>> = Vec::with_capacity(read_results.len());

        for (token, data) in &read_results {
            let data_offset = builder.create_vector(data);
            let rr = ReadResult::create(
                &mut builder,
                &ReadResultArgs {
                    token: *token,
                    data: Some(data_offset),
                },
            );
            result_offsets.push(rr);
        }

        let results_offset = builder.create_vector(&result_offsets);
        let gl_offset = if !gl_commands.is_empty() {
            Some(builder.create_vector(&gl_commands))
        } else {
            None
        };

        let rb = ResponseBatch::create(
            &mut builder,
            &ResponseBatchArgs {
                results: Some(results_offset),
                gl_commands: gl_offset,
            },
        );
        builder.finish(rb, None);

        builder.finished_data().to_vec()
    }
}
