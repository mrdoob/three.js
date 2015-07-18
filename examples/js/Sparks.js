/*
 * @author zz85 (http://github.com/zz85 http://www.lab4games.net/zz85/blog)
 *
 * a simple to use javascript 3d particles system inspired by FliNT and Stardust
 * created with TWEEN.js and THREE.js
 *
 * for feature requests or bugs, please visit https://github.com/zz85/sparks.js
 *
 * licensed under the MIT license
 */

var SPARKS = {};

/********************************
* Emitter Class
*
*   Creates and Manages Particles
*********************************/

SPARKS.Emitter = function (counter) {

	this._counter = counter ? counter : new SPARKS.SteadyCounter(10); // provides number of particles to produce

	this._particles = [];


	this._initializers = []; // use for creation of particles
	this._actions = [];     // uses action to update particles
	this._activities = [];  //  not supported yet

	this._handlers = [];

	this.callbacks = {};
};


SPARKS.Emitter.prototype = {

	_TIMESTEP: 15,
	_timer: null,
	_lastTime: null,
	_timerStep: 10,
	_velocityVerlet: true,

	// run its built in timer / stepping
	start: function() {
		this._lastTime = Date.now();
		this._timer = setTimeout(this.step, this._timerStep, this);
		this._isRunning = true;
	},

	stop: function() {
		this._isRunning = false;
		clearTimeout(this._timer);
	},

	isRunning: function() {
		return this._isRunning & true;
	},

	// Step gets called upon by the engine
	// but attempts to call update() on a regular basics
	// This method is also described in http://gameclosure.com/2011/04/11/deterministic-delta-tee-in-js-games/
	step: function(emitter) {

		var time = Date.now();
		var elapsed = time - emitter._lastTime;

		if (!this._velocityVerlet) {
			// if elapsed is way higher than time step, (usually after switching tabs, or excution cached in ff)
			// we will drop cycles. perhaps set to a limit of 10 or something?
			var maxBlock = emitter._TIMESTEP * 20;

			if (elapsed >= maxBlock) {
				//console.log('warning: sparks.js is fast fowarding engine, skipping steps', elapsed / emitter._TIMESTEP);
				//emitter.update( (elapsed - maxBlock) / 1000);
				elapsed = maxBlock;
			}

			while (elapsed >= emitter._TIMESTEP) {
				emitter.update(emitter._TIMESTEP / 1000);
				elapsed -= emitter._TIMESTEP;
			}
			emitter._lastTime = time - elapsed;

		} else {
			emitter.update(elapsed / 1000);
			emitter._lastTime = time;
		}



		if (emitter._isRunning)
		setTimeout(emitter.step, emitter._timerStep, emitter);

	},


	// Update particle engine in seconds, not milliseconds
    update: function(time) {

	var i, j;
	var len = this._counter.updateEmitter( this, time );

        // Create particles
	for ( i = 0; i < len; i ++ ) {
		this.createParticle();
	}

        // Update activities
	len = this._activities.length;
	for ( i = 0; i < len; i ++ )
        {
		this._activities[i].update( this, time );
	}


	len = this._actions.length;

	var particle;
	var action;
	var len2 = this._particles.length;

	for ( j = 0; j < len; j ++ )
        {
		action = this._actions[j];
		for ( i = 0; i < len2; ++ i )
            {
			particle = this._particles[i];
			action.update( this, particle, time );
		}
	}


        // remove dead particles
	for ( i = len2; i --; )
        {
		particle = this._particles[i];
		if ( particle.isDead )
            {
                //particle =
			this._particles.splice( i, 1 );
			this.dispatchEvent("dead", particle);
			SPARKS.VectorPool.release(particle.position); //
			SPARKS.VectorPool.release(particle.velocity);

		} else {
			this.dispatchEvent("updated", particle);
		}
	}

	this.dispatchEvent("loopUpdated");

    },

    createParticle: function() {
	var particle = new SPARKS.Particle();
        // In future, use a Particle Factory
	var len = this._initializers.length, i;

	for ( i = 0; i < len; i ++ ) {
		this._initializers[i].initialize( this, particle );
	}

	this._particles.push( particle );

	this.dispatchEvent("created", particle); // ParticleCreated

	return particle;
    },

    addInitializer: function (initializer) {
	this._initializers.push(initializer);
    },

    addAction: function (action) {
	this._actions.push(action);
    },

    removeInitializer: function (initializer) {
	var index = this._initializers.indexOf(initializer);
	if (index > -1) {
		this._initializers.splice( index, 1 );
	}
    },

    removeAction: function (action) {
	var index = this._actions.indexOf(action);
	if (index > -1) {
		this._actions.splice( index, 1 );
	}
		//console.log('removeAction', index, this._actions);
    },

    addCallback: function(name, callback) {
	this.callbacks[name] = callback;
    },

    dispatchEvent: function(name, args) {
	var callback = this.callbacks[name];
	if (callback) {
		callback(args);
	}

    }


};


/*
 * Constant Names for
 * Events called by emitter.dispatchEvent()
 *
 */
SPARKS.EVENT_PARTICLE_CREATED = "created"
SPARKS.EVENT_PARTICLE_UPDATED = "updated"
SPARKS.EVENT_PARTICLE_DEAD = "dead";
SPARKS.EVENT_LOOP_UPDATED = "loopUpdated";



/*
 * Steady Counter attempts to produces a particle rate steadily
 *
 */

// Number of particles per seconds
SPARKS.SteadyCounter = function(rate) {
	this.rate = rate;

	// we use a shortfall counter to make up for slow emitters
	this.leftover = 0;

};

SPARKS.SteadyCounter.prototype.updateEmitter = function(emitter, time) {

	var targetRelease = time * this.rate + this.leftover;
	var actualRelease = Math.floor(targetRelease);

	this.leftover = targetRelease - actualRelease;

	return actualRelease;
};


/*
 * Shot Counter produces specified particles
 * on a single impluse or burst
 */

SPARKS.ShotCounter = function(particles) {
	this.particles = particles;
	this.used = false;
};

SPARKS.ShotCounter.prototype.updateEmitter = function(emitter, time) {

	if (this.used) {
		return 0;
	} else {
		this.used = true;
	}

	return this.particles;
};


/********************************
* Particle Class
*
*   Represents a single particle
*********************************/
SPARKS.Particle = function() {

    /**
     * The lifetime of the particle, in seconds.
     */
	this.lifetime = 0;

    /**
     * The age of the particle, in seconds.
     */
	this.age = 0;

    /**
     * The energy of the particle.
     */
	this.energy = 1;

    /**
     * Whether the particle is dead and should be removed from the stage.
     */
	this.isDead = false;

	this.target = null; // tag

    /**
     * For 3D
     */

	this.position = SPARKS.VectorPool.get().set(0, 0, 0); //new THREE.Vector3( 0, 0, 0 );
	this.velocity = SPARKS.VectorPool.get().set(0, 0, 0); //new THREE.Vector3( 0, 0, 0 );
	this._oldvelocity = SPARKS.VectorPool.get().set(0, 0, 0);
     // rotation vec3
     // angVelocity vec3
     // faceAxis vec3

};


/********************************
* Action Classes
*
*   An abstract class which have
*   update function
*********************************/
SPARKS.Action = function() {
	this._priority = 0;
};


SPARKS.Age = function(easing) {
	this._easing = (easing == null) ? TWEEN.Easing.Linear.None : easing;
};

SPARKS.Age.prototype.update = function (emitter, particle, time) {
	particle.age += time;
	if ( particle.age >= particle.lifetime )
    {
		particle.energy = 0;
		particle.isDead = true;
	}
    else
	{
		var t = this._easing(particle.age / particle.lifetime);
		particle.energy = -1 * t + 1;
	}
};

/*
// Mark particle as dead when particle's < 0

SPARKS.Death = function(easing) {
    this._easing = (easing == null) ? TWEEN.Linear.None : easing;
};

SPARKS.Death.prototype.update = function (emitter, particle, time) {
    if (particle.life <= 0) {
        particle.isDead = true;
    }
};
*/


SPARKS.Move = function() {

};

SPARKS.Move.prototype.update = function(emitter, particle, time) {
    // attempt verlet velocity updating.
	var p = particle.position;
	var v = particle.velocity;
	var old = particle._oldvelocity;

	if (this._velocityVerlet) {
		p.x += (v.x + old.x) * 0.5 * time;
		p.y += (v.y + old.y) * 0.5 * time;
		p.z += (v.z + old.z) * 0.5 * time;
	} else {
		p.x += v.x * time;
		p.y += v.y * time;
		p.z += v.z * time;
	}

    //  OldVel = Vel;
    // Vel = Vel + Accel * dt;
    // Pos = Pos + (vel + Vel + Accel * dt) * 0.5 * dt;



};

/* Marks particles found in specified zone dead */
SPARKS.DeathZone = function(zone) {
	this.zone = zone;
};

SPARKS.DeathZone.prototype.update = function(emitter, particle, time) {

	if (this.zone.contains(particle.position)) {
		particle.isDead = true;
	}

};

/*
 * SPARKS.ActionZone applies an action when particle is found in zone
 */
SPARKS.ActionZone = function(action, zone) {
	this.action = action;
	this.zone = zone;
};

SPARKS.ActionZone.prototype.update = function(emitter, particle, time) {

	if (this.zone.contains(particle.position)) {
		this.action.update( emitter, particle, time );
	}

};

/*
 * Accelerate action affects velocity in specified 3d direction
 */
SPARKS.Accelerate = function(x,y,z) {

	if (x instanceof THREE.Vector3) {
		this.acceleration = x;
		return;
	}

	this.acceleration = new THREE.Vector3(x,y,z);

};

SPARKS.Accelerate.prototype.update = function(emitter, particle, time) {
	var acc = this.acceleration;

	var v = particle.velocity;

	particle._oldvelocity.set(v.x, v.y, v.z);

	v.x += acc.x * time;
	v.y += acc.y * time;
	v.z += acc.z * time;

};

/*
 * Accelerate Factor accelerate based on a factor of particle's velocity.
 */
SPARKS.AccelerateFactor = function(factor) {
	this.factor = factor;
};

SPARKS.AccelerateFactor.prototype.update = function(emitter, particle, time) {
	var factor = this.factor;

	var v = particle.velocity;
	var len = v.length();
	var adjFactor;
	if (len > 0) {

		adjFactor = factor * time / len;
		adjFactor += 1;

		v.multiplyScalar(adjFactor);
		// v.x *= adjFactor;
		// 	    v.y *= adjFactor;
		// 	    v.z *= adjFactor;
	}

};

/*
AccelerateNormal
 * AccelerateVelocity affects velocity based on its velocity direction
 */
SPARKS.AccelerateVelocity = function(factor) {

	this.factor = factor;

};

SPARKS.AccelerateVelocity.prototype.update = function(emitter, particle, time) {
	var factor = this.factor;

	var v = particle.velocity;


	v.z += - v.x * factor;
	v.y += v.z * factor;
	v.x +=  v.y * factor;

};


/* Set the max ammount of x,y,z drift movements in a second */
SPARKS.RandomDrift = function(x,y,z) {
	if (x instanceof THREE.Vector3) {
		this.drift = x;
		return;
	}

	this.drift = new THREE.Vector3(x,y,z);
}


SPARKS.RandomDrift.prototype.update = function(emitter, particle, time) {
	var drift = this.drift;

	var v = particle.velocity;

	v.x += ( Math.random() - 0.5 ) * drift.x * time;
	v.y += ( Math.random() - 0.5 ) * drift.y * time;
	v.z += ( Math.random() - 0.5 ) * drift.z * time;

};

/********************************
* Zone Classes
*
*   An abstract classes which have
*   getLocation() function
*********************************/
SPARKS.Zone = function() {
};

// TODO, contains() for Zone

SPARKS.PointZone = function(pos) {
	this.pos = pos;
};

SPARKS.PointZone.prototype.getLocation = function() {
	return this.pos;
};

SPARKS.PointZone = function(pos) {
	this.pos = pos;
};

SPARKS.PointZone.prototype.getLocation = function() {
	return this.pos;
};

SPARKS.LineZone = function(start, end) {
	this.start = start;
	this.end = end;
	this._length = end.clone().sub( start );
};

SPARKS.LineZone.prototype.getLocation = function() {
	var len = this._length.clone();

	len.multiplyScalar( Math.random() );
	return len.add( this.start );

};

// Basically a RectangleZone
SPARKS.ParallelogramZone = function(corner, side1, side2) {
	this.corner = corner;
	this.side1 = side1;
	this.side2 = side2;
};

SPARKS.ParallelogramZone.prototype.getLocation = function() {

	var d1 = this.side1.clone().multiplyScalar( Math.random() );
	var d2 = this.side2.clone().multiplyScalar( Math.random() );
	d1.add(d2);
	return d1.add( this.corner );

};

SPARKS.CubeZone = function(position, x, y, z) {
	this.position = position;
	this.x = x;
	this.y = y;
	this.z = z;
};

SPARKS.CubeZone.prototype.getLocation = function() {
    //TODO use pool?

	var location = this.position.clone();
	location.x += Math.random() * this.x;
	location.y += Math.random() * this.y;
	location.z += Math.random() * this.z;

	return location;

};


SPARKS.CubeZone.prototype.contains = function(position) {

	var startX = this.position.x;
	var startY = this.position.y;
	var startZ = this.position.z;
	var x = this.x; // width
	var y = this.y; // depth
	var z = this.z; // height

	if (x < 0) {
		startX += x;
		x = Math.abs(x);
	}

	if (y < 0) {
		startY += y;
		y = Math.abs(y);
	}

	if (z < 0) {
		startZ += z;
		z = Math.abs(z);
	}

	var diffX = position.x - startX;
	var diffY = position.y - startY;
	var diffZ = position.z - startZ;

	if ( (diffX > 0) && (diffX < x) &&
			(diffY > 0) && (diffY < y) &&
			(diffZ > 0) && (diffZ < z) ) {
		return true;
	}

	return false;

};



/**
 * The constructor creates a DiscZone 3D zone.
 *
 * @param centre The point at the center of the disc.
 * @param normal A vector normal to the disc.
 * @param outerRadius The outer radius of the disc.
 * @param innerRadius The inner radius of the disc. This defines the hole
 * in the center of the disc. If set to zero, there is no hole.
 */

/*
// BUGGY!!
SPARKS.DiscZone = function(center, radiusNormal, outerRadius, innerRadius) {
    this.center = center;
	this.radiusNormal = radiusNormal;
	this.outerRadius = (outerRadius==undefined) ? 0 : outerRadius;
	this.innerRadius = (innerRadius==undefined) ? 0 : innerRadius;

};

SPARKS.DiscZone.prototype.getLocation = function() {
    var rand = Math.random();
	var _innerRadius = this.innerRadius;
	var _outerRadius = this.outerRadius;
	var center = this.center;
	var _normal = this.radiusNormal;

	_distToOrigin = _normal.dot( center );

	var radius = _innerRadius + (1 - rand * rand ) * ( _outerRadius - _innerRadius );
	var angle = Math.random() * SPARKS.Utils.TWOPI;

	var _distToOrigin = _normal.dot( center );
	var axes = SPARKS.Utils.getPerpendiculars( _normal.clone() );
	var _planeAxis1 = axes[0];
	var _planeAxis2 = axes[1];

	var p = _planeAxis1.clone();
	p.multiplyScalar( radius * Math.cos( angle ) );
	var p2 = _planeAxis2.clone();
	p2.multiplyScalar( radius * Math.sin( angle ) );
	p.add( p2 );
	return _center.add( p );

};
*/

SPARKS.SphereCapZone = function(x, y, z, minr, maxr, angle) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.minr = minr;
	this.maxr = maxr;
	this.angle = angle;
};

SPARKS.SphereCapZone.prototype.getLocation = function() {
	var theta = Math.PI * 2  * SPARKS.Utils.random();
	var r = SPARKS.Utils.random();

    //new THREE.Vector3
	var v =  SPARKS.VectorPool.get().set(r * Math.cos(theta), -1 / Math.tan(this.angle * SPARKS.Utils.DEGREE_TO_RADIAN), r * Math.sin(theta));

    //v.length = StardustMath.interpolate(0, _minRadius, 1, _maxRadius, Math.random());

	var i = this.minr - ((this.minr - this.maxr) *  Math.random() );
	v.multiplyScalar(i);

	v.__markedForReleased = true;

	return v;
};


/********************************
* Initializer Classes
*
*   Classes which initializes
*   particles. Implements initialize( emitter:Emitter, particle:Particle )
*********************************/

// Specifies random life between max and min
SPARKS.Lifetime = function(min, max) {
	this._min = min;

	this._max = max ? max : min;

};

SPARKS.Lifetime.prototype.initialize = function( emitter/*Emitter*/, particle/*Particle*/ ) {
	particle.lifetime = this._min + SPARKS.Utils.random() * ( this._max - this._min );
};


SPARKS.Position = function(zone) {
	this.zone = zone;
};

SPARKS.Position.prototype.initialize = function( emitter/*Emitter*/, particle/*Particle*/ ) {
	var pos = this.zone.getLocation();
	particle.position.set(pos.x, pos.y, pos.z);
};

SPARKS.Velocity = function(zone) {
	this.zone = zone;
};

SPARKS.Velocity.prototype.initialize = function( emitter/*Emitter*/, particle/*Particle*/ ) {
	var pos = this.zone.getLocation();
	particle.velocity.set(pos.x, pos.y, pos.z);
	if (pos.__markedForReleased) {
		//console.log("release");
		SPARKS.VectorPool.release(pos);
		pos.__markedForReleased = false;
	}
};

SPARKS.Target = function(target, callback) {
	this.target = target;
	this.callback = callback;
};

SPARKS.Target.prototype.initialize = function( emitter, particle ) {

	if (this.callback) {
		particle.target = this.callback();
	} else {
		particle.target = this.target;
	}

};

/********************************
* VectorPool
*
*  Reuse much of Vectors if possible
*********************************/

SPARKS.VectorPool = {
	__pools: [],

	// Get a new Vector
	get: function() {
		if (this.__pools.length > 0) {
			return this.__pools.pop();
		}

		return this._addToPool();

	},

	// Release a vector back into the pool
	release: function(v) {
		this.__pools.push(v);
	},

	// Create a bunch of vectors and add to the pool
	_addToPool: function() {
		//console.log("creating some pools");

		for (var i = 0, size = 100; i < size; i ++) {
			this.__pools.push(new THREE.Vector3());
		}

		return new THREE.Vector3();

	}



};


/********************************
* Util Classes
*
*   Classes which initializes
*   particles. Implements initialize( emitter:Emitter, particle:Particle )
*********************************/
SPARKS.Utils = {
    random: function() {
	return Math.random();
    },
    DEGREE_TO_RADIAN: Math.PI / 180,
	TWOPI: Math.PI * 2,

	getPerpendiculars: function(normal) {
		var p1 = this.getPerpendicular( normal );
		var p2 = normal.cross( p1 );
		p2.normalize();
		return [ p1, p2 ];
	},

	getPerpendicular: function( v )
	{
		if ( v.x == 0 )
		{
			return new THREE.Vector3D( 1, 0, 0 );
		}
		else
		{
			var temp = new THREE.Vector3( v.y, -v.x, 0 );
			return temp.normalize();
		}
	}

};
