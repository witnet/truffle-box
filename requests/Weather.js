import { Request, Script, Source, Types } from "witnet-requests"
const { FILTERS, REDUCERS, TYPES } = Types

const request = new Request()
  .addSource(
    new Source("https://openweathermap.org/data/2.5/weather?id=2950159&appid=b6907d289e10d714a6e88b30761fae22")
      .asString()
      .parseJSON()
      .asMap()
      .get("weather")
      .asMap()
      .get("temp")
      .asFloat()
  ).addSource(
    new Source("http://api.apixu.com/v1/current.json?key=297bc8f9aa7841d7a0e95208180310&q=Berlin")
      .asString()
      .parseJSON()
      .asMap()
      .get("current")
      .asMap()
      .get("temp_c")
      .asFloat()
  )
  .setAggregator(
    new Script([TYPES.ARRAY, TYPES.RESULT, TYPES.FLOAT])
      .flatten()
      .filter(FILTERS.greaterThan, -30)
      .filter(FILTERS.lessThan, 50)
      .filter(FILTERS.deviationAbsolute, 2)
      .reduce(REDUCERS.averageMean)
  )
  .setTally(
    new Script([TYPES.ARRAY, TYPES.RESULT, TYPES.FLOAT])
      .flatten()
      .filter(FILTERS.deviationAbsolute, 2)
      .reduce(REDUCERS.averageMean)
  )
  .schedule(1669852800)

export { request as default }
