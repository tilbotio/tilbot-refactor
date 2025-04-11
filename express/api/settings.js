import { SettingsSchema } from '../db/settings.js';
import { mongoose } from 'mongoose';

export class SettingsApiController {
    static SettingsDetails = mongoose.model('settingsschemas', SettingsSchema);

    static permittedSettings = [
        'chatgpt_api_key',
        'chatgpt_version',
        'llm_setting',
        'llm_api_address',
    ];

    /**
     * Retrieve the settings belonging to the current user from database.
     * If no settings are found, create a new row and return that.
     *
     * @param {string} username - The username that owns the settings.
     * @return {SettingsSchema} Settings present in database.
     */
    static async get_settings(username) {
        return await this.SettingsDetails.findOneAndUpdate(
            { user_id: username },
            {},
            { upsert: true, new: true },
        );
    }

    /**
     * Retrieve the valid settings belonging to the current user from database.
     * If no settings are found, create a new row and return that.
     * Only returns valid settings, suitable for exposing from the API.
     *
     * @param {string} username - The username that owns the settings.
     * @return {Object} Settings present in database.
     */
    static async get_permitted_settings(username) {
        const settings = await this.get_settings(username);
        const permittedSettings = {};
        this.permittedSettings.forEach(key => {
            permittedSettings[key] = settings[key];
        });
        return permittedSettings;
    }

    /**
     * Update a user's settings.
     *
     * @param {string} username - User ID
     * @param {string} new_settings - JSON structure of settings
     */
    static async update_settings(username, new_settings) {
        const settings = await self.get_settings(username);
        // Only update permitted attributes:
        self.permittedSettings.forEach(key => {
            if (key in new_settings) {
                settings[key] = new_settings[key];
            }
        });
        await settings.save();
    }
}
