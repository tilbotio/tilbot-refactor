import { construct_svelte_component } from 'svelte/internal';
import { SettingsSchema } from '../db/settings.js';
import { mongoose } from 'mongoose';

export class SettingsApiController {

    static SettingsDetails = mongoose.model('settingsschemas', SettingsSchema);

    /**
     * Managing users stored in the database.
     * @constructor
     */
    constructor() {

    }

    /**
     * Retrieve the settings belonging to the current user from database.
     * If no settings are found, create a new row and return that.
     *
     * @param {string} user - The username that owns the settings.
     * @return {SettingsSchema} Settings present in database.
     */
    static async get_settings(user) {
        const user_settings = await SettingsApiController.SettingsDetails.findOne({ user_id: user});
        if (user_settings === null) {
            const settings = await SettingsApiController.create_settings(user);
            return settings;
        } else {
            return user_settings;
        }
    }

    /**
     * Create a new settings row and store it in the database.
     *
     * @param {string} user - Username
     * @return {SettingsSchema} Created settings.
     */
    static async create_settings(user) {
        let s = new SettingsApiController.SettingsDetails();
        s.user_id = user;
        try {
            await s.save();
            console.log('saved!');
            return s;
        } catch (error) {
            if (error.toString().includes('duplicate key')) { // This should not happen
                return 'SETTINGS_ROW_EXISTS';
            }
            return error;
        }
    }

    /**
     * Update a user's settings.
     *
     * @param {string} user - User ID
     * @param {string} settings - JSON structure of settings
     */
    static async update_settings(user, settings) {
        const schema = await SettingsApiController.SettingsDetails.findOne({ user_id: user});
        if (schema !== null) {
            let settings_json = JSON.parse(settings);
            Object.keys(settings_json).forEach(function(key) {
                schema[key] = settings_json[key];
                });
            await schema.save();
            return 'OK';
        }
    }
}
