pragma solidity ^0.5.0;

import "witnet-ethereum-bridge/contracts/UsingWitnet.sol";
import "../requests/Weather.sol";


contract MyContract is UsingWitnet {
  using SafeMath for uint256;

  Request weather_dr;
  uint256 grand_prize;
  mapping(int128 => Contestant[]) contestants;

  struct Contestant {
    address payable addr;
    uint256 amount;
  }

  function participate(int8 temperature) public payable witnetRequestAccepted(weather_dr.id()) before(1669852800) {
    contestants[temperature].push(Contestant(msg.sender, msg.value));
    grand_prize = grand_prize + msg.value;
  }

  function resolve() public {
    int128 actual_temperature = witnetReadResult(weather_dr).asInt128();

    Contestant[] memory winners = contestants[actual_temperature];

    uint256 total_from_winners = 0;
    for (uint i = 0; i < winners.length; i++) {
      total_from_winners = total_from_winners + winners[i].amount;
    }

    uint256 prize_share = grand_prize / total_from_winners;
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
