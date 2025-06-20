import { Schema, Document, Model, model } from 'mongoose';

export interface SettingsSchemaInterface extends Document {
    chatgpt_api_key: string;
    chatgpt_version: string;
    llm_setting: string;
    llm_api_address: string;
    user_id: string;
    // Instance methods go here
    updatePermitted(settings: Record<string, any>): Promise<void>;
    getPermitted(): Promise<Record<string, any>>;
}

export interface SettingsModelInterface extends Model<SettingsSchemaInterface> {
    permittedSettings: string[];
    // Static methods go here
    getOrCreate(username: string): Promise<SettingsSchemaInterface>;
}

export const SettingsSchema = new Schema<SettingsSchemaInterface>({
    chatgpt_api_key: { type: String, default: '' },
    chatgpt_version: { type: String, default: '3.5' },
    llm_setting: { type: String, default: 'chatgpt' },
    llm_api_address: { type: String, default: '' },
    user_id: { type: String, required: true, unique: true },
}, {
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
        * @param username - The username that owns the settings.
        * @return Settings present in database.
        */
        async getOrCreate(username: string): Promise<SettingsSchemaInterface> {
            return await SettingsModel.findOneAndUpdate(
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
        * @return Settings present in database.
        */
        getPermitted(): Record<string, any> {
            const summary = {};
            const constructor: any = this.constructor;
            for (const key of constructor.permittedSettings) {
                summary[key] = this[key];
            }
            return summary;
        },

        /**
        * Update a user's settings, only accepting permitted keys.
        *
        * @param new_settings - JSON structure of settings
        */
        async updatePermitted(new_settings: Record<string, any>) {
            // Only update permitted attributes:
            const constructor: any = this.constructor;
            for (const key of constructor.permittedSettings) {
                if (key in new_settings) {
                    this[key] = new_settings[key];
                }
            }
            await this.save();
        },
    },
});

export const SettingsModel = model<SettingsSchemaInterface, SettingsModelInterface>('settings', SettingsSchema);
