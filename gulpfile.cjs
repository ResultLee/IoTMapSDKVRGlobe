/*eslint-env node*/
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const child_process = require("child_process");

const globby = require("globby");
const gulpTerser = require("gulp-terser");
const rimraf = require("rimraf");
const glslStripComments = require("glsl-strip-comments");
const mkdirp = require("mkdirp");
const streamToPromise = require("stream-to-promise");
const gulp = require("gulp");
const Promise = require("bluebird");
const yargs = require("yargs");
const rollup = require("rollup");
const rollupPluginStripPragma = require("rollup-plugin-strip-pragma");
const rollupPluginTerser = require("rollup-plugin-terser");
const rollupCommonjs = require("@rollup/plugin-commonjs");
const rollupResolve = require("@rollup/plugin-node-resolve").default;
const cleanCSS = require("gulp-clean-css");
const typescript = require("typescript");

const packageJson = require("./package.json");
let version = packageJson.version;
if (/\.0$/.test(version)) {
  version = version.substring(0, version.length - 2);
}

//Gulp doesn't seem to have a way to get the currently running tasks for setting
//per-task variables.  We use the command line argument here to detect which task is being run.
const taskName = process.argv[2];

const minifyShaders =
  taskName === "minify" ||
  taskName === "minifyRelease" ||
  taskName === "release";

let concurrency = yargs.argv.concurrency;
if (!concurrency) {
  concurrency = os.cpus().length;
}

// Work-around until all third party libraries use npm
const filesToLeaveInThirdParty = [
  "!Source/ThirdParty/Workers/basis_transcoder.js",
  "!Source/ThirdParty/basis_transcoder.wasm",
  "!Source/ThirdParty/google-earth-dbroot-parser.js",
  "!Source/ThirdParty/knockout*.js",
];

const sourceFiles = [
  "Source/**/*.js",
  "!Source/*.js",
  "!Source/Workers/**",
  "!Source/WorkersES6/**",
  "Source/WorkersES6/createTaskProcessorWorker.js",
  "!Source/ThirdParty/Workers/**",
  "!Source/ThirdParty/google-earth-dbroot-parser.js",
  "!Source/ThirdParty/_*",
];

function rollupWarning(message) {
  // Ignore eval warnings in third-party code we don't have control over
  if (message.code === "EVAL" && /protobufjs/.test(message.loc.file)) {
    return;
  }

  console.log(message);
}

let copyrightHeader = fs.readFileSync(
  path.join("Source", "copyrightHeader.js"),
  "utf8"
);
copyrightHeader = copyrightHeader.replace("${version}", version);

function createWorkers() {
  rimraf.sync("Build/createWorkers");

  globby
    .sync([
      "Source/Workers/**",
      "!Source/Workers/cesiumWorkerBootstrapper.js",
      "!Source/Workers/transferTypedArrayTest.js",
    ])
    .forEach(function (file) {
      rimraf.sync(file);
    });

  const workers = globby.sync(["Source/WorkersES6/**"]);

  return rollup
    .rollup({
      input: workers,
      onwarn: rollupWarning,
    })
    .then(function (bundle) {
      return bundle.write({
        dir: "Build/createWorkers",
        banner:
          "/* This file is automatically rebuilt by the Cesium build process. */",
        format: "amd",
      });
    })
    .then(function () {
      return streamToPromise(
        gulp.src("Build/createWorkers/**").pipe(gulp.dest("Source/Workers"))
      );
    })
    .then(function () {
      rimraf.sync("Build/createWorkers");
      rimraf.sync("Build/minifyShaders.state");
      rimraf.sync("Build/package.json");
    });
}

async function buildThirdParty() {
  rimraf.sync("Build/createWorkers");
  globby.sync(filesToLeaveInThirdParty).forEach(function (file) {
    rimraf.sync(file);
  });

  const workers = globby.sync(["ThirdParty/npm/**"]);

  return rollup
    .rollup({
      input: workers,
      plugins: [rollupResolve(), rollupCommonjs()],
      onwarn: rollupWarning,
    })
    .then(function (bundle) {
      return bundle.write({
        dir: "Build/createThirdPartyNpm",
        banner:
          "/* This file is automatically rebuilt by the Cesium build process. */",
        format: "es",
      });
    })
    .then(function () {
      return streamToPromise(
        gulp
          .src("Build/createThirdPartyNpm/**")
          .pipe(gulp.dest("Source/ThirdParty"))
      );
    })
    .then(function () {
      rimraf.sync("Build/createThirdPartyNpm");
    });
}

gulp.task("build", async function () {
  mkdirp.sync("Build");

  fs.writeFileSync(
    "Build/package.json",
    JSON.stringify({
      type: "commonjs",
    }),
    "utf8"
  );

  await buildThirdParty();
  glslToJavaScript(minifyShaders, "Build/minifyShaders.state");
  createCesiumJs();
  // createWorkers();
  return Promise.join(createWorkers());
});

function minifyRelease() {
  return combineJavaScript({
    removePragmas: true,
    minify: true,
    outputDirectory: path.join("Build", "VRGlobe"),
  });
}

gulp.task("minifyRelease", gulp.series("build", minifyRelease));

function combineCesium(debug, minify, combineOutput) {
  const plugins = [];

  if (!debug) {
    plugins.push(
      rollupPluginStripPragma({
        pragmas: ["debug"],
      })
    );
  }
  if (minify) {
    plugins.push(rollupPluginTerser.terser());
  }

  return rollup
    .rollup({
      input: "WebAPI/VRGlobe.js",
      plugins: plugins,
      onwarn: rollupWarning,
    })
    .then(function (bundle) {
      return bundle.write({
        format: "umd",
        name: "VRGlobe",
        file: path.join(combineOutput, "VRGlobe.js"),
        sourcemap: debug,
        banner: copyrightHeader,
      });
    });
}

function combineWorkers(debug, minify, combineOutput) {
  //This is done waterfall style for concurrency reasons.
  // Copy files that are already minified
  return globby(["Source/ThirdParty/Workers/draco*.js"])
    .then(function (files) {
      const stream = gulp
        .src(files, { base: "Source" })
        .pipe(gulp.dest(combineOutput));
      return streamToPromise(stream);
    })
    .then(function () {
      return globby([
        "Source/Workers/cesiumWorkerBootstrapper.js",
        "Source/Workers/transferTypedArrayTest.js",
        "Source/ThirdParty/Workers/*.js",
        // Files are already minified, don't optimize
        "!Source/ThirdParty/Workers/draco*.js",
      ]);
    })
    .then(function (files) {
      return Promise.map(
        files,
        function (file) {
          return streamToPromise(
            gulp
              .src(file)
              .pipe(gulpTerser())
              .pipe(
                gulp.dest(
                  path.dirname(
                    path.join(combineOutput, path.relative("Source", file))
                  )
                )
              )
          );
        },
        { concurrency: concurrency }
      );
    })
    .then(function () {
      return globby(["Source/WorkersES6/*.js"]);
    })
    .then(function (files) {
      const plugins = [];

      if (!debug) {
        plugins.push(
          rollupPluginStripPragma({
            pragmas: ["debug"],
          })
        );
      }
      if (minify) {
        plugins.push(rollupPluginTerser.terser());
      }

      return rollup
        .rollup({
          input: files,
          plugins: plugins,
          onwarn: rollupWarning,
        })
        .then(function (bundle) {
          return bundle.write({
            dir: path.join(combineOutput, "Workers"),
            format: "amd",
            sourcemap: debug,
            banner: copyrightHeader,
          });
        });
    });
}

function minifyCSS(outputDirectory) {
  streamToPromise(
    gulp
      .src("Source/**/*.css")
      .pipe(cleanCSS())
      .pipe(gulp.dest(outputDirectory))
  );
}

function minifyModules(outputDirectory) {
  return streamToPromise(
    gulp
      .src("Source/ThirdParty/google-earth-dbroot-parser.js")
      .pipe(gulpTerser())
      .pipe(gulp.dest(`${outputDirectory}/ThirdParty/`))
  );
}

function combineJavaScript(options) {
  const minify = options.minify;
  const outputDirectory = options.outputDirectory;
  const removePragmas = options.removePragmas;

  const combineOutput = path.join(
    "Build",
    "combineOutput",
    minify ? "minified" : "combined"
  );

  const promise = Promise.join(
    combineCesium(!removePragmas, minify, combineOutput),
    combineWorkers(!removePragmas, minify, combineOutput),
    minifyModules(outputDirectory)
  );

  return promise.then(function () {
    const promises = [];

    //copy to build folder with copyright header added at the top
    let stream = gulp
      .src([`${combineOutput}/**`])
      .pipe(gulp.dest(outputDirectory));

    promises.push(streamToPromise(stream));

    const everythingElse = ["Source/**", "!**/*.js", "!**/*.glsl"];
    if (minify) {
      promises.push(minifyCSS(outputDirectory));
      everythingElse.push("!**/*.css");
    }

    stream = gulp
      .src(everythingElse, { nodir: true })
      .pipe(gulp.dest(outputDirectory));
    promises.push(streamToPromise(stream));

    return Promise.all(promises).then(function () {
      rimraf.sync(combineOutput);
      rimraf.sync("Build/combineOutput");
    });
  });
}

function glslToJavaScript(minify, minifyStateFilePath) {
  fs.writeFileSync(minifyStateFilePath, minify.toString());
  const minifyStateFileLastModified = fs.existsSync(minifyStateFilePath)
    ? fs.statSync(minifyStateFilePath).mtime.getTime()
    : 0;

  // collect all currently existing JS files into a set, later we will remove the ones
  // we still are using from the set, then delete any files remaining in the set.
  const leftOverJsFiles = {};

  globby
    .sync(["Source/Shaders/**/*.js", "Source/ThirdParty/Shaders/*.js"])
    .forEach(function (file) {
      leftOverJsFiles[path.normalize(file)] = true;
    });

  const builtinFunctions = [];
  const builtinConstants = [];
  const builtinStructs = [];

  const glslFiles = globby.sync([
    "Source/Shaders/**/*.glsl",
    "Source/ThirdParty/Shaders/*.glsl",
  ]);
  glslFiles.forEach(function (glslFile) {
    glslFile = path.normalize(glslFile);
    const baseName = path.basename(glslFile, ".glsl");
    const jsFile = `${path.join(path.dirname(glslFile), baseName)}.js`;

    // identify built in functions, structs, and constants
    const baseDir = path.join("Source", "Shaders", "Builtin");
    if (
      glslFile.indexOf(path.normalize(path.join(baseDir, "Functions"))) === 0
    ) {
      builtinFunctions.push(baseName);
    } else if (
      glslFile.indexOf(path.normalize(path.join(baseDir, "Constants"))) === 0
    ) {
      builtinConstants.push(baseName);
    } else if (
      glslFile.indexOf(path.normalize(path.join(baseDir, "Structs"))) === 0
    ) {
      builtinStructs.push(baseName);
    }

    delete leftOverJsFiles[jsFile];

    const jsFileExists = fs.existsSync(jsFile);
    const jsFileModified = jsFileExists
      ? fs.statSync(jsFile).mtime.getTime()
      : 0;
    const glslFileModified = fs.statSync(glslFile).mtime.getTime();

    if (
      jsFileExists &&
      jsFileModified > glslFileModified &&
      jsFileModified > minifyStateFileLastModified
    ) {
      return;
    }

    let contents = fs.readFileSync(glslFile, "utf8");
    contents = contents.replace(/\r\n/gm, "\n");

    let copyrightComments = "";
    const extractedCopyrightComments = contents.match(
      /\/\*\*(?:[^*\/]|\*(?!\/)|\n)*?@license(?:.|\n)*?\*\//gm
    );
    if (extractedCopyrightComments) {
      copyrightComments = `${extractedCopyrightComments.join("\n")}\n`;
    }

    if (minify) {
      contents = glslStripComments(contents);
      contents = contents
        .replace(/\s+$/gm, "")
        .replace(/^\s+/gm, "")
        .replace(/\n+/gm, "\n");
      contents += "\n";
    }

    contents = contents.split('"').join('\\"').replace(/\n/gm, "\\n\\\n");
    contents = `${copyrightComments}\
//This file is automatically rebuilt by the Cesium build process.\n\
export default "${contents}";\n`;

    fs.writeFileSync(jsFile, contents);
  });

  // delete any left over JS files from old shaders
  Object.keys(leftOverJsFiles).forEach(function (filepath) {
    rimraf.sync(filepath);
  });

  const generateBuiltinContents = function (contents, builtins, path) {
    for (let i = 0; i < builtins.length; i++) {
      const builtin = builtins[i];
      contents.imports.push(
        `import czm_${builtin} from './${path}/${builtin}.js'`
      );
      contents.builtinLookup.push(`czm_${builtin} : ` + `czm_${builtin}`);
    }
  };

  //generate the JS file for Built-in GLSL Functions, Structs, and Constants
  const contents = {
    imports: [],
    builtinLookup: [],
  };
  generateBuiltinContents(contents, builtinConstants, "Constants");
  generateBuiltinContents(contents, builtinStructs, "Structs");
  generateBuiltinContents(contents, builtinFunctions, "Functions");

  const fileContents = `//This file is automatically rebuilt by the Cesium build process.\n${contents.imports.join(
    "\n"
  )}\n\nexport default {\n    ${contents.builtinLookup.join(",\n    ")}\n};\n`;

  fs.writeFileSync(
    path.join("Source", "Shaders", "Builtin", "CzmBuiltins.js"),
    fileContents
  );
}

function createCesiumJs() {
  let contents = `export const VERSION = '${version}';\n`;
  globby.sync(sourceFiles).forEach(function (file) {
    file = path.relative("Source", file);

    let moduleId = file;
    moduleId = filePathToModuleId(moduleId);

    let assignmentName = path.basename(file, path.extname(file));
    if (moduleId.indexOf("Shaders/") === 0) {
      assignmentName = `_shaders${assignmentName}`;
    }
    assignmentName = assignmentName.replace(/(\.|-)/g, "_");
    contents += `export { default as ${assignmentName} } from './${moduleId}.js';${os.EOL}`;
  });

  fs.writeFileSync("Source/Cesium.js", contents);
}

function filePathToModuleId(moduleId) {
  return moduleId.substring(0, moduleId.lastIndexOf(".")).replace(/\\/g, "/");
}

gulp.task("demo", async function () {
  mkdirp.sync("Build");
  rimraf.sync("./Build/Example");
  mkdirp.sync("./Build/Example");
  fs.copyFileSync('index.html', './Build/Example/index.html');
  readdirSync('Example/');
})

function readdirSync(pathString) {
  mkdirp.sync('./Build/' + pathString);
  const data = fs.readdirSync(pathString);
  const parentDirs = data.toString().split(',');
  for (let i = 0; i < parentDirs.length; i++) {
    const fileName = parentDirs[i];
    fs.stat(pathString + fileName, function (err, data) {
      if (err) {
        console.error(err);
        return;
      }

      if (data.isDirectory()) {
        readdirSync(pathString + "/" + fileName + "/")
      } else {
        const pattern = /.html/;
        if (!pattern.test(fileName)) {
          if (fileName !== 'main.js') {
            fs.copyFileSync('./' + pathString.toString() + "/" + fileName, './Build/' + pathString.toString() + "/" + fileName);
          }
        } else {
          let testHtml = fs.readFileSync(pathString + "/" + fileName, 'utf8')
          let string = "";
          const stringArray = (pathString.toString() + "/").trim().split('//')
          for (let i = 0; i < stringArray.length; i++) {
            if (stringArray[i]) {
              string += "../";
            }
          }
          testHtml = testHtml.replace(/\<\/title\>/, '</title>\n\
          <link rel="stylesheet" href="'+ string + 'VRGlobe/Widgets/widgets.css">\n\
          <script type="text/javascript" src="'+ string + 'VRGlobe/VRGlobe.js"></script>\n');
          testHtml = testHtml.replace(/window.onload = \(\) =\> {/, 'window.Space_BASEURL = "' + string + 'VRGlobe"\n\
          window.onload = () => {');
          fs.writeFileSync('./Build/' + pathString.toString() + "/" + fileName, testHtml, 'utf8');
        }
      }
    });
  }
}

gulp.task("api", async function () {
  mkdirp.sync("Build");
  rimraf.sync("./Build/Documentation");
  child_process.execSync(
    `npx jsdoc -c ./Tools/jsdoc/jsdocConfig.json`,
    {
      stdio: "inherit",
      env: Object.assign({}, process.env, { CESIUM_VERSION: version }),
    }
  );
  return;
});