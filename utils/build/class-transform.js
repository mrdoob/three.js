const classTransform = ( { types: t, template } ) => {

	const buildInheritingNodes = template.statements( `
		SUBCLASS.prototype = Object.create( SUPERCLASS.prototype );
		SUBCLASS.prototype.constructor = SUBCLASS;
	` );

	const buildMethodNode = template.statement( `
		CLASS.prototype.METHOD_NAME = METHOD;
	` );

	const buildStaticMethodNode = template.statement( `
		CLASS.METHOD_NAME = METHOD;
	` );

	return {
		name: 'three.js-class-transform',
		visitor: {
			ClassExpression() {

				throw new Error( 'Transforming ClassExpressions is not supported currently. Please make it a declaration.' );

			},
			ClassDeclaration( path ) {

				const className = path.node.id.name;
				const superClass = path.node.superClass;

				const classBody = {
					constructor: null,
					methods: [],
					staticMethods: [],
				};

				for ( let p of path.get( 'body.body' ) ) {

					if ( ! t.isClassMethod( p.node ) ) {

						throw new Error( 'Only transforming class methods is supported currently.' );

					}

					if ( p.node.computed ) {

						throw new Error( 'Transforming computed method names is not supported currently.' );

					}

					switch ( p.node.kind ) {

						case 'constructor':
							classBody.constructor = p;
							break;
						case 'method':
							if ( p.node.static ) {

								classBody.staticMethods.push( p );

							} else {

								classBody.methods.push( p );

							}
							break;
						default:
							throw new Error( `Transforming a class method of kind "${p.node.kind}" is not supported currently.` );

					}

				}

				if ( ! classBody.constructor ) {

					throw new Error( 'Currently a class has to have an explicit constructor method.' );

				}


				if ( superClass ) {

					if ( ! t.isIdentifier( superClass ) ) {

						throw new Error( 'Only extending an identifier (a variable) is allowed.' );

					}

					// rewrite super(...args)
					classBody.constructor.traverse( {

						Function( path ) {

							path.skip();

						},

						Super( path ) {

							if ( ! path.parentPath.isCallExpression() ) {

								throw new Error( '`super` can only be called currently (as calling super class\' constructor).' );

							}

							path.parentPath.node.arguments.unshift( t.thisExpression() );
							path.parentPath.get( 'callee' ).replaceWith(
								t.memberExpression(
									t.cloneNode( superClass ),
									t.identifier( 'call' ),
								)
							);

						}
					} );

				}

				const output = [
					t.functionDeclaration(
						t.identifier( className ),
						classBody.constructor.node.params,
						classBody.constructor.node.body
					)
				];

				if ( superClass ) {

					output.push(
						...buildInheritingNodes( {
							SUBCLASS: t.identifier( className ),
							SUPERCLASS: t.cloneNode( superClass ),
						} )
					);

				}

				output.push(
					...classBody.methods.map(
						p => buildMethodNode( {
							CLASS: t.identifier( className ),
							METHOD_NAME: t.cloneNode( p.node.key ),
							METHOD: t.functionExpression(
								p.node.key,
								p.node.params,
								p.node.body,
							)
						} )
					)
				);

				output.push(
					...classBody.staticMethods.map(
						p => buildStaticMethodNode( {
							CLASS: t.identifier( className ),
							METHOD_NAME: t.cloneNode( p.node.key ),
							METHOD: t.functionExpression(
								p.node.key,
								p.node.params,
								p.node.body,
							)
						} )
					)
				);

				path.replaceWithMultiple( output );

			}
		}
	};

};

export default classTransform;
