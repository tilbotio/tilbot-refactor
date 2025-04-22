import { Schema } from 'mongoose';
import { SettingsSchema } from './settings.js';
import pkg from 'mongoose-bcrypt';
import {
    TilBotUserNotFoundError,
    TilBotBadPasswordError,
    TilBotUserExistsError,
} from '../errors.js';

export const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, bcrypt: true },
    role: { type: Number, required: true, default: 1 },
    active: { type: Boolean, default: true },
    statics: {
        /**
        * Retrieve active user by username
        *
        * @param {String} username - The username to search for.
        * @return {UserSchema} The user object from database.
        */
        async getByUsername(username) {
            const user = await UserSchema.findOne({ username, active: true });
            if (user == null) {
                throw new TilBotUserNotFoundError(username);
            }
            return user;
        },

        /**
        * Check if there's at least one active user with admin rights.
        *
        * @return {Boolean} True if at least one admin user is found, false otherwise.
        */
        async adminAccountExists() {
            return (
                await UserSchema.findOne({ role: 99, active: true })
            ) != null;
        },

        /**
        * Retrieve all users from database (role 1, not admin).
        *
        * @return {Object[]} Array of user info present in database.
        */
        async getSummaries() {
            const users = await UserSchema.find({ role: 1 });
            const summaries = users.map(user => ({
                username: user.username,
                active: user.active,
            }));
            summaries.sort((a, b) => a.username < b.username ? -1 : 1);
            return summaries;
        },

        /**
        * Create a new account and store it in the database.
        *
        * @param {String} username - Username
        * @param {String} password - Password
        * @param {Number} role - User role: 99 = admin; 1 = user
        */
        async create(username, password, role) {
            const user = new UserSchema({ username, password, role });
            try {
                await user.save();
            } catch (error) {
                if (error instanceof MongoError && error.code == 11000) {
                    // duplicate key error
                    throw new TilBotUserExistsError(user);
                } else {
                    throw error;
                }
            }
        },

    },
    methods: {
        /**
        * Try to log in to the dashboard. Raise an exception on failure.
        *
        * @param {string} password - Password
        */
        async checkPassword(password) {
            if (!(await this.verifyPassword(password))) {
                throw new TilBotBadPasswordError(this.username);
            }
        },

        /**
        * Change an account's password.
        *
        * @param {string} old_password - Original password
        * @param {string} new_password - New password
        */
        async updatePassword(old_password, new_password) {
            this.checkPassword(old_password);
            this.password = new_password;
            await this.save();
        },

        /**
        * Retrieve the settings belonging to the current user from database.
        * If no settings are found, create a new row and return that.
        *
        * @return {SettingsSchema} Settings present in database.
        */
        async getSettings() {
            return await SettingsSchema.getOrCreate(this.username);
        },

        /**
        * Retrieve the valid settings belonging to this user from database.
        * If no settings are found, create a new row and return that.
        * Only returns valid settings, suitable for exposing from the API.
        *
        * @return {Object} Settings present in database.
        */
        async getPermittedSettings() {
            const settings = await this.getSettings();
            return settings.getPermitted();
        },
    },
});

UserSchema.plugin(pkg);
