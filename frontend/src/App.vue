<template>
  <b-container class="py-4">
 
    <b-row md="6" class="mb-4">
      <b-col>
        <b-card
          header="Добро пожаловать"
          bg-variant="primary"
          text-variant="white"
          class="text-center"
        >
          <h2>Лотерея на Ethereum</h2>
          <p>Испытай свою удачу!</p>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="d-flex">
      <b-col md="6" class="mb-4">
        <b-card title="Подключите кошелёк для начала работы" class="text-center h-100">
          <br>
          <b-button variant="success" @click="connect">Подключить кошелёк</b-button>
        </b-card>
      </b-col>
      <b-col md="6" class="mb-4 ">
        <b-card title="Информация аккаунта" class="h-100">
          <p>
            <strong>Подключённый аккаунт:</strong>
            <span v-if="account">{{ account }}</span>
            <span v-else>Не подключен</span>
          </p>
          <p>
            <strong>Баланс:</strong> {{ balanceAccount }} ETH
          </p>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-card>
          <b-card-text>
              Создайте новую лотерию 
            </b-card-text>
          <b-button variant="success" @click="createLottery"> createLottery</b-button>
        </b-card>
      </b-col>
    </b-row>


    <b-row>
      <b-col>
        <h2>Активные лотереи</h2>
        <b-row>
          <b-col v-for="lottery in activeLotteries" :key="lottery.id" cols="12" md="4" lg="3" class="mb-4">
            <b-card
              img-src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8Jr6OxEPc_2L9j9ulmOcguxUobIl79Iu81Q&s"
              img-alt="Лотерея"
              img-top
              class="h-100"
              v-if="lottery.status == 0"
            >
              <b-card-text>
                <strong>Лотерея № {{  lottery.id }} </strong> <br/>
                <strong>Призовой фонд:</strong> {{ ethers.formatEther(lottery.prizePool) }} ETH<br/>
                <strong v-if="lottery.status == 0">Статус: Active</strong>
                <strong v-else>Статус: Finished</strong>
                <br/>
                <strong>Цена билета:</strong> {{ethers.formatEther(ticketPrice)}} ETH <br/>
                <strong>Участников:</strong> {{ lottery.players.length }} / {{ numTickets }}<br/>
              </b-card-text>
              <b-button variant="warning" class="m-1" @click="enterLottery(lottery.id)">Войти в лотерею</b-button>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <h2>Завершенные лотереи</h2>
        <b-row>
          <b-col v-for="lottery in finishedLotteries" :key="lottery.id" cols="12" md="4" lg="3" class="mb-4">
            <b-card
              img-src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8Jr6OxEPc_2L9j9ulmOcguxUobIl79Iu81Q&s"
              img-alt="Лотерея"
              img-top
              class="h-100"
              v-if="lottery.status == 1"
            >
              <b-card-text>
                <strong>Призовой фонд:</strong> {{ ethers.formatEther(lottery.prizePool) }} ETH<br/>
                <strong v-if="lottery.status == 0">Статус: Active</strong>
                <strong v-else>Статус: Finished</strong>
                <br/>
                <strong>Победитель:</strong> {{ lottery.winner }}<br/>
                <strong>Участников:</strong> {{ lottery.players.length }} / {{ numTickets }}<br/>
              </b-card-text>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { onMounted, ref, computed  } from "vue";
import { ethers } from "ethers";
import { abi } from "./contracts/abiMultiContract.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

const account = ref(null);
const balanceAccount = ref(0);
const lotteryId = ref(0);
const ethValue = ref("0.1");
const lotteryInfo = ref("");
const lotteries = ref();
const contract = ref(null);
const dataContract = ref();
const numTickets = ref();
const ticketPrice = ref(0n);


const getContract = async (signer) => {
  try {
    return new ethers.Contract(contractAddress, abi, signer);
  } catch (error) {
    console.error("Error initializing contract:", error);
    throw new Error(`Failed to connect to contract: ${error.message}`);
  }
};

const getDataContract = async () => {
  try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const dataContractRead = new ethers.Contract(contractAddress, abi, provider);
        return dataContractRead;
    } catch (error) {
        console.error("Error initializing read-only contract:", error);
        return null;
    }
}


const connect = async () => {
   try {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            contract.value = await getContract(signer);
            account.value = await signer.getAddress();
            balanceAccount.value = ethers.formatEther(await provider.getBalance(account.value));
          //  subscribeToEvents();
        } else {
            alert("MetaMask is not installed");
        }
    } catch (error) {
        console.error("Error connecting to wallet", error);
        alert("Failed to connect to wallet");
    }
};


const createLottery = async () => {
  if (!contract.value) {
    alert("Контракт не подключен");
    return;
  }
  try {
    const tx = await contract.value.create();
    await tx.wait();
    getLotteries();
    alert("Лотерея создана!");

  } catch (error) {
    console.error("Ошибка создания лотереи:", error);
    alert("Ошибка создания лотереи");
  }
};

const enterLottery = async (index) => {
  if (!contract.value) {
    alert("Контракт не подключен");
    return;
  }
  try {
      const tx = await contract.value.enter(index, {value:ticketPrice.value, gaslimit: 2500000000});
      await tx.wait();
      await getLotteries();
  } catch (error) {
    console.error("Ошибка входа в лотерею:", error);
    alert("Ошибка входа в лотерею");
  }
};


const pickWinner = async (index) => {
  if (!contract.value) {
    alert("Контракт не подключен");
    return;
  }
  try {
    const tx = await contract.value.pickWinner(index);
    await tx.wait();
    alert("Победитель выбран!");
    await getLotteries();
  } catch (error) {
    console.error("Ошибка выбора победителя:", error);
    alert("Ошибка выбора победителя");
  }
};

const getLotteries = async () => {
    if (!dataContract.value) {
        console.warn("Contract not initialized yet");
        return;
    }
    try {
        const allLotteries = await dataContract.value.getAllLotteries();
        console.log("Lotteries all :", allLotteries);
        lotteries.value = allLotteries;
    } catch (error) {
        console.error("Error getting all lotteries:", error);
        alert("Error getting all lotteries:");
    }
};

const activeLotteries = computed(() => {
  if (lotteries.value) {
    return lotteries.value.filter(lottery => lottery.status == 0);
  } else {
    return [];
  }
});

const finishedLotteries = computed(() => {
  if (lotteries.value) {
    return lotteries.value.filter(lottery => lottery.status == 1);
  } else {
    return [];
  }
});

const getNumTickets = async () => {
  if (!dataContract.value) {
    alert("Contract not initialized");
    return;
  }
  try {
    numTickets.value = await dataContract.value.numTickets();
  } catch (error) {
    console.error("Error getting num tickets");
  }
}

const getTicketPrice = async () => {
  if (!dataContract.value) {
    console.warm("Contract not initialized");
    return;
  }
  try {
    ticketPrice.value = await dataContract.value.ticketPrice();


  } catch (error) {
    console.error("Error getting ticket price");
  }
}


onMounted(async () => {
  console.log("MultiLottery Mounted");
  dataContract.value = await getDataContract();
  console.log("dataContract.value:", dataContract.value); // Добавлено
  await getLotteries();
  await getTicketPrice();
  await getNumTickets();
});
</script>

<style>

.multi-lottery {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
}

input {
  padding: 5px;
  margin-left: 10px;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
}

.d-flex {
  display: flex;
}
</style>