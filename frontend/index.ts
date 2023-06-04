import { BigNumber } from "ethers";
import { toNoteHex } from "../lib/crypto";
import { downloadPDF } from "./pdf";
import { createQR } from "./qrcode";
import { handleError, appURL, getEventIndex, createNewImgElement, appendTooltip } from "./utils";
import { BTTTESTNETID, calculatePurchaseFee, formatEther, getContract, getCurrencyFromNetId, getNetworkFromQueryString, getTicketedEvents, getWeb3Provider, onboardOrSwitchNetwork, purchaseTicket, TRONZKEVMTESTNET, ZEROADDRESS } from "./web3";
import { getNote } from "./web3/zkp";

const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromQueryString();
const index = getEventIndex();

const currency = getCurrencyFromNetId(NETID);

const currencyPriceRow = document.getElementById("currencyPriceRow") as HTMLDivElement;
const accessEventButton = document.getElementById("accessEventButton") as HTMLDivElement;

(
    async () => {
        if (NETID === BTTTESTNETID) {
            const imgEl = createNewImgElement("./bttLogo.svg");
            appendTooltip(currencyPriceRow, imgEl, null);
        } else if (NETID === TRONZKEVMTESTNET.chainId) {
            const imgEl = createNewImgElement("./tron-trx-logo.svg");
            appendTooltip(currencyPriceRow, imgEl, null);
        }
        if (!index) {
            accessEventButton.innerHTML = `Contact An Event Organizer`
            return;
        }
        accessEventButton.innerHTML = `CONNECT`

    })();

const purchaseTicketsSelectorButton = document.getElementById("purchaseTicketsSelectorButton") as HTMLElement;
const verifyTickets = document.getElementById("verifyTickets") as HTMLElement;

const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
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

const buyButtonLabel = document.getElementById("buyButtonLabel") as HTMLSpanElement;


const getHandleTicketURL = (index: string) => appURL + `/verify.html?i=${index}`

verifyTickets.onclick = function () {
    if (!index) {
        return;
    }
    window.location.href = getHandleTicketURL(index);
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
        purchaseTicketsSelectorButton.classList.add("hide");

        const provider = getWeb3Provider();
        const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromQueryString();
        let errorOccured = false;

        const zktickets = await getContract(provider, CONTRACTADDRESS, "ZKTickets.json").catch(err => {
            handleError("Network error");
            errorOccured = true;
        })



        if (errorOccured) {
            return;
        }
        const ticketedEvent = await getTicketedEvents(zktickets, index).catch(err => {
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

        const eventPriceWithFee = await calculatePurchaseFee(zktickets, ticketedEvent.price);

        eventCreator.textContent = ticketedEvent.creator;
        eventName.textContent = ticketedEvent.eventName.toUpperCase();

        let total = eventPriceWithFee.total as BigNumber;

        if (total.eq(0)) {
            eventPrice.textContent = "FREE";
            buyButtonLabel.classList.add("hide")
        } else {
            eventPrice.textContent = formatEther(eventPriceWithFee.total);
            priceInfo.textContent = `${formatEther(ticketedEvent.price)} ${currency} plus 1% Fee!`;
        }


        ticketsLeft.textContent = ticketedEvent.availableTickets;


        setTimeout(() => {
            const eventContainer = document.getElementById("eventContainer") as HTMLElement;
            eventContainer.classList.remove("hide");
            welcomeMessage.classList.add("hide");
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

    const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromQueryString();

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