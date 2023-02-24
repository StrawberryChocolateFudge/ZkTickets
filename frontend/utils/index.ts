
//TODO: add prod app url and use the node env to decide which one to load!
export const appURL = "http://localhost:1234";


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