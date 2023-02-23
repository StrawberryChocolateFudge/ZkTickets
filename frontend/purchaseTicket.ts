import { handleError, appURL } from "./utils";
import { FANTOMTESTNETCONTRACTADDRESS, formatEther, getContract, getTicketedEvents, getWeb3Provider, handleTicket, onboardOrSwitchNetwork } from "./web3";
(
    async () => {
        //@ts-ignore
        await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
        //@ts-ignore
        await tsParticles.load("tsparticles", {
            preset: "bigCircles", // also "big-circles" is accepted
        });
    })();


const search = window.location.search;
const searchParams = new URLSearchParams(search);

const purchaseTicketsButton = document.getElementById("purchaseTicketsButton") as HTMLElement;
const handleTicketsButton = document.getElementById("handleTicketsButton") as HTMLElement;
const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
const loadingBanner = document.getElementById("loadingBanner") as HTMLElement;

const getHandleTicketURL = (index: string) => appURL + `/handleTicket.html?index=${index}`

const getEventIndex = () => {
    if (searchParams.has("index")) {
        const index = searchParams.get("index") as string;
        if (isNaN(parseInt(index))) {

            handleError("Invalid Event Index");
            return false;
        }
        return index;

    }
}

handleTicketsButton.onclick = function () {
    const index = getEventIndex();
    if (!index) {
        return;
    }
    window.location.href = getHandleTicketURL(index)
}

purchaseTicketsButton.onclick = async function () {
    const index = getEventIndex();
    if (!index) {
        return;
    }

    welcomeMessage.classList.add("hide");
    loadingBanner.classList.remove("hide");
    purchaseTicketsButton.classList.add("hide");
    handleTicketsButton?.classList.add("hide");


    const switched = await onboardOrSwitchNetwork(handleError);
    if (switched) {
        //TODO: USE AN JSON RPC TO FETCH DETAILS AND ONLY USE PROVIDER WHEN PAYING!!
        const provider = getWeb3Provider();
        const contract = await getContract(provider, FANTOMTESTNETCONTRACTADDRESS, "/ZKTickets.json").catch(err => {
            handleError("Unable to connect to your wallet");
        })
        console.log(contract);
        const ticketedEvent = await getTicketedEvents(contract, index).catch(err => {
            handleError("Unable to find the event!")
        });

        if (!ticketedEvent) {
            handleError("Unable to connect to wallet");
        }
        console.log(ticketedEvent);
        const eventName = document.getElementById("eventName") as HTMLElement;
        const eventPrice = document.getElementById("eventPrice") as HTMLElement;
        const ticketsLeft = document.getElementById("ticketsLeft") as HTMLElement;

        eventName.textContent = ticketedEvent.eventName;
        eventPrice.textContent = formatEther(ticketedEvent.price);
        ticketsLeft.textContent = ticketedEvent.availableTickets;


        setTimeout(() => {
            const eventContainer = document.getElementById("eventContainer") as HTMLElement;
            eventContainer.classList.remove("hide");
            welcomeMessage.classList.add("hide");
            loadingBanner.classList.add("hide")
        }, 1000);




    }
};
