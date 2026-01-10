## Prettier Formatting

Use the following commands to check and fix code formatting:

```bash
# Check formatting issues (no changes)
npx prettier --check .

# Fix formatting issues in all files
npx prettier --write .

# Fix formatting for specific files only
npx prettier --write server.js database/db.js

# Note:
# During user registration, the `admin` role is not accepted via the API for security reasons.
# Even if `role: "admin"` is sent in the request, it will be ignored.
# By default, all registered users are saved with the `user` role only.
# Admin roles must be assigned manually in the database by an authorized administrator.