var UglifyJS = require("uglify-es");
var fs = require('fs');
const pkg = require('./package.json');
const name = pkg.name;
const folderOutput = './../' //folder JS project
const fileOutput = folderOutput+name+'.min.js'
console.log("Compiling and minifying...")

const file_to_compress = [
'src/CoCreateMap.js',
'src/CoCreateMap_Animate.js',
'src/CoCreateMap_GetLocation.js',
'src/CoCreateMap_Autocomplete.js',
'src/CoCreateMap_Direction.js',
'src/CoCreateMap_Search.js',
'src/index.js'
];

var options = {
    toplevel: false,
    compress: {
        passes: 1
    },
    output: {
        beautify: false,
        preamble: "/* CoCreate-maps */"
    }
};


for(var i =0 ; i<file_to_compress.length;i++){
    var file = file_to_compress[i];
    console.log(file)
    var result = UglifyJS.minify({
        file: fs.readFileSync(file, "utf8")
    }, options);
    //console.log('code = > ',result.code)
    if (typeof(result) != 'undefined')
        if (i)
            fs.appendFileSync(fileOutput, result.code);
        else
            fs.writeFileSync(fileOutput, result.code);
    else 
        console.log('Error code = > ',result)
}
console.log("Successfully Created "+fileOutput)