import { ProjectSchema } from '../db/project.js';
import { LogSchema } from '../db/log.js';
import { mongoose } from 'mongoose';
import crypto from 'crypto-js';

export class ProjectApiController {

    static ProjectDetails = mongoose.model('projectschemas', ProjectSchema);
    static LogDetails = mongoose.model('logschemas', LogSchema);

    /**
     * Retrieve a project
     *
     * @param {string} id - The project id to search for.
     * @param {string} username - The username that owns the project.
     * @param {active} boolean - Whether or not the project must be active (defaults to true)
     * @param {status} int - What the status must be (null for any)
     */
    static async get_project(id, username, active, status) {
        const query = { id: id, user_id: username, active: active ?? true };
        if (status != null) {
           query.status = status;
        }
        const project = await this.ProjectDetails.findOne(query);
        if (!project) {
            throw new TilBotProjectNotFoundError();
        }
        return project;
    }

    /**
     * Import a project, replacing the existing one
     *
     * @param {string} project - The project to import (JSON string).
     * @param {string} username - The username that owns the project.
     * @return {boolean} True if success, false if failed.
     */
    static async import_project(project, project_id, username) {
        const res = await this.ProjectDetails.deleteOne({ id: project_id, user_id: username });

        if (res.deletedCount == 0) {
            return false;
        } else {
            // Add new project
            let newschema = this.ProjectDetails.fromModel(JSON.parse(project));
            newschema.id = project_id;
            newschema.user_id = username;

            try {
                await newschema.save();
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    }

    /**
     * Retrieve all projects belonging to the current user from database.
     *
     * @param {string} user - The username that owns the projects.
     * @return {string[]} Array of projects present in database.
     */
    static async get_projects(user) {
        const projects = await this.ProjectDetails.find({ user_id: user, active: true });
        // let projects_return = Object.values(projects).map(project => ({
        //     id: project.id,
        //     name: project.settings.project_name,
        //     status: project.status,
        // }));
        let projects_return = [];
        for (const p in projects) {
            projects_return.push({
                id: projects[p].id,
                name: projects[p].settings.project_name,
                status: projects[p].status
            });
        }

        projects_return.sort((a, b) => (a.name > b.name) ? 1 : -1);
        return projects_return;
    }

    /**
     * Retrieve all running projects belonging to the current user from database.
     *
     * @param {string} user - The username that owns the projects.
     * @return {string[]} Array of projects present in database.
     */
    static async get_running_projects_user(user) {
        const projects = await this.ProjectDetails.find({ user_id: user, active: true, status: 1 });
        let projects_return = [];
        for (const p in projects) {
            projects_return.push({
                id: projects[p].id,
                name: projects[p].name,
                status: projects[p].status
            });
        }

        projects_return.sort((a, b) => (a.name > b.name) ? 1 : -1);
        return projects_return;
    }

    /**
     * Create a new account and store it in the database.
     *
     * @param {string} user - Username
     * @return {boolean} true if project created successfully, false if not.
     */
    static async create_project(user) {
        const p = new this.ProjectDetails();
        p.id = crypto.randomBytes(16).toString('hex');
        p.user_id = user;
        p.status = 0; // Paused by default
        p.settings.project_name = 'New project';
        await p.save();
    }

    /**
     * Retrieve the socket for a particular project.
     *
     * @param {string} project_id - Project ID
     * @return {integer} Socket of the retrieved project.
     */
    static async get_socket(project_id) {
        const project = await this.get_project(project_id, true, 1);
        return project.socket.toString();
    }

    /**
     * Retrieve all running bots.
     *
     */
    static async get_running_projects() {
        return await this.ProjectDetails.find({ status: 1, active: true});
    }


    /**
     * Set the status of a project (running or paused).
     *
     * @param {string} project_id - Project ID
     */
    static async set_project_status(project_id, status) {
        const project = await this.get_project(project_id, true);
        project.status = status;
        project.save();
    }

    /**
     * Set a project to active or inactive status.
     * Used to delete projects without permanently deleting them.
     * (Although this is hidden to the users)
     *
     * @param {string} project_id - Project ID
     * @param {boolean} active - true if needs to be set to active, false for inactive
     */
    static async set_project_active(project_id, active) {
        const project = await this.get_project(project_id, null);
        project.active = active;
        await project.save();
    }

    /**
     * Retrieve a project's logs
     *
     * @param {string} id - The project id to search for.
     * @return {JSONObject} The logs in .csv format (2 files, one containing user's text one containing bot's text)
     */
    static async get_logs(id) {
        let to_return = "project_id;session_id;participant_id;session_start;session_end;message_source;message_time;message_content\r\n";
        const logs = await this.LogDetails.find({ project_id: id});
        for (const l in logs) {
            for (const m in logs[l].messages) {
                let started = new Date(logs[l].session_started);
                let started_str = started.getFullYear() + '-' + ('0' + started.getMonth()).slice(-2) + '-' + ('0' + started.getDate()).slice(-2) + ' ' + ('0' + started.getHours()).slice(-2) + ':' + ('0' + started.getMinutes()).slice(-2) + ':' + ('0' + started.getSeconds()).slice(-2);
                let ended = new Date(logs[l].session_closed);
                let ended_str = ended.getFullYear() + '-' + ('0' + ended.getMonth()).slice(-2) + '-' + ('0' + ended.getDate()).slice(-2) + ' ' + ('0' + ended.getHours()).slice(-2) + ':' + ('0' + ended.getMinutes()).slice(-2) + ':' + ('0' + ended.getSeconds()).slice(-2);
                let sent_at = new Date(logs[l].messages[m].sent_at);
                let sent_at_str = sent_at.getFullYear() + '-' + ('0' + sent_at.getMonth()).slice(-2) + '-' + ('0' + sent_at.getDate()).slice(-2) + ' ' + ('0' + sent_at.getHours()).slice(-2) + ':' + ('0' + sent_at.getMinutes()).slice(-2) + ':' + ('0' + sent_at.getSeconds()).slice(-2);

                to_return += id + ";" + logs[l]._id + ";" + logs[l].participant_id + ";" + started_str + ";" + ended_str + ";" + logs[l].messages[m].source + ";" + sent_at_str + ';"' + logs[l].messages[m].message.replace(/(\r\n|\n|\r)/gm, " ").replace('"', '') + '"' + "\r\n";
            }
        }

        return to_return;
    }

    /**
     * Delete a project's logs
     *
     * @param {string} id - The project id to search for.
     */
    static async delete_logs(id) {
        await this.LogDetails.deleteMany({ project_id: id });
    }
}
