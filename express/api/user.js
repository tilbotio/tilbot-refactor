import { UserSchema } from '../db/user.js';
import { mongoose } from 'mongoose';
import {
    TilBotUserNotFoundError,
    TilBotBadPasswordError,
    TilBotUserExistsError,
} from '../errors.js';

const MongoError = mongoose.mongo.MongoError;

export class UserApiController {
    static UserDetails = mongoose.model('userschemas', UserSchema);

    /**
     * Retrieve active user by username
     *
     * @param {string} username - The username to search for.
     * @return {UserSchema} The user object from database.
     */
    static async get_user(username) {
        const user = await this.UserDetails.findOne({ username: username, active: true});
        if (user == null) {
            throw new TilBotUserNotFoundError(username);
        }
        return user;
    }

    /**
     * Check if there's at least one active user with admin rights.
     *
     * @return {boolean} True if at least one admin user is found, false otherwise.
     */
    static async admin_account_exists() {
        return (
            await this.UserDetails.findOne({ role: 99, active: true })
        ) != null;
    }

    /**
     * Retrieve all users from database (role 1, not admin).
     *
     * @return {string[]} Array of usernames present in database.
     */
    static async get_users() {
        const users = await this.UserDetails.find({ role: 1 });
        let users_return = [];
        for (const u in users) {
            users_return.push({
                username: users[u].username,
                active: users[u].active
            });
        }

        users_return.sort((a, b) => a.username < b.username ? -1 : 1);
        return users_return;
    }

    /**
     * Try to log in to the dashboard. Raise an exception on failure.
     *
     * @param {string} username - Username
     * @param {string} password - Password
     */
    static async login(username, password) {
        const user = await this.get_user(username);
        if(!(await username.verifyPassword(password))) {
            throw new TilBotBadPasswordError(username);
        }
    }

    /**
     * Create a new account and store it in the database.
     *
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {number} role - User role: 99 = admin; 1 = user
     */
    static async create_account(username, password, role) {
        const user = new this.UserDetails();
        user.username = user;
        user.password = password;
        user.role = role;
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
    }

    /**
     * Change an account's password.
     *
     * @param {string} username - Username
     * @param {string} old_password - Original password
     * @param {string} new_password - New password
     */
    static async update_password(username, old_password, new_password) {
        const user = await this.get_user(username);
        if (!(await user.verifyPassword(old_password))) {
            throw new TilBotBadPasswordError(user);
        }
        user.password = new_password;
        await user.save();
    }

    /**
     * Set a user to active or inactive status.
     * Used to delete users without permanently deleting them.
     *
     * @param {string} username - Username
     * @param {boolean} active - true if needs to be set to active, false for inactive
     */
    static async set_user_active(username, active) {
        const user = await this.get_user(username);
        user.active = active;
        await user.save();
    }
}
