import { BTTTESTNETID, createNewTicketedEvent, FANTOMTESTNETID, getContract, getNetworkFromSubdomain, getWeb3Provider, NewTicketedEventCreated, onboardOrSwitchNetwork, ZEROADDRESS } from "./web3";
import { handleError, appURL, createNewImgElement, createNewTooltipText, appendTooltip } from "./utils";
import { isAddress } from "ethers/lib/utils";

const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();
const currencyTooltip = document.getElementById("currencyTooltip") as HTMLDivElement;


(async () => {
    //@ts-ignore
    await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
    //@ts-ignore
    await tsParticles.load("tsparticles", {
        preset: "bigCircles", // also "big-circles" is accepted
    });

    if (NETID === BTTTESTNETID) {
        const imgEl = createNewImgElement("./bttLogo.svg");
        const tooltipTxt = createNewTooltipText("Price in Btt");
        appendTooltip(currencyTooltip, imgEl, tooltipTxt);
    } else if (NETID === FANTOMTESTNETID) {
        const imgEl = createNewImgElement("./fantomLogo.svg");
        const tooltipTxt = createNewTooltipText("Price in Fantom");
        appendTooltip(currencyTooltip, imgEl, tooltipTxt);
    }
})();


const getPurchasePageUrl = (index: string) => appURL + `/tickets.html?i=${index}`


const goToCreateEventsButton = document.getElementById("goToCreateEventsButton") as HTMLButtonElement;

const createEventButton = document.getElementById("CreateEventButton") as HTMLButtonElement;
const eventNameInput = document.getElementById("eventNameInput") as HTMLInputElement;
const eventPriceInput = document.getElementById("eventPriceInput") as HTMLInputElement;
const ticketCountInput = document.getElementById("ticketCountInput") as HTMLInputElement;
const allowSpeculationInput = document.getElementById("allowSpeculationInput") as HTMLInputElement;
const speculationWarning = document.getElementById("speculationWarning") as HTMLSpanElement;

const handlerAddressInput = document.getElementById("handlerAddressInput") as HTMLInputElement;

const hideCreateButton = document.getElementById("hideCreateButton") as HTMLInputElement;

const createEventFormContainer = document.getElementById("createEventFormContainer") as HTMLButtonElement;

allowSpeculationInput.onchange = function () {
    if (allowSpeculationInput.checked) {
        speculationWarning.style.display = "block";
    } else {
        speculationWarning.style.display = "none";
    }
}

goToCreateEventsButton.onclick = async function () {
    const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
    welcomeMessage.classList.add("hide");
    hideCreateButton.classList.add("hide");
    createEventFormContainer.classList.remove("hide");
}

createEventButton.onclick = async function () {
    const handlerAddress = handlerAddressInput.value;

    if (handlerAddress.length > 0 && !isAddress(handlerAddress)) {
        handleError("Invalid Handler Address")
        return;
    }

    const switched = await onboardOrSwitchNetwork(handleError);
    if (switched) {
        const provider = getWeb3Provider();

        const contract = await getContract(provider, CONTRACTADDRESS, "/ZKTickets.json").catch(err => {
            handleError("Unable to connect to your wallet");
        });

        const eventName = eventNameInput.value;
        if (eventName.length < 3) {
            handleError("Event name too short!");
            return;
        }
        const eventPrice = eventPriceInput.value;
        if (isNaN(parseFloat(eventPrice))) {
            handleError("Invalid Event price");
            return;
        }
        const ticketCount = ticketCountInput.value;

        if (isNaN(parseFloat(ticketCount))) {
            handleError("Invalid ticket count");
            return;
        }

        const handlerAddressToSubmit = handlerAddress.length === 0 ? ZEROADDRESS : handlerAddress;

        const allowSpeculation = allowSpeculationInput.checked;
        const tx = await createNewTicketedEvent(contract, eventPrice, eventName, ticketCount, handlerAddressToSubmit, allowSpeculation).catch(err => {
            handleError("Unable to submit transaction");
        });

        if (tx === undefined) {
            return;
        }
        await tx.wait().then(async (receipt) => {
            if (receipt.status === 1) {
                const eventIndex = await NewTicketedEventCreated(receipt, contract);
                if (!eventIndex) {
                    handleError("Oops, the transacion seems invalid!");
                } else {
                    window.location.href = getPurchasePageUrl(eventIndex.toString());
                }
            } else {
                handleError("Transaction Failed")
            }
        });
    }

}
