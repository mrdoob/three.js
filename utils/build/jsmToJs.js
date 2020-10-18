var path = require('path')
var glob = require('glob')
var fs = require('fs')
var mkdirp = require('mkdirp')
var babel = require('@babel/core')
var uglify = require('uglify-js')

class JsmToJs {
  constructor() {
    this.base = path.resolve()
    this.src = `${this.base}/examples/jsm`
    this.success = 0
    this.failure = 0
  }

  init(){
    return this.getJsxFilePaths().then(() => {
      return this.filesFlow()
    })
  }

  getJsxFilePaths(){
    return new Promise((resolve, reject) => {
      //glob(`C:/dev/three.js/examples/jsm/loaders/GLTFLoader.js`, {}, (err, d) => {
      glob(`${this.src}/**/*.js`, {}, (err, d) => {
        this.jsxFilePaths = d
        resolve()
      })
    })
  }

  filesFlow(){
    return new Promise((resolve, reject) => {
      this.fileFlowWorker = setInterval(() => {
        if(!this.busy && this.jsxFilePaths[0]){
          this.busy = true
          let filePath = this.jsxFilePaths[0]
          console.log(`JsmToJs.converting: ${filePath}`)
          this.fileFlow(filePath).then(() => {
            this.jsxFilePaths.shift()
            this.busy = false
            this.success++
          }).catch((e) => {
            this.failure++
            console.log(e)
          })
        }
        if(!this.busy && !this.jsxFilePaths[0]){
          console.log('SUCCESS TOTAL:', this.success)
          console.log('FAILURE TOTAL:', this.failure)
          resolve()
        }
      }, 20)
    })
  }

  fileFlow(filePath){
    let fileContents
    return this.readFile(filePath).then((d) => {
      fileContents = this.transformRawFile(filePath, d)
      return this.transpileFile(filePath, fileContents)
    }).then((d) => {
      fileContents = this.transformTranspiledFile(d)
      return this.writeFile(filePath, fileContents)
    }).catch((e) => {
      //Write out the file anyway just to see what happens
      this.failure++
      console.log(`ERROR:`, filePath)
      return this.writeFile(filePath, fileContents)
    })
  }

  readFile(filePath){
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, {encoding: 'utf-8'}, (e, d) => {
        if(d){
          resolve(d)
        } else {
          reject(e)
        }
      })
    })
  }

  transformRawFile(filePath, fileContents){
    fileContents = this.getFlatFileContents(fileContents)
    let imports = this.getFileContentsImports(filePath, fileContents)
    fileContents = this.getFileContentsNoImports(fileContents, imports)
    fileContents = this.replaceImportsWithGlobals(fileContents, imports) 
    return fileContents
  }

  transpileFile(filePath, fileContents){
    return new Promise((resolve, reject) => {  
      babel.transform(fileContents, {
        compact: false,
        presets: ["@babel/preset-env"]
      }, (e, d) => {
        if (e) {
          reject(e)
        } else {
          resolve(d.code)
        }
      })
    })
  }

  writeFile(filePath, fileContents){
    return new Promise((resolve, reject) => {
      filePath = filePath.replace("/jsm", "/js2")
      this.writeFileFs(`${filePath}`, fileContents, (e) => {
        if(e){
          reject(e)
        } else {
          resolve()
        }
      })
    })
  }

  writeFileFs(filePath, contents, cb) {
    mkdirp(path.dirname(filePath), (err) => {
      if (err) {
        return cb(err)
      }
      fs.writeFile(filePath, contents, cb)
    })
  }

  getFlatFileContents(fileContents){
    fileContents = fileContents.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "")
    fileContents = fileContents.replace(/\r\n|\n|\r/gm, "")
    return fileContents
  }

  getFileContentsImports(filePath, fileContents){
    let importsList = []
    let importsRegex = new RegExp(`(?<=import )(.*?)(?= from ("|'))`, `gm`)
    let importsRaw = fileContents.match(importsRegex) || []

    importsRaw.forEach((importRaw, i) => {
      let importsGroomed = importRaw.replace(/[ ]|\r\n|\n|\r|\t|\{|\}/gm, "")
      let importsArray = importsGroomed.split(",")
      importsList = [ ...importsList, ...importsArray ]
    })

    let lastImportRaw = importsRaw.length ? importsRaw[importsRaw.length - 1] : null
    let lastImportRegex = lastImportRaw ? new RegExp(`(?<=${lastImportRaw})(.*?)(?=;)`, `gm`) : null
    let lastImportMatch = lastImportRegex ? fileContents.match(lastImportRegex) : null
    let lastImportIndex = lastImportMatch ? lastImportRegex.exec(fileContents).index + lastImportMatch[0].length + 1 : 0

    return { 
      importsList: importsList,
      lastImportIndex: lastImportIndex
    }
  }

  getFileContentsNoImports(fileContents, imports){
    let fileContentsNoImports = fileContents.slice(imports.lastImportIndex)
    return fileContentsNoImports
  }

  replaceImportsWithGlobals(fileContents, imports){
    let fileContentsWithGlobals = fileContents
    imports.importsList.forEach((_import) => {
      let importIndex = fileContentsWithGlobals.indexOf(' ' + _import)
      let importContext = fileContentsWithGlobals[importIndex + _import.length + 1]
      let importMatch = new RegExp(/[^a-zA-Z\d\s:]/).test(importContext)
      if(importMatch){
        fileContentsWithGlobals = fileContentsWithGlobals.replace(' ' + _import, ` THREE.${_import}`)  
      }
    })
    return fileContentsWithGlobals
  }

  allIndexOf(str, toSearch) {
    var indices = []
    for(var pos = str.indexOf(toSearch); pos !== -1; pos = str.indexOf(toSearch, pos + 1)) {
      indices.push(pos)
    }
    return indices
  }

  transformTranspiledFile(fileContents){
    fileContents = fileContents.replace(/exports\./g, 'THREE.')
    return fileContents
  }
}

let jsmToJs = new JsmToJs()

jsmToJs.init().then(() => {
  console.log(`JsmToJs: [SUCCESS]`)
  process.exit(0)
}).catch((e) => {
  console.log(`JsmToJs: [FAILURE]`, e)
  process.exit(1)
})