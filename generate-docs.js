//@ts-check

/*

This file is used to generate the sync the list.json file with all the props and methods of a Class.

How to...

1. First install the dependency `npm i node-fetch` (`npm i` or `npm install` won't work, as node-fetch is not there in the package.json)
2. The json file should be available in `./docs/list.json`
3. Then: `node generate-docs`
4. This will generate a list.json file in the same dir you can merge the list.json with the ./docs/list.json

*/
const fetch = require('node-fetch')
const fs = require('fs')
let base = 'http://threejs.org/docs/'
// @ts-ignore
let list = JSON.parse(fs.readFileSync('./docs/list.json'))

const timer = ms => new Promise(res => setTimeout(res, ms))

async function task(i) { 
    //3000ms can be variable according to your internet speed and performance (lowering this value may cause connection timeout error)
    await timer(3000);
    console.log(`Task ${i} done!`);
}
(async () => {
let i = 0
    for (let locale in list){
        let lock = list[locale]
        for (let sec in lock){
            let lock1 = lock[sec]
            for (let cat in lock1){
                let lock2 = lock1[cat]
                for (let page in lock2){
                    // @ts-ignore
                    fetch(base+lock2[page]["url"]).then(r => r.text()).then(html =>{
                        let res = html.match(/\[\s*(method|property):\w*\s(\w*\s*)\]/ig)
                        let methods = [], props =[];
                        res?.forEach(async m => {
                            m.match(/\[\s*(method):\w*\s(\w*\s*)\]/ig)?.forEach(r => {
                                methods.push(r.replace(/\[\s*(method):\w*\s(\w*\s*)\]/ig, "$2"))
                            })
                            m.match(/\[\s*(property):\w*\s(\w*\s*)\]/ig)?.forEach(r => {
                                props.push(r.replace(/\[\s*(property):\w*\s(\w*\s*)\]/ig, "$2"))
                            })
                        })
                        list[locale][sec][cat][page] = {
                            "url": list[locale][sec][cat][page],
                            "methods": methods,
                            "props": props
                        }
                    }).catch(console.error)
                    i++
                    await task(i);
                }
            }
        }
        
    }
})().then(m => {
    fs.writeFileSync('./list.json', JSON.stringify(list))
})
