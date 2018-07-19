/**
 * optional[ --full --arch=ia32|x64 --verbose --includeNodeModules --tag=yourBuildVersionString ]
 */
const innosetupCompiler = require('innosetup-compiler');
const path = require('path');
const assert = require('assert');
const pkg = require('../../package.json');
var minimist = require('minimist');
var debug = require('debug')("build-win-setup")
var repoPath =path.dirname(path.dirname(__dirname)) ;

if (!/^win/.test(process.platform)) {
    repoPath = repoPath.replace(/^\//, '\\'); //绝对目录在wine环境下执行 需要改成 \ ；否则目录会出错
}
const setupDir = (arch, sourceDir) => path.join(repoPath, sourceDir, `win32-${arch}`);
const buildPath = (arch, sourceDir) => path.join(repoPath, sourceDir, arch === 'ia32' ? `win-${arch}-unpacked` : 'win-unpacked');

const issPath ='build/setup/win32/its-setup.iss'// 这里需要用相对路径，否则innosetup-compiler 执行会找不到iss脚本； path.join(__dirname, 'win32', 'its-setup.iss');

var args = process.argv.slice(2);

var argsO = minimist(args);

debug("options: " + JSON.stringify(argsO));

const defaultOptions = {
    arch: 'x64',
    verbose: false,
    gui: false,
}


var _opts = {};
//x64/ia32
if (argsO.arch && argsO.arch == 'ia32'||argsO.ia32) {
    _opts.arch = 'ia32';
}

if (argsO.tag) { //构建的版本号（安装包文件名后缀）
    _opts.tag = argsO.tag;
}
//是否输出详细innosetup打包信息
if (argsO.verbose) {
    _opts.verbose = argsO.verbose;
}
//是否创建完整安装包
if (!argsO.full) {
    //更新包
    _opts.updateMode = true;
    //更新包是否包含node_modules文件夹
    if (argsO.includeNodeModules) {
        _opts.includeNodeModules = argsO.includeNodeModules
    }
}
var Options = Object.assign(defaultOptions, _opts);


function getAppInfo() {
    var options = Options;
    var arch = options.arch;
    var productName = pkg.name;
    const ia32AppId = '{{5606A6BA-7AB6-4E93-B011-C38C4AF5B909}';
    const x64AppId = '{{5606A6BA-7AB6-4E93-B011-C38C4AF5B919}';
    //innosetup 需要依赖electron-builder 相关配置
    var build = pkg.build
    if (build && build.productName) {
        productName == pkg.build.productName
    }
    var win32AppUserModelId = pkg.build.appId || 'com.speiyou.its-client';
    var sourceDir = 'dist';
    if (build.directories && build.directories.output) {
        sourceDir = build.directories.output;
    }
    var copyright = build.copyright ? build.copyright : ''
    var OutputBaseFilename = 'RTS-Setup';
    if (options.updateMode) { //更新包的文件名
        if (options.tag)
            OutputBaseFilename = `RTS-Update-${options.arch}-${pkg.version}-${options.tag}`;
        else
            OutputBaseFilename = `RTS-Update-${options.arch}-${pkg.version}`;
    } else { //全量安装包的文件名
        if (options.tag)
            OutputBaseFilename = `RTS-Setup-${options.arch}-${pkg.version}-${options.tag}`;
        else
            OutputBaseFilename = `RTS-Setup-${options.arch}-${pkg.version}`;
    }
    const definitions = {
        NameLong: productName,
        NameShort: productName,
        ExeBasename: productName,
        DirName: "RTS",
        Version: pkg.version,
        RawVersion: pkg.version.replace(/-\w+(\.\w+)?$/, ''),
        NameVersion: "RTS Client",
        RegValueName: "RTS",
        AppMutex: "rtsclient",
        Arch: arch,
        AppId: arch === 'ia32' ? ia32AppId : x64AppId,
        IncompatibleAppId: arch === 'ia32' ? x64AppId : ia32AppId,
        AppUserId: win32AppUserModelId,
        ArchitecturesAllowed: arch === 'ia32' ? '' : 'x64',
        ArchitecturesInstallIn64BitMode: arch === 'ia32' ? '' : 'x64',
        SourceDir: buildPath(arch, sourceDir),
        RepoDir: repoPath,
        OutputDir: setupDir(arch, sourceDir),
        OutputBaseFilename: OutputBaseFilename,
        AppCopyright: copyright
    };
    if (options.includeNodeModules) {
        definitions.IncludeNodeModule = true;
    }
    if (options.updateMode) {
        definitions.UpdateMode = true;
    }
    return definitions;
}

function packageInnoSetup(iss, options, cb) {
    options = options || {};

    const definitions = options.definitions || {};
    const keys = Object.keys(definitions);
    // keys.forEach(key => assert(typeof definitions[key] === 'string', `Missing value for '${key}' in Inno Setup package step`));
    // const oMap = (o, f) => Object.assign(...Object.keys(o).map(k => ({
    //     [k]: f(o[k])
    // })));
    var defs = {};
    var outputFilenameFullPath = path.join(definitions.OutputDir, definitions.OutputBaseFilename + '.exe').replace(/^\\/, '/');
    // iscc option format as "/Dparameter1"
    keys.forEach(k => {
        defs['D' + k] = definitions[k]
    })

    // const defs = keys.map(key => `/D${key}=${definitions[key]}`);
    var opts = Object.assign({
        verbose: argsO.verbose || false,
        gui: false
    }, defs)
    debug("innosetup-options:", opts)
    return innosetupCompiler(iss, opts, function (err, result) {
        if (err) return cb(err);
        return cb(null, {
            output: outputFilenameFullPath
        })
    })
}

function buildWin32Setup(cb) {
    var definitions = getAppInfo();
    packageInnoSetup(issPath, {
        definitions
    }, cb);
}
//run build task
buildWin32Setup((err, out) => {
    if (err) {
        console.error('Error! Compiler Aborted!')
        process.exit(1);

    } else {
        if (out) {
            console.log(`output=${out.output}`)
        }
        console.log('completed!')
        process.exit(0)
    }

})