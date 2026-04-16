import { PostComposer } from "@/components/create/post-composer";
import { kk } from "@/lib/locale/kk";

export default function CreatePage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{kk.nav.create}</h1>
      <PostComposer />
    </div>
  );
}
