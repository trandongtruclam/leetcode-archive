import { title } from "@/components/primitives";
import Problem from "@/components/problem";
export default function DocsPage() {
  return (
    <div>
      <h1 className={title()}>Docs</h1>
      <Problem />
    </div>
  );
}
