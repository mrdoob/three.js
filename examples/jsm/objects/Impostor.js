import {
	Mesh,
	Vector3,
	Box3,
	Sphere,
	Quaternion,
	WebGLRenderTarget,
	RGBAFormat,
	NearestFilter,
	MathUtils,
	PlaneGeometry,
	MeshBasicMaterial
} from '../../../build/three.module.js';

// TODO :
// - put several impostors texture per rendertarget

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q = new Quaternion();

const impostors = [];

const DEFAULT_TEXTURE_SIZE = 64;
const DEFAULT_MAX_UPDATES_PER_FRAME = 10;

class Impostor extends Mesh {

	constructor( object3D, scene, camera, renderer ) {

		const renderTarget = new WebGLRenderTarget(
			DEFAULT_TEXTURE_SIZE,
			DEFAULT_TEXTURE_SIZE,
			{
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				format: RGBAFormat
			}
		);

		const geometry = new PlaneGeometry( 1, 1 );
		const material = new MeshBasicMaterial( {
			map: renderTarget.texture,
			color: 0xffffff,
			transparent: true,
			polygonOffset: true,
			polygonOffsetFactor: - 50
		} );

		super( geometry, material );

		this.scale.set( 10, 10, 1 );
		scene.add( this );

		//

		this.camera = camera;
		this.enabled = true;
		this.impostureDistance = 110;
		this.lights = [];
		this.maxAngle = 0.5;
		this.redrawInterval = null;
		this.renderer = renderer;
		this.scene = scene;

		this.type = 'Impostor';
		this.visible = false;

		// internal

		object3D._impostor = this;
		this._forged = object3D;

		this._renderTarget = renderTarget;
		this._isForging = false;
		this._lastViewAngle = new Vector3();
		this._boundingBox = new Box3();
		this._boundingSphere = new Sphere();
		this._boundingSphereOffset = new Vector3();

		//

		impostors.push( this );

	}

	static maxUpdatesPerFrame = DEFAULT_MAX_UPDATES_PER_FRAME;

	static updateAll() {

		for ( let i = 0; i < impostors.length; i ++ ) {

			impostors[ i ].update();

		}

		impostors
			.filter( i => i._mustRedraw )
			.sort( ( a, b ) => a._lastDistToCam - b._lastDistToCam )
			.filter( ( i, idx ) => idx < this.maxUpdatesPerFrame )
			.forEach( i => i.redraw() );

	}

	update() {

		// compute camera and forged object positions in world space.

		this.camera.updateWorldMatrix( true, false );
		this._forged.updateWorldMatrix( true, false );

		_v1.setScalar( 0 ).applyMatrix4( this.camera.matrixWorld );
		_v2.setScalar( 0 ).applyMatrix4( this._forged.matrixWorld );

		// move the impostor at the forged object position.

		this.position
			.copy( _v2 )
			.add( this._boundingSphereOffset );

		// check the distance between the camera and the forged object,
		// and update impostor/importored visibility accordingly.

		this._lastDistToCam = _v1.distanceTo( _v2 );

		if (
			this.enabled &&
			this._lastDistToCam > this.impostureDistance
		) {

			this.setImposture();

			// check if the new view angle justify a redraw of the impostor texture

			this._forged.worldToLocal( _v1 );
			_v1.normalize();

			if ( _v1.angleTo( this._lastViewAngle ) > this.maxAngle ) {

				this._mustRedraw = true;

			}

		} else {

			this.unsetImposture();

		}

		// if a redrawInterval parameter was set, we redraw the impostor
		// even if the camera angle doesn't justify a redraw.

		if ( this.redrawInterval !== null ) {

			if (
				! this.lastRedrawDate ||
				( Date.now() - this.lastRedrawDate > this.redrawInterval )
			) {

				this._mustRedraw = true;

			}

		}

	}

	//

	setSize( width ) {

		if ( Math.log2( width ) % 1 !== 0 ) {

			console.warn( 'Impostor.setSize: width must be power of two.' );

		} else {

			this._renderTarget.setSize( width, width );

		}

		return this;

	}

	//

	setImposture() {

		if ( ! this._isForging ) {

			this._forged.visible = false;
			this.visible = true;

			this._isForging = true;

			this._mustRedraw = true;

		}

	}

	//

	unsetImposture() {

		if ( this._isForging ) {

			this._forged.visible = true;
			this.visible = false;

			this._isForging = false;

		}

	}

	// render the forged object on the impostor texture.

	redraw() {

		this._forged.visible = true;
		this.visible = false;

		// the impostor will be subject to fog, so we don't want the fog to
		// have an effect when rendering on the texture.

		const fog = this.scene.fog;
		this.scene.fog = null;

		//

		this.attachLights();

		// make scene background transparent.

		const sceneBackground = this.scene.background;
		this.scene.background = null;

		// move the camera to render the object full screen.

		_q.copy( this.camera.quaternion );

		this._boundingBox.setFromObject( this._forged );
		this._boundingBox.getBoundingSphere( this._boundingSphere );
		this.camera.lookAt( this._boundingSphere.center );

		// update camera fov to fit the forged object.

		const camFov = this.camera.fov;
		const camAspect = this.camera.aspect;

		this.camera.updateWorldMatrix( true, false );
		_v1.setScalar( 0 ).applyMatrix4( this.camera.matrixWorld );
		const distance = _v1.distanceTo( this._boundingSphere.center );
		const targetAngle = 2 * Math.atan( this._boundingSphere.radius / distance );

		this.camera.fov = MathUtils.radToDeg( targetAngle );
		this.camera.aspect = 1;

		this.camera.updateProjectionMatrix();

		// update the impostor scale according to the object bounding box.

		this.scale.set(
			this._boundingSphere.radius * 2,
			this._boundingSphere.radius * 2,
			1
		);

		// render the texture.

		this.renderer.setRenderTarget( this._renderTarget );
		this.renderer.render( this._forged, this.camera );

		// undo changes made for the texture render.

		this.renderer.setRenderTarget( null );

		this._forged.visible = ! this._isForging;
		this.visible = this._isForging;

		this.scene.fog = fog;
		this.scene.background = sceneBackground;

		this.camera.quaternion.copy( _q );

		this.camera.fov = camFov;
		this.camera.aspect = camAspect;
		this.camera.updateProjectionMatrix();

		this.detachLights();

		// record the last draw angle, so we can know
		// when the current view angle exceeds the maximum.
		// the angle is recorded in forged object space, to account
		// for the object rotation.

		this.camera.updateWorldMatrix( true, false );
		this._forged.updateWorldMatrix( true, false );
		_v1.setScalar( 0 ).applyMatrix4( this.camera.matrixWorld );
		_v2.setScalar( 0 ).applyMatrix4( this._forged.matrixWorld );

		this._lastViewAngle.copy( _v1 );
		this._forged.worldToLocal( this._lastViewAngle );
		this._lastViewAngle.normalize();

		// in case redrawInterval is set.

		this.lastRedrawDate = Date.now();

		// we record the offset between the bounding sphere center and
		// the forged object position, because the impostor plane is centered
		// on the object geometry and we want to move the impostor each from
		// to match the object position.

		this._boundingSphereOffset.copy( this._boundingSphere.center );
		this._boundingSphereOffset.sub( _v2 );

		// make the plane orient towards the camera

		this.lookAt( _v1 );

		//

		this._mustRedraw = false;

		//

		return this;

	}

	//

	attachLights() {

		this.lights.forEach( light => {

			light._originalParent = light.parent;

			this._forged.attach( light );

		} );

	}

	//

	detachLights() {

		this.lights.forEach( light => {

			if ( light._originalParent ) {

				light._originalParent.attach( light );

			} else {

				this.scene.attach( light );

			}

		} );

	}

}

Impostor.prototype.isImpostor = true;

export { Impostor };
