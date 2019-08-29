pragma solidity ^0.5.0;

import "witnet-ethereum-bridge/contracts/UsingWitnet.sol";
import "../requests/BitcoinPrice.sol";

contract PriceFeed is UsingWitnet {
  uint8 smoothing;
  int128 public bitcoinPrice;
  bool pending;
  uint256 lastRequestId;

  constructor (uint8 _smoothing) public {
    require(_smoothing > 0);
    smoothing = _smoothing;
    pending = false;
  }

  function requestUpdate(uint256 _witnetReward) public payable {
    require(!pending);
    require(msg.value >= _witnetReward);

    Request request = new BitcoinPriceRequest();
    lastRequestId = witnetPostRequest(request, _witnetReward);
  }

  function completeUpdate() public payable witnetRequestAccepted(lastRequestId) {
    require(pending);

    Witnet.Result memory result = witnetReadResult(lastRequestId);
    if (result.isOk()) {
      bitcoinPrice *= smoothing;
      bitcoinPrice += result.asInt128();
      bitcoinPrice /= smoothing;
    } else {
      pending = false;
    }
  }
}
