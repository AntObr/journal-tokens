import { JTManager } from "./data.mjs";
import { newJTToken } from "./tokens.mjs";

export async function handleJournalTokenCreated(jtID) {
    const token = await newJTToken();
    JTManager.updateJournalTokenInActiveScene(jtID, {tokenID: token.id});
}

export async function handleJournalTokenDeleted(tokenDocument, options, userId) {
    const jt = JTManager.getJournalTokenByTokenIDInActiveScene(tokenDocument.id);
    JTManager.deleteJournalTokenInActiveScene(jt.id);
}

export async function handleDeleteJournalEntry(journalEntry, options, userId) {
    const jtIDs = [];
    for (const [jtID, jt] of Object.entries(JTManager.allJournalTokensInActiveScene)) {
        if (jt.journalId === journalEntry.id) {
            jtIDs.push(jtID);
        }
    }
    for (const jtID of jtIDs) {
        JTManager.deleteJournalTokenInActiveScene(jtID);
    }
}