const fs = require("fs")
const vm = require("vm")
const babel = require("@babel/core")
const CBOR = require("cbor")
const protobuf = require("protocol-buffers")

const requestsDir = "./requests/"
const contractsDir = "./contracts/requests/"
const schemaDir = "./witnet/schema/"

const prototype = loadPrototype("witnet")

/*
 * HERE GOES THE MAIN BUSINESS LOGIC OF THE COMPILER SCRIPT.
 */

console.log(`
Compiling your Witnet requests...
=================================`)

const fileNames = fs.readdirSync(requestsDir)
  .filter(fileName => fileName.match(/.*\.js/))

const steps = [
  fileName => `${requestsDir}${fileName}`,
  path => { console.log(`> Compiling ${path}`); return path },
  readFile,
  compile,
  execute,
  pack,
  intoProtoBuf,
  buff => buff.toString("hex"),
  (hex, i) => intoSol(hex, fileNames[i]),
  (sol, i) => writeSol(sol, fileNames[i]),
]

Promise.all(steps.reduce(
  (prev, step) => prev.map((p, i) => p.then(v => step(v, i))),
  fileNames.map(fileName => Promise.resolve(fileName))))
  .then(succeed)
  .catch(fail)

/*
 * THESE ARE THE DIFFERENT STEPS THAT CAN BE USED IN THE COMPILER SCRIPT.
 */

function succeed (_) {
  console.log(`
> All requests compiled successfully
`)
}

function fail (error) {
  console.error(`
! WITNET REQUESTS COMPILATION ERRORS:
  - ${error.message}`)
  process.exitCode = 1
}

function readFile (path) {
  return fs.readFileSync(path, "utf8")
}

function loadPrototype (fileName) {
  return protobuf(readFile(`${schemaDir}${fileName}.proto`))
}

function compile (code) {
  const newCode = babel.transformSync(code,
    {
      "plugins": [
        ["@babel/plugin-transform-modules-commonjs", {
          "allowTopLevelThis": true,
        }],
      ],
    }).code
  return newCode
}

function execute (code) {
  const context = vm.createContext({
    module: {},
    exports: {},
    require: (mod) => require(`${__dirname}/${mod}`),
  })

  try {
    return vm.runInContext(code, context, __dirname).compile()
  } catch (e) {
    throw Error(`${e} (most likely your request is missing the \`export\` statement at the end or the exported \
object is not an instance of the \`Request\` class).`)
  }
}

function pack (dro) {
  const retrieve = dro.data_request.retrieve.map((branch) => {
    return { ...branch, script: CBOR.encode(branch.script) }
  })
  const aggregate = { ...dro.data_request.aggregate, script: CBOR.encode(dro.data_request.aggregate.script) }
  const consensus = { ...dro.data_request.tally, script: CBOR.encode(dro.data_request.tally.script) }

  return { ...dro, data_request: { ...dro.data_request, retrieve, aggregate, consensus } }
}

function intoProtoBuf (request) {
  const buf = prototype.DataRequestOutput.encode(request)
  return buf
}

function intoSol (hex, fileName) {
  const contractName = fileName.replace(/\.js/, "")

  return `pragma solidity ^0.5.0;

import "witnet-ethereum-bridge/contracts/Request.sol";

// The bytecode of the ${contractName} request that will be sent to Witnet
contract ${contractName}Request is Request {
  constructor () Request(hex"${hex}") public { }
}
`
}

function writeSol (sol, fileName) {
  const solFileName = fileName.replace(/\.js/, ".sol")
  return fs.writeFileSync(`${contractsDir}${solFileName}`, sol)
}
