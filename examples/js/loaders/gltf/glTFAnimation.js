/**
 * @author Tony Parisi / http://www.tonyparisi.com/
 */

THREE.glTFAnimator = ( function () {

	var animators = [];

	return	{
		add : function(animator)
		{
			animators.push(animator);
		},

		remove: function(animator)
		{

			var i = animators.indexOf(animator);

			if ( i !== -1 ) {
				animators.splice( i, 1 );
			}
		},

		update : function()
		{
			for (i = 0; i < animators.length; i++)
			{
				animators[i].update();
			}
		},
	};
})();

// Construction/initialization
THREE.glTFAnimation = function(interps)
{
	this.running = false;
	this.loop = false;
	this.duration = 0;
	this.startTime = 0;
	this.interps = [];
	
	if (interps)
	{
		this.createInterpolators(interps);
	}
}

THREE.glTFAnimation.prototype.createInterpolators = function(interps)
{
	var i, len = interps.length;
	for (i = 0; i < len; i++)
	{
		var interp = new THREE.glTFInterpolator(interps[i]);
		this.interps.push(interp);
		this.duration = Math.max(this.duration, interp.duration);
	}
}

// Start/stop
THREE.glTFAnimation.prototype.play = function()
{
	if (this.running)
		return;
	
	this.startTime = Date.now();
	this.running = true;
	THREE.glTFAnimator.add(this);
}

THREE.glTFAnimation.prototype.stop = function()
{
	this.running = false;
	THREE.glTFAnimator.remove(this);
}

// Update - drive key frame evaluation
THREE.glTFAnimation.prototype.update = function()
{
	if (!this.running)
		return;
	
	var now = Date.now();
	var deltat = (now - this.startTime) / 1000;
	var t = deltat % this.duration;
	var nCycles = Math.floor(deltat / this.duration);
	
	if (nCycles >= 1 && !this.loop)
	{
		this.running = false;
		var i, len = this.interps.length;
		for (i = 0; i < len; i++)
		{
			this.interps[i].interp(this.duration);
		}
		this.stop();
		return;
	}
	else
	{
		var i, len = this.interps.length;
		for (i = 0; i < len; i++)
		{
			this.interps[i].interp(t);
		}
	}
}

//Interpolator class
//Construction/initialization
THREE.glTFInterpolator = function(param) 
{	    		
	this.keys = param.keys;
	this.values = param.values;
	this.count = param.count;
	this.type = param.type;
	this.path = param.path;
	this.isRot = false;
	
	var node = param.target;
	node.updateMatrix();
	node.matrixAutoUpdate = true;
	this.targetNode = node;
	
	switch (param.path) {
		case "translation" :
			this.target = node.position;
			this.originalValue = node.position.clone();
			break;
		case "rotation" :
			this.target = node.quaternion;
			this.originalValue = node.quaternion.clone();
			this.isRot = true;
			break;
		case "scale" :
			this.target = node.scale;
			this.originalValue = node.scale.clone();
			break;
	}
	
	this.duration = this.keys[this.count - 1];
	
	this.vec1 = new THREE.Vector3;
	this.vec2 = new THREE.Vector3;
	this.vec3 = new THREE.Vector3;
	this.quat1 = new THREE.Quaternion;
	this.quat2 = new THREE.Quaternion;
	this.quat3 = new THREE.Quaternion;
}

//Interpolation and tweening methods
THREE.glTFInterpolator.prototype.interp = function(t)
{
	var i, j;
	if (t == this.keys[0])
	{
		if (this.isRot) {
			this.quat3.set(this.values[0], this.values[1], this.values[2], this.values[3]);
		}
		else {
			this.vec3.set(this.values[0], this.values[1], this.values[2]);
		}
	}
	else if (t < this.keys[0])
	{
		if (this.isRot) {
			this.quat1.set(this.originalValue.x,
					this.originalValue.y,
					this.originalValue.z,
					this.originalValue.w);
			this.quat2.set(this.values[0],
					this.values[1],
					this.values[2],
					this.values[3]);
			THREE.Quaternion.slerp(this.quat1, this.quat2, this.quat3, t / this.keys[0]);
		}
		else {
			this.vec3.set(this.originalValue.x,
					this.originalValue.y,
					this.originalValue.z);
			this.vec2.set(this.values[0],
					this.values[1],
					this.values[2]);

			this.vec3.lerp(this.vec2, t / this.keys[0]);
		}
	}
	else if (t >= this.keys[this.count - 1])
	{
		if (this.isRot) {
			this.quat3.set(this.values[(this.count - 1) * 4], 
					this.values[(this.count - 1) * 4 + 1],
					this.values[(this.count - 1) * 4 + 2],
					this.values[(this.count - 1) * 4 + 3]);
		}
		else {
			this.vec3.set(this.values[(this.count - 1) * 3], 
					this.values[(this.count - 1) * 3 + 1],
					this.values[(this.count - 1) * 3 + 2]);
		}
	}
	else
	{
		for (i = 0; i < this.count - 1; i++)
		{
			var key1 = this.keys[i];
			var key2 = this.keys[i + 1];
	
			if (t >= key1 && t <= key2)
			{
				if (this.isRot) {
					this.quat1.set(this.values[i * 4],
							this.values[i * 4 + 1],
							this.values[i * 4 + 2],
							this.values[i * 4 + 3]);
					this.quat2.set(this.values[(i + 1) * 4],
							this.values[(i + 1) * 4 + 1],
							this.values[(i + 1) * 4 + 2],
							this.values[(i + 1) * 4 + 3]);
					THREE.Quaternion.slerp(this.quat1, this.quat2, this.quat3, (t - key1) / (key2 - key1));
				}
				else {
					this.vec3.set(this.values[i * 3],
							this.values[i * 3 + 1],
							this.values[i * 3 + 2]);
					this.vec2.set(this.values[(i + 1) * 3],
							this.values[(i + 1) * 3 + 1],
							this.values[(i + 1) * 3 + 2]);
	
					this.vec3.lerp(this.vec2, (t - key1) / (key2 - key1));
				}
			}
		}
	}
	
	if (this.target)
	{
		this.copyValue(this.target);
	}
}

THREE.glTFInterpolator.prototype.copyValue = function(target) {
	
	if (this.isRot) {
		target.copy(this.quat3);
	}
	else {
		target.copy(this.vec3);
	}		
}
