// Type names
const TYPES = {
  BOOLEAN: "Boolean",
  INTEGER: "Integer",
  FLOAT: "Float",
  STRING: "String",
  ARRAY: "Array",
  MAP: "Map",
  BYTES: "Bytes",
  RESULT: "Result",
}

// Pseudo-type names
const PSEUDOTYPES = {
  INNER: "Inner",
  ARGUMENT: "Argument",
  PASSTHROUGH: "Passthrough",
}

const REDUCERS = {
  min: 0x00,
  max: 0x01,
  mode: 0x02,
  averageMean: 0x03,
  averageMeanWeighted: 0x04,
  averageMedian: 0x05,
  averageMedianWeighted: 0x06,
  deviationStandard: 0x07,
  deviationAverage: 0x08,
  deviationMedian: 0x09,
  deviationMaximum: 0x0A,
}

const FILTERS = {
  greaterThan: 0x00,
  lessThan: 0x01,
  equals: 0x02,
  deviationAbsolute: 0x03,
  deviationRelative: 0x04,
  deviationStandard: 0x05,
  top: 0x06,
  bottom: 0x07,
  lessOrEqualThan: 0x80,
  greaterOrEqualThan: 0x81,
  notEquals: 0x82,
  notDeviationAbsolute: 0x83,
  notDeviationRelative: 0x84,
  notDeviationStandard: 0x85,
  notTop: 0x86,
  notBottom: 0x87,
}

const typeSystem = {
  [TYPES.BOOLEAN]: {
    match: [0x10, [PSEUDOTYPES.ARGUMENT]],
    negate: [0x11, [TYPES.BOOLEAN]],
    asString: [0x12, [TYPES.STRING]],
  },
  [TYPES.INTEGER]: {
    absolute: [0x20, [TYPES.INTEGER]],
    asBytes: [0x21, [TYPES.BYTES]],
    asFloat: [0x22, [TYPES.FLOAT]],
    asString: [0x23, [TYPES.STRING]],
    greaterThan: [0x24, [TYPES.BOOLEAN]],
    lessThan: [0x25, [TYPES.BOOLEAN]],
    match: [0x26, [PSEUDOTYPES.ARGUMENT]],
    modulo: [0x27, [TYPES.INTEGER]],
    multiply: [0x28, [TYPES.INTEGER]],
    negate: [0x29, [TYPES.INTEGER]],
    power: [0x2A, [TYPES.INTEGER]],
    reciprocal: [0x2B, [TYPES.FLOAT]],
    sum: [0x2C, [TYPES.INTEGER]],
  },
  [TYPES.FLOAT]: {
    absolute: [0x30, [TYPES.INTEGER]],
    asBytes: [0x31, [TYPES.BYTES]],
    asString: [0x32, [TYPES.STRING]],
    ceiling: [0x33, [TYPES.INTEGER]],
    graterThan: [0x34, [TYPES.BOOLEAN]],
    floor: [0x35, [TYPES.INTEGER]],
    lessThan: [0x36, [TYPES.BOOLEAN]],
    modulo: [0x37, [TYPES.FLOAT]],
    multiply: [0x38, [TYPES.FLOAT]],
    negate: [0x39, [TYPES.FLOAT]],
    power: [0x3A, [TYPES.FLOAT]],
    reciprocal: [0x3B, [TYPES.FLOAT]],
    round: [0x3C, [TYPES.INTEGER]],
    sum: [0x3D, [TYPES.FLOAT]],
    truncate: [0x3E, [TYPES.INTEGER]],
  },
  [TYPES.STRING]: {
    asBytes: [0x40, [TYPES.BYTES]],
    asFloat: [0x41, [TYPES.FLOAT]],
    asInteger: [0x42, [TYPES.INTEGER]],
    length: [0x43, [TYPES.INTEGER]],
    match: [0x44, [PSEUDOTYPES.ARGUMENT]],
    parseJSON: [0x45, [TYPES.BYTES]],
    parseXML: [0x46, [TYPES.MAP]],
    asBoolean: [0x47, [TYPES.BOOLEAN]],
    toLowerCase: [0x48, [TYPES.STRING]],
    toUpperCase: [0x49, [TYPES.STRING]],
  },
  [TYPES.ARRAY]: {
    asBytes: [0x50, [TYPES.BYTES]],
    count: [0x51, [TYPES.INTEGER]],
    every: [0x52, [TYPES.BOOLEAN]],
    filter: [0x53, [TYPES.ARRAY, PSEUDOTYPES.INNER]],
    flatten: [0x54, [TYPES.ARRAY, PSEUDOTYPES.PASSTHROUGH]],
    get: [0x55, [PSEUDOTYPES.INNER]],
    map: [0x56, [PSEUDOTYPES.ARGUMENT]],
    reduce: [0x57, [PSEUDOTYPES.INNER]],
    some: [0x58, [TYPES.BOOLEAN]],
    sort: [0x59, [TYPES.ARRAY, PSEUDOTYPES.INNER]],
    take: [0x5A, [TYPES.ARRAY, PSEUDOTYPES.INNER]],
  },
  [TYPES.MAP]: {
    entries: [0x60, [TYPES.ARRAY, TYPES.BYTES]],
    get: [0x61, [PSEUDOTYPES.INNER]],
    keys: [0x62, [TYPES.STRING]],
    values: [0x63, [PSEUDOTYPES.INNER]],
  },
  [TYPES.BYTES]: {
    asArray: [0x70, [TYPES.ARRAY, TYPES.BYTES]],
    asBoolean: [0x71, [TYPES.BOOLEAN]],
    asFloat: [0x72, [TYPES.FLOAT]],
    asInteger: [0x73, [TYPES.INTEGER]],
    asMap: [0x74, [TYPES.MAP, TYPES.BYTES]],
    asString: [0x75, [TYPES.STRING]],
    hash: [0x75, [TYPES.BYTES]],
  },
  [TYPES.RESULT]: {
    get: [0x80, [PSEUDOTYPES.INNER]],
    getOr: [0x81, [PSEUDOTYPES.INNER]],
    isOk: [0x82, [TYPES.BOOLEAN]],
  },
}

function typeFormat (type) {
  if (type.length > 1) {
    return `${type[0]}<${typeFormat(type.slice(1))}>`
  } else {
    return type[0]
  }
}

class Request {
  constructor () {
    this.data = {
      notBefore: Math.floor(Date.now() / 1000),
      retrieve: [],
      aggregate: {
        script: [],
      },
      tally: {
        script: [],
      },
    }
    this.lastTypes = {
      retrieve: [],
      aggregate: [],
      tally: [],
    }
  }
  addSource (source) {
    this.data.retrieve.push({
      url: source.url,
      script: source.script,
    })

    if (this.lastTypes.retrieve.length > 0) {
      const aTypeSig = typeFormat(this.lastTypes.retrieve)
      const bTypeSig = typeFormat(source.lastType)
      if (aTypeSig !== bTypeSig) {
        console.error(`Mismatching output types between different retrieve branches:\nA: ${aTypeSig}\nB: ${bTypeSig}`)
      }
    } else {
      this.lastTypes.retrieve = source.lastType
    }

    return this
  }
  setAggregator (aggregator) {
    this.data.aggregate.script = aggregator.script
    this.lastTypes.aggregate = aggregator.lastType
    return this
  }
  setTally (tally) {
    this.data.tally.script = tally.script
    this.lastTypes.tally = tally.lastType
    return this
  }
  schedule (timestamp) {
    this.data.notBefore = timestamp
    return this
  }
  deploy (witnesses, backup, commitFee, revealFee, tallyFee) {
    return {
      data_request: this.data,
      witnesses,
      backup,
      commit_fee: commitFee || 0,
      reveal_fee: revealFee || 0,
      tally_fee: tallyFee || 0,
    }
  }
}

class Script {
  constructor (firstType) {
    //console.log("New script:")
    this.script = []
    this.lastType = firstType

    this.proxy = new Proxy(this, {
      get (target, propKey) {
        return target[propKey] || target.apply(propKey)
      },
    })

    return this.proxy
  }

  apply (operator) {
    return (...args) => {
      let lastType = this.lastType
      const next = typeSystem[lastType[0]][operator]
      if (next !== undefined) {
        let [nextOpCode, nextType] = next
        let nextCall = args.length > 0 ? [nextOpCode, ...args] : nextOpCode

        this.script.push(nextCall)
        if (nextType[0] === PSEUDOTYPES.INNER) {
          // Unwrap the inner type
          nextType = [this.lastType[1]]
        } else if (nextType[0] === PSEUDOTYPES.ARGUMENT) {
          // Take the return type from the arguments
          let firstBranch = args[0][0][1]
          nextType = [{
            "number": TYPES.FLOAT,
            "string": TYPES.STRING,
            "boolean": TYPES.BOOLEAN,
            "undefined": undefined,
          }[typeof firstBranch] || TYPES.BYTES]
        } else if (nextType[1] === PSEUDOTYPES.PASSTHROUGH) {
          // Pop up the innermost type
          nextType = [this.lastType[0], this.lastType[2]]
        } else if (nextType[1] === PSEUDOTYPES.INNER) {
          // Pass down the inner type
          nextType[1] = this.lastType[1]
        }
        this.lastType = nextType
      } else {
        console.error(`Method ${typeFormat(lastType)}::${operator} is not implemented`)
      }

      //console.log(`  ${typeFormat(lastType)}::${operator}(${args.map((arg) => `${arg}`).join(", ")}) -> ${typeFormat(this.lastType)}`)
      return this.proxy
    }
  }
}

class Source extends Script {
  constructor (url) {
    super([TYPES.BYTES])
    this.url = url
  }
}

class Aggregator extends Script {
  constructor (sources) {
    super([TYPES.ARRAY, TYPES.RESULT, ...sources[0].lastType])
  }
}

class Tally extends Script {
  constructor (aggregate) {
    super([TYPES.ARRAY, TYPES.RESULT, ...aggregate.lastType])
  }
}

module.exports = {
  Script, Source, Aggregator, Tally, Request, TYPES, PSEUDOTYPES, REDUCERS, FILTERS,
}
