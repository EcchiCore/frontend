import type { MDXComponents } from 'mdx/types'
import { mdxComponents as customComponents } from '@/app/[locale]/components/mdx/MyComponent'

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
        ...customComponents,
    }
}
