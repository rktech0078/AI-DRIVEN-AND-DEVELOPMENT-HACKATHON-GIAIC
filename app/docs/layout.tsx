import { Sidebar } from "@/components/Sidebar"
import { TableOfContents } from "@/components/TableOfContents"
import { DocsLayoutWrapper } from "@/components/DocsLayoutWrapper"

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DocsLayoutWrapper sidebar={<Sidebar />}>
            <div className="mx-auto w-full min-w-0">
                <div className="prose prose-base dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-7 prose-li:my-0">
                    {children}
                </div>
            </div>
            <TableOfContents />
        </DocsLayoutWrapper>
    )
}

