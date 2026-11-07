import { MDXProvider } from "@mdx-js/react";
import type { ComponentType } from "react";
import { mdxComponents } from "./mdx";
import { MarkReadButton } from "./MarkReadButton";

/** Renders one .mdx file with the shared components and the "อ่านจบแล้ว" footer. */
export function MdxPage({ Content, id }: { Content: ComponentType; id: string }) {
  return (
    <MDXProvider components={mdxComponents}>
      <article className="prose">
        <Content />
      </article>
      <MarkReadButton id={id} />
    </MDXProvider>
  );
}
