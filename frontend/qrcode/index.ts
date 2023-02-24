import { AwesomeQR } from "awesome-qr";

export async function createQR(noteString: string): Promise<string | Buffer | ArrayBuffer | undefined> {
    const buffer = await new AwesomeQR({
        text: noteString,
        size: 500
    }).draw();

    return buffer;
}