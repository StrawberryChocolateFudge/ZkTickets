import { toNoteHex } from "../lib/crypto";
import { downloadPDF } from "./pdf";
import { createQR } from "./qrcode";
import { handleError, appURL, getEventIndex, createNewImgElement, createNewTooltipText, appendTooltip } from "./utils";
import { BTTTESTNETID, calculatePurchaseFee, FANTOMTESTNETID, formatEther, getContract, getCurrencyFromNetId, getJsonProviderTicketedEvent, getNetworkFromSubdomain, getTicketedEvents, getWeb3Provider, onboardOrSwitchNetwork, purchaseTicket, ZEROADDRESS } from "./web3";
import { getNote } from "./web3/zkp";

const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();
const index = getEventIndex();

const currency = getCurrencyFromNetId(NETID);

const currencyPriceRow = document.getElementById("currencyPriceRow") as HTMLDivElement;
const accessEventButton = document.getElementById("accessEventButton") as HTMLDivElement;

(
    async () => {
        //@ts-ignore
        await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
        //@ts-ignore
        await tsParticles.load("tsparticles", {
            preset: "bigCircles", // also "big-circles" is accepted
        });

        if (NETID === BTTTESTNETID) {
            const imgEl = createNewImgElement("./bttLogo.svg");
            appendTooltip(currencyPriceRow, imgEl, null);
        } else if (NETID === FANTOMTESTNETID) {
            const imgEl = createNewImgElement("./fantomLogo.svg");
            appendTooltip(currencyPriceRow, imgEl, null);
        }
        if (!index) {
            accessEventButton.innerHTML = `Invalid Event`
            return;
        }
        accessEventButton.innerHTML = `Enter Event ${index}`

    })();

const purchaseTicketsSelectorButton = document.getElementById("purchaseTicketsSelectorButton") as HTMLElement;
const handleTicketsButton = document.getElementById("handleTicketsButton") as HTMLElement;
const manageTicketsButton = document.getElementById("manageTicketsButton") as HTMLButtonElement;
const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
const loadingBanner = document.getElementById("loadingBanner") as HTMLElement;
const purchaseTicketAction = document.getElementById("purchaseTicketAction") as HTMLElement;

const purchaseTicketActionContainer = document.getElementById("purchaseTicketActionContainer") as HTMLElement;
const downloadbuttonContainer = document.getElementById("downloadbuttonContainer") as HTMLElement;
const downloadButton = document.getElementById("downloadButton") as HTMLButtonElement;

const eventName = document.getElementById("eventName") as HTMLElement;
const eventPrice = document.getElementById("eventPrice") as HTMLElement;
const ticketsLeft = document.getElementById("ticketsLeft") as HTMLElement;
const eventCreator = document.getElementById("eventCreator") as HTMLElement;

const priceInfoRow = document.getElementById("priceInfoRow") as HTMLElement;
const priceInfo = document.getElementById("priceInfo") as HTMLSpanElement;

const getHandleTicketURL = (index: string) => appURL + `/handleTicket.html?i=${index}`
const getManageTicketsURL = (index: string) => appURL + `/manageTickets.html?i=${index}`
handleTicketsButton.onclick = function () {
    if (!index) {
        return;
    }
    window.location.href = getHandleTicketURL(index);
}
manageTicketsButton.onclick = function () {
    if (!index) {
        return;
    }
    window.location.href = getManageTicketsURL(index);
}

purchaseTicketsSelectorButton.onclick = async function () {
    if (!index) {
        return;
    }

    const switched = await onboardOrSwitchNetwork(handleError);

    if (switched) {

        const index = getEventIndex();
        if (!index) {
            return;
        }

        welcomeMessage.classList.add("hide");
        loadingBanner.classList.remove("hide");
        purchaseTicketsSelectorButton.classList.add("hide");

        const provider = getWeb3Provider();
        const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();

        let errorOccured = false;

        const contract = await getContract(provider, CONTRACTADDRESS, "ZKTickets.json").catch(err => {
            handleError("Network error");
            errorOccured = true;
        })

        if (errorOccured) {
            return;
        }

        const ticketedEvent = await getTicketedEvents(contract, index).catch(err => {
            handleError("Unable to find the event!");
            errorOccured = true;
        })

        if (errorOccured) {
            return;
        }

        if (!ticketedEvent) {
            handleError("Unable to connect to wallet!")
            errorOccured = true;
        }

        if (errorOccured) {
            return;
        }

        const eventPriceWithFee = await calculatePurchaseFee(contract, ticketedEvent.price);

        eventCreator.textContent = ticketedEvent.creator;
        eventName.textContent = ticketedEvent.eventName;
        eventPrice.textContent = formatEther(eventPriceWithFee.total);
        ticketsLeft.textContent = ticketedEvent.availableTickets;

        priceInfo.textContent = `${formatEther(ticketedEvent.price)} ${currency} plus 1% Fee!`;

        setTimeout(() => {
            const eventContainer = document.getElementById("eventContainer") as HTMLElement;
            eventContainer.classList.remove("hide");
            welcomeMessage.classList.add("hide");
            loadingBanner.classList.add("hide");
            if (ticketedEvent.creator === ZEROADDRESS) {
                purchaseTicketActionContainer.classList.add("hide")
            }
        }, 1000);
    }
};

purchaseTicketAction.onclick = async function () {
    if (!index) {
        return;
    }

    const switched = await onboardOrSwitchNetwork(handleError);

    const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();

    if (switched) {
        const provider = getWeb3Provider();
        let errorOccured = false;
        const contract = await getContract(provider, CONTRACTADDRESS, "ZKTickets.json").catch(err => {
            handleError("Unable to connect to the network");
            errorOccured = true;
        })


        if (errorOccured) {
            return;
        }

        const ticketedEvent = await getTicketedEvents(contract, index).catch(err => {
            handleError("Unable to find the event!");
            errorOccured = true;
        })

        if (errorOccured) {
            return;
        }

        if (!ticketedEvent) {
            handleError("Unable to connect to the network!");
            return;
        }

        const availableTickets = ticketedEvent.availableTickets.toNumber();

        if (availableTickets === 0 || availableTickets === undefined) {
            handleError("Event sold out!")
            return;
        }
        // Then I create the crypto note
        const noteDetails = await getNote(NETID);
        const details = noteDetails[0];
        const noteString = noteDetails[1];
        // Now I Prompt the user to pay with metamask if there are available tickets!        
        const eventPriceWithFee = await calculatePurchaseFee(contract, ticketedEvent.price);

        const purchaseTx = await purchaseTicket(contract, eventPriceWithFee.total, index, toNoteHex(details.cryptoNote.commitment))
            .catch(err => {
                handleError("An Error Occured!")
            });

        if (purchaseTx !== undefined) {
            const dataUrl = await createQR(noteString) as string;
            await downloadPDF(ticketedEvent.eventName, formatEther(ticketedEvent.price), currency, dataUrl, noteString, window.location.href);

            await purchaseTx.wait().then(async (receipt) => {
                if (receipt.status === 1) {
                    // Update how many tickets are left
                    const updatedEvent = await getTicketedEvents(contract, index);
                    ticketsLeft.textContent = updatedEvent.availableTickets

                    // I automaticly start the download here but if it's blocked for some reason the users will have a download button
                    purchaseTicketActionContainer.classList.add("hide");
                    downloadbuttonContainer.classList.remove("hide");
                    priceInfoRow.classList.add("hide");
                    downloadButton.dataset.note = noteString;
                    downloadButton.dataset.eventName = ticketedEvent.eventName;
                    downloadButton.dataset.eventPrice = formatEther(eventPriceWithFee.total);

                } else {
                    handleError("Transaction failed!")
                }
            })
        }





    }
}

downloadButton.onclick = async function () {
    const noteString = downloadButton.dataset.note as string;
    const eventName = downloadButton.dataset.eventName as string;
    const eventPrice = downloadButton.dataset.eventPrice as string;
    const dataUrl = await createQR(noteString) as string;

    await downloadPDF(eventName, eventPrice, currency, dataUrl, noteString, window.location.href);
}