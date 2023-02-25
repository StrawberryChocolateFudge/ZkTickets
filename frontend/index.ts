import { createNewTicketedEvent, FANTOMTESTNETCONTRACTADDRESS, fetchAbi, getContract, getWeb3Provider, NewTicketedEventCreated, onboardOrSwitchNetwork, ZEROADDRESS } from "./web3";
import { handleError, appURL } from "./utils";
import { isAddress } from "ethers/lib/utils";

(async () => {
    //@ts-ignore
    await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
    //@ts-ignore
    await tsParticles.load("tsparticles", {
        preset: "bigCircles", // also "big-circles" is accepted
    });
})();


const getPurchasePageUrl = (index: string) => appURL + `/purchaseTicket.html?index=${index}`

const goToCreateEventsButton = document.getElementById("goToCreateEventsButton") as HTMLButtonElement;

const createEventButton = document.getElementById("CreateEventButton") as HTMLButtonElement;
const eventNameInput = document.getElementById("eventNameInput") as HTMLInputElement;
const eventPriceInput = document.getElementById("eventPriceInput") as HTMLInputElement;
const ticketCountInput = document.getElementById("ticketCountInput") as HTMLInputElement;

const handlerAddressInput = document.getElementById("handlerAddressInput") as HTMLInputElement;

const hideCreateButton = document.getElementById("hideCreateButton") as HTMLInputElement;

const createEventFormContainer = document.getElementById("createEventFormContainer") as HTMLButtonElement;

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

        const contract = await getContract(provider, FANTOMTESTNETCONTRACTADDRESS, "/ZKTickets.json").catch(err => {
            handleError("Unable to connect to your wallet");
        });

        const eventName = eventNameInput.value;
        const eventPrice = eventPriceInput.value;
        const ticketCount = ticketCountInput.value;
        const handlerAddressToSubmit = handlerAddress.length === 0 ? ZEROADDRESS : handlerAddress;

        const tx = await createNewTicketedEvent(contract, eventPrice, eventName, ticketCount, handlerAddressToSubmit).catch(err => {
            handleError("Unable to submit transaction");
        });

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
