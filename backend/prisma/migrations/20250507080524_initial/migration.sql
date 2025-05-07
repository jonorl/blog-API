-- CreateEnum
CREATE TYPE "roles" AS ENUM ('blogger', 'user');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "roles" "roles" DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "posts" (
    "post_id" SERIAL NOT NULL,
    "author_id" UUID NOT NULL,
    "post_text" TEXT NOT NULL,
    "message_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "comment_text" TEXT NOT NULL,
    "comment_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
