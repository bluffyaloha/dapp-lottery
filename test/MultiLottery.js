const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiLottery", function () {
  let multiLottery;
  let ticketPrice = ethers.parseEther("0.01");
  let numTickets = 5;
  let winner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;



  beforeEach(async function () {
    const MultiLottery = await ethers.getContractFactory('MultiLottery');
    multiLottery = await MultiLottery.deploy();
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
});

it("Create lottery", async function() {

  await multiLottery.connect(addr1).create();
  const lotteryCount = await multiLottery.lotteryCount();

  expect(lotteryCount).to.equal(1);
  expect(await multiLottery.connect(addr1).create()).to.emit(multiLottery, "LotteryCreated").withArgs(lotteryCount, owner);
});

it("Enter lottery", async function() {
  await multiLottery.connect(addr1).create();
  await multiLottery.connect(addr1).enter(0, {value : ticketPrice});
  const players = await multiLottery.getPlayersLottery(0);

  const lotteries = await multiLottery.getAllLotteries();
  expect(players[0]).to.equal(addr1);
  expect(players.length).to.equal(1);
  expect(lotteries[0].prizePool).to.equal(ticketPrice);
});


it("Enter lottery - with error price", async function() {
  await multiLottery.connect(addr1).create();
  const amount = ethers.parseEther("0.0001");
  await expect(multiLottery.connect(addr1).enter(0, {value : amount})).to.be.revertedWith("Inncorect price");
}) 

it("Enter lottery - kind doesn't exist", async function() {
  await multiLottery.connect(addr1).create();
  await expect(multiLottery.connect(addr1).enter(1, {value : ticketPrice})).to.be.revertedWith("Lottery does not exist");
})

it("Enter lottery - kind finished", async function() {
  await multiLottery.connect(addr1).create();
  
  for ( let i = 0; i < numTickets; i++ ) {
    await multiLottery.connect(addr1).enter(0, {value : ticketPrice});
  }
  await expect(multiLottery.connect(addr1).enter(0, {value : ticketPrice})).to.be.revertedWith("Lottery is closed");
})

it("Finished lottery", async function() {
  await multiLottery.connect(addr1).create();
  for (let i = 0; i < numTickets; i++) {
    await multiLottery.connect(addr1).enter(0, {value : ticketPrice});
  }

  let lotteries = await multiLottery.getAllLotteries();

  expect(lotteries[0].status).to.equal(1);
});

it("Pick winner", async function() {
  await multiLottery.connect(addr1).create();
  for (let i = 0; i < numTickets; i++) {
    await multiLottery.connect(addr1).enter(0, {value : ticketPrice});
  }

  let lotteries = await multiLottery.getAllLotteries();
  let winner = lotteries[0].winner;
  let addr1_address = await addr1.getAddress();

  expect(winner).to.eql(addr1_address);
})

it("Get players lottery", async function() {
  await multiLottery.connect(addr1).create();
  await multiLottery.connect(addr1).enter(0, {value : ticketPrice});
  await multiLottery.connect(addr2).enter(0, {value : ticketPrice});

  const players = await multiLottery.getPlayersLottery(0);
  let addr1_address = await addr1.getAddress();
  let addr2_address = await addr2.getAddress();
  let ew = [addr1_address, addr2_address];

  expect(players).to.eql(ew);
})

it("Get players lottery kind does not exist", async function() {
  await expect(multiLottery.getPlayersLottery(2)).to.be.revertedWith("Lottery does not exist");
})

it("Get remaining tickets lottery", async function() {
  await multiLottery.connect(addr1).create();
  await multiLottery.connect(addr1).enter(0, {value : ticketPrice});

  expect( await multiLottery.connect(addr1).getRemainingTicketsLottery(0)).to.equal(4);
});

it("Get remaining tickets lottery but lottery is finished", async function() {
  await multiLottery.connect(addr1).create();
  for (let i = 0 ; i < numTickets; i++) {
    await multiLottery.connect(addr1).enter(0, {value : ticketPrice});
  }

  await expect(multiLottery.getRemainingTicketsLottery(0)).to.be.revertedWith("Lottery is not active");
});

});
