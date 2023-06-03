import MetaMaskOnboarding from "@metamask/onboarding";
import { BigNumber, ethers } from "ethers";
import { CryptoNote, toNoteHex } from "../../lib/crypto";

export const BTTTESTNETZKTICKETSCONTRACTADDRESS = "0x04ce7D262c474A2d55589dCE8DCe23A9678c35E3"; // Updated address
export const BTTTESTNETID = "0x405";
export const BTTTESTNETRPCURL = "https://pre-rpc.bt.io/";


export const TRONZKEVMTESTNET = {
    name: "TRON zkEVM Testnet",
    rpc: ["https://test-rpc-zkevm.bt.io/"],
    chainId: "0x31641",
    currency: "TRX",
    TOKENADDRESS: "0xe96Fb5737D3ae08EF6Ebdb63A866944781EDebe1",
    PROSTAKINGADDRESS: "0xF63B78bb8Cb7d9BB7E3287798685130f0d5bef58",
    ZKTICKETSCONTRACTADDRESS: "0xa578CEA7efd46D990040B67908A2C4213f186265",
    EVENTWARNING: "0x03CD0226c9f830d65edC0E2E83eFa36aE66d5C2B"

}

export const TransferType = {
    TRANSFER: 0,
    REFUND: 1,
    RESALE: 2
}

export function getTransferType(from: string) {
    switch (from) {
        case "Transfer":
            return TransferType.TRANSFER
        case "Refund":
            return TransferType.REFUND;
        case 'Resale':
            return TransferType.RESALE;
        default:
            return 0;
    }
}

export const TransferStatus = {
    INITIATED: 0,
    CANCELLED: 1,
    FINISHED: 2
}

export function getNetworkFromSubdomain() {
    // The application is deployed on different networks with a different subdomain
    // This function checks for the subdomain, evaluates what chain should be used and returns the network details
    // for localhost it falls back to a default network

    const host = window.location.host;
    const subdomain = host.split(".")[0];


    const bttRes = [BTTTESTNETZKTICKETSCONTRACTADDRESS, BTTTESTNETID, BTTTESTNETRPCURL];

    const zktron = [TRONZKEVMTESTNET.ZKTICKETSCONTRACTADDRESS, TRONZKEVMTESTNET.chainId, TRONZKEVMTESTNET.rpc[0]]

    switch (subdomain) {
        case "btt":
            return bttRes;
        case "zktron":
            return zktron;
        default:
            // Fall back on ZkTron for this branch of development
            return bttRes;
    }
}

export function getCurrencyFromNetId(netId) {
    switch (netId) {
        case BTTTESTNETID:
            return "BTT"
        case TRONZKEVMTESTNET.chainId:
            return "Tron";
        default:
            return "";
    }
}

export const ZEROADDRESS = "0x0000000000000000000000000000000000000000"

export const formatEther = (bn: ethers.BigNumberish) => ethers.utils.formatEther(bn)

export function getJsonRpcProvider() {
    const [contractAddress, networkID, rpcurl] = getNetworkFromSubdomain();
    return new ethers.providers.JsonRpcProvider(rpcurl);
}

export function web3Injected(): boolean {
    //@ts-ignore
    if (window.ethereum !== undefined) {
        return true;
    } else {
        return false;
    }
}

export async function requestAccounts() {
    //@ts-ignore
    await window.ethereum.request({ method: "eth_requestAccounts" });
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

    await requestAccounts();

    await handleNetworkSwitch();
    return true;
}

async function handleNetworkSwitch() {
    const [contractAddress, networkID, rpcurl] = getNetworkFromSubdomain();

    switch (networkID) {
        case BTTTESTNETID:
            await switchToDonauTestnet();
            break;
        case TRONZKEVMTESTNET.chainId:
            await switchToTronZKEVM();
            break;
        default:
            break;
    }
}


export function getWeb3Provider() {
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //@ts-ignore
    window.ethereum.on('chainChanged', (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        // window.location.reload();
    });
    return provider;
}

export async function switchToTronZKEVM() {
    const switched = await switch_to_Chain(TRONZKEVMTESTNET.chainId);
    if (!switched) {
        await ethereumRequestAddChain(
            TRONZKEVMTESTNET.chainId,
            TRONZKEVMTESTNET.name,
            TRONZKEVMTESTNET.currency,
            TRONZKEVMTESTNET.currency,
            18,
            TRONZKEVMTESTNET.rpc,
            []
        )
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

export async function createNewTicketedEvent(zktickets: any, price: string, eventName: string, availableTickets: string) {
    return await zktickets.createNewTicketedEvent(ethers.utils.parseEther(price), eventName, availableTickets);
}

export async function getTicketedEventIndex(zktickets: any) {
    return await zktickets.ticketedEventIndex();
}

export async function getTicketedEvents(zktickets: any, ticketedEventIndex: string) {
    return await zktickets.ticketedEvents(ticketedEventIndex);
}

export async function purchaseTicket(zktickets: any, value: string, _ticketedEventIndex: string, commitment: string) {
    return await zktickets.purchaseTicket(_ticketedEventIndex, commitment, { value });
}

export async function handleTicket(zktickets: any, proof: any, _nullifierHash: string, _commitment: string) {
    return await zktickets.invalidateTicket(proof, _nullifierHash, _commitment);
}

export async function verifyTicket(zktickets: any, _commitment: string, _nullifierHash: string) {
    return await zktickets.verifyTicket(_commitment, _nullifierHash);
}

export async function calculatePurchaseFee(zktickets: any, purchasePrice: string) {
    return await zktickets.calculatePurchaseFee(purchasePrice);
}

export async function calculateResaleFee(zktickets: any, resalePrice: BigNumber) {
    return await zktickets.calculateResaleFee(resalePrice);
}

export async function ticketCommitments(zktickets: any, _commitment: string) {
    return await zktickets.ticketCommitments(_commitment);
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

export async function getJsonRpcProviderTicketedEventIndex(handleError: CallableFunction) {
    const provider = getJsonRpcProvider();
    const [contractAddress, networkID, rpcurl] = getNetworkFromSubdomain();
    const contract = await getContract(provider, contractAddress, "ZKTickets.json").catch(err => {
        handleError("Network error");
    })
    const eventIndex = await getTicketedEventIndex(contract).catch(err => {
        handleError("Unable to get events!")
    })

    console.log(eventIndex);

    if (!eventIndex) {
        handleError("Unable to connect to network")
    }
    return eventIndex;
}

export async function getJsonProviderTicketedEvent(index: string, handleError: CallableFunction) {
    const provider = getJsonRpcProvider();
    const [contractAddress, networkID, rpcurl] = getNetworkFromSubdomain();
    const contract = await getContract(provider, contractAddress, "ZKTickets.json").catch(err => {
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
    const [contractAddress, networkID, rpcurl] = getNetworkFromSubdomain();
    const contract = await getContract(provider, contractAddress, "ZKTickets.json").catch(err => {
        handleError("Network error");
    })
    const ticketValid = await verifyTicket(contract, toNoteHex(note.commitment), toNoteHex(note.nullifierHash)).catch(err => {
        handleError("Network error")
    });
    return ticketValid;
}

export async function walletRPCProviderVerifyTicket(index: string, note: CryptoNote, handleError: CallableFunction) {
    const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();

    const switched = await onboardOrSwitchNetwork(handleError);
    if (switched) {
        const provider = getWeb3Provider();

        const contract = await getContract(provider, CONTRACTADDRESS, "ZKTickets.json").catch(err => {
            handleError("Network error")
        })

        const ticketValid = await verifyTicket(contract, toNoteHex(note.commitment), toNoteHex(note.nullifierHash)).catch(err => {
            handleError("Network error")
        });
        return ticketValid;
    }
}
