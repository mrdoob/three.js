import { NumberInput, StringInput, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { Mesh, MathUtils, Vector3} from '../../../../build/three.module.js';

export class MeshEditor extends BaseNode {

	constructor( mesh = null ) {

		if ( mesh === null ) {

			mesh = new Mesh();

		}

		super( 'Mesh', 1, mesh );

		this.material = null;

		this.defaultMaterial = null;
		this.defaultPosition = new Vector3();
		this.defaultRotation = new Vector3();
		this.defaultScale = new Vector3( 100, 100, 100 );

		this._initTags();
		this._initTransform();
		this._initMaterial();

		this.updateDefault();
		this.update();

		this.onValidElement = () => {};

	}

	setEditor( editor ) {

		if ( this.editor ) {
			
			this._restoreDefault();
			
		}

		super.setEditor( editor );

		if ( editor ) {

			const name = this.nameInput.getValue();
			const mesh = editor.scene.getObjectByName( name );

			this.value = mesh;

			this.updateDefault();
			this.update();

		}

		return this;

	}

	get mesh() {

		return this.value;

	}

	_initMaterial() {

		const materialElement = new LabelElement( 'Material' ).setInputColor( 'forestgreen' ).setInput( 1 );

		materialElement.onValid( ( source, target, stage ) => {

			const object = target.getObject();

			if ( object && object.isMaterial !== true ) {

				if ( stage === 'dragged' ) {

					const name = target.node.getName();

					this.editor.tips.error( `"${name}" is not a Material.` );

				}

				return false;

			}

		} ).onConnect( () => {

			this.material = materialElement.getLinkedObject() || this.defaultMaterial;

			this.update();

		} );

		this.add( materialElement );

	}

	_initTags() {

		this.nameInput = new StringInput( this.mesh.name ).setReadOnly( true )
			.onChange( () => this.mesh.name = this.nameInput.getValue() );

		this.add( new LabelElement( 'Name' ).add( this.nameInput ) );

	}

	_initTransform() {

		const update = () => this.update();

		const posX = new NumberInput().setTagColor( 'red' ).onChange( update );
		const posY = new NumberInput().setTagColor( 'green' ).onChange( update );
		const posZ = new NumberInput().setTagColor( 'blue' ).onChange( update );

		const rotationStep = 1;

		const rotX = new NumberInput().setTagColor( 'red' ).setStep( rotationStep ).onChange( update );
		const rotY = new NumberInput().setTagColor( 'green' ).setStep( rotationStep ).onChange( update );
		const rotZ = new NumberInput().setTagColor( 'blue' ).setStep( rotationStep ).onChange( update );

		const scaleX = new NumberInput( 100 ).setTagColor( 'red' ).setStep( rotationStep ).onChange( update );
		const scaleY = new NumberInput( 100 ).setTagColor( 'green' ).setStep( rotationStep ).onChange( update );
		const scaleZ = new NumberInput( 100 ).setTagColor( 'blue' ).setStep( rotationStep ).onChange( update );

		this.add( new LabelElement( 'Position' ).add( posX ).add( posY ).add( posZ ) )
			.add( new LabelElement( 'Rotation' ).add( rotX ).add( rotY ).add( rotZ ) )
			.add( new LabelElement( 'Scale' ).add( scaleX ).add( scaleY ).add( scaleZ ) );

		this.posX = posX;
		this.posY = posY;
		this.posZ = posZ;

		this.rotX = rotX;
		this.rotY = rotY;
		this.rotZ = rotZ;

		this.scaleX = scaleX;
		this.scaleY = scaleY;
		this.scaleZ = scaleZ;

	}

	update() {

		const mesh = this.mesh;

		if ( mesh ) {
			
			const { position, rotation, scale } = mesh;

			position.x = this.posX.getValue();
			position.y = this.posY.getValue();
			position.z = this.posZ.getValue();

			rotation.x = MathUtils.degToRad( this.rotX.getValue() );
			rotation.y = MathUtils.degToRad( this.rotY.getValue() );
			rotation.z = MathUtils.degToRad( this.rotZ.getValue() );
			
			scale.x = this.scaleX.getValue() / 100;
			scale.y = this.scaleY.getValue() / 100;
			scale.z = this.scaleZ.getValue() / 100;
			
			mesh.material = this.material || this.defaultMaterial;

		}

	}
	
	updateDefault() {

		const { material, position, rotation, scale } = this.mesh;

		this.defaultMaterial = material;

		this.defaultPosition = position.clone();
		this.defaultRotation = new Vector3( MathUtils.radToDeg( rotation.x ), MathUtils.radToDeg( rotation.y ), MathUtils.radToDeg( rotation.z ) );
		this.defaultScale = scale.clone().multiplyScalar( 100 );

		this._restoreDefault();

	}
	
	_restoreDefault() {
		
		const position = this.defaultPosition;
		const rotation = this.defaultRotation;
		const scale = this.defaultScale;

		this.posX.setValue( position.x );
		this.posY.setValue( position.y );
		this.posZ.setValue( position.z );

		this.rotX.setValue( rotation.x );
		this.rotY.setValue( rotation.y );
		this.rotZ.setValue( rotation.z );

		this.scaleX.setValue( scale.x );
		this.scaleY.setValue( scale.y );
		this.scaleZ.setValue( scale.z );
		
		this.mesh.material = this.defaultMaterial;
		
	}

}
