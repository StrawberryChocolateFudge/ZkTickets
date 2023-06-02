import Decimal from "decimal.js";
import { BigNumber } from "ethers";
import { formatEther, getCurrencyFromNetId, getNetworkFromSubdomain, requestHashIdentifier, TransferStatus, TransferType, ZEROADDRESS } from "../web3";

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

export function renderRequestRows(requestIndexes, requestResults, appendTo: HTMLElement, renderCallback, eventName) {
    const [CONTRACTADDRESS, NETID, RPCURL] = getNetworkFromSubdomain();

    const currency = getCurrencyFromNetId(NETID);
    appendTo.innerHTML = "";
    if (requestIndexes.length === 0) {
        appendTo.appendChild(renderNothingToShow())
    } else {
        for (let i = 0; i < requestIndexes.length; i++) {
            const tr = renderCallback(requestResults[i], requestIndexes[i], currency, eventName) as HTMLElement;
            tr.classList.add("shadowedTr");
            if (tr.children.length === 0) {
                // This is an edgec-case that occurs sometimes...
                return appendTo.appendChild(renderNothingToShow())
            } else {
                appendTo.appendChild(tr);
            }
        }
    }
}

export function createRequestsByMeTR(transferRequest, requestIndex, currency, eventName) {
    const el = document.createElement("tr");
    const cancelEl = document.createElement("td");

    let price = formatEther(transferRequest.price);

    const cancelButton = `<button class="button-53 cancelButton" data-eventname="${eventName}" data-requestindex="${requestIndex}"> Cancel ${price} ${currency} ${getTransferType(transferRequest.transferType)} </button>`;

    if (transferRequest.status === TransferStatus.INITIATED) {
        cancelEl.innerHTML = cancelButton;
        el.appendChild(cancelEl);
    }


    return el;
}
function renderNothingToShow() {
    const el = document.createElement("tr");
    el.classList.add("shadowedTr");
    const td = document.createElement("td");
    td.innerHTML = `<div class="centered-row"><h2>NOTHING TO SHOW :) </h2></div>`
    el.appendChild(td);
    return el;
}

export function createRequestsToMeTR(transferRequest, requestIndex, currency, eventName) {

    const el = document.createElement("tr");
    const acceptEl = document.createElement("td");

    let originalPrice = formatEther(transferRequest.price);
    let price = originalPrice
    if (transferRequest.transferType === TransferType.RESALE) {
        price = calculatePriceFee(transferRequest.price);
    }

    const acceptButton = `<button class="button-53 acceptButton" data-eventname="${eventName}" data-type="${transferRequest.transferType}" data-price="${originalPrice}" data-requestindex="${requestIndex}">Accept ${price} ${currency} ${getTransferType(transferRequest.transferType)}</button>`;

    if (transferRequest.status === TransferStatus.INITIATED) {
        acceptEl.innerHTML = acceptButton;
        el.appendChild(acceptEl);

    }


    return el;
}

export function createOpenRequestsTR(transferRequest, requestIndex, currency, eventName) {

    const el = document.createElement("tr");
    const acceptEl = document.createElement("td");

    let originalPrice = formatEther(transferRequest.price);
    let price = calculatePriceFee(transferRequest.price);

    if (transferRequest.status === TransferStatus.INITIATED) {
        acceptEl.innerHTML = `<button class="button-53 buyButton" data-eventname="${eventName}" data-price="${originalPrice}" data-requestindex="${requestIndex}">Buy for ${price} ${currency}</button>`
        el.appendChild(acceptEl);

    }

    return el;

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

function getTransferRequestStatus(status) {
    switch (status) {
        case TransferStatus.INITIATED:
            return "Initiated";
        case TransferStatus.CANCELLED:
            return "Cancelled";
        case TransferStatus.FINISHED:
            return "Finished";
        default:
            return ""
    }
}

function getTransferType(transferType) {
    switch (transferType) {
        case TransferType.TRANSFER:
            return `Transfer`;
        case TransferType.RESALE:
            return `Resale`;
        case TransferType.REFUND:
            return `Refund`;
        default:
            return "";
    }
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


export function getPageRequestIndexesToFetch(
    list: Array<number>,
    userAddress: string,
    contractAddress: string,
    eventIndex: string) {

    // I need to hash the userAddress with the contract address and the id of the request and use it as key to save a boolean in local storage
    // to filter out page request transactions that are used already

    let filteredIndexes: Array<number> = [];

    for (let i = 0; i < list.length; i++) {
        const requestHashId = requestHashIdentifier(
            contractAddress,
            userAddress,
            eventIndex,
            list[i].toString())
        const dontfetch = checkRequestHashIdShouldFetchInLocalStorage(requestHashId);
        if (!dontfetch) {
            filteredIndexes.push(list[i]);
        }
    }
    return filteredIndexes;
}

export function setPageRequestIndexesToNotFetch(
    indexes: Array<number>,
    requests: Array<any>,
    contractAddress: string,
    userAddress: string,
    eventIndex: string) {
    for (let i = 0; i < indexes.length; i++) {
        if (requests[i].status !== 0) {
            const requestHashId = requestHashIdentifier(
                contractAddress,
                userAddress,
                eventIndex,
                indexes[i].toString())
            setRequestHashIdInLocalStorage(requestHashId);
        }
    }
}

export function checkRequestHashIdShouldFetchInLocalStorage(requestHashId: string): boolean {
    const shouldFetch = localStorage.getItem(requestHashId);
    if (shouldFetch === "dontfetch") {
        return true;
    }
    return false;
}

export function setRequestHashIdInLocalStorage(requestHashId: string) {
    localStorage.setItem(requestHashId, "dontfetch");
}