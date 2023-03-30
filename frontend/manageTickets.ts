import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import QrScanner from "qr-scanner";
import { parseNote } from "../lib/crypto";
import { createQRCodeScanner, startScanning, stopScanning } from "./camera";
import { appendOptionsElementsTo, createOptionElements, getEventIndex, handleError, triggerOverlay } from "./utils";
import { approveSpend, balanceOf, formatEther, getContract, getNetworkFromSubdomain, getStakingContractsFromSubdomain, getTicketedEvents, getTransferRequestsByEventIndex, getWeb3Provider, onboardOrSwitchNetwork, speculativeSaleCounter, stake, stakers, stakeUnit, stakingBlocks, totalStaked, unstake, walletRPCProviderVerifyTicket } from "./web3";

const welcomeMessage = document.getElementById("welcomeMessage") as HTMLDivElement;
const manageUiContainer = document.getElementById("manageUiContainer") as HTMLDivElement;
const stakeBalance = document.getElementById("stakeBalance") as HTMLElement;
const stakingDataContainer = document.getElementById("stakingDataContainer") as HTMLElement;
const transferRequestsDataContainer = document.getElementById("transferRequestsDataContainer") as HTMLElement;
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
const selectTransferType = document.getElementById("selectTransferType") as HTMLButtonElement;

const resalepriceInput = document.getElementById("resalepriceInput") as HTMLInputElement;

const transferTo = document.getElementById("transferTo") as HTMLInputElement;

const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();
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

                const speculativeSaleCounterValue = await speculativeSaleCounter(zkTickets, index, address);

                renderManageUI({ transferRequests, speculativeSaleCounterValue, proStaking, zkTickets, tokenContract, currentBlock, event, stakeUnitTokens, stakingBlockUnits, totalStakedTokens, staker, tokenBalance });
            }
        } catch (err) {
            handleError("An error Occured");
            console.log(err);
            return;
        }

    })();

function renderManageUI(data) {
    const { speculativeSaleCounterValue, proStaking, zkTickets, tokenContract, stakeUnitTokens, event, stakingBlockUnits, currentBlock, tokenBalance } = data;
    const { allowSpeculation, creator, eventName, externalHandelr, price, } = event;

    welcomeMessage.classList.add("hide");
    manageUiContainer.classList.remove("hide");

    increaseStakeAmount.onclick = function () {
        const currentAmount = amountToStake.dataset.amount;

        if (currentAmount !== undefined) {
            const stakeAmount = formatEther(stakeUnitTokens);
            const newAmount = parseInt(currentAmount) + parseInt(stakeAmount);
            amountToStake.dataset.amount = newAmount.toString();
            amountToStake.innerHTML = newAmount.toString() + " TPR";
        }
    }

    decreaseStakeAmount.onclick = function () {
        const currentAmount = amountToStake.dataset.amount;
        if (currentAmount != undefined && currentAmount !== "0") {
            const stakeAmount = formatEther(stakeUnitTokens);
            const newAmount = parseInt(currentAmount) - parseInt(stakeAmount);
            amountToStake.dataset.amount = newAmount.toString();
            amountToStake.innerHTML = newAmount.toString() + " TPR";
        }
    }

    unstakeButton.onclick = async function () {
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

    stakeButton.onclick = async function () {
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


    scanTicketButton.onclick = async function () {
        triggerOverlay(true);
        if (!index) {
            return;
        }

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
    const optionElements = createOptionElements(allowSpeculation);
    appendOptionsElementsTo(selectTransferType, optionElements);

    selectTransferType.onchange = function (event: any) {
        switch (event.target.value) {
            case "Transfer":
                resalepriceInput.disabled = true;
                resalepriceInput.value = "";
                resalepriceInput.placeholder = "Transfers are free"
                transferTo.placeholder = "Enter address of recipient";
                transferTo.disabled = false;
                transferTo.value = "";
                break;
            case "Refund":
                resalepriceInput.disabled = true;
                resalepriceInput.value = formatEther(price);
                transferTo.value = creator;
                transferTo.disabled = true;
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
                break;
            default:
                break;
        }
    }




    if (allowSpeculation) {

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

        transferRequestsDataContainer.classList.remove("hide");
        stakingDataContainer.classList.remove("hide");
    }


    // I need to hide the  loading UI
    // and I need to show the manager UI
    // And fill it with data

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
