import QrScanner from "qr-scanner";
import { parseNote, toNoteHex } from "../lib/crypto";
import { createQRCodeScanner, startScanning, stopScanning } from "./camera";
import { getEventIndex, handleError } from "./utils";
import { getContract, getNetworkFromSubdomain, getWeb3Provider, handleTicket, JSONRPCProviderVerifyTicket, onboardOrSwitchNetwork, walletRPCProviderVerifyTicket } from "./web3";
import { generateProof } from "./web3/zkp";

const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
const eventContainer = document.getElementById("createEventFormContainer") as HTMLElement;
const ticketCodeInput = document.getElementById("ticketCodeInput") as HTMLInputElement;
const validateTicketButton = document.getElementById("validateTicketButton") as HTMLButtonElement;
const ticketValidContainer = document.getElementById("ticketValidContainer") as HTMLElement;

const enterTheTicketCodeInfoRow = document.getElementById("enterTheTicketCodeInfoRow") as HTMLElement;
const ticketCodeInputTable = document.getElementById("ticketCodeInputTable") as HTMLElement;
const validateTicketButtonRow = document.getElementById("validateTicketButtonRow") as HTMLElement;
const stopScanningButtonRow = document.getElementById("stopScanningButtonRow") as HTMLElement;

const stopScanningButton = document.getElementById("stopScanningButton") as HTMLButtonElement;

const readerContainer = document.getElementById("readerContainer") as HTMLElement;

const validateBackButton = document.getElementById("validateBackButton") as HTMLButtonElement;


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
    ticketValidContainer.classList.remove("hide");
}

const renderTicketValidBack = () => {
    eventContainer.classList.remove("hide");
    ticketValidContainer.classList.add("hide");
}

(async () => {
    const index = getEventIndex();
    if (!index) {
        handleError("Invalid Link")
        return;
    }

    setTimeout(() => {
        welcomeMessage.classList.add("hide");
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
        const ticketValid = await walletRPCProviderVerifyTicket(index, note.cryptoNote, handleError);
        if (!ticketValid) {
            handleError("Invalid Ticket");
            return;
        }
        // If the ticket is valid I display TICKET VALID!
        // Then a button to invalidate it!
        eventContainer.classList.add("hide");
        ticketValidContainer.classList.remove("hide");
        validateBackButton.onclick = async function () {
            // If the back button is pressed, I empty the input field
            // Then I navigate back
            ticketCodeInput.value = "";
            renderTicketValidBack();
        }
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
            const ticketValid = await walletRPCProviderVerifyTicket(index, note.cryptoNote, handleError);
            if (!ticketValid) {
                handleError("Invalid Ticket");
                return;
            }

            // If the ticket is valid I display Ticket Valid!
            // Then the button to invalidate it

            ticketCodeInput.value = scannedNote;
            renderTicketValid();

            validateBackButton.onclick = async function () {
                // If the back button is pressed, I empty the input field
                // Then I navigate back
                ticketCodeInput.value = "";
                renderTicketValidBack();
                stopScanningButton.click();
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