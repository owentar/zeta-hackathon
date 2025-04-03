// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgeEstimation is Ownable {
    struct Estimation {
        uint256 age;
        address wallet;
        uint256 chainId;
        uint256 timestamp;
    }

    mapping(uint256 => Estimation) public estimations;
    uint256 public estimationCount;

    event AgeEstimated(
        uint256 indexed id,
        uint256 age,
        address indexed wallet,
        uint256 chainId,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function estimateAge(
        uint256 _age,
        address _wallet,
        uint256 _chainId
    ) external onlyOwner returns (uint256) {
        uint256 id = estimationCount++;
        estimations[id] = Estimation({
            age: _age,
            wallet: _wallet,
            chainId: _chainId,
            timestamp: block.timestamp
        });

        emit AgeEstimated(id, _age, _wallet, _chainId, block.timestamp);
        return id;
    }

    function getEstimation(uint256 _id) external view returns (Estimation memory) {
        return estimations[_id];
    }
} 