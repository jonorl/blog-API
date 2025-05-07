const { PrismaClient } = require("./generated/prisma/client");
const prisma = new PrismaClient();

async function insertNewUser(firstName, lastName, email, password) {
    const result = await prisma.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password_hash: password,
        },
      });
      return result;
}

async function readUser(id) {
    const result = await prisma.users.findUnique({
        where: {
          id: id,
        },
      });
      return result;
}

module.exports = {
  insertNewUser,
  readUser,
};