export const appURL = window.location.origin;

export const handleError = (msg) => {
    const snackBarElement = document.getElementById("snackbar");
    if (snackBarElement !== null) {
        snackBarElement.textContent = msg;

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
    for (let i = 0; i < elements.length; i++) {
        selectEl.innerHTML += elements[i];
    }
}

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