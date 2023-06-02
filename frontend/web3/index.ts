import MetaMaskOnboarding from "@metamask/onboarding";
import { BigNumber, ethers } from "ethers";
import { CryptoNote, toNoteHex } from "../../lib/crypto";

export const BTTTOKENCONTRACTADDRESS = "0xe48179BaB24c62E48eec1C73f8FB25CBb2B8E635";
export const BTTPROSTAKINGADDRESS = "0x26B7E178CE20bf43ce8fa3aB945B2B65088dC963";
export const BTTTESTNETZKTICKETSCONTRACTADDRESS = "0x3E6F7e33F99d76803365184a0a83B473A75e425d"; // Updated address
export const BTTTESTNETID = "0x405";
export const BTTTESTNETRPCURL = "https://pre-rpc.bt.io/";

export const BTTTESTNETEVENTWARNINGS = "0x44930bCdA63307ce111804D858fAE487b36A599a";

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

export function getStakingContractsFromSubdomain() {
    const host = window.location.host;
    const subdomain = host.split(".")[0];

    switch (subdomain) {
        case "btt":
            return [BTTPROSTAKINGADDRESS, BTTTOKENCONTRACTADDRESS];
        case "zktron":
            return [TRONZKEVMTESTNET.PROSTAKINGADDRESS, TRONZKEVMTESTNET.TOKENADDRESS]
        default:
            // Fallback to btt
            return [BTTPROSTAKINGADDRESS, BTTTOKENCONTRACTADDRESS]//[TRONZKEVMTESTNET.PROSTAKINGADDRESS, TRONZKEVMTESTNET.TOKENADDRESS];
    }
}

export function getEventWarningsFromSubdomain() {
    const host = window.location.host;
    const subdomain = host.split(".")[0];

    switch (subdomain) {
        case "btt":
            return BTTTESTNETEVENTWARNINGS;
        case "zktron":
            return TRONZKEVMTESTNET.EVENTWARNING
        default:
            return BTTTESTNETEVENTWARNINGS
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