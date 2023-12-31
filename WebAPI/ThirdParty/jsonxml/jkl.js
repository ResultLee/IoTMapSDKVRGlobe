let JKL = function () {};
JKL.Dumper = function () {
  return this;
};

JKL.Dumper.prototype.dump = function (data, offset, arrParams = []) {
  if (data.constructor == Object) {
    arrParams.map((arrParam) => {
      let { name, isTraverse, keywordProperty } = arrParam;
      if (!data[name]) {
        if (data.hasOwnProperty(keywordProperty) && isTraverse) data[name] = [];
      } else if (data[name].constructor == Object) {
        data[name] = [data[name]];
      }
    });
  }
  if (typeof offset == "undefined") offset = "";
  var nextoff = offset + "  ";
  switch (typeof data) {
    case "string":
      return '"' + this.escapeString(data) + '"';
    // break;
    case "number":
      return data;
    // break;
    case "boolean":
      return data ? "true" : "false";
    // break;
    case "undefined":
      return "null";
    // break;
    case "object":
      if (data == null) {
        return "null";
      } else if (data.constructor == Array) {
        let array = [];
        for (var i = 0; i < data.length; i++) {
          array[i] = this.dump(data[i], nextoff, arrParams);
        }
        return (
          "[\n" + nextoff + array.join(",\n" + nextoff) + "\n" + offset + "]"
        );
      } else {
        let array = [];
        for (var key in data) {
          var val = this.dump(data[key], nextoff, arrParams);
          //              if ( key.match( /[^A-Za-z0-9_]/ )) {
          key = '"' + this.escapeString(key) + '"';
          //              }
          array[array.length] = key + ": " + val;
        }
        if (array.length == 1 && !array[0].match(/[\n\{\[]/)) {
          return "{ " + array[0] + " }";
        }
        return (
          "{\n" + nextoff + array.join(",\n" + nextoff) + "\n" + offset + "}"
        );
      }
    // break;
    default:
      return data;
    // unsupported data type
    // break;
  }
};

//  escape '\' and '"'

JKL.Dumper.prototype.escapeString = function (str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

export default JKL;
