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
      user_id: id,
    },
  });
  return result;
}

async function createPost(user, title, text, isPublished) {
  const post = await prisma.posts.create({
    data: {
      author_id: user,
      title: title,
      post_text: text,
      is_published: isPublished,
    },
  });
  return post;
}

async function editPost(id, title, text, isPublished) {
  const update = await prisma.posts.update({
    where: {
      post_id: id,
    },
    data: {
      title: title,
      post_text: text,
      is_published: isPublished,
    },
  });
  return update;
}

module.exports = {
  insertNewUser,
  readUser,
  createPost,
  editPost,
};
