# #!/bin/bash
# # MongoDB Initialization Script

# # Exit immediately if a command exits with a non-zero status
# set -e

# # Check if required environment variables are set
# if [ -z "$MONGO_INITDB_ROOT_USERNAME" ] || [ -z "$MONGO_INITDB_ROOT_PASSWORD" ]; then
#     echo "Error: MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD must be set"
#     exit 1
# fi

# # Create initialization script for MongoDB
# mongo <<EOF
# use admin

# // Create root user
# db.createUser({
#     user: "$MONGO_INITDB_ROOT_USERNAME",
#     pwd: "$MONGO_INITDB_ROOT_PASSWORD",
#     roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
# })

# // Create application database
# use myapp

# // Create application user
# db.createUser({
#     user: "appuser",
#     pwd: "apppassword",
#     roles: [
#         { role: "readWrite", db: "myapp" }
#     ]
# })

# // Optional: Create some initial collections or indexes
# db.createCollection("users")
# db.users.createIndex({ "email": 1 }, { unique: true })
# db.users.createIndex({ "username": 1 }, { unique: true })

# // Optional: Insert some initial data (example)
# db.users.insertOne({
#     username: "admin",
#     email: "admin@example.com",
#     createdAt: new Date()
# })
# EOF

# echo "MongoDB initialization complete!"