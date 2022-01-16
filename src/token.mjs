import { Config } from "./config.mjs";
import { HTMLText } from "@pixi/text-html/dist/html-text.es";

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

    // Name/Title
    let text = new PIXI.Text(name ,{fontFamily : 'Arial', fontSize: 20, fill : 0x000000, align : 'left', wordWrap: true, wordWrapWidth: contentWidth});

    text.setTransform(leftMargin, 0);

    graphics.addChild(text);

    // Horizontal divider
    let line = new PIXI.Graphics()
    line.beginFill(dividerColor)
    line.drawRect(0, 0, contentWidth, dividerThickness);
    line.endFill();
    line.setTransform(leftMargin, text.getLocalBounds().height);
    graphics.addChild(line);

    // Content
    const style = new PIXI.TextStyle({
        fontSize: 16,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: contentWidth
    });
    let text2 = new HTMLText(content, style);

    text2.setTransform(leftMargin, text.getLocalBounds().height + dividerThickness);

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

export function drawIconWrapper(wrapped, ...args) {
    const journalEntryID = this.document.getFlag(Config.ID, Config.Flags.JournalEntryID);
    if (journalEntryID) {
        const journalEntry = game.journal.get(journalEntryID);
        let icon = new PIXI.Container();
        let graphics = getJournalTokenIcon(journalEntry.data.title, journalEntry.data.content, this.w, this.h);
        graphics.tint = this.data.tint ? foundry.utils.colorStringToHex(this.data.tint) : 0xFFFFFF;
        icon.addChild(graphics);
        return icon;
    }
    return wrapped(...args)
}

export function refreshWrapper(wrapped, ...args) {
    let result = wrapped(...args);
    const journalEntryID = this.document.getFlag(Config.ID, Config.Flags.JournalEntryID);
    if (journalEntryID) {
        const journalEntry = game.journal.get(journalEntryID);
        let graphics = getJournalTokenIcon(journalEntry.data.name, journalEntry.data.content, this.w, this.h);
        graphics.tint = this.data.tint ? foundry.utils.colorStringToHex(this.data.tint) : 0xFFFFFF;
        this.icon.removeChild(...this.icon.children);
        this.icon.addChild(graphics);
        this.icon.setTransform(0, 0);
    }
    return result
}

export function handleUpdateJournalEntry(journalEntry, change, options, userId) {
    for (let tok of canvas.tokens.placeables) {
        const journalEntryID = tok.document.getFlag(Config.ID, Config.Flags.JournalEntryID);
        if (journalEntryID) {
            console.log("Calling refresh on");
            console.log(tok);
            tok.refresh();
        }
    }
}