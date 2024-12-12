import { defineEventHandler, readBody } from "h3";
import { User } from "@/server/models/user";
import { CustomRole } from "@/server/models/customRole";
import fs from 'fs';

export default defineEventHandler(async (event) => {
    try {

        const users = await User.find().lean();
        const roles = await CustomRole.find().lean();
        console.log(users)
        fs.writeFileSync('./db_backup/users.json', JSON.stringify(users, null, 4));
        fs.writeFileSync('./db_backup/roles.json', JSON.stringify(roles, null, 4));
        console.log("Data exported successfully");
        return "Data exported successfully";
    } catch (error) {
        console.error("Error exporting data:", error);
        return error;
    }

});