export const pgOpt = {
    database: "huiqinzi",
    username: "pguser",
    password: "123456",
    options: {
        dialect: "postgres",
        host: "huiqinzi.aefcm.com",
        port: 6019,
        timezone: "+8:00",
        pool: {
            maxConnections: 5,
            minConnections: 0,
            maxIdleTime: 100000
        }
    }
}
