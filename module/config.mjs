export const Config = {
    ID: "journal-tokens",
    Flags: {
        Tokens: "journal-token-entities",
        TokenJournalFields: "token-journal-fields"
    },
    Hooks: {
        CreateJT: "createJT",
        UpdateJT: "updateJT",
        deleteJT: "deleteJT",
        CreateJTToken: "createJTToken",
        UpdateJTToken: "updateJTToken"
    }
}