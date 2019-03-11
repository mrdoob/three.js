# Modularize
Converting files in examples/js to ES6 modules by analyzing AST.
## Usage
```bash
cd utils/modularize
npm install
node convert.js loaders/OBJLoader.js
# or
node convert.js loaders/**/*.js
```