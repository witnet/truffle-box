pragma solidity ^0.5.0;

import "witnet-ethereum-bridge/contracts/UsingWitnet.sol";
import "../requests/RandomNumber.sol";

contract QuantumDice is UsingWitnet {
  struct Roll {
    address payable player;
    uint64 number;
    uint256 amount;
  }
  mapping(uint256 => Roll) rolls;
  uint64 diceFaces;

  // Set the faces count for the dice
  constructor (uint64 _diceFaces) public {
    diceFaces = _diceFaces;
  }

  // Say a number, deposit some value and roll an asynchronous dice powered by a quantum random number generator
  function roll(uint8 _number, uint256 _witnetReward) public payable returns(uint256) {
    require(_number < diceFaces);
    require(msg.value >= _witnetReward);

    Request request = new RandomNumberRequest();
    uint256 rollId = witnetPostRequest(request, _witnetReward);
    rolls[rollId] = Roll(msg.sender, _number, msg.value);
    return rollId;
  }

  // If the number is the same as the quantum random number, you get the faces count of the dice times your deposit
  function claimPrize(uint256 _rollId) public {
    uint64 randomNumber = witnetReadResult(_rollId).asUint64();
    uint64 winningFace = randomNumber % diceFaces;
    Roll memory myRoll = rolls[_rollId];
    if (myRoll.number == winningFace) {
      uint256 prize = myRoll.amount * diceFaces;
      require(myRoll.player.send(prize));
    }
  }
}
