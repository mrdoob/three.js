export function isExpression( st ) {

	return st.isFunctionDeclaration !== true && st.isFor !== true && st.isWhile !== true && st.isConditional !== true && st.isSwitch !== true;

}

export function isPrimitive( value ) {

	return /^(true|false|-?(\d|\.\d))/.test( value );

}

export function isType( str ) {

	return /void|bool|float|u?int|mat[234]|mat[234]x[234]|(u|i|b)?vec[234]/.test( str );

}

export function toFloatType( type ) {

	if ( /^(i?int)$/.test( type ) ) return 'float';

	const vecMatch = /^(i|u)?vec([234])$/.exec( type );

	if ( vecMatch ) return 'vec' + vecMatch[ 2 ];

	return type;

}
