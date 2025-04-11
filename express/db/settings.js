import { Schema } from 'mongoose';

let SettingsSchema = new Schema({
    chatgpt_api_key: {type: String, default: ''},
    chatgpt_version: {type: String, default: '3.5'},
    llm_setting: {type: String, default: 'chatgpt'},
    llm_api_address: {type: String, default: ''},
    user_id: {type: String, required: true, unique: true},
});

export { SettingsSchema };
