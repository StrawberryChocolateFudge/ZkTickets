// Used only for testing with a testpdf button element

// import { downloadPDF } from ".";
// import { createQR } from "../qrcode";
// import { getNote } from "../web3/zkp";

// export function test() {
//     const testpdf = document.getElementById("testpdf") as HTMLButtonElement;

//     testpdf.onclick = async function () {
//         const noteDetails = await getNote("0xfa2");
//         const d = noteDetails[1];
//         const dataUrl = await createQR(d) as string;
//         await downloadPDF("MY EVENT TITLE HEFKAF IS LONG LIKE THIS", "0.0001", "FTM", dataUrl, d, window.location.href)
//     }
// }