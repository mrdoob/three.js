/**
 * @author meatbags / xavierburrow.com, github/meatbags
 */

THREE.HalftonePass = function(width, height) {
	THREE.Pass.call(this);

	this.width = width;
	this.height = height;

	if (THREE.HalftoneShader === undefined) {
		console.error('THREE.HalftonePass requires THREE.HalftoneShader');
	}

	this.uniforms = THREE.UniformsUtils.clone(THREE.HalftoneShader.uniforms);
	this.material = new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		fragmentShader: THREE.HalftoneShader.fragmentShader,
		vertexShader: THREE.HalftoneShader.vertexShader
	});

	this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	this.scene = new THREE.Scene();
	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.quad.frustumCulled = false;
	this.scene.add(this.quad);
};

THREE.HalftonePass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.HalftonePass,

	render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
		this.material.uniforms["tDiffuse"].value = readBuffer.texture;
		this.quad.material = this.material;

		if (this.renderToScreen) {
			renderer.render(this.scene, this.camera);
		} else {
			renderer.render(this.scene, this.camera, writeBuffer, this.clear);
		}
	},

	setSize: function(width, height) {
		this.width = width;
		this.height = height;
		this.uniforms['width'].value = this.width;
		this.uniforms['height'].value = this.height;
	}
});
