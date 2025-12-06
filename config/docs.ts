export type SidebarNavItem = {
    title: string
    items: {
        title: string
        href: string
        disabled?: boolean
    }[]
}

export const docsConfig: SidebarNavItem[] = [
    {
        title: "Introduction",
        items: [
            {
                title: "Welcome",
                href: "/docs",
            },
        ],
    },
    {
        title: "Section 1: Foundations of Physical AI",
        items: [
            { title: "Chapter 1: What Is Physical AI?", href: "/docs/section-1/chapter-1" },
            { title: "Chapter 2: Sensors & Perception", href: "/docs/section-1/chapter-2" },
            { title: "Chapter 3: Industry Landscape", href: "/docs/section-1/chapter-3" },
        ],
    },
    {
        title: "Section 2: ROS 2 Basics",
        items: [
            { title: "Chapter 4: ROS 2 Fundamentals", href: "/docs/section-2/chapter-4" },
            { title: "Chapter 5: Building Packages", href: "/docs/section-2/chapter-5" },
            { title: "Chapter 6: Robot Description (URDF)", href: "/docs/section-2/chapter-6" },
        ],
    },
    {
        title: "Section 3: Simulation Environments",
        items: [
            { title: "Chapter 7: Simulation Concepts", href: "/docs/section-3/chapter-7" },
            { title: "Chapter 8: Gazebo Simulator", href: "/docs/section-3/chapter-8" },
            { title: "Chapter 9: Unity for Robotics", href: "/docs/section-3/chapter-9" },
        ],
    },
    {
        title: "Section 4: Advanced Simulation (Isaac Sim)",
        items: [
            { title: "Chapter 10: NVIDIA Isaac Sim", href: "/docs/section-4/chapter-10" },
            { title: "Chapter 11: Isaac ROS", href: "/docs/section-4/chapter-11" },
            { title: "Chapter 12: Navigation & Control", href: "/docs/section-4/chapter-12" },
        ],
    },
    {
        title: "Section 5: AI Integration",
        items: [
            { title: "Chapter 13: Voice-to-Action", href: "/docs/section-5/chapter-13" },
            { title: "Chapter 14: Cognitive Reasoning (LLMs)", href: "/docs/section-5/chapter-14" },
            { title: "Chapter 15: VLA Models", href: "/docs/section-5/chapter-15" },
        ],
    },
    {
        title: "Section 6: Humanoid & Sim-to-Real",
        items: [
            { title: "Chapter 16: Humanoid Architecture", href: "/docs/section-6/chapter-16" },
            { title: "Chapter 17: Capstone Requirements", href: "/docs/section-6/chapter-17" },
            { title: "Chapter 18: Sim-to-Real Transfer", href: "/docs/section-6/chapter-18" },
        ],
    },
    {
        title: "Section 7: Hardware & Edge AI",
        items: [
            { title: "Chapter 19: Hardware Requirements", href: "/docs/section-7/chapter-19" },
            { title: "Chapter 20: Edge AI Kits", href: "/docs/section-7/chapter-20" },
            { title: "Chapter 21: Robotics Lab Setup", href: "/docs/section-7/chapter-21" },
        ],
    },
    {
        title: "Section 8: Applied GenAI Projects",
        items: [
            { title: "Chapter 22: Embedded RAG Chatbot", href: "/docs/section-8/chapter-22" },
            { title: "Chapter 23: User Signup & Personalization", href: "/docs/section-8/chapter-23" },
            { title: "Chapter 24: Personalization Button", href: "/docs/section-8/chapter-24" },
            { title: "Chapter 25: Urdu Translation Button", href: "/docs/section-8/chapter-25" },
        ],
    },
    {
        title: "Section 9: Project Roadmap",
        items: [
            { title: "Chapter 26: Weekly Projects", href: "/docs/section-9/chapter-26" },
            { title: "Chapter 27: Midterm Simulation Project", href: "/docs/section-9/chapter-27" },
            { title: "Chapter 28: Final Humanoid Project", href: "/docs/section-9/chapter-28" },
        ],
    },
    {
        title: "Appendices",
        items: [
            { title: "Appendix A: Installation Guides", href: "/docs/section-10/appendix-a" },
            { title: "Appendix B: Cheatsheets", href: "/docs/section-10/appendix-b" },
            { title: "Appendix C: Glossary", href: "/docs/section-10/appendix-c" },
        ],
    },
]
