# Physical AI & Humanoid Robotics Project Constitution

## Core Principles

### I. AI-Native & Robotics-First
The project is fundamentally about Physical AI. Content and code must prioritize robotics concepts (ROS 2, Isaac Sim) and AI integration (VLA models, RAG). The documentation itself should be "AI-native", featuring embedded AI agents for interaction.

### II. Practical Implementation
Theory is supported by hands-on labs. Every chapter or section should lead to a practical outcome, whether it's a simulation in Gazebo/Isaac Sim or a real-world robot deployment. The "Hackathon Implementation" features (RAG Chatbot, Personalization) are critical.

### III. Interactive Learning
The platform is not just a static book. It uses Nextra for a rich reading experience and integrates an AI agent (Gemini via OpenAI SDK) to answer user queries, translate content (Urdu), and provide personalized examples.

### IV. Component-First Development
UI elements (Nextra components, Chat widget) are self-contained. We use Nextra's built-in features where possible and build custom React components for the AI agent and interactive elements, ensuring reusability and clear separation of concerns.

### V. Accessibility & Localization
Content must be accessible to a wide audience. This includes standard web accessibility (A11y) and specific language support (Urdu translation button) as defined in the book content.

## Additional Constraints

### Technology Stack Requirements
*   **Framework**: Nextra (Next.js based documentation framework)
*   **UI Library**: React
*   **Styling**: Tailwind CSS (Nextra default)
*   **AI Integration**: OpenAI Node.js SDK (configured for Gemini API)
*   **Content Format**: MDX (Markdown + React)

### Tooling & Standards
*   **Linting/Formatting**: ESLint & Prettier.
*   **Package Manager**: npm.
*   **Version Control**: Git.

### Performance Standards
*   Documentation should load instantly.
*   AI Agent responses should be streamed for low latency perception.

## Development Workflow

### Content-Code Sync
*   Book content updates (`pages/`) and code updates (`components/`) are managed in the same repo.
*   Major content sections (Sections 1-10) map to Nextra directory structure.

### Governance

### Authority
*   This Constitution defines the hackathon project's core goals.

### Compliance
*   All features (e.g., the Chatbot) must align with the "AI-Native" principle.
*   Content must follow the structure defined in `BOOK_CONTENT.md`.

**Version**: 1.1.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04