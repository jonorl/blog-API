const { PrismaClient } = require("../generated/prisma/client");
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

async function getUserByEmail(email) {
  const result = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });
  return result;
}

async function createPost(user, title, text, published) {
  const post = await prisma.posts.create({
    data: {
      author_id: user,
      title: title,
      post_text: text,
      is_published: published,
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

async function updateUser(userID, firstName, lastName, email, roles) {
  console.log("aqui")
  const editUser = await prisma.users.update({
    where: {
      user_id: userID,
    },
    data: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      roles: roles,
    },
  });
  console.log(editUser)
  return editUser;
}

async function deleteUser(userID) {
  const deleteUser = await prisma.users.delete({
    where: { user_id: userID },
  });
  return deleteUser;
}

async function getAllPosts() {
  const getPosts = await prisma.posts.findMany();
  return getPosts;
}

async function readPost(id) {
  const result = await prisma.posts.findUnique({
    where: {
      post_id: parseInt(id),
    },
  });
  return result;
}

async function createComment(user, text, postID) {
  const comment = await prisma.comments.create({
    data: {
      user_id: user,
      comment_text: text,
      post_id: parseInt(postID),
    },
  });
  return comment;
}

async function showPostComments(postID) {
  const comments = await prisma.comments.findMany({
    where: {
      post_id: parseInt(postID),
    },
  });
  return comments;
}

async function showSpecificComment(commentID) {
  const comment = await prisma.comments.findUnique({
    where: {
      comment_id: parseInt(commentID),
    },
  });
  return comment;
}

async function updateComment(commentID, text) {
  const comment = await prisma.comments.update({
    where: {
      comment_id: parseInt(commentID),
    },
    data: {
      comment_text: text,
    },
  });
  return comment;
}

async function deleteComment(commentID) {
  const comment = await prisma.comments.delete({
    where: {
      comment_id: parseInt(commentID),
    },
  });
  return comment;
}

module.exports = {
  insertNewUser,
  readUser,
  getUserByEmail,
  createPost,
  editPost,
  deletePost,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllPosts,
  readPost,
  createComment,
  showPostComments,
  showSpecificComment,
  updateComment,
  deleteComment,
};
