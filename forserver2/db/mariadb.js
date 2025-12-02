import mariadb from "mariadb";

export const pool = mariadb.createPool({
    host: "DBserver",
    port: 3306,
    user: "root",
    password: "jsp16",
    database: "gpt",
    connectionLimit: 5
});
