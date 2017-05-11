/**
 * @author pailhead / www.dusanbosnjak.com
 */

import { Mesh } from './Mesh';
import { Object3D } from '../core/Object3D';
import { InstancedBufferGeometry } from '../core/InstancedBufferGeometry';
import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute';
import { Matrix3 } from '../math/Matrix3';
import { Matrix4 } from '../math/Matrix4';

import { MeshDepthMaterial } from '../materials/MeshDepthMaterial';
import { RGBADepthPacking } from '../constants';
import { ShaderMaterial } from '../materials/ShaderMaterial';
import { UniformsUtils } from '../renderers/shaders/UniformsUtils';
import { ShaderLib } from '../renderers/shaders/ShaderLib';


//custom depth and distance material to be attached to meshes

var depthMaterialTemplate = new MeshDepthMaterial();

depthMaterialTemplate.depthPacking = RGBADepthPacking;

depthMaterialTemplate.clipping = true;

depthMaterialTemplate.defines = {

	INSTANCE_TRANSFORM: ''

};

var 
	
	distanceShader = ShaderLib[ "distanceRGBA" ],
	distanceUniforms = UniformsUtils.clone( distanceShader.uniforms ),
	distanceMaterialTemplate = new ShaderMaterial( {
		defines: {
			'USE_SHADOWMAP': '',
			'INSTANCE_TRANSFORM': ''
		},
		uniforms: distanceUniforms,
		vertexShader: distanceShader.vertexShader,
		fragmentShader: distanceShader.fragmentShader,
		clipping: true
	})
;

//main class
function InstancedMesh ( bufferGeometry , material , numInstances , dynamic , colors , uniformScale ) {

	Mesh.call( this , (new InstancedBufferGeometry()).copy( bufferGeometry ) ); //hacky for now

	this._dynamic = !!dynamic; //TODO: set a bit mask for different attributes?

 	this._uniformScale = !!uniformScale;

 	this._colors = !!colors;

	this.numInstances = numInstances;

	this._setAttributes();

	/**
	 * use the setter to decorate this material
	 * this is in lieu of changing the renderer
	 * WebGLRenderer injects stuff like this
	 */
	this.material = material.clone();
 	
	this.frustumCulled = false; //you can uncheck this if you generate your own bounding info

	//make it work with depth effects
	this.customDepthMaterial = depthMaterialTemplate; 

	this.customDistanceMaterial = distanceMaterialTemplate;

}

InstancedMesh.prototype = Object.create( Mesh.prototype );

InstancedMesh.constructor = InstancedMesh;

//this is kinda gnarly, done in order to avoid setting these defines in the WebGLRenderer (it manages most if not all of the define flags)
Object.defineProperties( InstancedMesh.prototype , {

	'material': {

		set: function( m ){ 

			/**
			 * whenever a material is set, decorate it, 
			 * if a material used with regular geometry is passed, 
			 * it will mutate it which is bad mkay
			 *
			 * either flag Material with these instance properties:
			 * 
			 *  "i want to create a RED PLASTIC material that will
			 *   be INSTANCED and i know it will be used on clones
			 *   that are known to be UNIFORMly scaled"
			 *  (also figure out where dynamic fits here)
			 *  
			 * or check here if the material has INSTANCE_TRANSFORM
			 * define set, if not, clone, document that it breaks reference
			 * or do a shallow copy or something
			 * 
			 * or something else?
			 */
			m = m.clone();

			if ( m.defines ) {
				
				m.defines.INSTANCE_TRANSFORM = '';
				
				if ( this._uniformScale ) m.defines.INSTANCE_UNIFORM = ''; //an optimization, should avoid doing an expensive matrix inverse in the shader
				else delete m.defines['INSTANCE_UNIFORM'];

				if ( this._colors ) m.defines.INSTANCE_COLOR = '';
				else delete m.defines['INSTANCE_COLOR'];
			}

			else{ 
			
				m.defines = { INSTANCE_TRANSFORM: '' };

				if ( this._uniformScale ) m.defines.INSTANCE_UNIFORM = '';
				if ( this._colors ) m.defines.INSTANCE_COLOR = '';
			}

			this._material = m;

		},

		get: function(){ return this._material; }

	},

	//force new attributes to be created when set?
	'numInstances': {

		set: function( v ){ 

			this._numInstances = v;

			//reset buffers

			this._setAttributes();

		},

		get: function(){ return this._numInstances; }

	},

	//do some auto-magic when BufferGeometry is set
	//TODO: account for Geometry, or change this approach completely 
	'geometry':{

		set: function( g ){ 

			//if its not already instanced attach buffers
			if ( !!g.attributes.instancePosition ) {

				this._geometry = new InstancedBufferGeometry();

				this._setAttributes();

			} 

			else 

				this._geometry = g;

		},

		get: function(){ return this._geometry; }

	}

});

InstancedMesh.prototype.setPositionAt = function( index , position ){

	this.geometry.attributes.instancePosition.setXYZ( index , position.x , position.y , position.z );

};

InstancedMesh.prototype.setQuaternionAt = function ( index , quat ) {

	this.geometry.attributes.instanceQuaternion.setXYZW( index , quat.x , quat.y , quat.z , quat.w );

};

InstancedMesh.prototype.setScaleAt = function ( index , scale ) {

	this.geometry.attributes.instanceScale.setXYZ( index , scale.x , scale.y , scale.z );

};

InstancedMesh.prototype.setColorAt = function ( index , color ) {

	if( !this._colors ) {

		console.warn( 'THREE.InstancedMesh: color not enabled');

		return;

	}

	this.geometry.attributes.instanceColor.setXYZ( 
		index , 
		Math.floor( color.r * 255 ), 
		Math.floor( color.g * 255 ), 
		Math.floor( color.b * 255 )
	);

};

InstancedMesh.prototype.needsUpdate = function( attribute ){

	switch ( attribute ){

		case 'position' :

			this.geometry.attributes.instancePosition.needsUpdate =   true;

			break;

		case 'quaternion' :

			this.geometry.attributes.instanceQuaternion.needsUpdate = true;

			break;

		case 'scale' :

			this.geometry.attributes.instanceScale.needsUpdate =      true;

			break;

		case 'colors' :

			this.geometry.attributes.instanceColor.needsUpdate =      true;

		default:

			this.geometry.attributes.instancePosition.needsUpdate =   true;
			this.geometry.attributes.instanceQuaternion.needsUpdate = true;
			this.geometry.attributes.instanceScale.needsUpdate =      true;
			this.geometry.attributes.instanceColor.needsUpdate =      true;

			break;

	}

};

InstancedMesh.prototype._setAttributes = function(){

	this.geometry.addAttribute( 'instancePosition' , 	new InstancedBufferAttribute( new Float32Array( this.numInstances * 3 ) , 3 , 1 ) ); 
	this.geometry.addAttribute( 'instanceQuaternion' , 	new InstancedBufferAttribute( new Float32Array( this.numInstances * 4 ) , 4 , 1 ) );
	this.geometry.addAttribute( 'instanceScale' , 		new InstancedBufferAttribute( new Float32Array( this.numInstances * 3 ) , 3 , 1 ) );

	//TODO: allow different combinations
	this.geometry.attributes.instancePosition.dynamic = this._dynamic;
	this.geometry.attributes.instanceQuaternion.dynamic = this._dynamic;
	this.geometry.attributes.instanceScale.dynamic = this._dynamic;
	
	if ( this._colors ){

		this.geometry.addAttribute( 'instanceColor' , 	new InstancedBufferAttribute( new Uint8Array( this.numInstances * 3 ) , 3 , 1 ) );
		this.geometry.attributes.instanceColor.normalized = true;
		this.geometry.attributes.instanceColor.dynamic = this._dynamic;

	}	

};

export { InstancedMesh };