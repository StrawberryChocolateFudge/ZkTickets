import { debug } from "console";
import { BigNumber } from "ethers";
import { isAddress, parseEther } from "ethers/lib/utils";
import QrScanner from "qr-scanner";
import { parseNote, toNoteHex } from "../lib/crypto";
import { createQRCodeScanner, startScanning, stopScanning } from "./camera";
import { downloadPDF } from "./pdf";
import { createQR } from "./qrcode";
import { appendOptionsElementsTo, bigNumberIndexesToNumber, createOpenRequestsTR, createOptionElements, createRequestsByMeTR, createRequestsToMeTR, getCurrentPageRequestIndexes, getEventIndex, getPageRequestIndexesToFetch, getTotalPages, handleError, renderRequestRows, setPageRequestIndexesToNotFetch, showOrHideIfPossible, triggerOverlay } from "./utils";
import { acceptRefundRequest, acceptResaleRequest, acceptTransfer, approveSpend, balanceOf, calculateResaleFee, cancelTransferRequest, createTransferRequest, formatEther, getContract, getCurrencyFromNetId, getNetworkFromSubdomain, getRequestsByMe, getRequestsToMe, getStakingContractsFromSubdomain, getTicketedEvents, getTransferRequestsByEventIndex, getTransferType, getWeb3Provider, onboardOrSwitchNetwork, requestAccounts, requestFetcher, speculativeSaleCounter, stake, stakers, stakeUnit, stakingBlocks, ticketCommitments, totalStaked, TransferType, unstake, walletRPCProviderVerifyTicket, ZEROADDRESS } from "./web3";
import { generateProof, getNote } from "./web3/zkp";

const welcomeMessage = document.getElementById("welcomeMessage") as HTMLDivElement;
const manageUiContainer = document.getElementById("manageUiContainer") as HTMLDivElement;
const stakeBalance = document.getElementById("stakeBalance") as HTMLElement;

const stakingDataOutterContainer = document.getElementById("stakingDataOutterContainer") as HTMLElement;
const transferRequestsOutterContainer = document.getElementById("transferRequestsOutterContainer") as HTMLElement;
const showTransferRequestsOutterContainer = document.getElementById("showTransferRequestsOutterContainer") as HTMLElement;

const goToViewRequests = document.getElementById("goToViewRequests") as HTMLButtonElement;
const goToCreateRequests = document.getElementById("goToCreateRequests") as HTMLButtonElement;
const goToStaking = document.getElementById("goToStaking") as HTMLButtonElement;
const goToShowRequestFromStaking = document.getElementById("goToShowRequestFromStaking") as HTMLButtonElement;


const tokenBalanceEl = document.getElementById("tokenBalance") as HTMLElement;

const blocksLeftTr = document.getElementById("blocksLeftTr") as HTMLElement;
const blocksLeft = document.getElementById("blocksLeft") as HTMLElement;

const amountToStake = document.getElementById("amountToStake") as HTMLElement;
const increaseStakeAmount = document.getElementById("increaseStakeAmount") as HTMLButtonElement;
const decreaseStakeAmount = document.getElementById("decreaseStakeAmount") as HTMLButtonElement;
const stakeButton = document.getElementById("stakeButton") as HTMLButtonElement;
const unstakeButton = document.getElementById("unstakeButton") as HTMLButtonElement;

const customPriceResalesLeft = document.getElementById("customPriceResalesLeft") as HTMLDivElement;
const customPriceResalesCreated = document.getElementById("customPriceResalesCreated") as HTMLElement;

const ticketCodeInput = document.getElementById("ticketCodeInput") as HTMLInputElement;
const scanTicketButton = document.getElementById("scanTicketButton") as HTMLButtonElement;
const stopScanningButton = document.getElementById("stopScanningButton") as HTMLButtonElement;

const cancelRequestTicketCodeInput = document.getElementById("cancelRequestTicketCodeInput") as HTMLInputElement;
const cancelRequestScanTicketButton = document.getElementById("cancelRequestScanTicketButton") as HTMLButtonElement;


const selectTransferType = document.getElementById("selectTransferType") as HTMLButtonElement;

const priceInfoContainer = document.getElementById("priceInfoContainer") as HTMLInputElement;

const resalepriceInput = document.getElementById("resalepriceInput") as HTMLInputElement;

const transferTo = document.getElementById("transferTo") as HTMLInputElement;

const createRequests = document.getElementById("createRequests") as HTMLButtonElement;

const fetchMyRequests = document.getElementById("fetchMyRequests") as HTMLButtonElement;
const fetchToMeRequests = document.getElementById("fetchToMeRequests") as HTMLButtonElement;
const fetchOpenResaleRequests = document.getElementById("fetchOpenResaleRequests") as HTMLButtonElement;


const myRequestsTableBody = document.getElementById("myRequestsTableBody") as HTMLElement;
const requestsToMeTableBody = document.getElementById("requestsToMeTableBody") as HTMLElement;
const openResaleRequestsTableBody = document.getElementById("openResaleRequestsTableBody") as HTMLElement;

const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();
const currency = getCurrencyFromNetId(NETID);
const [STAKINGCONTRACT, TOKENCONTRACT] = getStakingContractsFromSubdomain();


const index = getEventIndex();

(
    async () => {
        //@ts-ignore
        await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
        //@ts-ignore
        await tsParticles.load("tsparticles", {
            preset: "bigCircles", // also "big-circles" is accepted
        });

        if (!index) {
            return;
        }

        try {
            // I need to check if a wallet is connected and display a loading indicator till they are
            const switched = await onboardOrSwitchNetwork(handleError);

            if (switched) {
                await requestAccounts()
                const provider = getWeb3Provider();
                const zkTickets = await getContract(provider, CONTRACTADDRESS, "ZKTickets.json")
                const proStaking = await getContract(provider, STAKINGCONTRACT, "ProStaking.json")
                const tokenContract = await getContract(provider, TOKENCONTRACT, "TicketPro.json");
                const event = await getTicketedEvents(zkTickets, index);
                const transferRequests = await getTransferRequestsByEventIndex(zkTickets, index)
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                const currentBlock = await provider.getBlockNumber();
                const tokenBalance = await balanceOf(tokenContract, address);
                const staker = await stakers(proStaking, address);
                const totalStakedTokens = await totalStaked(proStaking);
                const stakeUnitTokens = await stakeUnit(proStaking);
                const stakingBlockUnits = await stakingBlocks(proStaking);

                const requestsByMe = await getRequestsByMe(zkTickets, index, address);
                const requestsToMe = await getRequestsToMe(zkTickets, index, address);
                const openResaleRequests = await getRequestsToMe(zkTickets, index, ZEROADDRESS);

                const speculativeSaleCounterValue = await speculativeSaleCounter(zkTickets, index, address);

                renderManageUI({
                    openResaleRequests,
                    requestsToMe,
                    requestsByMe,
                    transferRequests,
                    speculativeSaleCounterValue,
                    proStaking,
                    zkTickets,
                    tokenContract,
                    currentBlock,
                    event,
                    stakeUnitTokens,
                    stakingBlockUnits,
                    totalStakedTokens,
                    staker,
                    tokenBalance,
                    address
                });
            }
        } catch (err) {
            handleError("An error Occured");
            console.log(err);
            return;
        }

    })();




function renderManageUI(data) {
    const { openResaleRequests, requestsToMe, requestsByMe, speculativeSaleCounterValue, proStaking, zkTickets, tokenContract, stakeUnitTokens, event, stakingBlockUnits, currentBlock, tokenBalance, address } = data;
    const { allowSpeculation, creator, eventName, externalHandelr, price, } = event;

    welcomeMessage.classList.add("hide");
    manageUiContainer.classList.remove("hide");

    increaseStakeAmount.onclick = function () {
        increaseStakeAmountClick(stakeUnitTokens);
    }

    decreaseStakeAmount.onclick = function () {
        decreaseStakeAmountClick(stakeUnitTokens)
    }

    unstakeButton.onclick = async function () {
        await onUnstakeButtonClick(proStaking);
    }

    stakeButton.onclick = async function () {
        await onStakeButtonClick(tokenContract, proStaking);
    }


    scanTicketButton.onclick = async function () {
        await onScanTicketButton()
    }

    cancelRequestScanTicketButton.onclick = async function () {
        await onCancelRequestScanTicketButton();
    }


    const optionElements = createOptionElements(allowSpeculation);
    appendOptionsElementsTo(selectTransferType, optionElements);

    selectTransferType.onchange = function (event: any) {
        onSelectTransferType(event, price, creator, allowSpeculation)
    }

    createRequests.onclick = async function () {
        onCreateRequestsClick(zkTickets);
    }

    goToViewRequests.onclick = async function () {
        await initViewRequests(requestsByMe, requestsToMe, openResaleRequests, zkTickets, index);
    }

    fetchMyRequests.onclick = async function () {
        await fetchMyRequestsClick(requestsByMe, zkTickets, index, eventName, address);
    }
    fetchToMeRequests.onclick = async function () {
        await fetchToMeRequestsClick(requestsToMe, zkTickets, index, eventName, address);
    }

    fetchOpenResaleRequests.onclick = async function () {
        await fetchOpenResaleRequestsClick(openResaleRequests, zkTickets, index, eventName, address);
    }

    goToCreateRequests.onclick = function () {
        goToCreateRequestsClick()
    }

    goToStaking.onclick = function () {
        goToStakingClick()
    }

    goToShowRequestFromStaking.onclick = function () {
        goToViewRequests.click()
    }


    if (allowSpeculation) {
        ifSpeculationAllowed(data, stakingBlockUnits, currentBlock, speculativeSaleCounterValue, stakeUnitTokens, tokenBalance)
    }
}


function getBlocksLeft(stakingBlockUnits: number, currentBlock: number, stakeDate: number): [string, boolean] {
    const unlockBlock = stakeDate + stakingBlockUnits;

    if (currentBlock > unlockBlock) {
        return ["0", true];
    } else {
        return [`${unlockBlock - currentBlock} Blocks left`, false]
    }
}

function getHowMuchSpeculativeSalesLeft(stakingAmount: BigNumber, stakingUnits: BigNumber, speculativeSaleCounter: BigNumber): number {
    // calculate how many times the staking amount contains the staking units
    const howMuchMaxAllowed = stakingAmount.div(stakingUnits);
    // that value is the max allowed speculative sales per event
    // So I check how many resales the user did with a custom price and substract that to get how much is left
    return howMuchMaxAllowed.sub(speculativeSaleCounter).toNumber();
}


async function initViewRequests(requestsByMe, requestsToMe, openResaleRequests, zkTickets, index) {
    showOrHideIfPossible(false, transferRequestsOutterContainer);
    showOrHideIfPossible(true, showTransferRequestsOutterContainer);
    showOrHideIfPossible(false, stakingDataOutterContainer);
}

async function fetchMyRequestsClick(requestsByMe, zkTickets, index, eventName, userAddress) {
    let indexes = bigNumberIndexesToNumber(requestsByMe);
    // I filter the indexes I got from the API to not fetch requests that are not initialized more than once 
    indexes = getPageRequestIndexesToFetch(indexes, userAddress, CONTRACTADDRESS, index);
    const requestsByMeResults = await requestFetcher(zkTickets, index, indexes);
    // Now I check what requests are not initialized and save that in the localstorage
    setPageRequestIndexesToNotFetch(indexes, requestsByMeResults, CONTRACTADDRESS, userAddress, index);
    renderRequestRows(indexes, requestsByMeResults, myRequestsTableBody, createRequestsByMeTR, eventName);
    handleCancelButtons(zkTickets, index)
}
async function fetchToMeRequestsClick(requestsToMe, zkTickets, index, eventName, userAddress) {
    let indexes = bigNumberIndexesToNumber(requestsToMe);
    indexes = getPageRequestIndexesToFetch(indexes, userAddress, CONTRACTADDRESS, index);
    const requestsToMeResults = await requestFetcher(zkTickets, index, indexes);
    setPageRequestIndexesToNotFetch(indexes, requestsToMeResults, CONTRACTADDRESS, userAddress, index);
    renderRequestRows(indexes, requestsToMeResults, requestsToMeTableBody, createRequestsToMeTR, eventName);
    handleAcceptButtons(zkTickets, index);
}
async function fetchOpenResaleRequestsClick(openResaleRequests, zkTickets, index, eventName, userAddress) {
    let indexes = bigNumberIndexesToNumber(openResaleRequests);
    indexes = getPageRequestIndexesToFetch(indexes, userAddress, CONTRACTADDRESS, index);
    const openResaleResults = await requestFetcher(zkTickets, index, indexes);
    setPageRequestIndexesToNotFetch(indexes, openResaleResults, CONTRACTADDRESS, userAddress, index);
    //TODO: SORT RESALE REQUESTS BY PRICE!
    renderRequestRows(indexes, openResaleResults, openResaleRequestsTableBody, createOpenRequestsTR, eventName);
    handleBuyButtons(zkTickets, index);
}

function handleCancelButtons(zkTickets, eventIndex) {
    const cancelButtons = document.getElementsByClassName("cancelButton");

    for (let i = 0; i < cancelButtons.length; i++) {
        const btn = cancelButtons[i] as HTMLButtonElement;
        btn.onclick = async function () {

            const requestIndex = btn.dataset.requestindex as string;
            const note = await parseNote(cancelRequestTicketCodeInput.value).catch(err => {
                handleError("Invalid ticket")
            });
            if (!note) {
                return;
            }

            const _proof = await generateProof(note.cryptoNote);
            // Send the cancel request!
            const cancelTX = await cancelTransferRequest(
                zkTickets,
                toNoteHex(note.cryptoNote.commitment),
                toNoteHex(note.cryptoNote.nullifierHash),
                _proof,
                eventIndex,
                requestIndex
            ).catch(err => {
                if (err.message.includes("User rejected the transaction")) {
                    handleError("User rejected the transaction");
                } else if (err.message.includes("cannot estimate gas")) {
                    handleError("This transaction would fail. Invalid Note")
                } else {
                    handleError("An error occured")
                }
            })
            if (cancelTX !== undefined) {
                await cancelTX.wait().then(receipt => {
                    if (receipt.status === 1) {
                        window.location.reload();
                    } else {
                        handleError("Transaction Failed")
                    }
                })
            }
        }
    }
}

async function handleAcceptButtons(zktickets, eventIndex) {
    const acceptButtons = document.getElementsByClassName("acceptButton");
    for (let i = 0; i < acceptButtons.length; i++) {
        const btn = acceptButtons[i] as HTMLButtonElement;
        btn.onclick = async function () {
            await requestAccounts();
            const type = btn.dataset.type as string;
            const price = btn.dataset.price as string
            const requestIndex = btn.dataset.requestindex as string;
            const eventName = btn.dataset.eventname as string;

            if (parseInt(type) === TransferType.TRANSFER) {
                const note = await getNote(NETID);

                const transferTx = await acceptTransfer(
                    zktickets,
                    eventIndex,
                    requestIndex,
                    toNoteHex(note[0].cryptoNote.commitment)).catch(err => {
                        handleError("An error occured!")
                    })
                if (transferTx !== undefined) {
                    await downloadNoteAndAttach(note, eventName, price, btn);
                    await transferTx.wait(async (receipt) => {
                        if (receipt.status === 1) {
                        } else {
                            handleError("Transaction Failed!")
                        }
                    })
                }
                return
            } else if (parseInt(type) === TransferType.REFUND) {
                const refundTx = await acceptRefundRequest(
                    zktickets,
                    eventIndex,
                    requestIndex,
                    parseEther(price));
                if (refundTx !== undefined) {
                    btn.disabled = true;
                    btn.innerText = "Refunded"
                    await refundTx.wait((receipt) => {
                        if (receipt.status === 1) {
                            // this is an edge case and this is not triggering
                        } else {
                            handleError("Transaction failed!")
                        }
                    })
                }

                return;
            } else if (parseInt(type) === TransferType.RESALE) {
                const resoldNote = await getNote(NETID);
                const priceWithFee = await calculateResaleFee(zktickets, parseEther(price));
                const resaleTx = await acceptResaleRequest(
                    zktickets,
                    eventIndex,
                    requestIndex,
                    toNoteHex(resoldNote[0].cryptoNote.commitment),
                    priceWithFee.total
                );
                if (resaleTx !== undefined) {
                    await downloadNoteAndAttach(resoldNote, eventName, price, btn);
                }
                await resaleTx.wait(async (receipt) => {
                    if (receipt.status === 1) {
                    } else {
                        handleError("Transaction failed!")
                    }
                })
            }

        }
    }
}

async function downloadNoteAndAttach(note, eventName, price, btn) {
    const dataUrl = await createQR(note[1]) as string;
    await downloadPDF(eventName, price, currency, dataUrl, note[1], window.location.href);

    // Change it to a different button!!
    btn.classList.remove("button-53");
    btn.classList.add("button-50");
    btn.style.width = "100%";
    btn.innerText = "Download Note"

    btn.onclick = async function () {
        await downloadPDF(eventName, price, currency, dataUrl, note[1], window.location.href);
    }

}

async function handleBuyButtons(zktickets, eventIndex) {
    const buyButtons = document.getElementsByClassName("buyButton");
    for (let i = 0; i < buyButtons.length; i++) {
        const btn = buyButtons[i] as HTMLButtonElement;
        btn.onclick = async function () {
            await requestAccounts();
            const price = btn.dataset.price as string
            const requestIndex = btn.dataset.requestindex as string;
            const eventName = btn.dataset.eventname as string;
            const resoldNote = await getNote(NETID);

            const priceWithFee = await calculateResaleFee(zktickets, parseEther(price));
            const resaleTx = await acceptResaleRequest(
                zktickets,
                eventIndex,
                requestIndex,
                toNoteHex(resoldNote[0].cryptoNote.commitment),
                priceWithFee.total
            );

            if (resaleTx !== undefined) {
                await downloadNoteAndAttach(resoldNote, eventName, price, btn);
                await resaleTx.wait(async (receipt) => {
                    if (receipt.status === 1) {
                        // I moved the download to above because here it was not triggering
                    } else {
                        handleError("Transaction failed!")
                    }
                })
            }



        }
    }
}

function goToCreateRequestsClick() {
    showOrHideIfPossible(true, transferRequestsOutterContainer);
    showOrHideIfPossible(false, showTransferRequestsOutterContainer);
    showOrHideIfPossible(false, stakingDataOutterContainer);
}

function goToStakingClick() {
    showOrHideIfPossible(true, stakingDataOutterContainer);
    showOrHideIfPossible(false, transferRequestsOutterContainer);
    showOrHideIfPossible(false, showTransferRequestsOutterContainer);
}

async function onCreateRequestsClick(zkTickets) {
    if (!index) {
        return;
    }

    //Do vertification and then create the request!
    const ticketCode = ticketCodeInput.value;
    const note = await parseNote(ticketCode).catch(err => {
        handleError("Invalid Ticket");
    })
    if (!note) {
        return;
    }

    const transferType = getTransferType(selectTransferType.value)
    let transferToAddress = transferTo.value;

    let price = resalepriceInput.value;


    if (transferType === TransferType.TRANSFER) {
        price = '0';
    }

    if (transferType === TransferType.RESALE) {
        if (transferToAddress === "") {
            transferToAddress = ZEROADDRESS;
        }
    } else {
        if (transferToAddress === "") {
            handleError("Invalid address to transfer to")
            return;
        }
    }

    if (!isAddress(transferToAddress)) {
        handleError("Invalid address");
        return;
    }

    const ticket = await ticketCommitments(zkTickets, toNoteHex(note.cryptoNote.commitment));

    if (ticket.transferInitiated) {
        handleError("This ticket arleady has a transfer request!")
        return;
    }

    const _proof = await generateProof(note.cryptoNote);

    const transferRequestTx = await createTransferRequest(
        zkTickets,
        toNoteHex(note.cryptoNote.commitment),
        toNoteHex(note.cryptoNote.nullifierHash),
        _proof,
        index,
        transferType,
        transferToAddress,
        parseEther(price)
    );

    await transferRequestTx.wait().then(receipt => {
        if (receipt.status === 1) {
            window.location.reload();
        } else {
            handleError("Transaction failed");
        }
    })
}


async function onScanTicketButton() {
    if (!index) {
        return;
    }

    triggerOverlay(true);
    const onSuccess = async (scanResult: QrScanner.ScanResult) => {
        const scannedNote = scanResult.data;
        const note = await parseNote(scannedNote).catch(err => {
            handleError("Invalid Ticket")
        });
        if (!note) {
            return;
        }
        const ticketValid = await walletRPCProviderVerifyTicket(index, note.cryptoNote, handleError);
        if (!ticketValid) {
            handleError("Invalid Ticket");
            return;
        }
        ticketCodeInput.value = scannedNote;
        stopScanningButton.click();
    }

    const qrScanner = await createQRCodeScanner(onSuccess)
    await startScanning(qrScanner);

    stopScanningButton.onclick = async function () {
        await stopScanning(qrScanner).then(() => {
            triggerOverlay(false);
        })
    }
}

async function onCancelRequestScanTicketButton() {
    if (!index) {
        return;
    }
    triggerOverlay(true);
    const onSuccess = async (scanResult: QrScanner.ScanResult) => {
        const scannedNote = scanResult.data;
        const note = await parseNote(scannedNote).catch(err => {
            handleError("Invalid Ticket")
        });
        if (!note) {
            return;
        }

        cancelRequestTicketCodeInput.value = scannedNote;
        stopScanningButton.click();
    }

    const qrScanner = await createQRCodeScanner(onSuccess)
    await startScanning(qrScanner);

    stopScanningButton.onclick = async function () {
        await stopScanning(qrScanner).then(() => {
            triggerOverlay(false);
        })
    }


}

function onSelectTransferType(event, price, creator, allowSpeculation) {
    switch (event.target.value) {
        case "Transfer":
            resalepriceInput.disabled = true;
            resalepriceInput.value = "";
            resalepriceInput.placeholder = "0"
            transferTo.placeholder = "Enter address of recipient";
            transferTo.disabled = false;
            transferTo.value = "";
            priceInfoContainer.innerText = "Transfers are free"
            break;
        case "Refund":
            resalepriceInput.disabled = true;
            resalepriceInput.value = formatEther(price);
            transferTo.value = creator;
            transferTo.disabled = true;
            priceInfoContainer.innerText = "The 1% fee is non-refundable."
            break;
        case "Resale":
            if (allowSpeculation) {
                resalepriceInput.disabled = false;
            } else {
                resalepriceInput.disabled = true;
            }
            resalepriceInput.value = formatEther(price);
            transferTo.disabled = false;
            transferTo.value = ""
            transferTo.placeholder = "Anyone can purchase if empty"
            priceInfoContainer.innerText = "2% fee will be added to the resale price"
            break;
        default:
            break;
    }
}

function ifSpeculationAllowed(data, stakingBlockUnits, currentBlock, speculativeSaleCounterValue, stakeUnitTokens, tokenBalance) {
    const { isStaking, stakeAmount, stakeDate } = data.staker;

    if (isStaking) {
        stakeBalance.innerHTML = "Staking " + formatEther(stakeAmount) + " TPR"
        blocksLeftTr.classList.remove("hide");
        // calculate how many blocks are left to unstake
        const [blocksLeftAmount, canUnstake] = getBlocksLeft(
            stakingBlockUnits.toNumber(),
            currentBlock,
            stakeDate.toNumber());

        if (canUnstake) {
            unstakeButton.disabled = false;
        }

        blocksLeft.innerHTML = blocksLeftAmount;
        customPriceResalesCreated.innerHTML = speculativeSaleCounterValue.toNumber();
        const speculativeSalesLeft = getHowMuchSpeculativeSalesLeft(stakeAmount, stakeUnitTokens, speculativeSaleCounterValue);
        customPriceResalesLeft.innerHTML = speculativeSalesLeft.toString();


    } else {
        stakeBalance.innerHTML = "Not Staking"
    }

    tokenBalanceEl.innerHTML = formatEther(tokenBalance) + " TPR"
}

async function onStakeButtonClick(tokenContract, proStaking,) {
    // Allow to spend tokens and then stake them
    const amount = amountToStake.dataset.amount;
    if (amount !== undefined) {


        if (parseInt(amount) <= 0) {
            handleError("Unable to stake. Amount too low!")
            return;
        }


        const approveSpendTx = await approveSpend(tokenContract, proStaking.address, parseEther(amount))

        await approveSpendTx.wait().then(async (receipt) => {
            if (receipt.status === 1) {
                const stakeTransaciton = await stake(proStaking, parseEther(amount));
                await stakeTransaciton.wait().then((async (receipt2) => {
                    if (receipt2.status === 1) {
                        window.location.reload();
                    } else {
                        handleError("Transaction failed")
                    }
                }))
            } else {
                handleError("Transaction Failed");
            }
        })
    }
}

async function onUnstakeButtonClick(proStaking) {
    const amount = amountToStake.dataset.amount;
    if (amount !== undefined) {
        const unstakeTx = await unstake(proStaking, parseEther(amount));
        await unstakeTx.wait().then((receipt) => {
            if (receipt.status === 1) {
                window.location.reload();
            } else {
                handleError("Transaction failed")
            }
        })
    }
}

function decreaseStakeAmountClick(stakeUnitTokens) {
    const currentAmount = amountToStake.dataset.amount;
    if (currentAmount != undefined && currentAmount !== "0") {
        const stakeAmount = formatEther(stakeUnitTokens);
        const newAmount = parseInt(currentAmount) - parseInt(stakeAmount);
        amountToStake.dataset.amount = newAmount.toString();
        amountToStake.innerHTML = newAmount.toString() + " TPR";
    }
}

function increaseStakeAmountClick(stakeUnitTokens) {
    const currentAmount = amountToStake.dataset.amount;

    if (currentAmount !== undefined) {
        const stakeAmount = formatEther(stakeUnitTokens);
        const newAmount = parseInt(currentAmount) + parseInt(stakeAmount);
        amountToStake.dataset.amount = newAmount.toString();
        amountToStake.innerHTML = newAmount.toString() + " TPR";
    }
}