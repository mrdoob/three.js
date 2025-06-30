class Block {

	constructor( node, parent = null ) {

		this.node = node;
		this.parent = parent;

		this.properties = {};

	}

	setProperty( name, value ) {

		this.properties[ name ] = value;

	}

	getProperty( name ) {

		let value = this.properties[ name ];

		if ( value === undefined && this.parent !== null ) {

			value = this.parent.getProperty( name );

		}

		return value;

	}

}

class Linker {

	constructor() {

		this.block = null;

	}

	addBlock( node ) {

		this.block = new Block( node, this.block );

	}

	removeBlock( node ) {

		if ( this.block === null || this.block.node !== node ) {

			throw new Error( 'No block to remove or block mismatch.' );

		}

		this.block = this.block.parent;

	}

	processVariables( node ) {

		this.block.setProperty( node.name, node );

		if ( node.value ) {

			this.processExpression( node.value );

		}

	}

	processUniform( node ) {

		this.block.setProperty( node.name, node );

	}

	processVarying( node ) {

		this.block.setProperty( node.name, node );

	}

	evalProperty( node ) {

		let property = '';

		if ( node.isAccessor ) {

			property += node.property;

		}

		return property;

	}

	processExpression( node ) {

		if ( node.isAccessor ) {

			const property = this.block.getProperty( this.evalProperty( node ) );

			if ( property ) {

				node.linker.reference = property;

				property.linker.accesses.push( node );

			}

		} else if ( node.isNumber || node.isString ) {

			// Process primitive values

		} else if ( node.isOperator ) {

			this.processExpression( node.left );
			this.processExpression( node.right );

			if ( node.isAssignment ) {

				const property = this.block.getProperty( this.evalProperty( node.left ) );

				if ( property ) {

					property.linker.assignments.push( node );

				}

			}

		} else if ( node.isFunctionCall ) {

			for ( const param of node.params ) {

				this.processExpression( param );

			}

		} else if ( node.isReturn ) {

			if ( node.value ) this.processExpression( node.value );

		} else if ( node.isDiscard || node.isBreak || node.isContinue ) {

			// Process control flow

		} else if ( node.isAccessorElements ) {

			this.processExpression( node.object );

			for ( const element of node.elements ) {

				this.processExpression( element.value );

			}

		} else if ( node.isDynamicElement || node.isStaticElement ) {

			this.processExpression( node.value );

		} else if ( node.isFor || node.isWhile ) {

			this.processForWhile( node );

		} else if ( node.isSwitch ) {

			this.processSwitch( node );

		} else if ( node.isVariableDeclaration ) {

			this.processVariables( node );

		} else if ( node.isUniform ) {

			this.processUniform( node );

		} else if ( node.isVarying ) {

			this.processVarying( node );

		} else if ( node.isTernary ) {

			this.processExpression( node.cond );
			this.processExpression( node.left );
			this.processExpression( node.right );

		} else if ( node.isConditional ) {

			this.processConditional( node );

		} else if ( node.isUnary ) {

			this.processExpression( node.expression );

			if ( node.isAssignment ) {

				if ( node.parent.hasAssignment !== true ) {

					// optimize increment/decrement operator
					// to avoid creating a new variable

					node.after = false;

				}

				const property = this.block.getProperty( this.evalProperty( node.expression ) );

				if ( property ) {

					property.linker.assignments.push( node );

				}

			}

		}

	}

	processBody( body ) {

		for ( const statement of body ) {

			this.processExpression( statement );

		}

	}

	processConditional( node ) {

		this.processExpression( node.cond );
		this.processBody( node.body );

		let current = node;

		while ( current.elseConditional ) {

			if ( current.elseConditional.cond ) {

				this.processExpression( current.elseConditional.cond );

			}

			this.processBody( current.elseConditional.body );

			current = current.elseConditional;

		}

	}

	processForWhile( node ) {

		if ( node.initialization ) this.processExpression( node.initialization );
		if ( node.condition ) this.processExpression( node.condition );
		if ( node.afterthought ) this.processExpression( node.afterthought );

		this.processBody( node.body );

	}

	processSwitch( switchNode ) {

		this.processExpression( switchNode.discriminant );

		for ( const switchCase of switchNode.cases ) {

			if ( switchCase.isDefault !== true ) {

				for ( const condition of switchCase.conditions ) {

					this.processExpression( condition );

				}

			}

			this.processBody( switchCase.body );

		}

	}

	processFunction( node ) {

		this.addBlock( node );

		for ( const param of node.params ) {

			this.block.setProperty( param.name, param );

		}

		this.processBody( node.body );

		this.removeBlock( node );

	}

	process( ast ) {

		this.addBlock( ast );

		for ( const statement of ast.body ) {

			if ( statement.isFunctionDeclaration ) {

				this.processFunction( statement );

			} else {

				this.processExpression( statement );

			}

		}

		this.removeBlock( ast );

	}

}

export default Linker;
