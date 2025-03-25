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
        const user = await this.UserDetails.findOne({ username: username, active: true});
        return user;
    }

    /**
     * Retrieve the user with admin rights
     *
     * @return {UserSchema} The user object from database if found, otherwise null.
     */
    static async get_admin_user() {
        const user = await this.UserDetails.findOne({ role: 99, active: true});
        return user;
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
    static login(user, pass) {
        return new Promise(resolve => {
            this.UserDetails.findOne({ username: user, active: true }).then(function(schema) {
                if (schema != null) {

                    schema.verifyPassword(pass)
                    .then(function(valid) {
                        resolve(valid);
                    })
                    .catch(function(err) {
                        console.log(err);
                        resolve(false);
                    });

                }
                else {
                    resolve(false);
                }
            });

        });
    }

    /**
     * Create a new account and store it in the database.
     *
     * @param {string} user - Username
     * @param {string} pass - Password
     * @param {number} role - User role: 99 = admin; 1 = user
     * @return {boolean} true if logged in correctly, false if not.
     */
    static create_account(user, pass, role) {
        return new Promise(resolve => {
            var u = new this.UserDetails();
            u.username = user;
            u.password = pass;
            u.role = role;
            u.save().then(function(e) {
                resolve('OK');
            }).catch(function(error) {
                if (error.toString().includes('duplicate key')) {
                    resolve('USER_EXISTS');
                }
                resolve(error);
            });
        });
    }

    /**
     * Change an account's password.
     *
     * @param {string} user - Username
     * @param {string} oldpass - Original password
     * @param {string} newpass - New password
     */
    static update_password(user, oldpass, newpass) {
        return new Promise(resolve => {
            this.UserDetails.findOne({ username: user, active: true }).then(function(schema) {
                if (schema != null) {

                    schema.verifyPassword(oldpass)
                    .then(function(valid) {
                        if (valid) {
                            schema.password = newpass;
                            schema.save().then(function() {
                                resolve(true);
                            });
                        }
                        else {
                            resolve(false);
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                        resolve(false);
                    });
                }
            });
        })
    }

    /**
     * Set a user to active or inactive status.
     * Used to delete users without permanently deleting them.
     *
     * @param {string} user - Username
     * @param {boolean} active - true if needs to be set to active, false for inactive
     */
    static set_user_active(username, active) {
        return new Promise(resolve => {
            this.UserDetails.findOne({ username: username }).then(function(schema) {
                if (schema != null) {
                    schema.active = active;
                    schema.save().then(function() {
                        resolve(active);
                    });
                }
            });
        })
    }
}
