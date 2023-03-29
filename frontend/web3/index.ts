import MetaMaskOnboarding from "@metamask/onboarding";
import { ethers } from "ethers";
import { CryptoNote, toNoteHex } from "../../lib/crypto";

//TODO: Deprecate fantom testnet version!
export const FANTOMTESTNETCONTRACTADDRESS = "0x0680c8Fb31faC6029f01f5b75e55b2F3D4333fC2";

export const FANTOMTESTNETID = "0xfa2";
export const FANTOMTESTNETRPCURL = "https://xapi.testnet.fantom.network/lachesis";

export const BTTTOKENCONTRACTADDRESS = "0x305c9d8599d4e6d85ad0C1b4d2De294b6eFB82a2";
export const BTTPROSTAKINGADDRESS = "0xddD5455619eEe9A6AD5A8cbBD668Db15A4ab3710";
export const BTTTESTNETZKTICKETSCONTRACTADDRESS = "0x0e7EDA461a9d4129Fa70DCf08753708107dbced4"; // Updated address
export const BTTTESTNETID = "0x405";
export const BTTTESTNETRPCURL = "https://pre-rpc.bt.io/";

export const TransferType = {
    TRANSFER: 0,
    REFUND: 1,
    RESALE: 2
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

    const fantomRes = [FANTOMTESTNETCONTRACTADDRESS, FANTOMTESTNETID, FANTOMTESTNETRPCURL]

    const bttRes = [BTTTESTNETZKTICKETSCONTRACTADDRESS, BTTTESTNETID, BTTTESTNETRPCURL];

    switch (subdomain) {
        case "fantom":
            return fantomRes;
        case "btt":
            return bttRes;
        default:
            // Fall back on BTT for this branch of development
            return bttRes
    }
}

export function getCurrencyFromNetId(netId) {
    switch (netId) {
        case FANTOMTESTNETID:
            return "FTT"
        case BTTTESTNETID:
            return "BTT"
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
        case FANTOMTESTNETID:
            await switchToFantomTestnet();
            break;
        case BTTTESTNETID:
            await switchToDonauTestnet();
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

export async function createNewTicketedEvent(zktickets: any, price: string, eventName: string, availableTickets: string, externalHandler: string, allowSpeculation: boolean) {
    return await zktickets.createNewTicketedEvent(ethers.utils.parseEther(price), eventName, availableTickets, externalHandler, allowSpeculation);
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
    return await zktickets.handleTicket(proof, _nullifierHash, _commitment);
}

export async function verifyTicket(zktickets: any, _commitment: string, _nullifierHash: string) {
    return await zktickets.verifyTicket(_commitment, _nullifierHash);
}

export async function calculatePurchaseFee(zktickets: any, purchasePrice: string) {
    return await zktickets.calculatePurchaseFee(purchasePrice);
}

export async function calculateResaleFee(zktickets: any, resalePrice: string) {
    return await zktickets.calculateResaleFee(resalePrice);
}

export async function transferRequests(zktickets: any, eventIndex: string) {
    return await zktickets.transferRequests(eventIndex);
}
export async function speculativeSaleCounter(zktickets: any, eventIndex: string, address: string) {
    return await zktickets.speculativeSaleCounter(eventIndex, address);
}

export async function createTransferRequest(
    zktickets: any,
    _commitment: string,
    _nullifierHash: string,
    _proof: any,
    eventIndex: string,
    transferType: number,
    transferTo: string,
    transferPrice: string) {
    return await zktickets.createTransferRequest(
        _commitment,
        _nullifierHash,
        _proof,
        eventIndex,
        transferType,
        transferTo,
        transferPrice
    )
}

export async function cancelTransferRequest(
    zktickets: any,
    _commitment: string,
    _nullifierHash: string,
    _proof: any,
    eventIndex: string,
    transferRequestIndex: string
) {
    return await zktickets.cancelTransferRequest(
        _commitment,
        _nullifierHash,
        _proof,
        eventIndex,
        transferRequestIndex
    );
}

export async function acceptTransfer(
    zktickets: any,
    eventIndex: string,
    transferRequestIndex: string,
    _newCommitment: string
) {
    return await zktickets.acceptTransfer(
        eventIndex,
        transferRequestIndex,
        _newCommitment);
}

export async function acceptRefundRequest(
    zktickets: any,
    eventIndex: string,
    transferRequestIndex: string,
    value: string
) {
    return await zktickets.acceptRefundRequest(
        eventIndex,
        transferRequestIndex,
        { value }
    );
}

export async function acceptResaleRequest(
    zktickets: any,
    eventIndex: string,
    transferRequestIndex: string,
    newCommitment: string,
    value: string
) {
    return await zktickets.acceptResaleRequest(
        eventIndex,
        transferRequestIndex,
        newCommitment,
        { value }
    );
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


export async function balanceOf(ticketPro: any, address: string) {
    return await ticketPro.balanceOf(address);
}

export async function approveSpend(ticketPro: any, spender: string, amount: string) {
    return await ticketPro.approve(spender, amount);
}

export async function stake(proStaking: any, amount: string) {
    return await proStaking.stake(amount);
}

export async function unstake(proStaking: any, amount: string) {
    return await proStaking.unstake(amount);
}

export async function stakers(proStaking: any, address: string) {
    return await proStaking.stakers(address);
}

export async function totalStaked(proStaking: any) {
    return await proStaking.totalStaked();
}

export async function stakingBlocks(proStaking: any) {
    return await proStaking.stakingBlocks();
}

export async function stakeUnit(proStaking: any) {
    return await proStaking.stakeUnit();
}