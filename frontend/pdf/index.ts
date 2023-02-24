import { jsPDF } from "jspdf";

function splitTitle(eventTitle) {
    let firstHalf = "";
    let secondHalf = "";
    let pushToFirst = true;

    const words = eventTitle.split(" ");

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (firstHalf.length + word.length >= 30) {
            pushToFirst = false;
        }

        if (pushToFirst) {

            if (firstHalf === "") {
                firstHalf += word;
            } else {
                firstHalf += " " + word;
            }
        } else {
            if (secondHalf === "") {
                secondHalf += word;
            } else {
                secondHalf += " " + word;
            }
        }
    }

    return [firstHalf, secondHalf];
}

export async function downloadPDF(eventTitle: string, eventPrice: string, currency: string, dataUrl: string, noteString: string, handlerLink: string) {

    const [firstHalf, secondHalf] = splitTitle(eventTitle);

    let doc = new jsPDF("l", "px", "credit-card");

    doc.setFontSize(6);
    doc.text(`Single use Ticket purchased for ${eventPrice} ${currency}.`, 16, 25);
    doc.addImage(dataUrl, "JPEG", 15, 32, 40, 40);
    doc.setFontSize(10);
    doc.text(firstHalf, 70, 40);
    if (secondHalf !== "") {
        doc.text(secondHalf, 70, 50);
    }
    doc.setFontSize(4);
    doc.text("Ticket link:", 70, 65)
    doc.text(`${handlerLink}`, 70, 70);
    doc.setFontSize(2);
    doc.text(noteString, 16, 85);
    doc.save(`ZkTicket-${eventTitle}.pdf`)
}

