import { Config } from "./config.mjs";
import { handleGetJournalDirectoryEntryContext } from "./journal-entry.mjs";
import { refreshWrapper, drawIconWrapper, handleUpdateJournalEntry } from "./token.mjs";

// Add "To Journal Token" button to the Journal Entry context menu [ ]
// * Create a new Token [x]
// * Attach Journal Entry [x]
// * Copy default settings to new Token [ ]
Hooks.on("getJournalDirectoryEntryContext", handleGetJournalDirectoryEntryContext);

// Add "Journal Token Config" button to the Journal Entry context menu [ ]
// * Allow modification of rendering settings [ ]
// * Update child tokens button? [ ]

// Wrap Token.prototype._drawIcon and Token.prototype.refresh to render from Journal Entry [x]
Hooks.once("libWrapper.Ready", () => {
    if (!game.modules.get('lib-wrapper')?.active) {
		if (game.user.isGM) {
			ui.notifications.error("Module 'journal-tokens' requires the 'libWrapper' module. Please install and activate it.");
		}
		return;
	}
    libWrapper.register(Config.ID, 'Token.prototype._drawIcon', drawIconWrapper, 'MIXED');
    libWrapper.register(Config.ID, 'Token.prototype.refresh', refreshWrapper, 'MIXED');
});

// Refresh Token when Journal Entry updated [x]
Hooks.on("updateJournalEntry", handleUpdateJournalEntry);

// Add "Journal Token Config" to Token Config window [ ]
// * Allow modification of rendering settings [ ]
// * Update defaults from token button? [ ]

// Open Journal Entry when clicking on Journal Token [ ]