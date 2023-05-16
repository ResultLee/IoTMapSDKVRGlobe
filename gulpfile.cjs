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
      rimraf.sync("Build/combineOutput");
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
  createWorkers();
  return Promise.join(createWorkers());
});

gulp.task("build-ts", function () {
  createTypeScriptDefinitions();
  return Promise.resolve();
});

function combine() {
  const outputDirectory = path.join("Build", "CesiumUnminified");
  return combineJavaScript({
    removePragmas: false,
    minify: false,
    outputDirectory: outputDirectory,
  });
}

gulp.task("combine", gulp.series("build", combine));
gulp.task("default", gulp.series("combine"));

function combineRelease() {
  const outputDirectory = path.join("Build", "CesiumUnminified");
  return combineJavaScript({
    removePragmas: true,
    minify: false,
    outputDirectory: outputDirectory,
  });
}

gulp.task("combineRelease", gulp.series("build", combineRelease));

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

function createTypeScriptDefinitions() {
  // Run jsdoc with tsd-jsdoc to generate an initial Cesium.d.ts file.
  child_process.execSync("npx jsdoc --configure Tools/jsdoc/ts-conf.json", {
    stdio: "inherit",
  });

  let source = fs.readFileSync("Source/Cesium.d.ts").toString();

  // All of our enum assignments that alias to WebGLConstants, such as PixelDatatype.js
  // end up as enum strings instead of actually mapping values to WebGLConstants.
  // We fix this with a simple regex replace later on, but it means the
  // WebGLConstants constants enum needs to be defined in the file before it can
  // be used.  This block of code reads in the TS file, finds the WebGLConstants
  // declaration, and then writes the file back out (in memory to source) with
  // WebGLConstants being the first module.
  const node = typescript.createSourceFile(
    "Source/Cesium.d.ts",
    source,
    typescript.ScriptTarget.Latest
  );
  let firstNode;
  node.forEachChild((child) => {
    if (
      typescript.SyntaxKind[child.kind] === "EnumDeclaration" &&
      child.name.escapedText === "WebGLConstants"
    ) {
      firstNode = child;
    }
  });

  const printer = typescript.createPrinter({
    removeComments: false,
    newLine: typescript.NewLineKind.LineFeed,
  });

  let newSource = "";
  newSource += printer.printNode(
    typescript.EmitHint.Unspecified,
    firstNode,
    node
  );
  newSource += "\n\n";
  node.forEachChild((child) => {
    if (
      typescript.SyntaxKind[child.kind] !== "EnumDeclaration" ||
      child.name.escapedText !== "WebGLConstants"
    ) {
      newSource += printer.printNode(
        typescript.EmitHint.Unspecified,
        child,
        node
      );
      newSource += "\n\n";
    }
  });
  source = newSource;

  // The next step is to find the list of Cesium modules exported by the Cesium API
  // So that we can map these modules with a link back to their original source file.

  const regex = /^declare (function|class|namespace|enum) (.+)/gm;
  let matches;
  const publicModules = new Set();
  //eslint-disable-next-line no-cond-assign
  while ((matches = regex.exec(source))) {
    const moduleName = matches[2].match(/([^<\s|\(]+)/);
    publicModules.add(moduleName[1]);
  }

  // Math shows up as "Math" because of it's aliasing from CesiumMath and namespace collision with actual Math
  // It fails the above regex so just add it directly here.
  publicModules.add("Math");

  // Fix up the output to match what we need
  // declare => export since we are wrapping everything in a namespace
  // CesiumMath => Math (because no CesiumJS build step would be complete without special logic for the Math class)
  // Fix up the WebGLConstants aliasing we mentioned above by simply unquoting the strings.
  source = source
    .replace(/^declare /gm, "export ")
    .replace(/module "Math"/gm, "namespace Math")
    .replace(/CesiumMath/gm, "Math")
    .replace(/Number\[]/gm, "number[]") // Workaround https://github.com/englercj/tsd-jsdoc/issues/117
    .replace(/String\[]/gm, "string[]")
    .replace(/Boolean\[]/gm, "boolean[]")
    .replace(/Object\[]/gm, "object[]")
    .replace(/<Number>/gm, "<number>")
    .replace(/<String>/gm, "<string>")
    .replace(/<Boolean>/gm, "<boolean>")
    .replace(/<Object>/gm, "<object>")
    .replace(
      /= "WebGLConstants\.(.+)"/gm,
      // eslint-disable-next-line no-unused-vars
      (match, p1) => `= WebGLConstants.${p1}`
    )
    // Strip const enums which can cause errors - https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls
    .replace(/^(\s*)(export )?const enum (\S+) {(\s*)$/gm, "$1$2enum $3 {$4");

  // Wrap the source to actually be inside of a declared cesium module
  // and add any workaround and private utility types.
  source = `declare module "cesium" {
${source}
}

`;

  // Map individual modules back to their source file so that TS still works
  // when importing individual files instead of the entire cesium module.
  globby.sync(sourceFiles).forEach(function (file) {
    file = path.relative("Source", file);

    let moduleId = file;
    moduleId = filePathToModuleId(moduleId);

    const assignmentName = path.basename(file, path.extname(file));
    if (publicModules.has(assignmentName)) {
      publicModules.delete(assignmentName);
      source += `declare module "cesium/Source/${moduleId}" { import { ${assignmentName} } from 'cesium'; export default ${assignmentName}; }\n`;
    }
  });

  // Write the final source file back out
  fs.writeFileSync("Source/Cesium.d.ts", source);

  // Use tsc to compile it and make sure it is valid
  child_process.execSync("npx tsc -p Tools/jsdoc/tsconfig.json", {
    stdio: "inherit",
  });

  // Also compile our smokescreen to make sure interfaces work as expected.
  child_process.execSync("npx tsc -p Specs/TypeScript/tsconfig.json", {
    stdio: "inherit",
  });

  // Below is a sanity check to make sure we didn't leave anything out that
  // we don't already know about

  // Intentionally ignored nested items
  publicModules.delete("KmlFeatureData");
  publicModules.delete("MaterialAppearance");

  if (publicModules.size !== 0) {
    throw new Error(
      `Unexpected unexposed modules: ${Array.from(publicModules.values()).join(
        ", "
      )}`
    );
  }
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