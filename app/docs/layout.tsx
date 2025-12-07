import { Sidebar } from "@/components/Sidebar"
import { TableOfContents } from "@/components/TableOfContents"
import { DocsLayoutWrapper } from "@/components/DocsLayoutWrapper"
import TranslationButton from "@/components/TranslationButton"
import { DocsPager } from "@/components/DocsPager"

import { EditOnGithub } from "@/components/EditOnGithub"

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DocsLayoutWrapper sidebar={<Sidebar />}>
            <div className="mx-auto w-full min-w-0">
                <div
                    id="chapter-content"
                    className="prose prose-base dark:prose-invert max-w-4xl prose-headings:scroll-m-20 prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-7 prose-li:my-0 relative"
                >
                    <div className="translation-btn-container flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                        <TranslationButton />
                        <EditOnGithub />
                    </div>
                    {children}
                    <DocsPager />
                </div>
            </div>
            <TableOfContents />
        </DocsLayoutWrapper>
    )
}
