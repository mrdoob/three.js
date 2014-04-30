function ComponentClass ( opts ) {

	opts = opts || {};

	var defaultSrc = [
		'// hello world',
		'this.update = function () {',
		'  // this.target',
		'};',
	].join('\n');

	this.uuid = THREE.Math.generateUUID();
	this.name = opts.name || 'Unnamed Component';
	this.src = opts.src || defaultSrc;
	this.instances = [];

}