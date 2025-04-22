import { Schema } from 'mongoose';

export const SettingsSchema = new Schema({
    chatgpt_api_key: { type: String, default: '' },
    chatgpt_version: { type: String, default: '3.5' },
    llm_setting: { type: String, default: 'chatgpt' },
    llm_api_address: { type: String, default: '' },
    user_id: { type: String, required: true, unique: true },
    statics: {
        // Settings that the user is allowed to see.
        permittedSettings: [
            'chatgpt_api_key',
            'chatgpt_version',
            'llm_setting',
            'llm_api_address',
        ],

        /**
        * Retrieve the settings belonging to a user from database.
        * If no settings are found, create a new row and return that.
        *
        * @param {string} username - The username that owns the settings.
        * @return {SettingsSchema} Settings present in database.
        */
        async getOrCreate(username) {
            return await SettingsSchema.findOneAndUpdate(
                { user_id: username },
                {},
                { upsert: true, new: true },
            );
        },
    },
    methods: {
        /**
        * Create a summary of settings, containing only settings suitable for
        * exposing from the API.
        *
        * @return {Object} Settings present in database.
        */
        getPermitted() {
            const summary = {};
            this.permittedSettings.forEach(key => {
                summary[key] = this[key];
            });
            return summary;
        },

        /**
        * Update a user's settings, only accepting permitted keys.
        *
        * @param {string} new_settings - JSON structure of settings
        */
        async update(new_settings) {
            // Only update permitted attributes:
            this.permittedSettings.forEach(key => {
                if (key in new_settings) {
                    this[key] = new_settings[key];
                }
            });
            await settings.save();
        },
    },
});
