import { LabelElement } from '../../libs/flow.module.js';
import { Object3DEditor } from './Object3DEditor.js';
import { Mesh } from 'three';

export class MeshEditor extends Object3DEditor {

	constructor( mesh = null ) {

		if ( mesh === null ) {

			mesh = new Mesh();

		}

		super( mesh, 'Mesh' );

		this.material = null;

		this.defaultMaterial = null;

		this._initMaterial();

		this.updateDefault();
		this.restoreDefault();
		this.update();

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

	update() {

		super.update();

		const mesh = this.mesh;

		if ( mesh ) {

			mesh.material = this.material || this.defaultMaterial;

		}

	}

	updateDefault() {

		super.updateDefault();

		this.defaultMaterial = this.mesh.material;

	}

	restoreDefault() {

		super.restoreDefault();

		this.mesh.material = this.defaultMaterial;

	}

}
