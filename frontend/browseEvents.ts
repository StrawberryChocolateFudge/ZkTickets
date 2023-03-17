//TODO: I need to fetch what network I'm using
// Using the JSONRPC I need to fetch the last index of the event that was uploaded
// Then I need to display all the events, slowly loading them from the latest index
// I need to write a renderer that will insert the downloaded events one by one into the DOM

import { handleError } from "./utils";
import { getJsonRpcProviderTicketedEventIndex } from "./web3";


const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
const loadingBanner = document.getElementById("loadingBanner") as HTMLElement;

(
    async () => {
        //@ts-ignore
        await loadBigCirclesPreset(tsParticles); // this is required only if you are not using the bundle script
        //@ts-ignore
        await tsParticles.load("tsparticles", {
            preset: "bigCircles", // also "big-circles" is accepted
        });
    })();

(
    async () => {
        const eventIndex = await getJsonRpcProviderTicketedEventIndex(handleError);

    })();


    //TODO: Render the events
    // I need to hide the loading screen 
    // and I need to start rendering cards what display event data