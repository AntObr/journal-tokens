import { Config } from "./config.mjs";
// import  { HTMLText } from "@pixi/text-html";
// CONFIG.debug.hooks = true;
console.log("journal-tokens | Hello, World!");

let defaultActor = null;

class JTActor extends Actor {}

function getOrCreateDefaultActor() {
    if (!defaultActor) {
        defaultActor = new JTActor({name: "jt-actor", type: Object.keys(CONFIG.Actor.typeLabels)[0]});
    }
    return defaultActor;
}

class JTManager {
    static get allInScene() {
        return canvas.scene.getFlag(Config.ID, Config.Flags.Tokens);
    }

    static async new(journalEntry) {
        if (defaultActor === null) {
            getOrCreateDefaultActor();
        }
        const td = await defaultActor.getTokenData({name: "journal-tokens-token", img: "modules/journal-tokens/assets/1x1.png"});
        console.log(td);
        const docClass = getDocumentClass("Token");
        const token = await docClass.create(td, {parent: canvas.scene});
        console.log()
        const jt = {
            id: foundry.utils.randomID(16),
            journalId: journalEntry.id,
            tokenId: token.id,
            name: journalEntry.data.name,
            content: journalEntry.data.content
        };
        const entry = {
            [jt.id]: jt
        };
        await canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, entry);
        return jt;
    }

    static async update(jt, changes) {
        await canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[jt.id]: changes});
    }

    static delete(jt) {
        canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[`-=${jt.id}`]: null});
    }

    static getByTokenID(tokenId) {
        for (const [jtID, jt] of Object.entries(this.allInScene)) {
            if (jt.tokenId === tokenId) {
                return jt;
            }
        }
    }

    static getAllByJournalID(journalId) {
        const matches = [];
        for (const [jtID, jt] of Object.entries(this.allInScene)) {
            if (jt.journalId === journalId) {
                matches.push(jt)
            }
        }
        return matches;
    }

    static getToken(jt) {
        return canvas.tokens.get(jt.tokenId);
    }

    static getJournal(jt) {
        return game.journal.get(jt.journalId);
    }
}

async function createJT(journalEntry) {
    const jt = await JTManager.new(journalEntry);
    JTManager.getToken(jt).document.update({name: jt.name}); // , displayName: 50});
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

function handleDeleteToken(tokenDocument, options, userId) {
    const jt = JTManager.getByTokenID(tokenDocument.id);
    JTManager.delete(jt);
}

Hooks.on("deleteToken", handleDeleteToken);

function handleDeleteJournalEntry(journalEntry, options, userId) {
    const forDeletion = JTManager.getAllByJournalID(journalEntry.id);
    forDeletion.forEach((jt) => {
        canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, {[jt.id]: {journalId: ""}});
    });
}

Hooks.on("deleteJournalEntry", handleDeleteJournalEntry);

async function handleUpdateJournalEntry(journalEntry, change, options, userId) {
    const jts = JTManager.getAllByJournalID(journalEntry.id);
    for (const jt of jts) {
        const update = {
            name: change.name||journalEntry.data.name,
            content: change.content||journalEntry.data.content
        };
        await JTManager.update(jt, update); //{name: journalEntry.data.name});
        JTManager.getToken(jt).document.update(update); //{name: change.name, displayName: 50});
    }
}

Hooks.on("updateJournalEntry", handleUpdateJournalEntry);

function getJournalTokenIcon(
    name,
    content,
    width,
    height,
    margin = null,
    backgroundColor = 0xFFFFFF,
    borderColor = 0x000000,
    borderThickness = 1,
    dividerColor = 0x000000,
    dividerThickness = 2
) {
    console.log(`Creating a token icon with `)
    if (margin === null) {
        margin = width / 10;
    }
    const leftMargin = margin / 2;
    const rightMargin = leftMargin;
    const contentWidth = width - leftMargin - rightMargin;
    let graphics = new PIXI.Graphics()

    // Background
    graphics.beginFill(backgroundColor);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    // Border
    graphics.lineStyle(2, borderColor, borderThickness);
    graphics.beginFill(0x000000, 0);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    let text = new PIXI.Text(name ,{fontFamily : 'Arial', fontSize: 20, fill : 0x000000, align : 'left', wordWrap: true, wordWrapWidth: contentWidth});

    text.setTransform(leftMargin, 0);

    graphics.addChild(text);

    // Horizontal divider
    let line = new PIXI.Graphics()
    line.beginFill(dividerColor)
    line.drawRect(0, 0, contentWidth, dividerThickness);
    line.endFill();
    line.setTransform(leftMargin, text.getLocalBounds().height);
    console.log(line);
    graphics.addChild(line);

    let text2 = new PIXI.Text(content ,{fontFamily : 'Arial', fontSize: 16, fill : 0x000000, align : 'left', wordWrap: true, wordWrapWidth: contentWidth});

    text2.setTransform(leftMargin, text.getLocalBounds().height+dividerThickness);

    graphics.addChild(text2);

    // Mask
    let mask = new PIXI.Graphics();
    mask.beginFill(0x000000, 0);
    mask.drawRect(0, 0, width, height);
    mask.endFill();

    graphics.addChild(mask);
    graphics.mask = mask;
    return graphics;
}

// Hooks.once("libWrapper.Ready", () => {
//     console.log("###################################");
//     console.log("attempting register");
// 	if (!game.modules.get('lib-wrapper')?.active) {
// 		if (game.user.isGM) {
// 			ui.notifications.error("Module journal-tokens requires the 'libWrapper' module. Please install and activate it.");
// 		}
// 		return;
// 	}
//     libWrapper.register(Config.ID, 'Token.prototype._drawIcon', async function (wrapped, ...args) {
//             console.log('Token.prototype._drawIcon was called');
//             console.log(this);
//             const jt = JTManager.getByTokenID(this.id);
//             console.log(jt);
//             if (jt) {
//                 console.log("RENDERING ICON AS JOURNAL TOKEN");
//                 let graphics = getJournalTokenIcon(jt.name, jt.content, this.w, this.h);
//                 graphics.tint = this.data.tint ? foundry.utils.colorStringToHex(this.data.tint) : 0xFFFFFF;
//                 graphics.setTransform(0, 0);
//                 return graphics;
//                 // console.log(icon);
//                 // return icon;
//             }
//             else {
//                 let result = wrapped(...args);
//                 return result;
//             }
//         },
//         'MIXED'
//     );

//     libWrapper.register(Config.ID, 'Token.prototype.refresh', async function (wrapped, ...args) {
//         console.log('Token.prototype.refresh was called');
//             console.log(this);
//             const jt = JTManager.getByTokenID(this.id);
//             console.log(jt);
//             if (jt) {
//                 console.log("RENDERING AS JOURNAL TOKENS");
//                 console.log(this);
//                 let graphics = getJournalTokenIcon(jt.name, jt.content, this.w, this.h);
//                 this.icon = graphics;
//                 console.log(this.icon);
//                 return this
//                 // this.icon.removeChild(...this.icon.children);
//                 // graphics.children.forEach((child) => {
//                 //     this.icon.addChild(child);
//                 // });
//                 // this.icon.beginFill(0xFF0000);
//                 // this.icon.drawRect(0, 0, this.w, this.h);
//                 // this.icon.endFill();
//                 // let jtString = jt.name + jt.content;
//                 // let text = new PIXI.Text(jtString ,{fontFamily : 'Arial', fontSize: 24, fill : 0x000000, align : 'center', wordWrap: true, wordWrapWidth: this.w});
//                 // console.log(text);
//                 // this.icon.addChild(text);
//                 // this.icon.tint = this.data.tint ? foundry.utils.colorStringToHex(this.data.tint) : 0xFFFFFF;
//                 // console.log("###################################");
//                 // console.log("###################################");
//                 // console.log("###################################");
//                 // this.setTransform(0, 0, this.scale.x, this.scale.y, this.rotation, this.skew.x, this.skew.y, 0.5, 0.5);
//                 // console.log(this.icon);
//             }
//             let result = wrapped(...args);
//             return result;
//     }, 'MIXED');
// });

Hooks.once("libWrapper.Ready", () => {
	if (!game.modules.get('lib-wrapper')?.active) {
		if (game.user.isGM) {
			ui.notifications.error("Module journal-tokens requires the 'libWrapper' module. Please install and activate it.");
		}
		return;
	}
    libWrapper.register(Config.ID, 'Token.prototype._drawIcon', async function (wrapped, ...args) {
        const jt = JTManager.getByTokenID(this.id);
        console.log(this);
        console.log(jt);
        if (jt) {
            let icon = new PIXI.Container();
            console.log(icon);
            let graphics = getJournalTokenIcon(jt.title, jt.content, this.w, this.h);
            icon.addChild(graphics);
            // icon.setTransform(0, 0);
            return icon;
        }
        return wrapped(...args)
    }, 'MIXED');

    libWrapper.register(Config.ID, 'Token.prototype.refresh', async function (wrapped, ...args) {
        const jt = JTManager.getByTokenID(this.id);
        let result = wrapped(...args);
        console.log(jt);
        console.log(this);
        console.log(defaultActor);
        if (jt) {
            // this.icon.clear();
            let graphics = getJournalTokenIcon(jt.name, jt.content, this.w, this.h);
            this.icon.removeChild(...this.icon.children);
            this.icon.addChild(graphics);
            this.icon.setTransform(0, 0);
            console.log(this);
        }
        return result
    }, 'MIXED');
});
