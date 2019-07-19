pragma solidity ^0.5.0;

import "witnet-ethereum-bridge/contracts/Request.sol";

// The bytecode of the RandomNumber request that will be sent to Witnet
contract RandomNumberRequest is Request {
  constructor () Request(hex"0a6d12531238687474703a2f2f71726e672e616e752e6564752e61752f4150492f6a736f6e492e7068703f6c656e6774683d3126747970653d75696e74381a1787187518451874821861646461746118708218550018731a030a018022110a0f851854185018751873821827190100280030003800") public { }
}
