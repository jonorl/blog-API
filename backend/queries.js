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
      post_id: parseInt(id),
    },
    data: {
      title: title,
      post_text: text,
      is_published: isPublished,
    },
  });
  return update;
}

async function deletePost(id) {
  const del = await prisma.posts.delete({
    where: {
      post_id: parseInt(id),
    },
  });
  return del;
}

async function getAllUsers() {
  const getUsers = await prisma.users.findMany();
  return getUsers;
}

async function updateUser(userID, firstName, lastName, email) {
  const editUser = await prisma.users.update({
    where: {
      user_id: userID,
    },
    data: {
      first_name: firstName,
      last_name: lastName,
      email: email,
    },
  });
  return editUser;
}

async function deleteUser(userID) {
  const deleteUser = await prisma.users.delete({
    where: { user_id: userID },
  });
  return deleteUser
}

async function getAllPosts() {
  const getPosts = await prisma.posts.findMany();
  return getPosts;
}

async function readPost(id){
  const result = await prisma.posts.findUnique({
    where: {
      post_id: parseInt(id),
    },
  });
  return result;
}

module.exports = {
  insertNewUser,
  readUser,
  createPost,
  editPost,
  deletePost,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllPosts,
  readPost,
};
