import chalk, { Chalk } from "chalk"
import * as moment from "moment"

export class LogLevel {
    readonly name: string
    readonly color: Chalk
    readonly priority: number
    readonly scope: LogScope

    /**
     * 
     * @param name The name
     * @param color The chalk color (or style)
     * @param priority The priority (the lower the number the higher priority of being output)
     * @param scope stdout or stderr
     */
    constructor(name: string, color: Chalk, priority: number, scope: LogScope) {
        this.name = name
        this.color = color
        this.priority = priority
        this.scope = scope
    }
}

export enum LogScope {
    STDOUT = "stdout",
    STDERR = "stderr"
}

export default class Logger {
    readonly logLevels: LogLevel[] = [
        new LogLevel("error", chalk.red.bold, 0, LogScope.STDERR),
        new LogLevel("warn", chalk.yellow.bold, 1, LogScope.STDERR),
        new LogLevel("info", chalk.green.bold, 2, LogScope.STDOUT),
        new LogLevel("debug", chalk.blue.bold, 3, LogScope.STDOUT),
    ]
    readonly defaultLogLevel: LogLevel = this.logLevels[2]
    private logLevel: any
    private timeFormat: string = "HH:mm:ss"

    constructor() {
        if (!process.env.LOG_LEVEL) {
            // if not set
            this.logLevel = this.defaultLogLevel
        } else if (isNaN(parseInt(process.env.LOG_LEVEL))) {
            // if set but not a number
            let levelFromName = this.getLogLevelByName(process.env.LOG_LEVEL)
            // handle invalid level string
            if (!levelFromName) {
                this.logLevel = this.defaultLogLevel
            } else {
                this.logLevel = levelFromName
            }
        } else {
            // if set as number
            let levelFromNum = this.getLogLevelByPriority(parseInt(process.env.LOG_LEVEL))
            // handle invalid level number
            if (!levelFromNum) {
                this.logLevel = this.defaultLogLevel
            } else {
                this.logLevel = levelFromNum
            }
        }

        this.debug("Using log level: " + this.logLevel.name)
    }

    /**
     * Sets the log level. Defaults to info.
     * @param level The level to set
     */
    setLogLevel(level: LogLevel) {
        this.logLevel = level
    }

    /**
     * Sets the Moment.js time format. Defaults to "HH:mm:ss".
     * @param format The time format
     */
    setTimeFormat(format: string) {
        this.timeFormat = format
    }

    /**
     * Gets a log level from its name
     * @param name The name
     */
    getLogLevelByName(name: string) {
        return this.logLevels[this.logLevels.findIndex((l: any) => l.name === name)]
    }

    /**
     * Get a log level from its priority
     * @param priority The priority
     */
    getLogLevelByPriority(priority: number) {
        return this.logLevels[this.logLevels.findIndex((l: any) => l.priority === priority)]
    }

    /**
     * Format a message
     * @param level The log level to format for
     * @param message The message
     */
    format(level: LogLevel, message: any, notime?: boolean) {
        let time = moment().format(this.timeFormat)
        let line = `${level.color(level.name.toUpperCase())} ${message}`

        if (!notime) line = `[${chalk.gray(time)}] ` + line
        return line
    }

    /**
     * Format a message in JSON
     * @param level The log level to format for
     * @param message The message
     */
    formatJson(level: LogLevel, message: any) {
        let time = moment().format("HH:mm:ss")
        let line = JSON.stringify({ time: time, level: level, message: message })
        return line
    }

    /**
     * Log a message
     * @param level The level to log in
     * @param message The message
     */
    log(level: LogLevel, message: string, json?: boolean) {
        if (this.logLevel.priority >= level.priority) {
            let line = json ? this.formatJson(level, message) : this.format(level, message)
            level.scope === LogScope.STDERR ? console.error(line) : console.log(line)
            return line
        }
    }

    /**
    * Format a message with the error log level
    * @param message The message
    * @param json Whether or not to format in json
    * @returns The log line or nothing if the log level wasn't high enough
    */
    async error(message: any, json?: boolean): Promise<string | void> {
        return this.log(this.logLevels[0], message, json)
    }

    /**
     * Format a message with the warn log level
     * @param message The message
     * @param json Whether or not to format in json
     * @returns The log line or nothing if the log level wasn't high enough
     */
    async warn(message: any, json?: boolean): Promise<string | void> {
        return this.log(this.logLevels[1], message, json)
    }

    /**
     * Format a message with the info log level
     * @param message The message
     * @param json Whether or not to format in json
     * @returns The log line or nothing if the log level wasn't high enough
     */
    async info(message: any, json?: boolean): Promise<string | void> {
        return this.log(this.logLevels[2], message, json)
    }

    /**
     * Format a message with the debug log level
     * @param message The message
     * @param json Whether or not to format in json
     * @returns The log line or nothing if the log level wasn't high enough
     */
    async debug(message: any, json?: boolean): Promise<string | void> {
        return this.log(this.logLevels[3], message, json)
    }
}




