import { Button } from "@/components/ui/button";
import { sql } from "drizzle-orm";
import { auth, signIn, signOut } from "@/server/auth";
import { db } from "@/server/db";
import { comments } from "@/server/db/schema";
import { getThemeToggler } from "@/lib/theme/get-theme-button";
import { useState } from "react";

import { InferModel } from "drizzle-orm";
type Comment = InferModel<typeof comments>;

export const runtime = "edge";

export default async function Page() {
  const session = await auth();

  // Fetch comments from the database
  const commentList = await db.select().from(comments);

  const SetThemeButton = getThemeToggler();

  // Form submission logic
  async function handleCommentSubmit(data: FormData) {
    "use server";
    const author = data.get("author") as string;
    const body = data.get("body") as string;
    const post_slug = data.get("post_slug") as string;

    // Insert the comment into the database
    await db.insert(comments).values({
      author,
      body,
      post_slug,
    });
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex max-w-2xl justify-between w-full">
        <SetThemeButton />

        <div className="flex gap-2 items-center justify-center">
          <span className="italic">Cloudflare Next Saas Starter</span>
        </div>

        <div className="border border-black dark:border-white rounded-2xl p-2 flex items-center">
          Start by editing apps/web/page.tsx
        </div>
      </div>

      <div className="max-w-2xl text-start w-full mt-16">
        <ul className="list-disc mt-4 prose dark:prose-invert">
          <li /> Leave a comment them...🙄
        </ul>
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-xl font-bold">Comments</h2>
          {commentList.length > 0 ? (
            commentList.map((comment) => (
              <div key={comment.id} className="border p-2 my-2 rounded">
                <strong>{comment.author}</strong>
                <p>{comment.body}</p>
                <small className="text-gray-500">{comment.post_slug}</small>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

          {/* Add New Comment Form */}
          <form
            action={handleCommentSubmit}
            className="mt-4 flex flex-col gap-4"
          >
            <input
              name="author"
              placeholder="Your name"
              className="border p-2 rounded"
              required
            />
            <textarea
              name="body"
              placeholder="Your comment"
              className="border p-2 rounded"
              required
            ></textarea>
            <input
              name="post_slug"
              placeholder="Post Slug"
              className="border p-2 rounded"
              required
            />
            <Button type="submit" className="mt-4">
              Submit Comment
            </Button>
          </form>
        </div>
        {session?.user?.email ? (
          <>
            <div className="mt-4 flex flex-col gap-2">
              <span>Hello {session.user.name} 👋</span>
              <span>{session.user.email}</span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button className="mt-4">Sign out</Button>
            </form>
          </>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button className="mt-4">Login with Google</Button>
          </form>
        )}
      </div>
    </main>
  );
}
