module.exports = jsext = {};

var querystring = require("querystring");
var fs = require("fs");
var path = require("path");
var os = require("os");

jsext.PriorityQueue = require("./priorityqueue");

// JS Type Extensions

if (!Function.prototype.extends) {
    Function.prototype.extends = function(ParentClass) {
        if(ParentClass.constructor == Function) {
            this.prototype = new ParentClass;
            this.prototype.constructor = this;
            this.prototype.parent = ParentClass.prototype;
        } else {
            this.prototype = ParentClass;
            this.prototype.constructor = this;
            this.prototype.parent = ParentClass;
        }
    }
}

if (!RegExp.escape) {
    RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
}

if (!Array.prototype.unique) {
    Array.prototype.unique = function() {
        var a = this.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    };
}

if (!Array.prototype.removeArray) {
    Array.prototype.removeArray = function(killer) {
        var a = this.concat();
        for(var i=0; i<killer.length; ++i) {
            var val = killer[i];
            var index = a.indexOf(val);
            if(index >= 0) {
                a.splice(index, 1);
            }
        }
        return a;
    };
}

if(!Array.prototype.clean) {
    Array.prototype.clean = function(validation) {
        var a = this.concat();
        var validationFunc = validation && typeof(validation) == "function" ? validation : Boolean;
        return a.filter(function(val) {
            return validationFunc(val);
        });
    }
}

if(!Array.prototype.sample) {
    Array.prototype.sample = function(count) {
        count = count > this.length ? this.length : count;

        if(count == this.length) return this.concat();

        var sampled = [];
        var pendding = count;
        while(pendding) {
            var elem = this[Math.floor(Math.random() * this.length)];
            if(sampled.indexOf(elem) < 0) {
                sampled[sampled.length] = elem;
                pendding--;
            }
        }
        return sampled;
    }
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "");
    }
}

if (!String.prototype.format) {
    String.prototype.format = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    }
}

if (!Object.prototype.pick) {
    Object.prototype.pick = function(props) {
        var origin = this;
        if(!props || !Array.isArray(props) || !props.length) return origin;

        var subset = props.reduce(function(out, k) {
            if(origin.hasOwnProperty(k)) out[k] = origin[k];
            return out;
        }, {});
        return subset;
    }
}


if (!Object.prototype.filter) {
    Object.prototype.filter = function(callback) {
        var origin = this;
        return jsext.filterObject(origin, callback);
    }
}

if (!Object.prototype.format) {
    Object.prototype.format = function(convertion) {
        var origin = this;
        return jsext.formatObject(origin, convertion);
    }
}

// Extension's functions

jsext.filterObject = function(obj, callback) {
    if(!obj)
        throw new Error("Missing object instance");
    if (typeof callback != "function")
        throw new Error("Function type");

    var response = {};
    Object.keys(obj).forEach(function(key) {
        var elem = obj[key];
        if(callback(key, elem)) response[key] = elem;
    });
    return response;
}

jsext.getObjectValues = function (dataObject) {
    if(!dataObject)
        return;
    var dataArray = Object.keys(dataObject).map(function(k){return dataObject[k]});
    return dataArray;
}

jsext.formatObject = function (input, format) {
    if(!input || !format)
        return input;

    var output = {};
    for(var outformat in format) {
        if(!format.hasOwnProperty(outformat)) continue;

        var informat = format[outformat];
        var value = jsext.getObjectDeepValue(input, informat);
        jsext.setObjectDeepValue(output, outformat, value);
    }
    return output;
}

jsext.setObjectDeepValue = function (obj, path, value, separator) {
    if(!obj || !path)
        return;

    separator = separator || ".";
    var parts = path.split(separator);
    if (parts.length == 1) {
        obj[parts[0]] = value;
        return;
    }

    var subpath = parts.slice(1).join(separator);
    var firstkey = parts[0];
    obj[firstkey] = {};
    jsext.setObjectDeepValue(obj[firstkey], subpath, value, separator);
}

jsext.getObjectDeepValue = function (obj, path, separator) {
    if(!obj || !path)
        return obj;

    separator = separator || ".";
    var parts = path.split(separator);
    if (parts.length == 1)
        return obj[parts[0]];

    var subpath = parts.slice(1).join(separator);
    var firstkey = parts[0];
    return jsext.getObjectDeepValue(obj[firstkey], subpath);
}

jsext.serializeDictionary = function (obj, connector) {
    if(!obj)
        return;

    connector = connector || ",";
    var builder = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i) || typeof(i) === 'function') continue;

        builder.push(i + "=" + obj[i]);
    }
    return builder.join(connector);
}

jsext.buildUrl = function (link, params, starter) {
    var serializedParams = typeof(params) == "string" ? params : querystring.stringify(params);
    var url = link || "";
    if(serializedParams) {
        starter = starter || "?";
        if(url.indexOf(starter) < 0) {
            url += starter + serializedParams;
        } else {
            url = url.endsWith("&") ? url + serializedParams : url + "&" + serializedParams;
        }
    }

    return url;
}

jsext.first = function(obj) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i) || typeof(i) === 'function') continue;

        return obj[i];
    }
}

jsext.loadJsonFile = function(file) {
    if(!file)
        return;

    if(!jsext.fileExists(file))
        return;

    var filecontent = fs.readFileSync(file, 'utf8');
    if(!filecontent)
        return;

    var fileobject = JSON.parse(filecontent);
    if(!fileobject)
        return;

    return fileobject;
}

jsext.saveJsonFile = function(file, obj, space, force) {
    return new Promise(function (resolve, reject) {
        if(!file || !obj)
            return reject("missing required parameter");

        force = force != undefined ? force : false;
        if(!force && jsext.fileExists(file))
            return reject("Can not replace the file " + file + " it already exists");

        var content = JSON.stringify(obj, null, space);
        fs.writeFile(file, content, function (err) {
            if (err) return reject(err);
            return resolve(content);
        });
    });
}

jsext.renameOverwrite = function (currentName, newName) {
    return new Promise(function(resolve, reject) {
        if(!jsext.fileExists(currentName))
            return resolve();

        if(jsext.fileExists(newName))
            fs.unlinkSync(newName);

        fs.rename(currentName, newName, function (err) {
            if (err) return reject(err);
            return resolve(newName);
        });
    });
}

jsext.fileExists = function(file) {
    try {
        var stats = fs.statSync(file);
        return true;
    }
    catch (e) {
        return false;
    }
}

jsext.removeFile = function(file) {
    if(!jsext.fileExists(file))
        return;

    fs.unlinkSync(file);
}

jsext.isDir = function (path) {
    if(!path)
        return false;

    try {
        if(!fs.existsSync(path)) return false;
    }
    catch (e) {
        return false;
    }

    var dirstats = fs.statSync(path);
    if(!dirstats || !dirstats.isDirectory())
        return false;

    return true;
}

jsext.listDir = function (dirpath, extfilter) {
    dirpath = dirpath && path.normalize(dirpath);
    if(!dirpath)
        return;

    extfilter = extfilter || [];
    if(typeof(extfilter) == "string") extfilter = [extfilter];

    if(!jsext.isDir(dirpath))
        return;

    var files = fs.readdirSync(dirpath);
    if(!files || !extfilter)
        return files;

    files = files.filter(function (file) {
        var fullfile = dirpath + "/" + file;
        var stats = fs.statSync(fullfile);
        if(!stats.isFile())
            return false;

        var extension = path.extname(fullfile || "");
        extension = extension.replace(".", "");
        var inFilter = extfilter.indexOf(extension.toUpperCase()) >= 0 || extfilter.indexOf(extension.toLowerCase()) >= 0;
        return inFilter;
    });
    return files;
}

jsext.mkdirSync = function (dir) {
    dir = path.normalize(dir);
    if(jsext.isDir(dir))
        return;

    try {
        fs.mkdirSync(dir);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}

jsext.mkdirRecursive = function (dir) {
    dir = path.normalize(dir);
    if(jsext.isDir(dir))
        return;

    var parts = dir.split(path.sep);
    if(!parts || !parts.length)
        return;

    var starter = "";

    //traitement for mac or linux paths
    if(os.platform() == "win32") {
        starter = parts.shift() + path.sep;
    } else 
    if(!parts[0]) {
        parts.shift();
        starter = path.sep;
    }
    for( var i = 1; i <= parts.length; i++ ) {
        var partial = parts.slice(0, i);
        var partialPath = starter + path.join.apply(null, partial);
        jsext.mkdirSync( partialPath );
    }
}

jsext.listSubdir = function (path) {
    if(!path)
        return;

    if(!jsext.isDir(path))
        return;

    var files = fs.readdirSync(path);
    if(!files)
        return;

    var subdirs = files.filter(function (file) {
        var fullfile = path + "/" + file;
        var stats = fs.statSync(fullfile);
        return !stats.isFile();
    });
    return subdirs;
}

jsext.fileToBuffer = function (filename, bufferlimit) {
    bufferlimit = bufferlimit || 1048576;
    return new Promise(function (resolve, reject) {
        fs.open(filename, 'r', function (err, fd) {
            if (err) reject(err);
            else {
                var buffer = new Buffer(bufferlimit);
                fs.read(fd, buffer, 0, bufferlimit, 0, function (err, bytesRead, buffer) {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            }
        });
    });
}

jsext.extractFromFile = function (filename, markBegin, markEnd, bufferlimit) {
    return new Promise( function (resolve, reject) {
        jsext.fileToBuffer(filename, bufferlimit)
            .then(function (buffer) {
                if (!Buffer.isBuffer(buffer)) {
                    reject("input is not a buffer");
                    return;
                }
                var data = {raw: {}};
                var offsetBegin = buffer.indexOf(markBegin);
                var offsetEnd = buffer.indexOf(markEnd);
                var extractBuffer = offsetBegin && offsetEnd && buffer.slice(offsetBegin, offsetEnd + markEnd.length);
                var extract = extractBuffer && extractBuffer.toString("utf-8", 0, extractBuffer.length);
                resolve(extract);
            });
    });
}

jsext.callback = function(callback, args) {
    if(!callback)
        return;

    return callback.apply(null, args || []);
}