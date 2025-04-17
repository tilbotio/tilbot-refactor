import { Schema } from 'mongoose';
import { LogSchema } from './log.js';
import { TilBotProjectNotFoundError } from '../errors.js';
import crypto from 'crypto-js';

export const ProjectSchema = new Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, default: 'New project' },
    status: { type: Number, default: 0 }, // 0 = paused, 1 = running
    current_block_id: { type: Number, default: 1 },
    // Blocks are stored as JSON because they can have many different classes
    blocks: { type: Schema.Types.Mixed, default: {} },
    starting_block_id: { type: Number, default: -1 },
    canvas_width: { type: Number, default: -1 },
    canvas_height: { type: Number, default: -1 },
    bot_name: { type: String, default: 'Tilbot' },
    variables: { type: [Schema.Types.Mixed], default: [] },
    settings: { type: Schema.Types.Mixed, default: {} },
    user_id: { type: String, required: true },
    socket: { type: Number },
    active: { type: Boolean, default: true },
    statics: {
        /**
         * Create a new project and store it in the database.
         *
         * @param {string} username - Username
         * @return {ProjectSchema} The created project.
         */
        async create(username) {
            const project = new this();
            project.id = crypto.randomBytes(16).toString('hex');
            project.user_id = username;
            await project.save();
            return project;
        },

        /**
         * Retrieve a project. Raises a TilBotProjectNotFoundError exception if
         * it was not found.
         *
         * @param {string} id - The project id to search for.
         * @param {Object} extra_filters  - Extra filters to apply to the query.
         */
        async getById(id, extra_filters) {
            const query = { id: id, ...(extra_filters ?? {}) };
            const project = await this.findOne(query);
            if (!project) {
                throw new TilBotProjectNotFoundError();
            }
            return project;
        },

        /**
         * Retrieve summaries for all projects from database.
         *
         * @param {Object} filters - Filter conditions.
         * @return {Object[]} Array of summarized projects present in database.
         */
        async getSummaries(filters) {
            const projects = await this.find(filters ?? {});
            const summaries = projects.map(project => ({
                id: project.id,
                name: project.settings.project_name,
                status: project.status,
            }));
            summaries.sort((a, b) => a.name < b.name ? -1 : 1);
            return summaries;
        },
    },
    methods: {
        /**
         * Import a project, replacing the existing values
         *
         * @param {Object} model - The project values to import (plain Object).
         */
        fromModel(model) {
            this.name = model.name;
            this.current_block_id = model.current_block_id;
            this.starting_block_id = model.starting_block_id;
            this.canvas_width = model.canvas_width;
            this.canvas_height = model.canvas_height;
            this.bot_name = model.bot_name;
            this.variables = model.variables;
            this.settings = model.settings;
            this.blocks = model.blocks;
        },

        /**
        * Retrieve this project's logs
        *
        * @return {string} The logs in .csv format
        */
        async getLogs() {
            const to_return = [
                "project_id;session_id;participant_id;session_start;session_end;message_source;message_time;message_content",
            ];

            const logs = await LogSchema.find({ project_id: this.id });
            for (const log of logs) {
                // I Sverige använder man standarden ISO-8601 och den kommer väl
                // till pass här! :)
                const log_fields = [
                    this.id,
                    log._id,
                    log.participant_id,
                    new Date(log.session_started).toLocaleString('sv'),
                    new Date(log.session_closed).toLocaleString('sv'),
                ];

                for (const message of log.messages) {
                    const message_fields = [
                        ...log_fields,
                        message.source,
                        new Date(message.sent_at).toLocaleString('sv'),
                        JSON.stringify(message.message),
                    ];
                    to_return.push(message_fields.join(';'));
                }
            }

            to_return.push(''); // to get a trailing \r\n
            return to_return.join("\r\n");
        },
    },
}, { minimize: false });
