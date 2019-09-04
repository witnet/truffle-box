pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "witnet-ethereum-bridge/contracts/UsingWitnet.sol";
import "./requests/Weather.sol";


contract WeatherContest is UsingWitnet {
  using SafeMath for uint256;

  address owner;
  uint256 weatherRequestId;
  uint256 grandPrice;
  mapping(int128 => Contestant[]) contestants;

  struct Contestant {
    address payable addr;
    uint256 amount;
  }

  constructor (address _wbi) UsingWitnet(_wbi) public {
    owner = msg.sender;
  }

  function initialize(uint256 _tallyFee) public payable {
    require(msg.sender == owner);
    require(weatherRequestId == 0);

    Request weatherRequest = new WeatherRequest();
    weatherRequestId = witnetPostRequest(weatherRequest, _tallyFee);
  }

  function participate(int8 temperature) public payable witnetRequestAccepted(weatherRequestId) before(1669852800) {
    contestants[temperature].push(Contestant(msg.sender, msg.value));
    grandPrice = grandPrice + msg.value;
  }

  function resolve() public {
    int128 actual_temperature = witnetReadResult(weatherRequestId).asInt128();

    Contestant[] memory winners = contestants[actual_temperature];

    uint256 total_from_winners = 0;
    for (uint i = 0; i < winners.length; i++) {
      total_from_winners = total_from_winners + winners[i].amount;
    }

    uint256 prize_share = grandPrice / total_from_winners;
    for (uint i = 0; i < winners.length; i++) {
      Contestant memory winner = winners[i];
      uint256 prize = winner.amount * prize_share;
      winner.addr.transfer(prize);
    }
  }

  modifier before(uint256 _timestamp) {
    require(block.timestamp < _timestamp, "The participation window is over");
    _;
  }
}
