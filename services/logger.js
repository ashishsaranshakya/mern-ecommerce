import winston from 'winston';
import moment from 'moment-timezone';

const timezone = process.env.TZ || 'Asia/Kolkata';

const customTimestamp = () => {
    const now = moment().tz(timezone);
    const offset = now.utcOffset();
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);

    return now.format(`DD-MM-YYYY HH:mm:ss.SSS UTC${offsetSign}${offsetHours}:${offsetMinutes}`);
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: customTimestamp }),
        winston.format.json()
    ),
    defaultMeta: { service: 'cittaa-backend' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ]
});

export const adminLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: customTimestamp }),
        winston.format.json()
    ),
    defaultMeta: { service: 'cittaa-backend' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/admin.error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/admin.combined.log' }),
    ]
});

export default logger;