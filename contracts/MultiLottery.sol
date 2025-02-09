// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

contract MultiLottery {

    uint public numTickets = 5;
    uint public ticketPrice = 10000000000000000; 
    uint public lotteryCount = 0;
    enum Status { Active, Finished }

    struct Lottery {
        uint id;
        address owner;
        address winner;
        address[] players;
        Status status;
        uint prizePool;
    }

    mapping(uint => Lottery) public lotteries;

    event PlayerEntered(uint256 lotteryId, address player);
    event WinnerPicked(uint256 lotteryId, address winner);
    event LotteryCreated(uint256 lotteryId, address owner);

    function create() public {
        lotteries[lotteryCount] = Lottery({
            id: lotteryCount,
            owner: msg.sender,
            winner: address(0),
            players: new address[](0),
            status: Status.Active,
            prizePool: 0
        });

        emit LotteryCreated(lotteryCount, msg.sender);
        lotteryCount++;
    }

    function enter(uint256 _lotteryId) public payable {
        require(_lotteryId < lotteryCount, "Lottery does not exist");
        require(msg.value == ticketPrice, "Inncorect price");

        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.status == Status.Active, "Lottery is closed");

        lottery.players.push(msg.sender);
        lottery.prizePool += msg.value;
        emit PlayerEntered(_lotteryId, msg.sender);


        if (lottery.players.length == numTickets) {
            pickWinner(_lotteryId);
        }
    }
    
    function getAllLotteries() public view returns (Lottery[] memory) {
        Lottery[] memory allLotteries = new Lottery[](lotteryCount);
        for (uint i = 0; i < lotteryCount; i++) {
            allLotteries[i] = lotteries[i];
        }
        return allLotteries;
    }


    function getRemainingTicketsLottery(uint256 _lotteryId) public view returns(uint x) {
      require(lotteries[_lotteryId].status == Status.Active, "Lottery is not active");
      return(numTickets - lotteries[_lotteryId].players.length);
    }

    function pickWinner(uint256 _lotteryId) public {
        Lottery storage lottery = lotteries[_lotteryId];


        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
        ) % lottery.players.length;

        lottery.winner = lottery.players[randomIndex];
        lottery.status = Status.Finished;

        (bool success, ) = lottery.winner.call{value: lottery.prizePool}("");
        require(success, "ETH transfer failed");

        emit WinnerPicked(_lotteryId, lottery.winner);
    }

    function getPlayersLottery(uint256 _lotteryId) public view returns (address[] memory) {
        require(_lotteryId < lotteryCount, "Lottery does not exist");
        return lotteries[_lotteryId].players;
    }
}