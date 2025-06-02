
db = db.getSiblingDB('dev');
db.createUser({
	user: "drankkas",
	pwd: "drankkas",
	roles: [{ role: "readWrite", db: "dev" }]
});
