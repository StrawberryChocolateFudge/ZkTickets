import MetaMaskOnboarding from "@metamask/onboarding";
import { ethers } from "ethers";
import { CryptoNote, toNoteHex } from "../../lib/crypto";

export const FANTOMTESTNETCONTRACTADDRESS = "0xEfE959bc25bAEceb16DbFc942B3508A900D0674A";

export const FANTOMTESTNETID = "0xfa2";
export const FANTOMTESTNETRPCURL = "https://xapi.testnet.fantom.network/lachesis";

export const formatEther = (bn: ethers.BigNumberish) => ethers.utils.formatEther(bn)

export function getJsonRpcProvider() {
    return new ethers.providers.JsonRpcProvider(FANTOMTESTNETRPCURL);
}

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


export async function onboardOrSwitchNetwork(handleError) {
    if (!web3Injected()) {
        handleError("You need to install metamask!");
        await doOnBoarding();
        return false;
    }
    await switchToFantomTestnet();
    return true;
}


export function getWeb3Provider() {
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //@ts-ignore
    window.ethereum.on('chainChanged', (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        window.location.reload();
    });
    return provider;
}

export async function switchToFantomTestnet() {
    const hexChainId = FANTOMTESTNETID;
    const chainName = "Fantom testnet";
    const rpcUrls = [FANTOMTESTNETRPCURL]
    const blockExplorerUrls = ["https://testnet.ftmscan.com/"]
    const switched = await switch_to_Chain(hexChainId);
    if (!switched) {
        await ethereumRequestAddChain(hexChainId, chainName, "FTM", "FTM", 18, rpcUrls, blockExplorerUrls)
    }
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

export async function getTicketedEventIndex(contract: any) {
    return await contract.ticketedEventIndex();
}

export async function getTicketedEvents(contract: any, ticketedEventIndex: string) {
    return await contract.ticketedEvents(ticketedEventIndex);
}

export async function purchaseTicket(contract: any, value: string, _ticketedEventIndex: string, commitment: string) {
    return await contract.purchaseTicket(_ticketedEventIndex, commitment, { value });
}

export async function handleTicket(contract: any, proof: any, _nullifierHash: string, _commitment: string) {
    return await contract.handleTicket(proof, _nullifierHash, _commitment);
}

export async function verifyTicket(contract: any, _commitment: string, _nullifierHash: string) {
    return await contract.verifyTicket(_commitment, _nullifierHash);
}

export async function NewTicketedEventCreated(receipt, contract) {
    const log = contract.interface.parseLog(receipt.logs[0]);
    const logName = log.name;

    if (logName !== "NewTicketedEventCreated") {
        return false;
    } else {
        return log.args[0];
    }
}

export async function getJsonProviderTicketedEvent(index: string, handleError: CallableFunction) {
    const provider = getJsonRpcProvider();
    const contract = await getContract(provider, FANTOMTESTNETCONTRACTADDRESS, "ZKTickets.json").catch(err => {
        handleError("Network error");
    })
    const ticketedEvent = await getTicketedEvents(contract, index).catch(err => {
        handleError("Unable to find the event!");
    })

    if (!ticketedEvent) {
        handleError("Unable to connect to wallet!")
    }
    return ticketedEvent;
}

export async function JSONRPCProviderVerifyTicket(index: string, note: CryptoNote, handleError: CallableFunction) {
    const provider = getJsonRpcProvider();
    const contract = await getContract(provider, FANTOMTESTNETCONTRACTADDRESS, "ZKTickets.json").catch(err => {
        handleError("Network error");
    })
    const ticketValid = await verifyTicket(contract, toNoteHex(note.commitment), toNoteHex(note.nullifierHash)).catch(err => {
        handleError("Network error")
    });
    return ticketValid;
}