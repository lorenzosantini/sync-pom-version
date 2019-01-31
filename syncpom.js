var fs = require('fs');
var parse = require('xml-parser');

function extractPomVersion(pomContent) {
    var pom = parse(pomContent);
    var pomVersionNode = extractPomVersionNode(pom.root);
    if (!pomVersionNode) {
        var parent = extractParentNode(pom.root);
        pomVersionNode = extractPomVersionNode(parent);
    }

    var pomVersion = pomVersionNode.content;
    return pomVersion;
}

function updateDependency(json, depType, dependencyToUpdate, dependencyNewVersion) {
    var ret = "";
    var dependencyToUpdateOldVersion = json[depType][dependencyToUpdate];
    if (dependencyToUpdateOldVersion !== dependencyToUpdate) {
        console.log('found version ' + dependencyToUpdateOldVersion + ' of dependency ' + dependencyToUpdate + ' in package.json');
        json[depType][dependencyToUpdate] = dependencyNewVersion;
        ret = 'package.json ' + dependencyToUpdate + ' updated to version ' + dependencyNewVersion + '\n'
    }
    return ret;
}

exports.main = function (pomContent, packageContent, writer, dependencyToUpdate, dependencyNewVersion) {

    var pomVersion = extractPomVersion(pomContent);
    console.log('found version ' + pomVersion + ' in pom.xml');

    var json = JSON.parse(packageContent);

    var npmVersion = json.version;
    console.log('found version ' + npmVersion + ' in package.json');

    var newNpmVersion = mvnVersionToNpm(pomVersion);

    var log = "";
    if (newNpmVersion !== npmVersion) {
        json.version = newNpmVersion;
        log = 'package.json updated to version ' + newNpmVersion + '\n';
    }
    if (json.devDependencies[dependencyToUpdate]) {
        log += updateDependency(json, "devDependencies", dependencyToUpdate, dependencyNewVersion);

    } else if (json.dependencies[dependencyToUpdate]) {
        log += updateDependency(json, "dependencies", dependencyToUpdate, dependencyNewVersion);
    }

    var newPackageContent = JSON.stringify(json);
    if (newPackageContent !== packageContent) {
        writer(newPackageContent);
        console.log(log);
    }
};

function extractParentNode(node) {
    return node.children.filter(function (item) {
        return item.name === 'parent';
    })[0];
}

function extractPomVersionNode(parent) {
    return parent.children.filter(function (item) {
        return item.name === 'version';
    })[0];
}

function padToNPMVersion(version) {
    var NPM_VERSION_SEQUENCES = 3;

    var tokens = version.split('.').length;
    var missingSeq = NPM_VERSION_SEQUENCES - tokens;
    for (var i = 0; i < missingSeq; i++) {
        version = version + ".0"
    }
    return version;
}

function mvnVersionToNpm(mvnVersion) {
    var normalizedMvnVersion = mvnVersion.replace(/[\.-](RELEASE|FINAL)$/i, '');
    var tokens = normalizedMvnVersion.split("-");
    var snapshotSuffix = (tokens.length == 2 ? "-" + tokens[1] : "");
    return padToNPMVersion(tokens[0]) + snapshotSuffix;
}
