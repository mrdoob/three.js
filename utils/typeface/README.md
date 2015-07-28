# Three.js Create Font JS from TTF/OTF 

Creates a _typeface js from TTF and OTF files.

## Usage

1. Run module   node createfontjs {path of otf/ttf file}.
2. Creates a js file with filename as font family name.
3. Include the js in HTML where the font is required. 
4. Create text geometry as 

        new THREE.TextGeometry( text, {
        
                    font: font, //font family name in js file 
                    weight: weight,
                    style: style,
                    
                } );

## Dependency 

Require OPENTYPE.JS 
        https://github.com/nodebox/opentype.js