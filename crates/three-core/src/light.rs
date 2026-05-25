#[derive(Clone, Debug)]
pub enum Light {
    Ambient {
        color: [f32; 3],
        intensity: f32,
    },
    Directional {
        color: [f32; 3],
        intensity: f32,
        direction: [f32; 3],
    },
}

impl Light {
    pub fn new_ambient(color: [f32; 3], intensity: f32) -> Self {
        Light::Ambient { color, intensity }
    }

    pub fn new_directional(color: [f32; 3], intensity: f32, direction: [f32; 3]) -> Self {
        Light::Directional { color, intensity, direction }
    }
}

#[derive(Default)]
pub struct LightStore {
    lights: Vec<Light>,
}

impl LightStore {
    pub fn new() -> Self {
        LightStore { lights: Vec::new() }
    }

    pub fn set_lights(&mut self, lights: Vec<Light>) {
        self.lights = lights;
    }

    pub fn get_lights(&self) -> &[Light] {
        &self.lights
    }

    pub fn hash_config(&self) -> u64 {
        let mut h: u64 = 0;
        for light in &self.lights {
            h = h.wrapping_mul(31).wrapping_add(match light {
                Light::Ambient { .. } => 0,
                Light::Directional { .. } => 1,
            });
        }
        h
    }
}
