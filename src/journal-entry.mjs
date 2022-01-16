import { Config } from "./config.mjs";

let defaultActor = null;

class JTActor extends Actor {}

function getOrCreateDefaultActor() {
    if (!defaultActor) {
        defaultActor = new JTActor({name: "jt-actor", type: Object.keys(CONFIG.Actor.typeLabels)[0]});
    }
    return defaultActor;
}

async function newJTFromJournalEntry(journalEntry) {
    if (defaultActor === null) {
        getOrCreateDefaultActor();
    }
    const td = await defaultActor.getTokenData({name: "journal-tokens-token", img: "modules/journal-tokens/assets/1x1.png"});
    const docClass = getDocumentClass("Token");
    const tokenDocument = await docClass.create(td, {parent: canvas.scene});
    tokenDocument.setFlag(Config.ID, Config.Flags.JournalEntryID, journalEntry.id);
    tokenDocument.update({name: journalEntry.data.name, displayName: 50});
    return tokenDocument;
}

export async function handleGetJournalDirectoryEntryContext(_html, contextEntries) {
    contextEntries.push({
        name: "to token",
        icon: `<i class="fas fa-code"></i>`,
        callback: async data => {
            const journalEntry = game.journal.get(data[0].dataset.entityId || data[0].dataset.documentId);
            newJTFromJournalEntry(journalEntry);
        }
    });
}
