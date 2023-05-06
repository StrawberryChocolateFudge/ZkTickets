import { jsPDF } from "jspdf";

export async function downloadPDF(eventTitle: string, eventPrice: string, currency: string, dataUrl: string, noteString: string, handlerLink: string) {


    let doc = new jsPDF("l", "px", "credit-card");
    doc.addImage(dataUrl, "JPEG", 1, 1, 85, 85);
    doc.setFontSize(10);
    let maxLineWidth = 100;
    let textLines = doc.splitTextToSize(eventTitle, maxLineWidth)
    doc.text(textLines, 85, 25);

    doc.setFontSize(15);
    doc.text(`Single use Ticket`, 85, 12);

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

