import { CopyPageButton } from './components/CopyPageButton'
import UserAvatar from './components/UserAvatar'
import AiAgentTrigger from './components/AiAgentTrigger'

export default {
    logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <span style={{
                fontWeight: 700,
                fontSize: 'clamp(0.875rem, 2vw, 1.1rem)',
                lineHeight: 1.2
            }}>
                Physical AI & Humanoid Robotics
            </span>
        </div>
    ),
    navbar: {
        extraContent: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AiAgentTrigger />
                <UserAvatar />
            </div>
        )
    },
    project: {
        link: 'https://github.com/rktech0078/physical-ai-hackathon',
    },
    docsRepositoryBase: 'https://github.com/rktech0078/physical-ai-hackathon',
    footer: {
        content: (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                width: '100%',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
            }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <span>
                    MIT {new Date().getFullYear()} ©{' '}
                    <a
                        href="https://abdulrafay.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            borderBottom: '1px solid currentColor'
                        }}
                    >
                        Abdul Rafay
                    </a>
                </span>
            </div>
        ),
    },
    search: {
        placeholder: 'Search the knowledge base...',
    },
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
    },
    primaryHue: 0,
    primarySaturation: 0,
    useNextSeoProps() {
        return {
            titleTemplate: '%s – Physical AI Book'
        }
    },
    banner: {
        key: '2.0-release',
        text: <a href="https://github.com/panaversity" target="_blank">🎉 Physical AI Hackathon is Live! Read more →</a>,
    },
    editLink: {
        component: null
    },
    feedback: {
        content: null
    },
    toc: {
        float: true,
        title: 'On This Page',
        extraContent: <CopyPageButton />
    }
}
