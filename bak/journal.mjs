import { Config } from "./config.mjs";

export async function addCreateTokenToContextMenu(_html, contextEntries) {
    contextEntries.push({
        name: "to token",
        icon: `<i class="fas fa-code"></i>`,
        callback: async data => {
            const journalEntry = game.journal.get(data[0].dataset.entityId || data[0].dataset.documentId);
            Hooks.call(Config.Hooks.CreateJT, journalEntry, {}, game.userId);
        }
    });
}