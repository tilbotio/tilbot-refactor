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
    static get_settings(user) {
        return new Promise(resolve => {
            SettingsApiController.SettingsDetails.findOne({ user_id: user }).then(function(settings) {
                if (settings === null) {
                    SettingsApiController.create_settings(user).then(function(settings) {
                        resolve(settings);
                    })
                }
                else {
                    resolve(settings);
                }
            });
        });
    }      
    
    /**
     * Create a new settings row and store it in the database.
     *
     * @param {string} user - Username
     * @return {SettingsSchema} Created settings.
     */
    static create_settings(user) {
        return new Promise(resolve => {
            var s = new SettingsApiController.SettingsDetails();
            s.user_id = user;

            s.save().then(function(e) {
                console.log('saved!');
                resolve(s);
            }).catch(function(error) {
                if (error.toString().includes('duplicate key')) { // This should not happen
                    resolve('SETTINGS_ROW_EXISTS');
                }
                resolve(error);
            });
        });
    }    

    /**
     * Update a user's settings.
     *
     * @param {string} user - User ID
     * @param {string} settings - JSON structure of settings
     */    
    static update_settings(user, settings) {
        return new Promise(resolve => {
            SettingsApiController.SettingsDetails.findOne({ user_id: user }).then(function(schema) {
                if (schema !== null) {
                    let settings_json = JSON.parse(settings);

                    Object.keys(settings_json).forEach(function(key) {
                        schema[key] = settings_json[key];
                    });

                    schema.save().then(function() {
                        resolve('OK');
                    });            
                }
            });        
        })
    }    
        
}