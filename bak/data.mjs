import { Config } from "./config.mjs"

export class JTManager {

    static _setFlag(value) {
        return canvas.scene.setFlag(Config.ID, Config.Flags.Tokens, value);
    }

    static get _getFlag() {
        return canvas.scene.getFlag(Config.ID, Config.Flags.Tokens);
    }

    static get allJournalTokensInActiveScene() {
        return this._getFlag;
    }

    static getJournalTokenInActiveScene(jtID) {
        return this._getFlag[jtID];
    }

    static getJournalTokenByTokenIDInActiveScene(tokenID) {
        for (const [jtID, jt] of Object.entries(this._getFlag)) {
            if (jt.tokenID === tokenID) {
                return jt;
            }
        }
    }

    static createJournalTokenInActiveScene(journalEntry) {
        const jt = {
            id: foundry.utils.randomID(16),
            journalId: journalEntry.id,
            title: journalEntry.data.name,
            content: journalEntry.data.content,
        };
        const entry = {
            [jt.id]: jt
        };
        this._setFlag(entry);
        Hooks.call(Config.Hooks.JournalTokenCreated, jt.id);
    }

    static updateJournalTokenInActiveScene(jtID, update) {
        this._setFlag({[jtID]: update});
        // TODO: Broadcast hook
    }

    static deleteJournalTokenInActiveScene(jtID) {
        this._setFlag({[`-=${jtID}`]: null});
        // TODO: Broadcast hook
    }

    static _deleteAllJournalTokensInActiveScene() {
        return canvas.scene.unsetFlag(Config.ID, Config.Flags.Tokens);
    }
}