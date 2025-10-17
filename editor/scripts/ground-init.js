// Get all query string parameters
const urlParams = new URLSearchParams(window.location.search);

// Helper function to get parameter value
function getParam(name) {
	return urlParams.get('ground_' + name);
}

// Helper function to load texture
function loadTexture(url) {
	const loader = new THREE.TextureLoader();
	return loader.load(url);
}

// Update geometry (radius)
const radiusValue = getParam('radius');
if (radiusValue !== null) {
	const radius = parseFloat(radiusValue);
	if (!isNaN(radius) && radius > 0) {
		// Update the geometry with new radius
		const segments = this.geometry.parameters.widthSegments || 32;
		this.geometry.dispose();
		this.geometry = new THREE.CircleGeometry(radius, segments);
	}
}

// Update position
const posX = getParam('position_x');
const posY = getParam('position_y');
const posZ = getParam('position_z');
if (posX !== null) this.position.x = parseFloat(posX);
if (posY !== null) this.position.y = parseFloat(posY);
if (posZ !== null) this.position.z = parseFloat(posZ);

// Update rotation (in degrees, converted to radians)
const rotX = getParam('rotation_x');
const rotY = getParam('rotation_y');
const rotZ = getParam('rotation_z');
if (rotX !== null) this.rotation.x = parseFloat(rotX) * Math.PI / 180;
if (rotY !== null) this.rotation.y = parseFloat(rotY) * Math.PI / 180;
if (rotZ !== null) this.rotation.z = parseFloat(rotZ) * Math.PI / 180;

// Update material textures
const mapUrl = getParam('map');
if (mapUrl !== null) {
	this.material.map = loadTexture(mapUrl);
	this.material.needsUpdate = true;
}

const normalMapUrl = getParam('normal_map');
if (normalMapUrl !== null) {
	this.material.normalMap = loadTexture(normalMapUrl);
	this.material.needsUpdate = true;
}

const roughMapUrl = getParam('rough_map');
if (roughMapUrl !== null) {
	this.material.roughnessMap = loadTexture(roughMapUrl);
	this.material.needsUpdate = true;
}

const metalMapUrl = getParam('metal_map');
if (metalMapUrl !== null) {
	this.material.metalnessMap = loadTexture(metalMapUrl);
	this.material.needsUpdate = true;
}

const aoMapUrl = getParam('ao_map');
if (aoMapUrl !== null) {
	this.material.aoMap = loadTexture(aoMapUrl);
	this.material.needsUpdate = true;
}

const envMapUrl = getParam('env_map');
if (envMapUrl !== null) {
	this.material.envMap = loadTexture(envMapUrl);
	this.material.needsUpdate = true;
}

const lightMapUrl = getParam('light_map');
if (lightMapUrl !== null) {
	this.material.lightMap = loadTexture(lightMapUrl);
	this.material.needsUpdate = true;
}

const emissiveMapUrl = getParam('emissive_map');
if (emissiveMapUrl !== null) {
	this.material.emissiveMap = loadTexture(emissiveMapUrl);
	this.material.needsUpdate = true;
}

// Update material properties
const roughness = getParam('roughness');
if (roughness !== null) {
	this.material.roughness = parseFloat(roughness);
	this.material.needsUpdate = true;
}

const metalness = getParam('metalness');
if (metalness !== null) {
	this.material.metalness = parseFloat(metalness);
	this.material.needsUpdate = true;
}

const side = getParam('side');
if (side !== null) {
	const sideMap = {
		'front': THREE.FrontSide,
		'back': THREE.BackSide,
		'double': THREE.DoubleSide
	};
	if (sideMap[side.toLowerCase()]) {
		this.material.side = sideMap[side.toLowerCase()];
		this.material.needsUpdate = true;
	}
}

const blending = getParam('blending');
if (blending !== null) {
	const blendingMap = {
		'normal': THREE.NormalBlending,
		'additive': THREE.AdditiveBlending,
		'subtractive': THREE.SubtractiveBlending,
		'multiply': THREE.MultiplyBlending
	};
	if (blendingMap[blending.toLowerCase()]) {
		this.material.blending = blendingMap[blending.toLowerCase()];
		this.material.needsUpdate = true;
	}
}

const opacity = getParam('opacity');
if (opacity !== null) {
	this.material.opacity = parseFloat(opacity);
	this.material.needsUpdate = true;
}

const transparent = getParam('transparent');
if (transparent !== null) {
	this.material.transparent = (transparent.toLowerCase() === 'true');
	this.material.needsUpdate = true;
}

// Update texture repeat if specified
const repeatValue = getParam('texture_repeat');
if (repeatValue !== null && this.material.map) {
	const repeat = parseFloat(repeatValue);
	if (!isNaN(repeat) && repeat > 0) {
		if (this.material.map) {
			this.material.map.wrapS = this.material.map.wrapT = THREE.RepeatWrapping;
			this.material.map.repeat.set(repeat, repeat);
			this.material.map.needsUpdate = true;
		}
		if (this.material.normalMap) {
			this.material.normalMap.wrapS = this.material.normalMap.wrapT = THREE.RepeatWrapping;
			this.material.normalMap.repeat.set(repeat, repeat);
			this.material.normalMap.needsUpdate = true;
		}
	}
}

function update(event) { }
