import MetaMaskOnboarding from "@metamask/onboarding";
import { ethers } from "ethers";

export function web3Injected(): boolean {
    //@ts-ignore
    if (window.ethereum !== undefined) {
        return true;
    } else {
        return false;
    }
}

export function doOnBoarding() {
    const onboarding = new MetaMaskOnboarding();
    onboarding.startOnboarding();
}


export async function onboardOrSwitchNetwork(networkId, handleError) {
    if (!web3Injected()) {
        handleError("You need to install metamask!");
        await doOnBoarding();
        return false;
    }
    await switchToDonauTestnet();
    return true;
}

export async function switchToDonauTestnet() {
    const chainId = 1029;
    const hexchainId = "0x" + chainId.toString(16);
    const chainName = "BTT Donau testnet"
    const rpcUrls = ["https://pre-rpc.bt.io/"];
    const blockExplorerUrls = ["https://testscan.bt.io/"];
    const switched = await switch_to_Chain(hexchainId);
    if (!switched) {
        // If I cannot switch to it I try to add it!
        await ethereumRequestAddChain(hexchainId, chainName, "BTT", "BTT", 18, rpcUrls, blockExplorerUrls);
    }
}

async function switch_to_Chain(chainId: string) {
    try {
        let errorOccured = false;
        //@ts-ignore
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
        }).catch(err => {
            if (err.message !== "User rejected the request.")
                errorOccured = true;
        })
        if (errorOccured) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function ethereumRequestAddChain(
    hexchainId: string,
    chainName: string,
    name: string,
    symbol: string,
    decimals: number,
    rpcUrls: string[],
    blockExplorerUrls: string[]) {
    //@ts-ignore
    await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            {
                chainId: hexchainId,
                chainName,
                nativeCurrency: {
                    name,
                    symbol,
                    decimals,
                },
                rpcUrls,
                blockExplorerUrls,
            },
        ],
    });
}

export async function fetchAbi(at: string) {
    const res = await fetch(at);
    return res.json();
}

export async function getContract(provider: any, at: string, abiPath: string): Promise<any> {
    const artifact = await fetchAbi(abiPath);
    const signer = provider.getSigner();
    return new ethers.Contract(at, artifact.abi, signer);
}

export async function createNewTicketedEvent(contract: any, price: string, eventName: string, availableTickets: string) {
    return await contract.createNewTicketedEvent(ethers.utils.parseEther(price), eventName, availableTickets);
}

export async function purchaseTicket(contract: any, value: string, _ticketedEventIndex: number, commitment: string) {
    return await contract.purchaseTicket(_ticketedEventIndex, commitment, { value });
}

export async function handleTicket(contract: any, proof: any, _nullifierHash: string, _commitment: string) {
    return await contract.handleTicket(proof, _nullifierHash, _commitment);
}

export async function verifyTicket(contract: any, _commitment: string, _nullifierHash: string) {
    return await contract.verifyTicket(_commitment, _nullifierHash);
}