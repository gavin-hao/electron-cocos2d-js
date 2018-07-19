'use strict'

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn, exec } = require('child_process')

process.env.PLATFORM = 'electron'
let electronProcess = null
let manualRestart = false
let cocosProcess = null;
function logStats(proc, data) {
  let log = ''

  log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
  log += '\n\n'

  if (typeof data === 'object') {
    data.toString({
      colors: true,
      chunks: false
    }).split(/\r?\n/).forEach(line => {
      log += '  ' + line + '\n'
    })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  console.log(log)
}

function startRenderer() {
  return new Promise((resolve, reject) => {
    cocosProcess = exec("cocos compile -p web -s ./app -o ./publish -m release",(error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject();
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      return resolve();
    });
    cocosProcess.stdout.on('data', data => {
      logStats('cocos', data)
    })
    cocosProcess.stderr.on('data', data => {
      logStats('cocos', data)
    })

    cocosProcess.on('close', () => {
      if (!manualRestart) process.exit()
    })
  })
}



function startElectron() {
  electronProcess = spawn(electron, ['--inspect=5858', path.join(__dirname, '../frame/main.js')])

  electronProcess.stdout.on('data', data => {
    electronLog(data, 'blue')
  })
  electronProcess.stderr.on('data', data => {
    electronLog(data, 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

function electronLog(data, color) {
  let log = ''
  data = data.toString().split(/\r?\n/)
  data.forEach(line => {
    log += `  ${line}\n`
  })
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    )
  }
}

function greeting() {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 104) text = 'electron-vue'
  else if (cols > 76) text = 'electron-|vue'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  electron-vue'))
  console.log(chalk.blue('  getting ready...') + '\n')
}

function init() {
  greeting()

  Promise.all([startRenderer()])
    .then(() => {
      startElectron()
    })
    .catch(err => {
      console.error(err)
    })
}

init()
