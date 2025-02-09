import { ethers } from "ethers";
import { abi } from "./abiMultiContract.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

export const getContract = async () => {
    let provider;
    try {
       if (window.ethereum == null) {
             provider = new ethers.BrowserProvider(null);
            if (!provider)
               throw new Error("MetaMask not installed");
              console.warn("MetaMask is not installed, using read-only connection");
        } else {
            provider = new ethers.BrowserProvider(window.ethereum);
        }

        const signer = await provider.getSigner();
         return new ethers.Contract(contractAddress, abi, signer);
    } catch (error) {
       console.error("Error initializing contract:", error);
       throw new Error(`Failed to connect to contract: ${error.message}`);
    }
};