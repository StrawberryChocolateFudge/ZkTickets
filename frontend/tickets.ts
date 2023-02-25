import { toNoteHex } from "../lib/crypto";
import { downloadPDF } from "./pdf";
import { createQR } from "./qrcode";
import { handleError, appURL, getEventIndex } from "./utils";
import { FANTOMTESTNETCONTRACTADDRESS, FANTOMTESTNETID, formatEther, getContract, getJsonProviderTicketedEvent, getJsonRpcProvider, getTicketedEvents, getWeb3Provider, handleTicket, onboardOrSwitchNetwork, purchaseTicket, ZEROADDRESS } from "./web3";
import { getNote } from "./web3/zkp";
(
    async () => {
        //@ts-ignore
        await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
        //@ts-ignore
        await tsParticles.load("tsparticles", {
            preset: "bigCircles", // also "big-circles" is accepted
        });
    })();

const purchaseTicketsSelectorButton = document.getElementById("purchaseTicketsSelectorButton") as HTMLElement;
const handleTicketsButton = document.getElementById("handleTicketsButton") as HTMLElement;
const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
const loadingBanner = document.getElementById("loadingBanner") as HTMLElement;
const purchaseTicketAction = document.getElementById("purchaseTicketAction") as HTMLElement;

const purchaseTicketActionContainer = document.getElementById("purchaseTicketActionContainer") as HTMLElement;
const downloadbuttonContainer = document.getElementById("downloadbuttonContainer") as HTMLElement;
const downloadButton = document.getElementById("downloadButton") as HTMLButtonElement;

const eventName = document.getElementById("eventName") as HTMLElement;
const eventPrice = document.getElementById("eventPrice") as HTMLElement;
const ticketsLeft = document.getElementById("ticketsLeft") as HTMLElement;


const getHandleTicketURL = (index: string) => appURL + `/handleTicket.html?i=${index}`


handleTicketsButton.onclick = function () {
    const index = getEventIndex();
    if (!index) {
        return;
    }
    window.location.href = getHandleTicketURL(index)
}

purchaseTicketsSelectorButton.onclick = async function () {
    const index = getEventIndex();
    if (!index) {
        return;
    }

    welcomeMessage.classList.add("hide");
    loadingBanner.classList.remove("hide");
    purchaseTicketsSelectorButton.classList.add("hide");
    handleTicketsButton?.classList.add("hide");

    const ticketedEvent = await getJsonProviderTicketedEvent(index, handleError);

    eventName.textContent = ticketedEvent.eventName;
    eventPrice.textContent = formatEther(ticketedEvent.price);
    ticketsLeft.textContent = ticketedEvent.availableTickets;

    setTimeout(() => {
        const eventContainer = document.getElementById("eventContainer") as HTMLElement;
        eventContainer.classList.remove("hide");
        welcomeMessage.classList.add("hide");
        loadingBanner.classList.add("hide");
        if (ticketedEvent.creator === ZEROADDRESS) {
            purchaseTicketActionContainer.classList.add("hide")
        }
    }, 1000);
};

purchaseTicketAction.onclick = async function () {
    const index = getEventIndex();
    if (!index) {
        return;
    }

    const switched = await onboardOrSwitchNetwork(handleError);

    if (switched) {
        const provider = getWeb3Provider();
        const contract = await getContract(provider, FANTOMTESTNETCONTRACTADDRESS, "ZKTickets.json").catch(err => {
            handleError("Unable to connect to the network");
        })

        const ticketedEvent = await getTicketedEvents(contract, index).catch(err => {
            handleError("Unable to find the event!");
        })

        if (!ticketedEvent) {
            handleError("Unable to connect to the network!");
        }
        const availableTickets = ticketedEvent.availableTickets.toNumber();

        if (availableTickets === 0) {
            handleError("Event sold out!")
            return;
        }

        const price = ticketedEvent.price;
        // Then I create the crypto note
        const noteDetails = await getNote(FANTOMTESTNETID);
        const details = noteDetails[0];
        const noteString = noteDetails[1];
        // Now I Prompt the user to pay with metamask if there are available tickets!        

        const purchaseTx = await purchaseTicket(contract, price, index, toNoteHex(details.cryptoNote.commitment));

        await purchaseTx.wait().then(async (receipt) => {
            if (receipt.status === 1) {
                // Update how many tickets are left
                const updatedEvent = await getTicketedEvents(contract, index);
                ticketsLeft.textContent = updatedEvent.availableTickets

                // I automaticly start the download here but if it's blocked for some reason the users will have a download button
                purchaseTicketActionContainer.classList.add("hide");
                downloadbuttonContainer.classList.remove("hide");
                downloadButton.dataset.note = noteString;
                downloadButton.dataset.eventName = ticketedEvent.eventName;
                downloadButton.dataset.eventPrice = formatEther(ticketedEvent.price);
                const dataUrl = await createQR(noteString) as string;
                await downloadPDF(ticketedEvent.eventName, formatEther(ticketedEvent.price), "FTM", dataUrl, noteString, window.location.href);


            } else {
                handleError("Transaction failed!")
            }
        })

    }
}

downloadButton.onclick = async function () {
    const noteString = downloadButton.dataset.note as string;
    const eventName = downloadButton.dataset.eventName as string;
    const eventPrice = downloadButton.dataset.eventPrice as string;
    const dataUrl = await createQR(noteString) as string;

    await downloadPDF(eventName, eventPrice, "FTM", dataUrl, noteString, window.location.href);
}