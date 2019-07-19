import { Request, Source, Tally } from "rad.js"

const source = new Source("http://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8")
  .asString()
  .parseJSON()
  .asMap()
  .get("data")
  .asArray()
  .get(0)
  .asInteger()

const tally = new Tally(source)
  .flatten()
  .asBytes()
  .hash()
  .asInteger()
  .modulo(256)

const request = new Request()
  .addSource(source)
  .setTally(tally)
  .schedule(1669852800)

export { request as default }
