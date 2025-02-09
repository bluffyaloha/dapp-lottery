const hre = require("hardhat");

async function main() {
    const MultiLottery = await ethers.getContractFactory("MultiLottery");
    const multiLottery = await MultiLottery.deploy();
    await multiLottery.waitForDeployment();
    console.log("Contract deployed to: ", await multiLottery.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });