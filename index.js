var fs = require('fs');
const main = require("./syncpom").main;
var args = process.argv.splice(2);
var pomPath = args.length ? args[0] : 'pom.xml';
var packagePath = args.length >= 2 ? args[1] : 'package.json';
var devDependencyToUpdate = args.length >= 3 ? args[2] : undefined;
var devDependencyNewVersion = args.length >= 4 ? args[3] : undefined;
var UTF8 = 'UTF8';

main(fs.readFileSync(pomPath, UTF8),
    fs.readFileSync(packagePath, UTF8),
    devDependencyToUpdate,
    devDependencyNewVersion,
    function packageNewContent(content) {
        fs.writeFileSync(packagePath, content, UTF8)
    }
);

