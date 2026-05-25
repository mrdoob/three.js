use std::collections::HashMap;

pub struct Geometry {
    pub id: u32,
    pub vertices: Vec<f32>,
    pub indices: Vec<u32>,
    pub uvs: Vec<f32>,
}

impl Geometry {
    pub fn new(id: u32, vertices: Vec<f32>, indices: Vec<u32>) -> Self {
        Geometry { id, vertices, indices, uvs: vec![] }
    }
    pub fn new_with_uvs(id: u32, vertices: Vec<f32>, indices: Vec<u32>, uvs: Vec<f32>) -> Self {
        Geometry { id, vertices, indices, uvs }
    }
}

pub struct GeometryStore {
    geometries: HashMap<u32, Geometry>,
    next_id: u32,
}

impl GeometryStore {
    pub fn new() -> Self {
        GeometryStore {
            geometries: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn create(&mut self, vertices: Vec<f32>, indices: Vec<u32>) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.geometries.insert(id, Geometry::new(id, vertices, indices));
        id
    }

    pub fn create_with_uvs(&mut self, vertices: Vec<f32>, indices: Vec<u32>, uvs: Vec<f32>) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.geometries.insert(id, Geometry::new_with_uvs(id, vertices, indices, uvs));
        id
    }

    pub fn get(&self, id: u32) -> Option<&Geometry> {
        self.geometries.get(&id)
    }
}
