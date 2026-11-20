let targetdb = db.getSiblingDB('admin');

targetdb.createUser({
    user: process.env.MONGO_TILBOT_USER,
    pwd: process.env.MONGO_TILBOT_PASSWORD,
    roles: [
        {
            role: "readWrite",
            db: "tilbot",
        },
    ],
});