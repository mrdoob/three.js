import { LabelElement, ToggleInput, SelectInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { onValidNode, onValidType } from '../NodeEditorUtils.js';
import { texture, uv } from 'three/nodes';
import { Texture, TextureLoader, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping } from 'three';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

const textureLoader = new TextureLoader();
const defaultTexture = new Texture();

let defaultUV = null;

const getTexture = ( url ) => {

	return textureLoader.load( url );

};

export class TextureEditor extends BaseNodeEditor {

	constructor() {

		const node = texture( defaultTexture );

		super( 'Texture', node, 250 );

		this.texture = null;

		this._initFile();
		this._initParams();

		this.onValidElement = () => {};

	}

	_initFile() {

		const fileElement = setInputAestheticsFromType( new LabelElement( 'File' ), 'URL' );

		fileElement.onValid( onValidType( 'URL' ) ).onConnect( () => {

			const textureNode = this.value;
			const fileEditorElement = fileElement.getLinkedElement();

			this.texture = fileEditorElement ? getTexture( fileEditorElement.node.getURL() ) : null;

			textureNode.value = this.texture || defaultTexture;

			this.update();

		}, true );

		this.add( fileElement );

	}

	_initParams() {

		const uvField = setInputAestheticsFromType( new LabelElement( 'UV' ), 'Vector2' );

		uvField.onValid( onValidNode ).onConnect( () => {

			const node = this.value;

			node.uvNode = uvField.getLinkedObject() || defaultUV || ( defaultUV = uv() );

		} );

		this.wrapSInput = new SelectInput( [
			{ name: 'Repeat Wrapping', value: RepeatWrapping },
			{ name: 'Clamp To Edge Wrapping', value: ClampToEdgeWrapping },
			{ name: 'Mirrored Repeat Wrapping', value: MirroredRepeatWrapping }
		], RepeatWrapping ).onChange( () => {

			this.update();

		} );

		this.wrapTInput = new SelectInput( [
			{ name: 'Repeat Wrapping', value: RepeatWrapping },
			{ name: 'Clamp To Edge Wrapping', value: ClampToEdgeWrapping },
			{ name: 'Mirrored Repeat Wrapping', value: MirroredRepeatWrapping }
		], RepeatWrapping ).onChange( () => {

			this.update();

		} );

		this.flipYInput = new ToggleInput( false ).onChange( () => {

			this.update();

		} );

		this.add( uvField )
			.add( new LabelElement( 'Wrap S' ).add( this.wrapSInput ) )
			.add( new LabelElement( 'Wrap T' ).add( this.wrapTInput ) )
			.add( new LabelElement( 'Flip Y' ).add( this.flipYInput ) );

	}

	update() {

		const texture = this.texture;

		if ( texture ) {

			texture.wrapS = Number( this.wrapSInput.getValue() );
			texture.wrapT = Number( this.wrapTInput.getValue() );
			texture.flipY = this.flipYInput.getValue();
			texture.dispose();

			this.invalidate();

		}

	}

}
