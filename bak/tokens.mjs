import { JTActor } from "./actors.mjs";

let defaultActor = null;

export async function newJTToken() {
    if (defaultActor === null) {
        createDefaultActor();
    }
    const td = defaultActor.getTokenData({});
    const docClass = getDocumentClass("Token");
    return await docClass.create(td, {parent: canvas.scene});
}

function createDefaultActor() {
    defaultActor = new JTActor({name: "Journal Tokens Default Actor", type: "character"});
}