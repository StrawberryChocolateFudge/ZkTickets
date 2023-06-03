import Decimal from "decimal.js";
import { BigNumber } from "ethers";
import { formatEther, ZEROADDRESS } from "../web3";

export const appURL = window.location.origin;

export const handleError = (msg) => {
    const snackBarElement = document.getElementById("snackbar");
    if (snackBarElement !== null) {
        snackBarElement.textContent = msg.toLocaleUpperCase();

        // Add the "show" class to DIV
        snackBarElement.className = "show";

        // After 3 seconds, remove the show class from DIV
        setTimeout(function () { snackBarElement.className = snackBarElement.className.replace("show", ""); }, 3000);
    }
}

export const getEventIndex = () => {
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);

    if (searchParams.has("i")) {
        const index = searchParams.get("i") as string;
        if (isNaN(parseInt(index))) {

            handleError("Invalid Event Index");
            return false;
        }
        return index;

    }
}

export function createNewImgElement(src) {
    const imgEl = document.createElement("img");
    imgEl.classList.add("inputImage");
    imgEl.width = 25;
    imgEl.src = src;
    return imgEl;
}

export function createNewTooltipText(txt) {
    const divEl = document.createElement("div");
    divEl.classList.add("tooltiptext");
    divEl.innerText = txt;
    return divEl;
}


export function createOptionElements(allowSpeculation: boolean) {
    let elements = Array<string>(3);
    elements.push(`<option value="Transfer">Transfer</option>`);
    elements.push(`<option value="Refund">Refund</option>`);
    if (allowSpeculation) {
        elements.push(`<option value="Resale">Resale</option>`)
    }
    return elements;
}

export function appendOptionsElementsTo(selectEl: HTMLElement, elements: Array<string>) {

    if (selectEl.innerHTML === "") {
        for (let i = 0; i < elements.length; i++) {
            selectEl.innerHTML += elements[i];
        }
    }
}


function calculatePriceFee(price) {
    const resalePrice = new Decimal(formatEther(price));
    const doubleFee = resalePrice.div(100).mul(2);
    const priceWithFee = resalePrice.add(doubleFee).toNumber();
    return `${priceWithFee}`
}

function getPriceWithoutFee(price, currency) {
    return `<span class="initialFont">${formatEther(price)} ${currency}</span>`
}


function getTransferTo(address) {
    if (address === ZEROADDRESS) {
        return `<span class="initialFont">Anyone</span>`
    } else {
        return shortenAddress(address)
    }

}

export const shortenAddress = (address: string) => `<div class="tooltip"><span class="initialFont">${address.substring(0, 6)}...${address.substring(address.length - 6)}</span><div class="tooltipTextCenter>${address}</div></div>`


export function appendTooltip(parent, child1, child2) {
    parent.appendChild(child1);
    if (child2) {
        parent.appendChild(child2)
    }
}

export function triggerOverlay(to: boolean) {
    const overlay = document.getElementById("overlay") as HTMLDivElement;
    if (to) {
        overlay.style.display = "block";
    } else {
        overlay.style.display = "none";
    }
}

export function showOrHideIfPossible(show: boolean, el: HTMLElement) {
    if (show) {
        if (el.classList.contains("hide")) {
            el.classList.remove("hide");
        }
    } else {
        if (!el.classList.contains("hide")) {
            el.classList.add("hide")
        }
    }
}


export const getTotalPages = (length, size) => {
    if (length === 0) {
        return 1;
    }
    const divided = new Decimal(length).dividedBy(size);
    const split = divided.toString().split(".");

    if (split[0] === "0") {
        return 1;
    }

    if (split[1] === undefined) {
        return parseInt(split[0]);
    }

    return parseInt(split[0]) + 1;
};

export function bigNumberIndexesToNumber(list: Array<BigNumber>) {
    let indexes: Array<number> = []
    for (let i = 0; i < list.length; i++) {
        indexes.push(list[i].toNumber());
    }
    return indexes;
}

export function getCurrentPageRequestIndexes(currentPage: number, list: Array<BigNumber>) {
    let elements: Array<number> = [];
    for (let i = 0; i < list.length; i++) {
        if (getTotalPages(i, 5) === currentPage) {
            elements.push(list[i].toNumber())
        }
    }
    return elements;
}
