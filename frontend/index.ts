import { onboardOrSwitchNetwork } from "./web3";

const createEventButton = document.getElementById("CreateEventButton");

if (createEventButton !== null) {
    createEventButton.onclick = function () {
        console.log("create event button clicked!")
        // onboardOrSwitchNetwork();

    }
}

//TODO: I need to do the onboarding and the network switching to BTTC chain
//TODO: I need to submit the transaction to the network about the new event

//Then redirect to a new page where the user can interact with the event!