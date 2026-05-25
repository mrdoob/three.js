use std::collections::HashMap;

#[derive(Clone, Debug)]
pub struct Material {
    pub id: u32,
    pub color: [f32; 4],
    pub specular: [f32; 3],
    pub shininess: f32,
    pub material_type: MaterialType,
}

#[derive(Clone, Debug, PartialEq)]
pub enum MaterialType {
    Basic,
    Phong,
}

impl Material {
    pub fn new(id: u32, color: [f32; 4], specular: [f32; 3], shininess: f32, material_type: MaterialType) -> Self {
        Material { id, color, specular, shininess, material_type }
    }
}

pub struct MaterialStore {
    materials: HashMap<u32, Material>,
    next_id: u32,
}

impl MaterialStore {
    pub fn new() -> Self {
        MaterialStore {
            materials: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn create(&mut self, color: [f32; 4], specular: [f32; 3], shininess: f32, material_type: MaterialType) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.materials.insert(id, Material::new(id, color, specular, shininess, material_type));
        id
    }

    pub fn get(&self, id: u32) -> Option<&Material> {
        self.materials.get(&id)
    }
}
