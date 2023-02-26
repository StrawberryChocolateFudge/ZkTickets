import { jsPDF } from "jspdf";

function splitTitle(eventTitle) {
    let firstHalf = "";
    let secondHalf = "";
    let thirdHalf = "";
    let pushTo = "first";

    const words = eventTitle.split(" ");

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (firstHalf.length + word.length >= 20) {
            pushTo = "second";
        }
        if (secondHalf.length + word.length >= 20) {
            pushTo = "third"
        }

        switch (pushTo) {
            case "first":
                if (firstHalf === "") {
                    firstHalf += word;
                } else {
                    firstHalf += " " + word;
                }
                break;
            case "second":
                if (secondHalf === "") {
                    secondHalf += word;
                } else {
                    secondHalf += " " + word;
                }
                break;
            case "third":
                if (thirdHalf === "") {
                    thirdHalf += word;
                } else {
                    thirdHalf += " " + word;
                }
                break;
            default:
                break;
        }

    }

    return [firstHalf, secondHalf, thirdHalf];
}

export async function downloadPDF(eventTitle: string, eventPrice: string, currency: string, dataUrl: string, noteString: string, handlerLink: string) {

    const [firstHalf, secondHalf, thirdHalf] = splitTitle(eventTitle);

    let doc = new jsPDF("l", "px", "credit-card");
    doc.addImage(dataUrl, "JPEG", 1, 1, 85, 85);
    doc.setFontSize(10);
    doc.text(firstHalf, 85, 45);
    if (secondHalf !== "") {
        doc.text(secondHalf, 85, 55);
    }

    if (thirdHalf !== "") {
        doc.text(thirdHalf, 85, 65)
    }
    doc.setFontSize(15);
    doc.text(`Single use Ticket`, 85, 12);

    doc.setFontSize(10);
    doc.text(`${eventPrice} ${currency}`, 85, 22);

    doc.setFontSize(8);
    doc.text(`${handlerLink}`, 5, 95);
    doc.setFontSize(3);
    doc.text(noteString, 5, 105);
    doc.save(`ZkTicket-${eventTitle}.pdf`)

    // For testing I opened it in another window!
    // var string = doc.output('datauristring');
    // var embed = "<embed width='100%' height='100%' src='" + string + "'/>"
    // var x = window.open() as Window;
    // x.document.open();
    // x.document.write(embed);
    // x.document.close();
}

