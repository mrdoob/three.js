import re

def constify( sourceCode, spec, debug = False ):

    for ctxSpec in spec:
        if ctxSpec.get('contextRegExp') is not None:
            break

        ctxSpec['contextRegExp'] = re.compile(
                ctxSpec.get( 'contextRegExpString', None ) )

    def debugOutput( match ):

        start, end = match.start( 1 ), match.end()

        lineStart = sourceCode.rfind( '\n', 0, start ) + 1
        lineEnd = sourceCode.find( '\n', end )
        if lineEnd == -1: lineEnd = len( sourceCode )

        line = sourceCode[ lineStart : lineEnd ]
        prefix = line[ : start - lineStart ]

        line = line.expandtabs( 4 )
        prefix = prefix.expandtabs( 4 )

        print line
        print ' ' * len( prefix ) + '^'

    def replaceConstant( match ):
        before, context, identifier = match.groups()

        for ctxSpec in spec:

            if not ctxSpec['contextRegExp'].match( context ): continue

            value = ctxSpec['constants'].get( identifier )

            if value is not None:
                if debug: debugOutput(match)
                return before + unicode( value )

            break

        return match.group( 0 )

    return re.sub(
            r'(^|\W)(\w+)\s*\.\s*([A-Z]\w+)(?!\s*=[^=])',
            # matches <context> . <Id>
            # where 'Id' must refer to an uppercase identifier.
            # The construct must not be followed by '=', but may
            # be followed by '=='.

            replaceConstant, sourceCode )

