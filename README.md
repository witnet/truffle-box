# The Witnet Truffle Box

This [Truffle box] gives you a **Solidity project template** that comes
bundled with everything you need to start writing **Ethereum contracts
that can read information from the web and consume APIs** using the
[Witnet Decentralized Oracle Network][Witnet].

## Getting started

Getting started with the Witnet Truffle Box is a no-brainer:

0. Install Truffle if it is not installed yet. Assuming you have `node`
   in your system:
    ```console
    npm install -g truffle
    ```
1. Go to the folder where you want to create the Witnet-enabled project
   and run this magic one-liner:
    ```console
    truffle unbox witnet/truffle-box
    ```
2. Compile the project to check that everything is OK:
    ```console
    npm run compile
    ```

*(Other than NodeJS and Truffle itself, Python 2.x may be required for
the installation of some NodeJS dependencies.)*

## Create your Witnet requests in the `requests` folder

In order for your contracts to query APIs or any external data source
using the Witnet Decentralized Oracle Network, you are required to write
the requests in a very specific way.

Do not panic: **Witnet requests are written as plain JavaScript
modules**.

A comprehensive tutorial on how to write Witnet requests is available in
the [Witnet ecosystem documentation][requests-docs].

**Every `.js` file that you drop in the `request` folder will be quietly
compiled into a `.sol` contract** that contains the logic of the request
using the native bytecode serialization that Witnet nodes understand. In
other words, you do not need to worry about how Witnet works, everything
is handled by the compiler for you with `npm run compile`.

**The compiled contracts will end up in the `contracts/request`
folder**, from where you can easily import them into your own contracts.

The boilerplate created by this Truffle box already contains 3
ready-to-deploy sample requests that exemplify how they work:

- [BitcoinPrice.js] pulls the USD price of a bitcoin from 3 different
  price index APIs.
- [RandomNumber.js] retrieves random numbers from the
  [Australian National University Quantum Random Numbers Server][random].
- [Weather.js] queries the weather in Berlin from two different weather
  APIs.

## Put your Solidity contracts in the `contracts` folder

Any Solidity contract that you create in the `contracts` folder can
easily import the Witnet requests from the `requests` folder as soon as
those have been compiled with `npm run compile`.

A comprehensive tutorial on how to instantiate the requests inside your
Solidity contracts and send them to Witnet can be found in the
[Witnet ecosystem documentation][contracts-docs].

This boilerplate already contains 3 ready-to-deploy Solidity sample
contracts that exemplify how this is used:

- [PriceFeed.sol] uses [BitcoinPrice.js] to maintain an on-chain bitcoin
  price index that can be updated on demand.
- [QuantumDice.sol] uses [RandomNumber.js] to implement a simple dice
  game that uses the
  [Australian National University Quantum Random Numbers Server][random]
  as its source of randomness.
- [WeatherContest.sol] uses [Weather.js] to run a contest in which
  anyone can try to guess what the temperature in Berlin will be at a
  certain date.
  
## Compiling

This command will validate and compile your Witnet requests as well as
your own Solidity contracts:

```console
npm run compile
```

## What happens behind the curtain

Requests are automatically relayed between your contracts and Witnet
thanks to the [Witnet Bridge Interface][WBI] (WBI). The WBI is an
Ethereum contract that acts as a "job board" where all requests are
posted.

At any particular Ethereum block height, a different randomly selected
subset of Witnet "bridge nodes" is eligible for relaying recently posted
requests from the WBI into Witnet. If they can prove that those requests
were included in the Witnet blockchain, they receive part of the rewards
set by the requesters.

Conversely, as soon as the requests are processed by the Witnet
Decentralized Oracle Network and their results are confirmed, the bridge
nodes can earn another part of the rewards by relaying those results
back to the WBI along a cryptographic proof of their integrity.

[Truffle box]: https://www.trufflesuite.com/boxes
[Witnet]: https://witnet.io
[requests-docs]: https://witnet.github.io/documentation/try/my-first-data-request/
[contracts-docs]: https://witnet.github.io/documentation/try/use-from-ethereum/
[BitcoinPrice.js]: /witnet/truffle-box/blob/master/requests/BitcoinPrice.js
[RandomNumber.js]: /witnet/truffle-box/blob/master/requests/RandomNumber.js
[Weather.js]: /witnet/truffle-box/blob/master/requests/Weather.js
[PriceFeed.sol]: /witnet/truffle-box/blob/master/contracts/examples/PriceFeed.sol
[QuantumDice.sol]: /witnet/truffle-box/blob/master/contracts/examples/QuantumDice.sol
[WeatherContest.sol]: /witnet/truffle-box/blob/master/contracts/examples/WeatherContest.sol
[random]: http://qrng.anu.edu.au/
