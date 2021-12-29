import { Config } from "./config.mjs";

console.log("journal-tokens | Hello, World!");

let defaultActor = null;

class JTActor extends Actor {}

function createDefaultActor() {
    defaultActor = new JTActor({name: "Journal Tokens Default Actor", type: "character"});
}

async function createJT(journalEntry) {
    if (defaultActor === null) {
        createDefaultActor();
    }
    const td = defaultActor.getTokenData({});
    const docClass = getDocumentClass("Token");
    const token = await docClass.create(td, {parent: canvas.scene});
    const jt = {
        id: foundry.utils.randomID(16),
        journalId: journalEntry.id,
        tokenId: token.id,
        name: journalEntry.data.name,
        content: journalEntry.data.content
    };
    token.data.document.update({name: jt.name, displayName: 50});
    console.log(token);
    token.setFlag(Config.ID, Config.Flags.TokenJournalFields, {name: jt.name, content: jt.content});
    const entry = {
        [jt.id]: jt
    };
    await canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, entry);
}

Hooks.on("getJournalDirectoryEntryContext", (_html, contextEntries) => {
    contextEntries.push({
        name: "to token",
        icon: `<i class="fas fa-code"></i>`,
        callback: async data => {
            const journalEntry = game.journal.get(data[0].dataset.entityId || data[0].dataset.documentId);
            createJT(journalEntry);
        }
    });
});

function handleUpdateJournalEntry(journalEntry, change, options, userId) {
    for (const [jtID, jt] of Object.entries(canvas.scene.getFlag(Config.ID, Config.Flags.Tokens))) {
        if (jt.journalId === journalEntry.id) {
            const update = {
                name: change.name||journalEntry.data.name,
                content: change.content||journalEntry.data.content
            };
            canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[jtID]: update});
            const token = canvas.tokens.get(jt.tokenId);
            token.data.document.update({name: update.name});
            token.document.setFlag(Config.ID, Config.Flags.TokenJournalFields, update);
        }
    }
}

Hooks.on("updateJournalEntry", handleUpdateJournalEntry);

function handleDeleteJournalEntry(journalEntry, options, userId) {
    const forDeletion = [];
    for (const [jtID, jt] of Object.entries(canvas.scene.getFlag(Config.ID, Config.Flags.Tokens))) {
        if (jt.journalId === journalEntry.id) {
            forDeletion.push(jt);
        }
    }
    forDeletion.forEach((jt) => {
        canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[`-=${jt.id}`]: null});
    }, forDeletion);
    canvas.scene.deleteEmbeddedDocuments("Token", forDeletion.map((value) => {return value.a}));
}

Hooks.on("deleteJournalEntry", handleDeleteJournalEntry);

function handleDeleteToken(jt, options, userId) {
    canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[`-=${jt.id}`]: null});
}

Hooks.on("deleteToken", handleDeleteToken);


// class JournalEntryManager {
//     static handleGetJournalDirectoryEntryContext(_html, contextEntries) {
//         contextEntries.push({
//             name: "to token",
//             icon: `<i class="fas fa-code"></i>`,
//             callback: async data => {
//                 const journalEntry = game.journal.get(data[0].dataset.entityId || data[0].dataset.documentId);
//                 Hooks.call(Config.Hooks.CreateJT, journalEntry, {}, game.userId);
//             }
//         });
//     }

//     static handleUpdateJournalEntry(journalEntry, change, options, userId) {
//         for (const [jtID, jt] of Object.entries(JTManager.allJournalTokensInActiveScene)) {
//             if (jt.journalId === journalEntry.id) {
//                 Hooks.call(Config.Hooks.UpdateJT, jt, {name: change.name, content: change,content}, userId);
//             }
//         }
//     }

//     static handleDeleteJournalEntry(journalEntry, options, userId) {
//         const forDeletion = [];
//         for (const [jtID, jt] of Object.entries(JTManager.allJournalTokensInActiveScene)) {
//             if (jt.journalId === journalEntry.id) {
//                 forDeletion.push(jt);
//             }
//         }
//         forDeletion.forEach((jt) => {
//             Hooks.call(Config.Hooks.DeleteJT, jt, userId);
//         }, forDeletion);
//     }
// }

// Hooks.on("getJournalDirectoryEntryContext", JournalEntryManager.handleGetJournalDirectoryEntryContext);
// Hooks.on("updateJournalEntry", JournalEntryManager.handleUpdateJournalEntry);
// Hooks.on("deleteJournalEntry", JournalEntryManager.handleDeleteJournalEntry);

// class JTManager {
//     static async handleCreateJT(journalEntry, options, userId) {
//         const jt = JTManager.createJournalTokenInActiveScene(journalEntry);
//         Hooks.call(Config.Hooks.CreateJTToken, jt, options, userId);
//         // wut
//     }

//     static handleUpdateJT(jt, update, userId) {
//         const updatedJT = JTManager.updateJournalTokenInActiveScene(jt.id, update);
//         Hooks.call(Config.Hooks.UpdateJTToken, updatedJT, update, userId);
//     }

//     static handleDeleteJT(jt, userId) {
//         JTManager.deleteJournalTokenInActiveScene(jt.id);
//     }

//     static get allJournalTokensInActiveScene() {
//         return canvas.scene.getFlag(Config.ID, Config.Flags.Tokens);
//     }

//     static getJournalTokenInActiveScene(jtID) {
//         return canvas.scene.getFlag(Config.ID, Config.Flags.Tokens)[jtID];
//     }

//     static getJournalTokenByTokenIDInActiveScene(tokenID) {
//         for (const [jtID, jt] of Object.entries(canvas.scene.getFlag(Config.ID, Config.Flags.Tokens))) {
//             if (jt.tokenID === tokenID) {
//                 return jt;
//             }
//         }
//     }

//     static async createJournalTokenInActiveScene(journalEntry) {
//         const jt = {
//             id: foundry.utils.randomID(16),
//             journalId: journalEntry.id,
//             title: journalEntry.data.name,
//             content: journalEntry.data.content,
//         };
//         const entry = {
//             [jt.id]: jt
//         };
//         await canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, entry);
//         return jt
//     }

//     static updateJournalTokenInActiveScene(jtID, update) {
//         canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[jtID]: update});
//         return canvas.scene.getFlag(Config.ID, Config.Flags.Tokens)[jtID];
//     }

//     static deleteJournalTokenInActiveScene(jtID) {
//         canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[`-=${jtID}`]: null});
//         // TODO: Broadcast hook
//     }

//     static _deleteAllJournalTokensInActiveScene() {
//         return canvas.scene.unsetFlag(Config.ID, Config.Flags.Tokens);
//     }
// }

// Hooks.on(Config.Hooks.CreateJT, JTManager.handleCreateJT);
// Hooks.on(Config.Hooks.UpdateJT, JTManager.handleUpdateJT);
// Hooks.on(Config.Hooks.DeleteJT, JTManager.handleDeleteJT);


// let defaultActor = null;

// async function newJTToken() {
//     if (defaultActor === null) {
//         createDefaultActor();
//     }
//     const td = defaultActor.getTokenData({});
//     const docClass = getDocumentClass("Token");
//     return await docClass.create(td, {parent: canvas.scene});
// }

// function createDefaultActor() {
//     defaultActor = new JTActor({name: "Journal Tokens Default Actor", type: "character"});
// }

// class TokenManager {
//     static async handleCreateJTToken(jt, options, userId) {
//         const token = await newJTToken();
//         token.data.document.setFlag(Config.ID, Config.Flags.TokenJournalFields, {title: jt.title, content: jt.content});
//         Hooks.call(Config.Hooks.UpdateJT, jt, {tokenId: token.id}, userId);
//     }

//     static handleUpdateJTToken(jt, update, userId) {
//         const token = canvas.tokens.get(jt.tokenId);
//         token.data.document.setFlag(Config.ID, Config.Flags.TokenJournalFields, {title: jt.title, content: jt.content});

//     }

//     static handleDeleteToken(tokenDocument, options, userId) {
//         const jt = JTManager.getJournalTokenByTokenIDInActiveScene(tokenDocument.id);
//         Hooks.call(Config.Hooks.DeleteJT, jt, userId);
//     }

//     static handleDeleteJT(jt, userID) {
//         JTManager.deleteJournalTokenInActiveScene(jt.id);
//     }


// }

// Hooks.on(Config.Hooks.CreateJTToken, TokenManager.handleCreateJTToken);
// Hooks.on(Config.Hooks.UpdateJTToken, TokenManager.handleUpdateJTToken);
// Hooks.on("deleteToken", TokenManager.handleDeleteToken);
// Hooks.on(Config.Hooks.DeleteJT, TokenManager.handleDeleteJT);
// // Hooks.once("canvasReady", () => {JTManager.handleCreateJT(game.journal.get("1fQlJs09pve6tjUG"), {}, game.userId)});