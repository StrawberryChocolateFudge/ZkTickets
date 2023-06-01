import MetaMaskOnboarding from "@metamask/onboarding";
import { BigNumber, ethers } from "ethers";
import { CryptoNote, toNoteHex } from "../../lib/crypto";

export const BTTTOKENCONTRACTADDRESS = "0x305c9d8599d4e6d85ad0C1b4d2De294b6eFB82a2";
export const BTTPROSTAKINGADDRESS = "0xddD5455619eEe9A6AD5A8cbBD668Db15A4ab3710";
export const BTTTESTNETZKTICKETSCONTRACTADDRESS = "0xA186deff34278c32d2176f6b90e1B2A3FBD824f9"; // Updated address
export const BTTTESTNETID = "0x405";
export const BTTTESTNETRPCURL = "https://pre-rpc.bt.io/";

export const BTTTESTNETEVENTWARNINGS = "0xA48bbf691169767F535490663aD8a5583367f701";

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

    switch (subdomain) {
        case "btt":
            return bttRes;
        default:
            // Fall back on BTT for this branch of development
            return bttRes
    }
}

export function getStakingContractsFromSubdomain() {
    const host = window.location.host;
    const subdomain = host.split(".")[0];

    switch (subdomain) {
        case "fantom":
            // TODO: fantom will be deprecated
            return ["", ""];
        case "btt":
            return [BTTPROSTAKINGADDRESS, BTTTOKENCONTRACTADDRESS];
        default:
            // Fallback to btt
            return [BTTPROSTAKINGADDRESS, BTTTOKENCONTRACTADDRESS];
    }
}

export function getEventWarningsFromSubdomain() {
    const host = window.location.host;
    const subdomain = host.split(".")[0];

    switch (subdomain) {
        case "fantom":
            // /?TODO:fantom will be deprecated
            return ""
        case "btt":
            return BTTTESTNETEVENTWARNINGS;
        default:
            return BTTTESTNETEVENTWARNINGS;
    }
}

export function getCurrencyFromNetId(netId) {
    switch (netId) {
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

export async function calculateResaleFee(zktickets: any, resalePrice: BigNumber) {
    return await zktickets.calculateResaleFee(resalePrice);
}

export async function getTransferRequestsByEventIndex(zktickets: any, eventIndex: string) {
    return await zktickets.getTransferRequestsByEventIndex(eventIndex);
}
export async function speculativeSaleCounter(zktickets: any, eventIndex: string, address: string) {
    return await zktickets.speculativeSaleCounter(eventIndex, address);
}
export async function ticketCommitments(zktickets: any, _commitment: string) {
    return await zktickets.ticketCommitments(_commitment);
}

export async function getRequestsByMe(zktickets: any, eventIndex: string, myAddress: string) {
    return await zktickets.getRequestsByMe(eventIndex, myAddress);
}

export async function getRequestsToMe(zktickets: any, eventIndex: string, myAddress: string) {
    return await zktickets.getRequestsToMe(eventIndex, myAddress);
}

export async function getTransferRequestsForPagination(zktickets: any, eventIndex: string, indexes: Array<number>) {
    return await zktickets.getTransferRequestsForPagination(eventIndex, indexes);
}

async function prepareAndFetchRequests(zktickets: any, eventIndex: string, indexes: Array<number>) {
    if (indexes.length === 0) {
        return [];
    }
    // So the paging function expects 5 indexes and will return me 5 indexes 
    // however many times I don't have 5 so I pad it and keep track of the padding
    let addedPadding = 0;
    let indexesToFetch: Array<number> = [];
    for (let i = 0; i < 5; i++) {
        if (indexes.length < i + 1) {
            addedPadding++;
            indexesToFetch.push(0);
        } else {
            indexesToFetch.push(indexes[i]);
        }
    }
    const requests = await getTransferRequestsForPagination(zktickets, eventIndex, indexesToFetch);
    let returnedRequests: Array<any> = [];
    //Now I remove the padded values from the list
    for (let i = 0; i < requests.length - addedPadding; i++) {
        returnedRequests.push(requests[i]);
    }
    return returnedRequests;
}


export async function requestFetcher(zktickets: any, eventindex: string, indexes: Array<number>) {
    // I need to separate all the indexes an create chunks of 5 and single requests
    // And these will be fed to the prepareAndFetchRequests 

    // So I want to create a list of arrays with the requests in them
    let fiveIndexArrayList: Array<Array<number>> = []
    let arrayBuilder: Array<number> = [];

    for (let i = 0; i < indexes.length; i++) {
        // I push the index into the array builder
        arrayBuilder.push(indexes[i]);

        // then if the indexes are over or arraybuilder length is 5 I push it into fixeIndexArrayList
        // and empty the array builder
        if (arrayBuilder.length === 5 || i + 1 === indexes.length) {
            fiveIndexArrayList.push(arrayBuilder);
            arrayBuilder = [];
        }
    }
    let requests: Array<any> = [];

    // Now I can loop over the fiveIndexArrayList to prepare and fetch requests!
    for (let i = 0; i < fiveIndexArrayList.length; i++) {
        let sortedIndexes = fiveIndexArrayList[i];
        const returnedRequests = await prepareAndFetchRequests(zktickets, eventindex, sortedIndexes);
        requests = requests.concat(returnedRequests);
    }
    return requests;
}

export async function createTransferRequest(
    zktickets: any,
    _commitment: string,
    _nullifierHash: string,
    _proof: any,
    eventIndex: string,
    transferType: number,
    transferTo: string,
    transferPrice: BigNumber) {
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
    value: BigNumber
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
    value: BigNumber
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

export async function approveSpend(ticketPro: any, spender: string, amount: BigNumber) {
    return await ticketPro.approve(spender, amount);
}

export async function stake(proStaking: any, amount: BigNumber) {
    return await proStaking.stake(amount);
}

export async function unstake(proStaking: any, amount: BigNumber) {
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

// Some helper functions to filter transaction requests

export function hashData(data: string) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
}

export function requestHashIdentifier(
    contractAddress: string,
    userAddress: string,
    eventIndex: string,
    requestIndex: string) {
    const data = `${contractAddress}${userAddress}${eventIndex}${requestIndex}`;
    return hashData(data);
}

// Event warnings functions

export enum WarningLevel {
    NONE = 0,
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3
}

export async function createWarning(eventWarnings: any, level: WarningLevel, message: string, about: string) {
    return await eventWarnings.createWarning(level, message, about);
}

export async function editWarning(eventWarnings: any, level: WarningLevel, message: string, about: string, arrayIndex: number) {
    return await eventWarnings.editWarning(level, message, about, arrayIndex);
}

export async function getWarnings(eventWarnings: any, about: string) {
    return await eventWarnings.getWarnings(about);
}

export async function getWarningCount(eventWarnings: any, about: string) {
    return await eventWarnings.warningCount(about);
}