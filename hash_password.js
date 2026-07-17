const bcrypt = require('bcryptjs');
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node hash_password.js <password>");
    process.exit(1);
}
const password = args[0];
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
