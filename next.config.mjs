import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

import rehypeSlug from 'rehype-slug'

const withMDX = createMDX({
    options: {
        rehypePlugins: [rehypeSlug],
    },
})

export default withMDX(nextConfig)
