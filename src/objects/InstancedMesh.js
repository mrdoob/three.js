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

function InstancedMesh ( bufferGeometry , material , numInstances , uniformScale ) {

	Mesh.call( this , (new InstancedBufferGeometry()).copy( bufferGeometry ) );


	this.numInstances = numInstances;

	this._setAttributes();

	//use the setter to decorate this material
	this.material = material.clone();
 	
 	this._uniformScale = !!uniformScale;

	this.frustumCulled = false; //you can uncheck this if you generate your own bounding info

	//work with depth effects
	this.customDepthMaterial = depthMaterialTemplate; 

	this.customDistanceMaterial = distanceMaterialTemplate;

}

InstancedMesh.prototype = Object.create( Mesh.prototype );

InstancedMesh.constructor = InstancedMesh;

// Object.defineProperty( InstancedMesh.prototype, 'material', {
Object.defineProperties( InstancedMesh.prototype , {

	'material': {

		set: function( m ){ 

			if ( m.defines ) {
			
				m.defines.INSTANCE_TRANSFORM = '';
				
				if( this._uniformScale) m.defines.INSTANCE_UNIFORM = '';

			}

			else{ 
			
				m.defines = { INSTANCE_TRANSFORM: '' };

				if ( this._uniformScale ) m.defines.INSTANCE_UNIFORM = '';
			
			}

			this._material = m;

		},

		get: function(){ return this._material; }

	},

	'numInstances': {

		set: function( v ){ 

			this._numInstances = v;

			//reset buffers

			this._setAttributes();

		},

		get: function(){ return this._numInstances; }

	},

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

InstancedMesh.prototype.needsUpdate = function( attribute ){

	switch ( attribute ){

		case 'position' :

			this.geometry.attributes.instancePosition.needsUpdate = 	true;

			break;

		case 'quaternion' :

			this.geometry.attributes.instanceQuaternion.needsUpdate = 	true;

			break;

		case 'scale' :

			this.geometry.attributes.instanceScale.needsUpdate = 		true;

			break;

		default:

			this.geometry.attributes.instancePosition.needsUpdate = 	true;
			this.geometry.attributes.instanceQuaternion.needsUpdate = 	true;
			this.geometry.attributes.instanceScale.needsUpdate = 		true;

			break;

	}

}

InstancedMesh.prototype._setAttributes = function(){

	this.geometry.addAttribute( 'instancePosition' , 	new THREE.InstancedBufferAttribute( new Float32Array( this.numInstances * 3 ) , 3 , 1 ) ); 
	this.geometry.addAttribute( 'instanceQuaternion' , 	new THREE.InstancedBufferAttribute( new Float32Array( this.numInstances * 4 ) , 4 , 1 ) );
	this.geometry.addAttribute( 'instanceScale' , 		new THREE.InstancedBufferAttribute( new Float32Array( this.numInstances * 3 ) , 3 , 1 ) );

};

export { InstancedMesh };