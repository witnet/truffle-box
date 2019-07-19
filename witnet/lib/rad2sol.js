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
Compiling your Witnet data requests...
======================================`)

const contracts = fs.readdirSync(requestsDir)
  .filter(onlyJS)

const result = contracts
  .map((fileName) => `${requestsDir}${fileName}`)
  .map((path) => { console.log(`> Compiling ${path}`); return path })
  .map(readFile)
  .map(compile)
  .map(execute)
  .map(pack)
  .map(intoProtoBuf)
  .map((buf) => buf.toString("hex"))
  .map((hex, i) => intoSol(hex, contracts[i]))
  .map((sol, i) => writeSol(sol, contracts[i]))

if (result) {
  console.log(`
> Compiled successfully
`)
}

/*
 * THESE ARE THE DIFFERENT STEPS THAT CAN BE USED IN THE COMPILER SCRIPT.
 */

function onlyJS (fileName) {
  return fileName.match(/.*\.js/)
}

function readFile (path) {
  return fs.readFileSync(path, "utf8")
}

function loadPrototype (fileName) {
  return protobuf(readFile(`${schemaDir}${fileName}.proto`))
}

function tap (input) {
  console.log(input)
  return input
}

function jsonTap (input) {
  console.log(JSON.stringify(input))
  return input
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
  return vm.runInContext(code, context, __dirname).deploy()
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
