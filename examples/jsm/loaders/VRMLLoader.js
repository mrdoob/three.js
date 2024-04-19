import {
	BackSide,
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DataTexture,
	DoubleSide,
	FileLoader,
	Float32BufferAttribute,
	FrontSide,
	Group,
	LineBasicMaterial,
	LineSegments,
	Loader,
	LoaderUtils,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	Object3D,
	Points,
	PointsMaterial,
	Quaternion,
	RepeatWrapping,
	Scene,
	ShapeUtils,
	SphereGeometry,
	SRGBColorSpace,
	TextureLoader,
	Vector2,
	Vector3
} from 'three';
import chevrotain from '../libs/chevrotain.module.min.js';


class VRMLLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( data, path ) {

		const nodeMap = {};

		function generateVRMLTree( data ) {

			// create lexer, parser and visitor

			const tokenData = createTokens();

			const lexer = new VRMLLexer( tokenData.tokens );
			const parser = new VRMLParser( tokenData.tokenVocabulary );
			const visitor = createVisitor( parser.getBaseCstVisitorConstructor() );

			// lexing

			const lexingResult = lexer.lex( data );
			parser.input = lexingResult.tokens;

			// parsing

			const cstOutput = parser.vrml();

			if ( parser.errors.length > 0 ) {

				console.error( parser.errors );

				throw Error( 'THREE.VRMLLoader: Parsing errors detected.' );

			}

			// actions

			const ast = visitor.visit( cstOutput );

			return ast;

		}

		function createTokens() {

			const createToken = chevrotain.createToken;

			// from http://gun.teipir.gr/VRML-amgem/spec/part1/concepts.html#SyntaxBasics

			const RouteIdentifier = createToken( { name: 'RouteIdentifier', pattern: /[^\x30-\x39\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d][^\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]*[\.][^\x30-\x39\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d][^\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]*/ } );
			const Identifier = createToken( { name: 'Identifier', pattern: /[^\x30-\x39\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]([^\0-\x20\x22\x27\x23\x2b\x2c\x2e\x5b\x5d\x5c\x7b\x7d])*/, longer_alt: RouteIdentifier } );

			// from http://gun.teipir.gr/VRML-amgem/spec/part1/nodesRef.html

			const nodeTypes = [
				'Anchor', 'Billboard', 'Collision', 'Group', 'Transform', // grouping nodes
				'Inline', 'LOD', 'Switch', // special groups
				'AudioClip', 'DirectionalLight', 'PointLight', 'Script', 'Shape', 'Sound', 'SpotLight', 'WorldInfo', // common nodes
				'CylinderSensor', 'PlaneSensor', 'ProximitySensor', 'SphereSensor', 'TimeSensor', 'TouchSensor', 'VisibilitySensor', // sensors
				'Box', 'Cone', 'Cylinder', 'ElevationGrid', 'Extrusion', 'IndexedFaceSet', 'IndexedLineSet', 'PointSet', 'Sphere', // geometries
				'Color', 'Coordinate', 'Normal', 'TextureCoordinate', // geometric properties
				'Appearance', 'FontStyle', 'ImageTexture', 'Material', 'MovieTexture', 'PixelTexture', 'TextureTransform', // appearance
				'ColorInterpolator', 'CoordinateInterpolator', 'NormalInterpolator', 'OrientationInterpolator', 'PositionInterpolator', 'ScalarInterpolator', // interpolators
				'Background', 'Fog', 'NavigationInfo', 'Viewpoint', // bindable nodes
				'Text' // Text must be placed at the end of the regex so there are no matches for TextureTransform and TextureCoordinate
			];

			//

			const Version = createToken( {
				name: 'Version',
				pattern: /#VRML.*/,
				longer_alt: Identifier
			} );

			const NodeName = createToken( {
				name: 'NodeName',
				pattern: new RegExp( nodeTypes.join( '|' ) ),
				longer_alt: Identifier
			} );

			const DEF = createToken( {
				name: 'DEF',
				pattern: /DEF/,
				longer_alt: Identifier
			} );

			const USE = createToken( {
				name: 'USE',
				pattern: /USE/,
				longer_alt: Identifier
			} );

			const ROUTE = createToken( {
				name: 'ROUTE',
				pattern: /ROUTE/,
				longer_alt: Identifier
			} );

			const TO = createToken( {
				name: 'TO',
				pattern: /TO/,
				longer_alt: Identifier
			} );

			//

			const StringLiteral = createToken( { name: 'StringLiteral', pattern: /"(?:[^\\"\n\r]|\\[bfnrtv"\\/]|\\u[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])*"/ } );
			const HexLiteral = createToken( { name: 'HexLiteral', pattern: /0[xX][0-9a-fA-F]+/ } );
			const NumberLiteral = createToken( { name: 'NumberLiteral', pattern: /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/ } );
			const TrueLiteral = createToken( { name: 'TrueLiteral', pattern: /TRUE/ } );
			const FalseLiteral = createToken( { name: 'FalseLiteral', pattern: /FALSE/ } );
			const NullLiteral = createToken( { name: 'NullLiteral', pattern: /NULL/ } );
			const LSquare = createToken( { name: 'LSquare', pattern: /\[/ } );
			const RSquare = createToken( { name: 'RSquare', pattern: /]/ } );
			const LCurly = createToken( { name: 'LCurly', pattern: /{/ } );
			const RCurly = createToken( { name: 'RCurly', pattern: /}/ } );
			const Comment = createToken( {
				name: 'Comment',
				pattern: /#.*/,
				group: chevrotain.Lexer.SKIPPED
			} );

			// commas, blanks, tabs, newlines and carriage returns are whitespace characters wherever they appear outside of string fields

			const WhiteSpace = createToken( {
				name: 'WhiteSpace',
				pattern: /[ ,\s]/,
				group: chevrotain.Lexer.SKIPPED
			} );

			const tokens = [
				WhiteSpace,
				// keywords appear before the Identifier
				NodeName,
				DEF,
				USE,
				ROUTE,
				TO,
				TrueLiteral,
				FalseLiteral,
				NullLiteral,
				// the Identifier must appear after the keywords because all keywords are valid identifiers
				Version,
				Identifier,
				RouteIdentifier,
				StringLiteral,
				HexLiteral,
				NumberLiteral,
				LSquare,
				RSquare,
				LCurly,
				RCurly,
				Comment
			];

			const tokenVocabulary = {};

			for ( let i = 0, l = tokens.length; i < l; i ++ ) {

				const token = tokens[ i ];

				tokenVocabulary[ token.name ] = token;

			}

			return { tokens: tokens, tokenVocabulary: tokenVocabulary };

		}


		function createVisitor( BaseVRMLVisitor ) {

			// the visitor is created dynmaically based on the given base class

			class VRMLToASTVisitor extends BaseVRMLVisitor {

				constructor() {

					super();

					this.validateVisitor();

				}

				vrml( ctx ) {

					const data = {
						version: this.visit( ctx.version ),
						nodes: [],
						routes: []
					};

					for ( let i = 0, l = ctx.node.length; i < l; i ++ ) {

						const node = ctx.node[ i ];

						data.nodes.push( this.visit( node ) );

					}

					if ( ctx.route ) {

						for ( let i = 0, l = ctx.route.length; i < l; i ++ ) {

							const route = ctx.route[ i ];

							data.routes.push( this.visit( route ) );

						}

					}

					return data;

				}

				version( ctx ) {

					return ctx.Version[ 0 ].image;

				}

				node( ctx ) {

					const data = {
						name: ctx.NodeName[ 0 ].image,
						fields: []
					};

					if ( ctx.field ) {

						for ( let i = 0, l = ctx.field.length; i < l; i ++ ) {

							const field = ctx.field[ i ];

							data.fields.push( this.visit( field ) );

						}

					}

					// DEF

					if ( ctx.def ) {

						data.DEF = this.visit( ctx.def[ 0 ] );

					}

					return data;

				}

				field( ctx ) {

					const data = {
						name: ctx.Identifier[ 0 ].image,
						type: null,
						values: null
					};

					let result;

					// SFValue

					if ( ctx.singleFieldValue ) {

						result = this.visit( ctx.singleFieldValue[ 0 ] );

					}

					// MFValue

					if ( ctx.multiFieldValue ) {

						result = this.visit( ctx.multiFieldValue[ 0 ] );

					}

					data.type = result.type;
					data.values = result.values;

					return data;

				}

				def( ctx ) {

					return ( ctx.Identifier || ctx.NodeName )[ 0 ].image;

				}

				use( ctx ) {

					return { USE: ( ctx.Identifier || ctx.NodeName )[ 0 ].image };

				}

				singleFieldValue( ctx ) {

					return processField( this, ctx );

				}

				multiFieldValue( ctx ) {

					return processField( this, ctx );

				}

				route( ctx ) {

					const data = {
						FROM: ctx.RouteIdentifier[ 0 ].image,
						TO: ctx.RouteIdentifier[ 1 ].image
					};

					return data;

				}

			}

			function processField( scope, ctx ) {

				const field = {
					type: null,
					values: []
				};

				if ( ctx.node ) {

					field.type = 'node';

					for ( let i = 0, l = ctx.node.length; i < l; i ++ ) {

						const node = ctx.node[ i ];

						field.values.push( scope.visit( node ) );

					}

				}

				if ( ctx.use ) {

					field.type = 'use';

					for ( let i = 0, l = ctx.use.length; i < l; i ++ ) {

						const use = ctx.use[ i ];

						field.values.push( scope.visit( use ) );

					}

				}

				if ( ctx.StringLiteral ) {

					field.type = 'string';

					for ( let i = 0, l = ctx.StringLiteral.length; i < l; i ++ ) {

						const stringLiteral = ctx.StringLiteral[ i ];

						field.values.push( stringLiteral.image.replace( /'|"/g, '' ) );

					}

				}

				if ( ctx.NumberLiteral ) {

					field.type = 'number';

					for ( let i = 0, l = ctx.NumberLiteral.length; i < l; i ++ ) {

						const numberLiteral = ctx.NumberLiteral[ i ];

						field.values.push( parseFloat( numberLiteral.image ) );

					}

				}

				if ( ctx.HexLiteral ) {

					field.type = 'hex';

					for ( let i = 0, l = ctx.HexLiteral.length; i < l; i ++ ) {

						const hexLiteral = ctx.HexLiteral[ i ];

						field.values.push( hexLiteral.image );

					}

				}

				if ( ctx.TrueLiteral ) {

					field.type = 'boolean';

					for ( let i = 0, l = ctx.TrueLiteral.length; i < l; i ++ ) {

						const trueLiteral = ctx.TrueLiteral[ i ];

						if ( trueLiteral.image === 'TRUE' ) field.values.push( true );

					}

				}

				if ( ctx.FalseLiteral ) {

					field.type = 'boolean';

					for ( let i = 0, l = ctx.FalseLiteral.length; i < l; i ++ ) {

						const falseLiteral = ctx.FalseLiteral[ i ];

						if ( falseLiteral.image === 'FALSE' ) field.values.push( false );

					}

				}

				if ( ctx.NullLiteral ) {

					field.type = 'null';

					ctx.NullLiteral.forEach( function () {

						field.values.push( null );

					} );

				}

				return field;

			}

			return new VRMLToASTVisitor();

		}

		function parseTree( tree ) {

			// console.log( JSON.stringify( tree, null, 2 ) );

			const nodes = tree.nodes;
			const scene = new Scene();

			// first iteration: build nodemap based on DEF statements

			for ( let i = 0, l = nodes.length; i < l; i ++ ) {

				const node = nodes[ i ];

				buildNodeMap( node );

			}

			// second iteration: build nodes

			for ( let i = 0, l = nodes.length; i < l; i ++ ) {

				const node = nodes[ i ];
				const object = getNode( node );

				if ( object instanceof Object3D ) scene.add( object );

				if ( node.name === 'WorldInfo' ) scene.userData.worldInfo = object;

			}

			return scene;

		}

		function buildNodeMap( node ) {

			if ( node.DEF ) {

				nodeMap[ node.DEF ] = node;

			}

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];

				if ( field.type === 'node' ) {

					const fieldValues = field.values;

					for ( let j = 0, jl = fieldValues.length; j < jl; j ++ ) {

						buildNodeMap( fieldValues[ j ] );

					}

				}


			}

		}


		function getNode( node ) {

			// handle case where a node refers to a different one

			if ( node.USE ) {

				return resolveUSE( node.USE );

			}

			if ( node.build !== undefined ) return node.build;

			node.build = buildNode( node );

			return node.build;

		}

		// node builder

		function buildNode( node ) {

			const nodeName = node.name;
			let build;

			switch ( nodeName ) {

				case 'Anchor':
				case 'Group':
				case 'Transform':
				case 'Collision':
					build = buildGroupingNode( node );
					break;

				case 'Background':
					build = buildBackgroundNode( node );
					break;

				case 'Shape':
					build = buildShapeNode( node );
					break;

				case 'Appearance':
					build = buildAppearanceNode( node );
					break;

				case 'Material':
					build = buildMaterialNode( node );
					break;

				case 'ImageTexture':
					build = buildImageTextureNode( node );
					break;

				case 'PixelTexture':
					build = buildPixelTextureNode( node );
					break;

				case 'TextureTransform':
					build = buildTextureTransformNode( node );
					break;

				case 'IndexedFaceSet':
					build = buildIndexedFaceSetNode( node );
					break;

				case 'IndexedLineSet':
					build = buildIndexedLineSetNode( node );
					break;

				case 'PointSet':
					build = buildPointSetNode( node );
					break;

				case 'Box':
					build = buildBoxNode( node );
					break;

				case 'Cone':
					build = buildConeNode( node );
					break;

				case 'Cylinder':
					build = buildCylinderNode( node );
					break;

				case 'Sphere':
					build = buildSphereNode( node );
					break;

				case 'ElevationGrid':
					build = buildElevationGridNode( node );
					break;

				case 'Extrusion':
					build = buildExtrusionNode( node );
					break;

				case 'Color':
				case 'Coordinate':
				case 'Normal':
				case 'TextureCoordinate':
					build = buildGeometricNode( node );
					break;

				case 'WorldInfo':
					build = buildWorldInfoNode( node );
					break;

				case 'Billboard':

				case 'Inline':
				case 'LOD':
				case 'Switch':

				case 'AudioClip':
				case 'DirectionalLight':
				case 'PointLight':
				case 'Script':
				case 'Sound':
				case 'SpotLight':

				case 'CylinderSensor':
				case 'PlaneSensor':
				case 'ProximitySensor':
				case 'SphereSensor':
				case 'TimeSensor':
				case 'TouchSensor':
				case 'VisibilitySensor':

				case 'Text':

				case 'FontStyle':
				case 'MovieTexture':

				case 'ColorInterpolator':
				case 'CoordinateInterpolator':
				case 'NormalInterpolator':
				case 'OrientationInterpolator':
				case 'PositionInterpolator':
				case 'ScalarInterpolator':

				case 'Fog':
				case 'NavigationInfo':
				case 'Viewpoint':
					// node not supported yet
					break;

				default:
					console.warn( 'THREE.VRMLLoader: Unknown node:', nodeName );
					break;

			}

			if ( build !== undefined && node.DEF !== undefined && build.hasOwnProperty( 'name' ) === true ) {

				build.name = node.DEF;

			}

			return build;

		}

		function buildGroupingNode( node ) {

			const object = new Group();

			//

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'bboxCenter':
						// field not supported
						break;

					case 'bboxSize':
						// field not supported
						break;

					case 'center':
						// field not supported
						break;

					case 'children':
						parseFieldChildren( fieldValues, object );
						break;

					case 'description':
						// field not supported
						break;

					case 'collide':
						// field not supported
						break;

					case 'parameter':
						// field not supported
						break;

					case 'rotation':
						const axis = new Vector3( fieldValues[ 0 ], fieldValues[ 1 ], fieldValues[ 2 ] ).normalize();
						const angle = fieldValues[ 3 ];
						object.quaternion.setFromAxisAngle( axis, angle );
						break;

					case 'scale':
						object.scale.set( fieldValues[ 0 ], fieldValues[ 1 ], fieldValues[ 2 ] );
						break;

					case 'scaleOrientation':
						// field not supported
						break;

					case 'translation':
						object.position.set( fieldValues[ 0 ], fieldValues[ 1 ], fieldValues[ 2 ] );
						break;

					case 'proxy':
						// field not supported
						break;

					case 'url':
						// field not supported
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			return object;

		}

		function buildBackgroundNode( node ) {

			const group = new Group();

			let groundAngle, groundColor;
			let skyAngle, skyColor;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'groundAngle':
						groundAngle = fieldValues;
						break;

					case 'groundColor':
						groundColor = fieldValues;
						break;

					case 'backUrl':
						// field not supported
						break;

					case 'bottomUrl':
						// field not supported
						break;

					case 'frontUrl':
						// field not supported
						break;

					case 'leftUrl':
						// field not supported
						break;

					case 'rightUrl':
						// field not supported
						break;

					case 'topUrl':
						// field not supported
						break;

					case 'skyAngle':
						skyAngle = fieldValues;
						break;

					case 'skyColor':
						skyColor = fieldValues;
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const radius = 10000;

			// sky

			if ( skyColor ) {

				const skyGeometry = new SphereGeometry( radius, 32, 16 );
				const skyMaterial = new MeshBasicMaterial( { fog: false, side: BackSide, depthWrite: false, depthTest: false } );

				if ( skyColor.length > 3 ) {

					paintFaces( skyGeometry, radius, skyAngle, toColorArray( skyColor ), true );
					skyMaterial.vertexColors = true;

				} else {

					skyMaterial.color.setRGB( skyColor[ 0 ], skyColor[ 1 ], skyColor[ 2 ] );
					skyMaterial.color.convertSRGBToLinear();

				}

				const sky = new Mesh( skyGeometry, skyMaterial );
				group.add( sky );

			}

			// ground

			if ( groundColor ) {

				if ( groundColor.length > 0 ) {

					const groundGeometry = new SphereGeometry( radius, 32, 16, 0, 2 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI );
					const groundMaterial = new MeshBasicMaterial( { fog: false, side: BackSide, vertexColors: true, depthWrite: false, depthTest: false } );

					paintFaces( groundGeometry, radius, groundAngle, toColorArray( groundColor ), false );

					const ground = new Mesh( groundGeometry, groundMaterial );
					group.add( ground );

				}

			}

			// render background group first

			group.renderOrder = - Infinity;

			return group;

		}

		function buildShapeNode( node ) {

			const fields = node.fields;

			// if the appearance field is NULL or unspecified, lighting is off and the unlit object color is (0, 0, 0)

			let material = new MeshBasicMaterial( {
				name: Loader.DEFAULT_MATERIAL_NAME,
				color: 0x000000
			} );
			let geometry;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'appearance':
						if ( fieldValues[ 0 ] !== null ) {

							material = getNode( fieldValues[ 0 ] );

						}

						break;

					case 'geometry':
						if ( fieldValues[ 0 ] !== null ) {

							geometry = getNode( fieldValues[ 0 ] );

						}

						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			// build 3D object

			let object;

			if ( geometry && geometry.attributes.position ) {

				const type = geometry._type;

				if ( type === 'points' ) { // points

					const pointsMaterial = new PointsMaterial( {
						name: Loader.DEFAULT_MATERIAL_NAME,
						color: 0xffffff,
						opacity: material.opacity,
						transparent: material.transparent
					} );

					if ( geometry.attributes.color !== undefined ) {

						pointsMaterial.vertexColors = true;

					} else {

						// if the color field is NULL and there is a material defined for the appearance affecting this PointSet, then use the emissiveColor of the material to draw the points

						if ( material.isMeshPhongMaterial ) {

							pointsMaterial.color.copy( material.emissive );

						}

					}

					object = new Points( geometry, pointsMaterial );

				} else if ( type === 'line' ) { // lines

					const lineMaterial = new LineBasicMaterial( {
						name: Loader.DEFAULT_MATERIAL_NAME,
						color: 0xffffff,
						opacity: material.opacity,
						transparent: material.transparent
					} );

					if ( geometry.attributes.color !== undefined ) {

						lineMaterial.vertexColors = true;

					} else {

						// if the color field is NULL and there is a material defined for the appearance affecting this IndexedLineSet, then use the emissiveColor of the material to draw the lines

						if ( material.isMeshPhongMaterial ) {

							lineMaterial.color.copy( material.emissive );

						}

					}

					object = new LineSegments( geometry, lineMaterial );

				} else { // consider meshes

					// check "solid" hint (it's placed in the geometry but affects the material)

					if ( geometry._solid !== undefined ) {

						material.side = ( geometry._solid ) ? FrontSide : DoubleSide;

					}

					// check for vertex colors

					if ( geometry.attributes.color !== undefined ) {

						material.vertexColors = true;

					}

					object = new Mesh( geometry, material );

				}

			} else {

				object = new Object3D();

				// if the geometry field is NULL or no vertices are defined the object is not drawn

				object.visible = false;

			}

			return object;

		}

		function buildAppearanceNode( node ) {

			let material = new MeshPhongMaterial();
			let transformData;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'material':
						if ( fieldValues[ 0 ] !== null ) {

							const materialData = getNode( fieldValues[ 0 ] );

							if ( materialData.diffuseColor ) material.color.copy( materialData.diffuseColor );
							if ( materialData.emissiveColor ) material.emissive.copy( materialData.emissiveColor );
							if ( materialData.shininess ) material.shininess = materialData.shininess;
							if ( materialData.specularColor ) material.specular.copy( materialData.specularColor );
							if ( materialData.transparency ) material.opacity = 1 - materialData.transparency;
							if ( materialData.transparency > 0 ) material.transparent = true;

						} else {

							// if the material field is NULL or unspecified, lighting is off and the unlit object color is (0, 0, 0)

							material = new MeshBasicMaterial( {
								name: Loader.DEFAULT_MATERIAL_NAME,
								color: 0x000000
							} );

						}

						break;

					case 'texture':
						const textureNode = fieldValues[ 0 ];
						if ( textureNode !== null ) {

							if ( textureNode.name === 'ImageTexture' || textureNode.name === 'PixelTexture' ) {

								material.map = getNode( textureNode );

							} else {

								// MovieTexture not supported yet

							}

						}

						break;

					case 'textureTransform':
						if ( fieldValues[ 0 ] !== null ) {

							transformData = getNode( fieldValues[ 0 ] );

						}

						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			// only apply texture transform data if a texture was defined

			if ( material.map ) {

				// respect VRML lighting model

				if ( material.map.__type ) {

					switch ( material.map.__type ) {

						case TEXTURE_TYPE.INTENSITY_ALPHA:
							material.opacity = 1; // ignore transparency
							break;

						case TEXTURE_TYPE.RGB:
							material.color.set( 0xffffff ); // ignore material color
							break;

						case TEXTURE_TYPE.RGBA:
							material.color.set( 0xffffff ); // ignore material color
							material.opacity = 1; // ignore transparency
							break;

						default:

					}

					delete material.map.__type;

				}

				// apply texture transform

				if ( transformData ) {

					material.map.center.copy( transformData.center );
					material.map.rotation = transformData.rotation;
					material.map.repeat.copy( transformData.scale );
					material.map.offset.copy( transformData.translation );

				}

			}

			return material;

		}

		function buildMaterialNode( node ) {

			const materialData = {};

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'ambientIntensity':
						// field not supported
						break;

					case 'diffuseColor':
						materialData.diffuseColor = new Color( fieldValues[ 0 ], fieldValues[ 1 ], fieldValues[ 2 ] );
						materialData.diffuseColor.convertSRGBToLinear();
						break;

					case 'emissiveColor':
						materialData.emissiveColor = new Color( fieldValues[ 0 ], fieldValues[ 1 ], fieldValues[ 2 ] );
						materialData.emissiveColor.convertSRGBToLinear();
						break;

					case 'shininess':
						materialData.shininess = fieldValues[ 0 ];
						break;

					case 'specularColor':
						materialData.specularColor = new Color( fieldValues[ 0 ], fieldValues[ 1 ], fieldValues[ 2 ] );
						materialData.specularColor.convertSRGBToLinear();
						break;

					case 'transparency':
						materialData.transparency = fieldValues[ 0 ];
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			return materialData;

		}

		function parseHexColor( hex, textureType, color ) {

			let value;

			switch ( textureType ) {

				case TEXTURE_TYPE.INTENSITY:
					// Intensity texture: A one-component image specifies one-byte hexadecimal or integer values representing the intensity of the image
					value = parseInt( hex );
					color.r = value;
					color.g = value;
					color.b = value;
					color.a = 1;
					break;

				case TEXTURE_TYPE.INTENSITY_ALPHA:
					// Intensity+Alpha texture: A two-component image specifies the intensity in the first (high) byte and the alpha opacity in the second (low) byte.
					value = parseInt( '0x' + hex.substring( 2, 4 ) );
					color.r = value;
					color.g = value;
					color.b = value;
					color.a = parseInt( '0x' + hex.substring( 4, 6 ) );
					break;

				case TEXTURE_TYPE.RGB:
					// RGB texture: Pixels in a three-component image specify the red component in the first (high) byte, followed by the green and blue components
					color.r = parseInt( '0x' + hex.substring( 2, 4 ) );
					color.g = parseInt( '0x' + hex.substring( 4, 6 ) );
					color.b = parseInt( '0x' + hex.substring( 6, 8 ) );
					color.a = 1;
					break;

				case TEXTURE_TYPE.RGBA:
					// RGBA texture: Four-component images specify the alpha opacity byte after red/green/blue
					color.r = parseInt( '0x' + hex.substring( 2, 4 ) );
					color.g = parseInt( '0x' + hex.substring( 4, 6 ) );
					color.b = parseInt( '0x' + hex.substring( 6, 8 ) );
					color.a = parseInt( '0x' + hex.substring( 8, 10 ) );
					break;

				default:

			}

		}

		function getTextureType( num_components ) {

			let type;

			switch ( num_components ) {

				case 1:
					type = TEXTURE_TYPE.INTENSITY;
					break;

				case 2:
					type = TEXTURE_TYPE.INTENSITY_ALPHA;
					break;

				case 3:
					type = TEXTURE_TYPE.RGB;
					break;

				case 4:
					type = TEXTURE_TYPE.RGBA;
					break;

				default:

			}

			return type;

		}

		function buildPixelTextureNode( node ) {

			let texture;
			let wrapS = RepeatWrapping;
			let wrapT = RepeatWrapping;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'image':
						const width = fieldValues[ 0 ];
						const height = fieldValues[ 1 ];
						const num_components = fieldValues[ 2 ];

						const textureType = getTextureType( num_components );

						const data = new Uint8Array( 4 * width * height );

						const color = { r: 0, g: 0, b: 0, a: 0 };

						for ( let j = 3, k = 0, jl = fieldValues.length; j < jl; j ++, k ++ ) {

							parseHexColor( fieldValues[ j ], textureType, color );

							const stride = k * 4;

							data[ stride + 0 ] = color.r;
							data[ stride + 1 ] = color.g;
							data[ stride + 2 ] = color.b;
							data[ stride + 3 ] = color.a;

						}

						texture = new DataTexture( data, width, height );
						texture.colorSpace = SRGBColorSpace;
						texture.needsUpdate = true;
						texture.__type = textureType; // needed for material modifications
						break;

					case 'repeatS':
						if ( fieldValues[ 0 ] === false ) wrapS = ClampToEdgeWrapping;
						break;

					case 'repeatT':
						if ( fieldValues[ 0 ] === false ) wrapT = ClampToEdgeWrapping;
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			if ( texture ) {

				texture.wrapS = wrapS;
				texture.wrapT = wrapT;

			}

			return texture;

		}

		function buildImageTextureNode( node ) {

			let texture;
			let wrapS = RepeatWrapping;
			let wrapT = RepeatWrapping;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'url':
						const url = fieldValues[ 0 ];
						if ( url ) texture = textureLoader.load( url );
						break;

					case 'repeatS':
						if ( fieldValues[ 0 ] === false ) wrapS = ClampToEdgeWrapping;
						break;

					case 'repeatT':
						if ( fieldValues[ 0 ] === false ) wrapT = ClampToEdgeWrapping;
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			if ( texture ) {

				texture.wrapS = wrapS;
				texture.wrapT = wrapT;
				texture.colorSpace = SRGBColorSpace;

			}

			return texture;

		}

		function buildTextureTransformNode( node ) {

			const transformData = {
				center: new Vector2(),
				rotation: new Vector2(),
				scale: new Vector2(),
				translation: new Vector2()
			};

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'center':
						transformData.center.set( fieldValues[ 0 ], fieldValues[ 1 ] );
						break;

					case 'rotation':
						transformData.rotation = fieldValues[ 0 ];
						break;

					case 'scale':
						transformData.scale.set( fieldValues[ 0 ], fieldValues[ 1 ] );
						break;

					case 'translation':
						transformData.translation.set( fieldValues[ 0 ], fieldValues[ 1 ] );
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			return transformData;

		}

		function buildGeometricNode( node ) {

			return node.fields[ 0 ].values;

		}

		function buildWorldInfoNode( node ) {

			const worldInfo = {};

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'title':
						worldInfo.title = fieldValues[ 0 ];
						break;

					case 'info':
						worldInfo.info = fieldValues;
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			return worldInfo;

		}

		function buildIndexedFaceSetNode( node ) {

			let color, coord, normal, texCoord;
			let ccw = true, solid = true, creaseAngle = 0;
			let colorIndex, coordIndex, normalIndex, texCoordIndex;
			let colorPerVertex = true, normalPerVertex = true;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'color':
						const colorNode = fieldValues[ 0 ];

						if ( colorNode !== null ) {

							color = getNode( colorNode );

						}

						break;

					case 'coord':
						const coordNode = fieldValues[ 0 ];

						if ( coordNode !== null ) {

							coord = getNode( coordNode );

						}

						break;

					case 'normal':
						const normalNode = fieldValues[ 0 ];

						if ( normalNode !== null ) {

							normal = getNode( normalNode );

						}

						break;

					case 'texCoord':
						const texCoordNode = fieldValues[ 0 ];

						if ( texCoordNode !== null ) {

							texCoord = getNode( texCoordNode );

						}

						break;

					case 'ccw':
						ccw = fieldValues[ 0 ];
						break;

					case 'colorIndex':
						colorIndex = fieldValues;
						break;

					case 'colorPerVertex':
						colorPerVertex = fieldValues[ 0 ];
						break;

					case 'convex':
						// field not supported
						break;

					case 'coordIndex':
						coordIndex = fieldValues;
						break;

					case 'creaseAngle':
						creaseAngle = fieldValues[ 0 ];
						break;

					case 'normalIndex':
						normalIndex = fieldValues;
						break;

					case 'normalPerVertex':
						normalPerVertex = fieldValues[ 0 ];
						break;

					case 'solid':
						solid = fieldValues[ 0 ];
						break;

					case 'texCoordIndex':
						texCoordIndex = fieldValues;
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			if ( coordIndex === undefined ) {

				console.warn( 'THREE.VRMLLoader: Missing coordIndex.' );

				return new BufferGeometry(); // handle VRML files with incomplete geometry definition

			}

			const triangulatedCoordIndex = triangulateFaceIndex( coordIndex, ccw );

			let colorAttribute;
			let normalAttribute;
			let uvAttribute;

			if ( color ) {

				if ( colorPerVertex === true ) {

					if ( colorIndex && colorIndex.length > 0 ) {

						// if the colorIndex field is not empty, then it is used to choose colors for each vertex of the IndexedFaceSet.

						const triangulatedColorIndex = triangulateFaceIndex( colorIndex, ccw );
						colorAttribute = computeAttributeFromIndexedData( triangulatedCoordIndex, triangulatedColorIndex, color, 3 );

					} else {

						// if the colorIndex field is empty, then the coordIndex field is used to choose colors from the Color node

						colorAttribute = toNonIndexedAttribute( triangulatedCoordIndex, new Float32BufferAttribute( color, 3 ) );

					}

				} else {

					if ( colorIndex && colorIndex.length > 0 ) {

						// if the colorIndex field is not empty, then they are used to choose one color for each face of the IndexedFaceSet

						const flattenFaceColors = flattenData( color, colorIndex );
						const triangulatedFaceColors = triangulateFaceData( flattenFaceColors, coordIndex );
						colorAttribute = computeAttributeFromFaceData( triangulatedCoordIndex, triangulatedFaceColors );

					} else {

						// if the colorIndex field is empty, then the color are applied to each face of the IndexedFaceSet in order

						const triangulatedFaceColors = triangulateFaceData( color, coordIndex );
						colorAttribute = computeAttributeFromFaceData( triangulatedCoordIndex, triangulatedFaceColors );


					}

				}

				convertColorsToLinearSRGB( colorAttribute );

			}

			if ( normal ) {

				if ( normalPerVertex === true ) {

					// consider vertex normals

					if ( normalIndex && normalIndex.length > 0 ) {

						// if the normalIndex field is not empty, then it is used to choose normals for each vertex of the IndexedFaceSet.

						const triangulatedNormalIndex = triangulateFaceIndex( normalIndex, ccw );
						normalAttribute = computeAttributeFromIndexedData( triangulatedCoordIndex, triangulatedNormalIndex, normal, 3 );

					} else {

						// if the normalIndex field is empty, then the coordIndex field is used to choose normals from the Normal node

						normalAttribute = toNonIndexedAttribute( triangulatedCoordIndex, new Float32BufferAttribute( normal, 3 ) );

					}

				} else {

					// consider face normals

					if ( normalIndex && normalIndex.length > 0 ) {

						// if the normalIndex field is not empty, then they are used to choose one normal for each face of the IndexedFaceSet

						const flattenFaceNormals = flattenData( normal, normalIndex );
						const triangulatedFaceNormals = triangulateFaceData( flattenFaceNormals, coordIndex );
						normalAttribute = computeAttributeFromFaceData( triangulatedCoordIndex, triangulatedFaceNormals );

					} else {

						// if the normalIndex field is empty, then the normals are applied to each face of the IndexedFaceSet in order

						const triangulatedFaceNormals = triangulateFaceData( normal, coordIndex );
						normalAttribute = computeAttributeFromFaceData( triangulatedCoordIndex, triangulatedFaceNormals );

					}

				}

			} else {

				// if the normal field is NULL, then the loader should automatically generate normals, using creaseAngle to determine if and how normals are smoothed across shared vertices

				normalAttribute = computeNormalAttribute( triangulatedCoordIndex, coord, creaseAngle );

			}

			if ( texCoord ) {

				// texture coordinates are always defined on vertex level

				if ( texCoordIndex && texCoordIndex.length > 0 ) {

					// if the texCoordIndex field is not empty, then it is used to choose texture coordinates for each vertex of the IndexedFaceSet.

					const triangulatedTexCoordIndex = triangulateFaceIndex( texCoordIndex, ccw );
					uvAttribute = computeAttributeFromIndexedData( triangulatedCoordIndex, triangulatedTexCoordIndex, texCoord, 2 );


				} else {

					// if the texCoordIndex field is empty, then the coordIndex array is used to choose texture coordinates from the TextureCoordinate node

					uvAttribute = toNonIndexedAttribute( triangulatedCoordIndex, new Float32BufferAttribute( texCoord, 2 ) );

				}

			}

			const geometry = new BufferGeometry();
			const positionAttribute = toNonIndexedAttribute( triangulatedCoordIndex, new Float32BufferAttribute( coord, 3 ) );

			geometry.setAttribute( 'position', positionAttribute );
			geometry.setAttribute( 'normal', normalAttribute );

			// optional attributes

			if ( colorAttribute ) geometry.setAttribute( 'color', colorAttribute );
			if ( uvAttribute ) geometry.setAttribute( 'uv', uvAttribute );

			// "solid" influences the material so let's store it for later use

			geometry._solid = solid;
			geometry._type = 'mesh';

			return geometry;

		}

		function buildIndexedLineSetNode( node ) {

			let color, coord;
			let colorIndex, coordIndex;
			let colorPerVertex = true;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'color':
						const colorNode = fieldValues[ 0 ];

						if ( colorNode !== null ) {

							color = getNode( colorNode );

						}

						break;

					case 'coord':
						const coordNode = fieldValues[ 0 ];

						if ( coordNode !== null ) {

							coord = getNode( coordNode );

						}

						break;

					case 'colorIndex':
						colorIndex = fieldValues;
						break;

					case 'colorPerVertex':
						colorPerVertex = fieldValues[ 0 ];
						break;

					case 'coordIndex':
						coordIndex = fieldValues;
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			// build lines

			let colorAttribute;

			const expandedLineIndex = expandLineIndex( coordIndex ); // create an index for three.js's linesegment primitive

			if ( color ) {

				if ( colorPerVertex === true ) {

					if ( colorIndex.length > 0 ) {

						// if the colorIndex field is not empty, then one color is used for each polyline of the IndexedLineSet.

						const expandedColorIndex = expandLineIndex( colorIndex ); // compute colors for each line segment (rendering primitve)
						colorAttribute = computeAttributeFromIndexedData( expandedLineIndex, expandedColorIndex, color, 3 ); // compute data on vertex level

					} else {

						// if the colorIndex field is empty, then the colors are applied to each polyline of the IndexedLineSet in order.

						colorAttribute = toNonIndexedAttribute( expandedLineIndex, new Float32BufferAttribute( color, 3 ) );

					}

				} else {

					if ( colorIndex.length > 0 ) {

						// if the colorIndex field is not empty, then colors are applied to each vertex of the IndexedLineSet

						const flattenLineColors = flattenData( color, colorIndex ); // compute colors for each VRML primitve
						const expandedLineColors = expandLineData( flattenLineColors, coordIndex ); // compute colors for each line segment (rendering primitve)
						colorAttribute = computeAttributeFromLineData( expandedLineIndex, expandedLineColors ); // compute data on vertex level


					} else {

						// if the colorIndex field is empty, then the coordIndex field is used to choose colors from the Color node

						const expandedLineColors = expandLineData( color, coordIndex ); // compute colors for each line segment (rendering primitve)
						colorAttribute = computeAttributeFromLineData( expandedLineIndex, expandedLineColors ); // compute data on vertex level

					}

				}

				convertColorsToLinearSRGB( colorAttribute );

			}

			//

			const geometry = new BufferGeometry();

			const positionAttribute = toNonIndexedAttribute( expandedLineIndex, new Float32BufferAttribute( coord, 3 ) );
			geometry.setAttribute( 'position', positionAttribute );

			if ( colorAttribute ) geometry.setAttribute( 'color', colorAttribute );

			geometry._type = 'line';

			return geometry;

		}

		function buildPointSetNode( node ) {

			let color, coord;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'color':
						const colorNode = fieldValues[ 0 ];

						if ( colorNode !== null ) {

							color = getNode( colorNode );

						}

						break;

					case 'coord':
						const coordNode = fieldValues[ 0 ];

						if ( coordNode !== null ) {

							coord = getNode( coordNode );

						}

						break;


					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const geometry = new BufferGeometry();

			geometry.setAttribute( 'position', new Float32BufferAttribute( coord, 3 ) );

			if ( color ) {

				const colorAttribute = new Float32BufferAttribute( color, 3 );
				convertColorsToLinearSRGB( colorAttribute );

				geometry.setAttribute( 'color', colorAttribute );

			}

			geometry._type = 'points';

			return geometry;

		}

		function buildBoxNode( node ) {

			const size = new Vector3( 2, 2, 2 );

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'size':
						size.x = fieldValues[ 0 ];
						size.y = fieldValues[ 1 ];
						size.z = fieldValues[ 2 ];
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const geometry = new BoxGeometry( size.x, size.y, size.z );

			return geometry;

		}

		function buildConeNode( node ) {

			let radius = 1, height = 2, openEnded = false;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'bottom':
						openEnded = ! fieldValues[ 0 ];
						break;

					case 'bottomRadius':
						radius = fieldValues[ 0 ];
						break;

					case 'height':
						height = fieldValues[ 0 ];
						break;

					case 'side':
						// field not supported
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const geometry = new ConeGeometry( radius, height, 16, 1, openEnded );

			return geometry;

		}

		function buildCylinderNode( node ) {

			let radius = 1, height = 2;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'bottom':
						// field not supported
						break;

					case 'radius':
						radius = fieldValues[ 0 ];
						break;

					case 'height':
						height = fieldValues[ 0 ];
						break;

					case 'side':
						// field not supported
						break;

					case 'top':
						// field not supported
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const geometry = new CylinderGeometry( radius, radius, height, 16, 1 );

			return geometry;

		}

		function buildSphereNode( node ) {

			let radius = 1;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'radius':
						radius = fieldValues[ 0 ];
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const geometry = new SphereGeometry( radius, 16, 16 );

			return geometry;

		}

		function buildElevationGridNode( node ) {

			let color;
			let normal;
			let texCoord;
			let height;

			let colorPerVertex = true;
			let normalPerVertex = true;
			let solid = true;
			let ccw = true;
			let creaseAngle = 0;
			let xDimension = 2;
			let zDimension = 2;
			let xSpacing = 1;
			let zSpacing = 1;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'color':
						const colorNode = fieldValues[ 0 ];

						if ( colorNode !== null ) {

							color = getNode( colorNode );

						}

						break;

					case 'normal':
						const normalNode = fieldValues[ 0 ];

						if ( normalNode !== null ) {

							normal = getNode( normalNode );

						}

						break;

					case 'texCoord':
						const texCoordNode = fieldValues[ 0 ];

						if ( texCoordNode !== null ) {

							texCoord = getNode( texCoordNode );

						}

						break;

					case 'height':
						height = fieldValues;
						break;

					case 'ccw':
						ccw = fieldValues[ 0 ];
						break;

					case 'colorPerVertex':
						colorPerVertex = fieldValues[ 0 ];
						break;

					case 'creaseAngle':
						creaseAngle = fieldValues[ 0 ];
						break;

					case 'normalPerVertex':
						normalPerVertex = fieldValues[ 0 ];
						break;

					case 'solid':
						solid = fieldValues[ 0 ];
						break;

					case 'xDimension':
						xDimension = fieldValues[ 0 ];
						break;

					case 'xSpacing':
						xSpacing = fieldValues[ 0 ];
						break;

					case 'zDimension':
						zDimension = fieldValues[ 0 ];
						break;

					case 'zSpacing':
						zSpacing = fieldValues[ 0 ];
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			// vertex data

			const vertices = [];
			const normals = [];
			const colors = [];
			const uvs = [];

			for ( let i = 0; i < zDimension; i ++ ) {

				for ( let j = 0; j < xDimension; j ++ ) {

					// compute a row major index

					const index = ( i * xDimension ) + j;

					// vertices

					const x = xSpacing * i;
					const y = height[ index ];
					const z = zSpacing * j;

					vertices.push( x, y, z );

					// colors

					if ( color && colorPerVertex === true ) {

						const r = color[ index * 3 + 0 ];
						const g = color[ index * 3 + 1 ];
						const b = color[ index * 3 + 2 ];

						colors.push( r, g, b );

					}

					// normals

					if ( normal && normalPerVertex === true ) {

						const xn = normal[ index * 3 + 0 ];
						const yn = normal[ index * 3 + 1 ];
						const zn = normal[ index * 3 + 2 ];

						normals.push( xn, yn, zn );

					}

					// uvs

					if ( texCoord ) {

						const s = texCoord[ index * 2 + 0 ];
						const t = texCoord[ index * 2 + 1 ];

						uvs.push( s, t );


					} else {

						uvs.push( i / ( xDimension - 1 ), j / ( zDimension - 1 ) );

					}

				}

			}

			// indices

			const indices = [];

			for ( let i = 0; i < xDimension - 1; i ++ ) {

				for ( let j = 0; j < zDimension - 1; j ++ ) {

					// from https://tecfa.unige.ch/guides/vrml/vrml97/spec/part1/nodesRef.html#ElevationGrid

					const a = i + j * xDimension;
					const b = i + ( j + 1 ) * xDimension;
					const c = ( i + 1 ) + ( j + 1 ) * xDimension;
					const d = ( i + 1 ) + j * xDimension;

					// faces

					if ( ccw === true ) {

						indices.push( a, c, b );
						indices.push( c, a, d );

					} else {

						indices.push( a, b, c );
						indices.push( c, d, a );

					}

				}

			}

			//

			const positionAttribute = toNonIndexedAttribute( indices, new Float32BufferAttribute( vertices, 3 ) );
			const uvAttribute = toNonIndexedAttribute( indices, new Float32BufferAttribute( uvs, 2 ) );
			let colorAttribute;
			let normalAttribute;

			// color attribute

			if ( color ) {

				if ( colorPerVertex === false ) {

					for ( let i = 0; i < xDimension - 1; i ++ ) {

						for ( let j = 0; j < zDimension - 1; j ++ ) {

							const index = i + j * ( xDimension - 1 );

							const r = color[ index * 3 + 0 ];
							const g = color[ index * 3 + 1 ];
							const b = color[ index * 3 + 2 ];

							// one color per quad

							colors.push( r, g, b ); colors.push( r, g, b ); colors.push( r, g, b );
							colors.push( r, g, b ); colors.push( r, g, b ); colors.push( r, g, b );

						}

					}

					colorAttribute = new Float32BufferAttribute( colors, 3 );

				} else {

					colorAttribute = toNonIndexedAttribute( indices, new Float32BufferAttribute( colors, 3 ) );

				}

				convertColorsToLinearSRGB( colorAttribute );

			}

			// normal attribute

			if ( normal ) {

				if ( normalPerVertex === false ) {

					for ( let i = 0; i < xDimension - 1; i ++ ) {

						for ( let j = 0; j < zDimension - 1; j ++ ) {

							const index = i + j * ( xDimension - 1 );

							const xn = normal[ index * 3 + 0 ];
							const yn = normal[ index * 3 + 1 ];
							const zn = normal[ index * 3 + 2 ];

							// one normal per quad

							normals.push( xn, yn, zn ); normals.push( xn, yn, zn ); normals.push( xn, yn, zn );
							normals.push( xn, yn, zn ); normals.push( xn, yn, zn ); normals.push( xn, yn, zn );

						}

					}

					normalAttribute = new Float32BufferAttribute( normals, 3 );

				} else {

					normalAttribute = toNonIndexedAttribute( indices, new Float32BufferAttribute( normals, 3 ) );

				}

			} else {

				normalAttribute = computeNormalAttribute( indices, vertices, creaseAngle );

			}

			// build geometry

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', positionAttribute );
			geometry.setAttribute( 'normal', normalAttribute );
			geometry.setAttribute( 'uv', uvAttribute );

			if ( colorAttribute ) geometry.setAttribute( 'color', colorAttribute );

			// "solid" influences the material so let's store it for later use

			geometry._solid = solid;
			geometry._type = 'mesh';

			return geometry;

		}

		function buildExtrusionNode( node ) {

			let crossSection = [ 1, 1, 1, - 1, - 1, - 1, - 1, 1, 1, 1 ];
			let spine = [ 0, 0, 0, 0, 1, 0 ];
			let scale;
			let orientation;

			let beginCap = true;
			let ccw = true;
			let creaseAngle = 0;
			let endCap = true;
			let solid = true;

			const fields = node.fields;

			for ( let i = 0, l = fields.length; i < l; i ++ ) {

				const field = fields[ i ];
				const fieldName = field.name;
				const fieldValues = field.values;

				switch ( fieldName ) {

					case 'beginCap':
						beginCap = fieldValues[ 0 ];
						break;

					case 'ccw':
						ccw = fieldValues[ 0 ];
						break;

					case 'convex':
						// field not supported
						break;

					case 'creaseAngle':
						creaseAngle = fieldValues[ 0 ];
						break;

					case 'crossSection':
						crossSection = fieldValues;
						break;

					case 'endCap':
						endCap = fieldValues[ 0 ];
						break;

					case 'orientation':
						orientation = fieldValues;
						break;

					case 'scale':
						scale = fieldValues;
						break;

					case 'solid':
						solid = fieldValues[ 0 ];
						break;

					case 'spine':
						spine = fieldValues; // only extrusion along the Y-axis are supported so far
						break;

					default:
						console.warn( 'THREE.VRMLLoader: Unknown field:', fieldName );
						break;

				}

			}

			const crossSectionClosed = ( crossSection[ 0 ] === crossSection[ crossSection.length - 2 ] && crossSection[ 1 ] === crossSection[ crossSection.length - 1 ] );

			// vertices

			const vertices = [];
			const spineVector = new Vector3();
			const scaling = new Vector3();

			const axis = new Vector3();
			const vertex = new Vector3();
			const quaternion = new Quaternion();

			for ( let i = 0, j = 0, o = 0, il = spine.length; i < il; i += 3, j += 2, o += 4 ) {

				spineVector.fromArray( spine, i );

				scaling.x = scale ? scale[ j + 0 ] : 1;
				scaling.y = 1;
				scaling.z = scale ? scale[ j + 1 ] : 1;

				axis.x = orientation ? orientation[ o + 0 ] : 0;
				axis.y = orientation ? orientation[ o + 1 ] : 0;
				axis.z = orientation ? orientation[ o + 2 ] : 1;
				const angle = orientation ? orientation[ o + 3 ] : 0;

				for ( let k = 0, kl = crossSection.length; k < kl; k += 2 ) {

					vertex.x = crossSection[ k + 0 ];
					vertex.y = 0;
					vertex.z = crossSection[ k + 1 ];

					// scale

					vertex.multiply( scaling );

					// rotate

					quaternion.setFromAxisAngle( axis, angle );
					vertex.applyQuaternion( quaternion );

					// translate

					vertex.add( spineVector );

					vertices.push( vertex.x, vertex.y, vertex.z );

				}

			}

			// indices

			const indices = [];

			const spineCount = spine.length / 3;
			const crossSectionCount = crossSection.length / 2;

			for ( let i = 0; i < spineCount - 1; i ++ ) {

				for ( let j = 0; j < crossSectionCount - 1; j ++ ) {

					const a = j + i * crossSectionCount;
					let b = ( j + 1 ) + i * crossSectionCount;
					const c = j + ( i + 1 ) * crossSectionCount;
					let d = ( j + 1 ) + ( i + 1 ) * crossSectionCount;

					if ( ( j === crossSectionCount - 2 ) && ( crossSectionClosed === true ) ) {

						b = i * crossSectionCount;
						d = ( i + 1 ) * crossSectionCount;

					}

					if ( ccw === true ) {

						indices.push( a, b, c );
						indices.push( c, b, d );

					} else {

						indices.push( a, c, b );
						indices.push( c, d, b );

					}

				}

			}

			// triangulate cap

			if ( beginCap === true || endCap === true ) {

				const contour = [];

				for ( let i = 0, l = crossSection.length; i < l; i += 2 ) {

					contour.push( new Vector2( crossSection[ i ], crossSection[ i + 1 ] ) );

				}

				const faces = ShapeUtils.triangulateShape( contour, [] );
				const capIndices = [];

				for ( let i = 0, l = faces.length; i < l; i ++ ) {

					const face = faces[ i ];

					capIndices.push( face[ 0 ], face[ 1 ], face[ 2 ] );

				}

				// begin cap

				if ( beginCap === true ) {

					for ( let i = 0, l = capIndices.length; i < l; i += 3 ) {

						if ( ccw === true ) {

							indices.push( capIndices[ i + 0 ], capIndices[ i + 1 ], capIndices[ i + 2 ] );

						} else {

							indices.push( capIndices[ i + 0 ], capIndices[ i + 2 ], capIndices[ i + 1 ] );

						}

					}

				}

				// end cap

				if ( endCap === true ) {

					const indexOffset = crossSectionCount * ( spineCount - 1 ); // references to the first vertex of the last cross section

					for ( let i = 0, l = capIndices.length; i < l; i += 3 ) {

						if ( ccw === true ) {

							indices.push( indexOffset + capIndices[ i + 0 ], indexOffset + capIndices[ i + 2 ], indexOffset + capIndices[ i + 1 ] );

						} else {

							indices.push( indexOffset + capIndices[ i + 0 ], indexOffset + capIndices[ i + 1 ], indexOffset + capIndices[ i + 2 ] );

						}

					}

				}

			}

			const positionAttribute = toNonIndexedAttribute( indices, new Float32BufferAttribute( vertices, 3 ) );
			const normalAttribute = computeNormalAttribute( indices, vertices, creaseAngle );

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', positionAttribute );
			geometry.setAttribute( 'normal', normalAttribute );
			// no uvs yet

			// "solid" influences the material so let's store it for later use

			geometry._solid = solid;
			geometry._type = 'mesh';

			return geometry;

		}

		// helper functions

		function resolveUSE( identifier ) {

			const node = nodeMap[ identifier ];
			const build = getNode( node );

			// because the same 3D objects can have different transformations, it's necessary to clone them.
			// materials can be influenced by the geometry (e.g. vertex normals). cloning is necessary to avoid
			// any side effects

			return ( build.isObject3D || build.isMaterial ) ? build.clone() : build;

		}

		function parseFieldChildren( children, owner ) {

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const object = getNode( children[ i ] );

				if ( object instanceof Object3D ) owner.add( object );

			}

		}

		function triangulateFaceIndex( index, ccw ) {

			const indices = [];

			// since face defintions can have more than three vertices, it's necessary to
			// perform a simple triangulation

			let start = 0;

			for ( let i = 0, l = index.length; i < l; i ++ ) {

				const i1 = index[ start ];
				const i2 = index[ i + ( ccw ? 1 : 2 ) ];
				const i3 = index[ i + ( ccw ? 2 : 1 ) ];

				indices.push( i1, i2, i3 );

				// an index of -1 indicates that the current face has ended and the next one begins

				if ( index[ i + 3 ] === - 1 || i + 3 >= l ) {

					i += 3;
					start = i + 1;

				}

			}

			return indices;

		}

		function triangulateFaceData( data, index ) {

			const triangulatedData = [];

			let start = 0;

			for ( let i = 0, l = index.length; i < l; i ++ ) {

				const stride = start * 3;

				const x = data[ stride ];
				const y = data[ stride + 1 ];
				const z = data[ stride + 2 ];

				triangulatedData.push( x, y, z );

				// an index of -1 indicates that the current face has ended and the next one begins

				if ( index[ i + 3 ] === - 1 || i + 3 >= l ) {

					i += 3;
					start ++;

				}

			}

			return triangulatedData;

		}

		function flattenData( data, index ) {

			const flattenData = [];

			for ( let i = 0, l = index.length; i < l; i ++ ) {

				const i1 = index[ i ];

				const stride = i1 * 3;

				const x = data[ stride ];
				const y = data[ stride + 1 ];
				const z = data[ stride + 2 ];

				flattenData.push( x, y, z );

			}

			return flattenData;

		}

		function expandLineIndex( index ) {

			const indices = [];

			for ( let i = 0, l = index.length; i < l; i ++ ) {

				const i1 = index[ i ];
				const i2 = index[ i + 1 ];

				indices.push( i1, i2 );

				// an index of -1 indicates that the current line has ended and the next one begins

				if ( index[ i + 2 ] === - 1 || i + 2 >= l ) {

					i += 2;

				}

			}

			return indices;

		}

		function expandLineData( data, index ) {

			const triangulatedData = [];

			let start = 0;

			for ( let i = 0, l = index.length; i < l; i ++ ) {

				const stride = start * 3;

				const x = data[ stride ];
				const y = data[ stride + 1 ];
				const z = data[ stride + 2 ];

				triangulatedData.push( x, y, z );

				// an index of -1 indicates that the current line has ended and the next one begins

				if ( index[ i + 2 ] === - 1 || i + 2 >= l ) {

					i += 2;
					start ++;

				}

			}

			return triangulatedData;

		}

		const vA = new Vector3();
		const vB = new Vector3();
		const vC = new Vector3();

		const uvA = new Vector2();
		const uvB = new Vector2();
		const uvC = new Vector2();

		function computeAttributeFromIndexedData( coordIndex, index, data, itemSize ) {

			const array = [];

			// we use the coordIndex.length as delimiter since normalIndex must contain at least as many indices

			for ( let i = 0, l = coordIndex.length; i < l; i += 3 ) {

				const a = index[ i ];
				const b = index[ i + 1 ];
				const c = index[ i + 2 ];

				if ( itemSize === 2 ) {

					uvA.fromArray( data, a * itemSize );
					uvB.fromArray( data, b * itemSize );
					uvC.fromArray( data, c * itemSize );

					array.push( uvA.x, uvA.y );
					array.push( uvB.x, uvB.y );
					array.push( uvC.x, uvC.y );

				} else {

					vA.fromArray( data, a * itemSize );
					vB.fromArray( data, b * itemSize );
					vC.fromArray( data, c * itemSize );

					array.push( vA.x, vA.y, vA.z );
					array.push( vB.x, vB.y, vB.z );
					array.push( vC.x, vC.y, vC.z );

				}

			}

			return new Float32BufferAttribute( array, itemSize );

		}

		function computeAttributeFromFaceData( index, faceData ) {

			const array = [];

			for ( let i = 0, j = 0, l = index.length; i < l; i += 3, j ++ ) {

				vA.fromArray( faceData, j * 3 );

				array.push( vA.x, vA.y, vA.z );
				array.push( vA.x, vA.y, vA.z );
				array.push( vA.x, vA.y, vA.z );

			}

			return new Float32BufferAttribute( array, 3 );

		}

		function computeAttributeFromLineData( index, lineData ) {

			const array = [];

			for ( let i = 0, j = 0, l = index.length; i < l; i += 2, j ++ ) {

				vA.fromArray( lineData, j * 3 );

				array.push( vA.x, vA.y, vA.z );
				array.push( vA.x, vA.y, vA.z );

			}

			return new Float32BufferAttribute( array, 3 );

		}

		function toNonIndexedAttribute( indices, attribute ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				index = indices[ i ] * itemSize;

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new Float32BufferAttribute( array2, itemSize );

		}

		const ab = new Vector3();
		const cb = new Vector3();

		function computeNormalAttribute( index, coord, creaseAngle ) {

			const faces = [];
			const vertexNormals = {};

			// prepare face and raw vertex normals

			for ( let i = 0, l = index.length; i < l; i += 3 ) {

				const a = index[ i ];
				const b = index[ i + 1 ];
				const c = index[ i + 2 ];

				const face = new Face( a, b, c );

				vA.fromArray( coord, a * 3 );
				vB.fromArray( coord, b * 3 );
				vC.fromArray( coord, c * 3 );

				cb.subVectors( vC, vB );
				ab.subVectors( vA, vB );
				cb.cross( ab );

				cb.normalize();

				face.normal.copy( cb );

				if ( vertexNormals[ a ] === undefined ) vertexNormals[ a ] = [];
				if ( vertexNormals[ b ] === undefined ) vertexNormals[ b ] = [];
				if ( vertexNormals[ c ] === undefined ) vertexNormals[ c ] = [];

				vertexNormals[ a ].push( face.normal );
				vertexNormals[ b ].push( face.normal );
				vertexNormals[ c ].push( face.normal );

				faces.push( face );

			}

			// compute vertex normals and build final geometry

			const normals = [];

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				const face = faces[ i ];

				const nA = weightedNormal( vertexNormals[ face.a ], face.normal, creaseAngle );
				const nB = weightedNormal( vertexNormals[ face.b ], face.normal, creaseAngle );
				const nC = weightedNormal( vertexNormals[ face.c ], face.normal, creaseAngle );

				vA.fromArray( coord, face.a * 3 );
				vB.fromArray( coord, face.b * 3 );
				vC.fromArray( coord, face.c * 3 );

				normals.push( nA.x, nA.y, nA.z );
				normals.push( nB.x, nB.y, nB.z );
				normals.push( nC.x, nC.y, nC.z );

			}

			return new Float32BufferAttribute( normals, 3 );

		}

		function weightedNormal( normals, vector, creaseAngle ) {

			const normal = new Vector3();

			if ( creaseAngle === 0 ) {

				normal.copy( vector );

			} else {

				for ( let i = 0, l = normals.length; i < l; i ++ ) {

					if ( normals[ i ].angleTo( vector ) < creaseAngle ) {

						normal.add( normals[ i ] );

					}

				}

			}

			return normal.normalize();

		}

		function toColorArray( colors ) {

			const array = [];

			for ( let i = 0, l = colors.length; i < l; i += 3 ) {

				array.push( new Color( colors[ i ], colors[ i + 1 ], colors[ i + 2 ] ) );

			}

			return array;

		}

		function convertColorsToLinearSRGB( attribute ) {

			const color = new Color();

			for ( let i = 0; i < attribute.count; i ++ ) {

				color.fromBufferAttribute( attribute, i );
				color.convertSRGBToLinear();

				attribute.setXYZ( i, color.r, color.g, color.b );

			}

		}

		/**
		 * Vertically paints the faces interpolating between the
		 * specified colors at the specified angels. This is used for the Background
		 * node, but could be applied to other nodes with multiple faces as well.
		 *
		 * When used with the Background node, default is directionIsDown is true if
		 * interpolating the skyColor down from the Zenith. When interpolationg up from
		 * the Nadir i.e. interpolating the groundColor, the directionIsDown is false.
		 *
		 * The first angle is never specified, it is the Zenith (0 rad). Angles are specified
		 * in radians. The geometry is thought a sphere, but could be anything. The color interpolation
		 * is linear along the Y axis in any case.
		 *
		 * You must specify one more color than you have angles at the beginning of the colors array.
		 * This is the color of the Zenith (the top of the shape).
		 *
		 * @param {BufferGeometry} geometry
		 * @param {number} radius
		 * @param {array} angles
		 * @param {array} colors
		 * @param {boolean} topDown - Whether to work top down or bottom up.
		 */
		function paintFaces( geometry, radius, angles, colors, topDown ) {

			// compute threshold values

			const thresholds = [];
			const startAngle = ( topDown === true ) ? 0 : Math.PI;

			for ( let i = 0, l = colors.length; i < l; i ++ ) {

				let angle = ( i === 0 ) ? 0 : angles[ i - 1 ];
				angle = ( topDown === true ) ? angle : ( startAngle - angle );

				const point = new Vector3();
				point.setFromSphericalCoords( radius, angle, 0 );

				thresholds.push( point );

			}

			// generate vertex colors

			const indices = geometry.index;
			const positionAttribute = geometry.attributes.position;
			const colorAttribute = new BufferAttribute( new Float32Array( geometry.attributes.position.count * 3 ), 3 );

			const position = new Vector3();
			const color = new Color();

			for ( let i = 0; i < indices.count; i ++ ) {

				const index = indices.getX( i );
				position.fromBufferAttribute( positionAttribute, index );

				let thresholdIndexA, thresholdIndexB;
				let t = 1;

				for ( let j = 1; j < thresholds.length; j ++ ) {

					thresholdIndexA = j - 1;
					thresholdIndexB = j;

					const thresholdA = thresholds[ thresholdIndexA ];
					const thresholdB = thresholds[ thresholdIndexB ];

					if ( topDown === true ) {

						// interpolation for sky color

						if ( position.y <= thresholdA.y && position.y > thresholdB.y ) {

							t = Math.abs( thresholdA.y - position.y ) / Math.abs( thresholdA.y - thresholdB.y );

							break;

						}

					} else {

						// interpolation for ground color

						if ( position.y >= thresholdA.y && position.y < thresholdB.y ) {

							t = Math.abs( thresholdA.y - position.y ) / Math.abs( thresholdA.y - thresholdB.y );

							break;

						}

					}

				}

				const colorA = colors[ thresholdIndexA ];
				const colorB = colors[ thresholdIndexB ];

				color.copy( colorA ).lerp( colorB, t ).convertSRGBToLinear();

				colorAttribute.setXYZ( index, color.r, color.g, color.b );

			}

			geometry.setAttribute( 'color', colorAttribute );

		}

		//

		const textureLoader = new TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		// check version (only 2.0 is supported)

		if ( data.indexOf( '#VRML V2.0' ) === - 1 ) {

			throw Error( 'THREE.VRMLLexer: Version of VRML asset not supported.' );

		}

		// create JSON representing the tree structure of the VRML asset

		const tree = generateVRMLTree( data );

		// parse the tree structure to a three.js scene

		const scene = parseTree( tree );

		return scene;

	}

}

class VRMLLexer {

	constructor( tokens ) {

		this.lexer = new chevrotain.Lexer( tokens );

	}

	lex( inputText ) {

		const lexingResult = this.lexer.tokenize( inputText );

		if ( lexingResult.errors.length > 0 ) {

			console.error( lexingResult.errors );

			throw Error( 'THREE.VRMLLexer: Lexing errors detected.' );

		}

		return lexingResult;

	}

}

const CstParser = chevrotain.CstParser;

class VRMLParser extends CstParser {

	constructor( tokenVocabulary ) {

		super( tokenVocabulary );

		const $ = this;

		const Version = tokenVocabulary[ 'Version' ];
		const LCurly = tokenVocabulary[ 'LCurly' ];
		const RCurly = tokenVocabulary[ 'RCurly' ];
		const LSquare = tokenVocabulary[ 'LSquare' ];
		const RSquare = tokenVocabulary[ 'RSquare' ];
		const Identifier = tokenVocabulary[ 'Identifier' ];
		const RouteIdentifier = tokenVocabulary[ 'RouteIdentifier' ];
		const StringLiteral = tokenVocabulary[ 'StringLiteral' ];
		const HexLiteral = tokenVocabulary[ 'HexLiteral' ];
		const NumberLiteral = tokenVocabulary[ 'NumberLiteral' ];
		const TrueLiteral = tokenVocabulary[ 'TrueLiteral' ];
		const FalseLiteral = tokenVocabulary[ 'FalseLiteral' ];
		const NullLiteral = tokenVocabulary[ 'NullLiteral' ];
		const DEF = tokenVocabulary[ 'DEF' ];
		const USE = tokenVocabulary[ 'USE' ];
		const ROUTE = tokenVocabulary[ 'ROUTE' ];
		const TO = tokenVocabulary[ 'TO' ];
		const NodeName = tokenVocabulary[ 'NodeName' ];

		$.RULE( 'vrml', function () {

			$.SUBRULE( $.version );
			$.AT_LEAST_ONE( function () {

				$.SUBRULE( $.node );

			} );
			$.MANY( function () {

				$.SUBRULE( $.route );

			} );

		} );

		$.RULE( 'version', function () {

			$.CONSUME( Version );

		} );

		$.RULE( 'node', function () {

			$.OPTION( function () {

				$.SUBRULE( $.def );

			} );

			$.CONSUME( NodeName );
			$.CONSUME( LCurly );
			$.MANY( function () {

				$.SUBRULE( $.field );

			} );
			$.CONSUME( RCurly );

		} );

		$.RULE( 'field', function () {

			$.CONSUME( Identifier );

			$.OR2( [
				{ ALT: function () {

					$.SUBRULE( $.singleFieldValue );

				} },
				{ ALT: function () {

					$.SUBRULE( $.multiFieldValue );

				} }
			] );

		} );

		$.RULE( 'def', function () {

			$.CONSUME( DEF );
			$.OR( [
				{ ALT: function () {

					$.CONSUME( Identifier );

				} },
				{ ALT: function () {

					$.CONSUME( NodeName );

				} }
			] );

		} );

		$.RULE( 'use', function () {

			$.CONSUME( USE );
			$.OR( [
				{ ALT: function () {

					$.CONSUME( Identifier );

				} },
				{ ALT: function () {

					$.CONSUME( NodeName );

				} }
			] );

		} );

		$.RULE( 'singleFieldValue', function () {

			$.AT_LEAST_ONE( function () {

				$.OR( [
					{ ALT: function () {

						$.SUBRULE( $.node );

					} },
					{ ALT: function () {

						$.SUBRULE( $.use );

					} },
					{ ALT: function () {

						$.CONSUME( StringLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( HexLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( NumberLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( TrueLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( FalseLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( NullLiteral );

					} }
				] );


			} );

		} );

		$.RULE( 'multiFieldValue', function () {

			$.CONSUME( LSquare );
			$.MANY( function () {

				$.OR( [
					{ ALT: function () {

						$.SUBRULE( $.node );

					} },
					{ ALT: function () {

						$.SUBRULE( $.use );

					} },
					{ ALT: function () {

						$.CONSUME( StringLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( HexLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( NumberLiteral );

					} },
					{ ALT: function () {

						$.CONSUME( NullLiteral );

					} }
				] );

			} );
			$.CONSUME( RSquare );

		} );

		$.RULE( 'route', function () {

			$.CONSUME( ROUTE );
			$.CONSUME( RouteIdentifier );
			$.CONSUME( TO );
			$.CONSUME2( RouteIdentifier );

		} );

		this.performSelfAnalysis();

	}

}

class Face {

	constructor( a, b, c ) {

		this.a = a;
		this.b = b;
		this.c = c;
		this.normal = new Vector3();

	}

}

const TEXTURE_TYPE = {
	INTENSITY: 1,
	INTENSITY_ALPHA: 2,
	RGB: 3,
	RGBA: 4
};

export { VRMLLoader };
