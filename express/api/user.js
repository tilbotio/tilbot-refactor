import { UserSchema } from '../db/user.js';
import { mongoose } from 'mongoose';

export class UserApiController {
    static UserDetails = mongoose.model('userschemas', UserSchema);

    /**
     * Managing users stored in the database.
     * @constructor
     */
    constructor() {

    }

    /**
     * Retrieve active user by username
     *
     * @param {string} username - The username to search for.
     * @return {UserSchema} The user object from database if found, otherwise null.
     */
    static async get_user(username) {
        return await this.UserDetails.findOne({ username: username, active: true});
    }

    /**
     * Retrieve the user with admin rights
     *
     * @return {UserSchema} The user object from database if found, otherwise null.
     */
    static async get_admin_user() {
        return await this.UserDetails.findOne({ role: 99, active: true});
    }

    /**
     * Retrieve all users from database (role 1, not admin).
     *
     * @return {string[]} Array of usernames present in database.
     */
    static async get_users() {
        const users = await this.UserDetails.find({ role: 1});
        let users_return = [];
        for (const u in users) {
            users_return.push({
                username: users[u].username,
                active: users[u].active
            });
        }

        users_return.sort((a, b) => (a.username > b.username) ? 1: -1);
        return users_return;
    }

    /**
     * Try to log in to the dashboard.
     *
     * @param {string} user - Username
     * @param {string} pass - Password
     * @return {boolean} true if logged in correctly, false if not.
     */
    static async login(user, pass) {
        const schema = await this.UserDetails.findOne({ username: user, active: true});
        if (schema != null) {
            try {
                return await schema.verifyPassword(pass);
            } catch (error) {
                console.log(error);
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Create a new account and store it in the database.
     *
     * @param {string} user - Username
     * @param {string} pass - Password
     * @param {number} role - User role: 99 = admin; 1 = user
     * @return {boolean} true if logged in correctly, false if not.
     */
    static async create_account(user, pass, role) {
        const u = new this.UserDetails();
        u.username = user;
        u.password = pass;
        u.role = role;
        try {
            await u.save();
            return 'OK';
        } catch (error) {
            if (error.toString().includes('duplicate key')) {
                return 'USER_EXISTS';
            }
            return error;
        }
    }

    /**
     * Change an account's password.
     *
     * @param {string} user - Username
     * @param {string} oldpass - Original password
     * @param {string} newpass - New password
     */
    static async update_password(user, oldpass, newpass) {
        const schema = await this.UserDetails.findOne({ username: user, active: true});
        if (schema != null) {
            try {
                const valid = await schema.verifyPassword(oldpass);
                if (valid) {
                    schema.password = newpass;
                    await schema.save();
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    }

    /**
     * Set a user to active or inactive status.
     * Used to delete users without permanently deleting them.
     *
     * @param {string} user - Username
     * @param {boolean} active - true if needs to be set to active, false for inactive
     */
    static async set_user_active(username, active) {
        const schema = await this.UserDetails.findOne({ username: username });
        if (schema != null) {
            schema.active = active;
            await schema.save();
            return active;
        }
    }
}
