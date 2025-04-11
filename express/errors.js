export class TilBotError extends Error {
    get name() {
        return this.constructor.name;
    }
    api_status_code = 'NOK';
}

export class TilBotLoginFailedError extends TilBotError {}
export class TilBotUserNotFoundError extends TilBotError {
    api_status_code = 'USER_NOT_FOUND';
}
export class TilBotUserIsAdminError extends TilBotError {}
export class TilBotUserNotAdminError extends TilBotError {
    api_status_code = 'USER_NOT_ADMIN';
}
export class TilBotUserExistsError extends TilBotError {
    api_status_code = 'USER_EXISTS';
}
export class TilBotBadPasswordError extends TilBotError {}
export class TilBotNotLoggedInError extends TilBotError {
    api_status_code = 'NOT_LOGGED_IN';
}
export class TilBotNoProjectFileError extends TilBotError {
    api_status_code = 'NO_PROJECT_FILE';
}
export class TilBotProjectNotFoundError extends TilBotError {}
export class TilBotProjectLogsNotFoundError extends TilBotError {}
