import { CreatePostForm } from "../components/CreatePostForm";
import { PostsList } from "../components/PostsList";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Cash Track dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create posts and fetch data from the Flask backend.
          </p>
        </header>

        <CreatePostForm />
        <PostsList />
      </section>
    </main>
  );
}
