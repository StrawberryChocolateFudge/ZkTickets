import QrScanner from "qr-scanner";
import { parseNote, toNoteHex } from "../lib/crypto";
import { createQRCodeScanner, startScanning, stopScanning } from "./camera";
import { getEventIndex, handleError } from "./utils";
import { FANTOMTESTNETCONTRACTADDRESS, getContract, getJsonProviderTicketedEvent, getWeb3Provider, handleTicket, JSONRPCProviderVerifyTicket, onboardOrSwitchNetwork } from "./web3";
import { generateProof } from "./web3/zkp";

(async () => {
    //@ts-ignore
    await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
    //@ts-ignore
    await tsParticles.load("tsparticles", {
        preset: "bigCircles", // also "big-circles" is accepted
    });
})();


const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
const loadingBanner = document.getElementById("loadingBanner") as HTMLElement;
const eventContainer = document.getElementById("createEventFormContainer") as HTMLElement;
const ticketCodeInput = document.getElementById("ticketCodeInput") as HTMLInputElement;
const validateTicketButton = document.getElementById("validateTicketButton") as HTMLButtonElement;
const invalidateTicketContainer = document.getElementById("invalidateTicketContainer") as HTMLElement;
const invalidateTicketButton = document.getElementById("invalidateTicketButton") as HTMLButtonElement;

const enterTheTicketCodeInfoRow = document.getElementById("enterTheTicketCodeInfoRow") as HTMLElement;
const ticketCodeInputTable = document.getElementById("ticketCodeInputTable") as HTMLElement;
const validateTicketButtonRow = document.getElementById("validateTicketButtonRow") as HTMLElement;
const stopScanningButtonRow = document.getElementById("stopScanningButtonRow") as HTMLElement;

const stopScanningButton = document.getElementById("stopScanningButton") as HTMLButtonElement;

const readerContainer = document.getElementById("readerContainer") as HTMLElement;

const invalidateBackButton = document.getElementById("invalidateBackButton") as HTMLButtonElement;

const renderScanner = () => {
    ticketCodeInputTable.classList.add("hide");
    validateTicketButtonRow.classList.add("hide");
    enterTheTicketCodeInfoRow.classList.add("hide");
    stopScanningButtonRow.classList.remove("hide");
    readerContainer.classList.remove("hide");
}

const renderStopScan = () => {
    readerContainer.classList.add("hide")
    ticketCodeInputTable.classList.remove("hide");
    validateTicketButtonRow.classList.remove("hide");
    enterTheTicketCodeInfoRow.classList.remove("hide");
    stopScanningButtonRow.classList.add("hide");
}

const renderTicketValid = () => {
    eventContainer.classList.add("hide");
    invalidateTicketContainer.classList.remove("hide");
}

const renderTicketValidBack = () => {
    eventContainer.classList.remove("hide");
    invalidateTicketContainer.classList.add("hide");
}

(async () => {
    const index = getEventIndex();
    if (!index) {
        return;
    }

    setTimeout(() => {
        welcomeMessage.classList.add("hide");
        loadingBanner.classList.add("hide");
        eventContainer.classList.remove("hide");
    }, 1000);
})();

validateTicketButton.onclick = async function () {
    const index = getEventIndex();
    if (!index) {
        return;
    }
    const enteredValue = ticketCodeInput.value;
    if (enteredValue.length !== 0) {
        // something was entered so I will attempt to validate it!
        const note = await parseNote(enteredValue).catch(err => {
            handleError("Invalid Ticket");
        });
        if (!note) {
            return;
        }
        const ticketValid = await JSONRPCProviderVerifyTicket(index, note.cryptoNote, handleError);
        if (!ticketValid) {
            handleError("Invalid Ticket");
            return;
        }
        // If the ticket is valid I display TICKET VALID!
        // Then a button to invalidate it!
        eventContainer.classList.add("hide");
        invalidateTicketContainer.classList.remove("hide");
    } else {

        //I hide current ui
        renderScanner();

        const onSuccess = async (scanResult: QrScanner.ScanResult) => {
            const scannedNote = scanResult.data;
            const note = await parseNote(scannedNote).catch(err => {
                handleError("Invalid Ticket")
            });
            if (!note) {
                return;
            }
            const ticketValid = await JSONRPCProviderVerifyTicket(index, note.cryptoNote, handleError);
            if (!ticketValid) {
                handleError("Invalid Ticket");
                return;
            }

            // If the ticket is valid I display Ticket Valid!
            // Then the button to invalidate it

            ticketCodeInput.value = scannedNote;
            renderTicketValid();

            invalidateBackButton.onclick = async function () {
                // If the back button is pressed, I empty the input field
                // Then I navigate back
                ticketCodeInput.value = "";
                renderTicketValidBack();
            }

        }

        const qrScanner = await createQRCodeScanner(onSuccess);

        await startScanning(qrScanner);

        stopScanningButton.onclick = async function () {
            await stopScanning(qrScanner).then(() => {
                renderStopScan();
            })
        }
    }
}

invalidateTicketButton.onclick = async function () {
    const enteredValue = ticketCodeInput.value;
    const note = await parseNote(enteredValue).catch(err => {
        handleError("Invalid Ticket");
    });
    if (!note) {
        return;
    }
    const proof = await generateProof(note.cryptoNote);
    // Invalidate the Ticket
    const switched = await onboardOrSwitchNetwork(handleError);

    if (switched) {
        const provider = getWeb3Provider();
        const contract = await getContract(provider, FANTOMTESTNETCONTRACTADDRESS, "ZKTickets.json").catch(err => {
            handleError("Unable to connect to the network")
        })

        const tx = await handleTicket(contract, proof, toNoteHex(note.cryptoNote.nullifierHash), toNoteHex(note.cryptoNote.commitment)).catch(err => {
            console.log(err);
            handleError("Unable to dispatch transaction")
        });

        if (tx) {
            await tx.wait().then(async (receipt) => {
                if (receipt.status === 1) {
                    window.location.reload();
                } else {
                    handleError("Transaction Failed")
                }
            })
        }
    }
}