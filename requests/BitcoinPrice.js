import { Aggregator, Request, Source, Tally, Types } from "witnet-requests"
const { FILTERS, REDUCERS } = Types

const coindesk = new Source("https://api.coindesk.com/v1/bpi/currentprice.json").asString()
  .parseJSON().asMap()
  .get("bpi").asMap()
  .get("USD").asMap()
  .get("rate_float").asFloat()

const blockchain = new Source("https://blockchain.info/ticker").asString()
  .parseJSON().asMap()
  .get("USD").asMap()
  .get("15m").asFloat()

const bitstamp = new Source("https://www.bitstamp.net/api/ticker/").asString()
  .parseJSON().asMap()
  .get("last").asFloat()

const aggregator = new Aggregator([coindesk, blockchain, bitstamp])
  .flatten()
  .filter(FILTERS.deviationStandard, 2)
  .reduce(REDUCERS.averageMean)

const tally = new Tally(aggregator)
  .flatten()
  .filter(FILTERS.deviationStandard, 1.5)
  .reduce(REDUCERS.averageMean)

const request = new Request()
  .addSource(coindesk)
  .addSource(blockchain)
  .addSource(bitstamp)
  .setAggregator(aggregator)
  .setTally(tally)
  .schedule(1669852800)

export { request as default }
