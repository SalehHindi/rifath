# LiveKit Voice Agent with Visual UI - Technical Plan

## Overview

This project implements a React/Next.js web application with a LiveKit voice agent that can control UI components through voice commands. The agent runs locally as a Python process and communicates with the frontend via LiveKit's RPC (Remote Procedure Calls) mechanism.

---

## Current Status (Dec 11, 2025)

- ✅ **LiveKit + Push-to-Talk pipeline working**: Local LiveKit server, token endpoint, room connection, push-to-talk button, and agent audio playback hooks are all in place.
- ✅ **Agent session lifecycle fixed**: The Python worker stays running and only listens when the user holds Push-to-Talk.
- ✅ **Mode renderer scaffolding**: Placeholder Quiz/Table/Blank components render correctly based on `ModeContext`.
- ✅ **RPC infrastructure**: `set_mode`/`get_mode` RPC handlers and `ModeContext` wiring are implemented on the frontend.
- 🟡 **Agent tool definitions created**: `show_quiz`, `show_table`, `show_blank`, `get_current_mode` exist, but we still need to polish the prompts and verify tool-triggered UI changes end-to-end.
- 🟡 **Frontend audio playback**: `useAgentAudio` attaches the agent’s audio track; testing shows the agent speaks, though we’re monitoring for edge cases.
- ⏳ **Quiz experience**: Quiz data, animations, tool-driven quiz control, and RPC sync are scheduled for Phase 3.
- Next immediate task: **finish Phase 2 by verifying the tool calls change the rendered component (quiz/table/blank) reliably** before moving into Phase 3’s quiz UX work.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Push-to-Talk │  │  Mode Render │  │   Quiz UI    │     │
│  │    Button    │  │    Area      │  │  Component   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                │                  │             │
│           └────────────────┼──────────────────┘             │
│                            │                                │
│                    LiveKit Client SDK                        │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    WebRTC Connection
                             │
┌────────────────────────────┼────────────────────────────────┐
│                    LiveKit Server                           │
│              (Local or Cloud Instance)                      │
└────────────────────────────┼────────────────────────────────┘
                             │
                    WebRTC Connection
                             │
┌────────────────────────────┼────────────────────────────────┐
│              Python Agent (Local Process)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   STT/LLM    │  │  Tool Calls  │  │  RPC Methods  │     │
│  │   Pipeline   │  │   Handler    │  │   Registry    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **LiveKit SDK**: `@livekit/components-react`, `livekit-client`
- **State Management**: React Context API / Zustand (for mode and quiz state)

### Backend Agent
- **Language**: Python 3.10+
- **Framework**: LiveKit Agents SDK (`livekit-agents`)
- **LLM**: OpenAI GPT-4 or compatible (can use local models)
- **STT**: OpenAI Whisper or LiveKit's built-in STT
- **TTS**: OpenAI TTS or LiveKit's built-in TTS

### Infrastructure
- **LiveKit Server**: Local instance via Docker or LiveKit Cloud (free tier)
- **Token Server**: Next.js API route for token generation

## Repository Structure

```
rifath_project/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main page with push-to-talk
│   │   └── api/
│   │       └── token/
│   │           └── route.ts    # Token generation endpoint
│   ├── components/
│   │   ├── VoiceAgent/
│   │   │   ├── PushToTalkButton.tsx
│   │   │   ├── AudioVisualizer.tsx
│   │   │   └── ConnectionStatus.tsx
│   │   ├── Quiz/
│   │   │   ├── QuizComponent.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── OptionButton.tsx
│   │   │   └── NextButton.tsx
│   │   ├── Table/
│   │   │   └── TableComponent.tsx
│   │   └── Blank/
│   │       └── BlankComponent.tsx
│   ├── hooks/
│   │   ├── useLiveKitRoom.ts
│   │   ├── useVoiceAgent.ts
│   │   └── useQuiz.ts
│   ├── contexts/
│   │   ├── ModeContext.tsx     # Manages current UI mode
│   │   └── QuizContext.tsx     # Manages quiz state
│   ├── lib/
│   │   ├── livekit.ts          # LiveKit client setup
│   │   └── quiz-data.ts        # Hardcoded quiz data
│   ├── package.json
│   └── tailwind.config.js
│
├── agent/                       # Python agent
│   ├── main.py                 # Agent entry point
│   ├── agent.py                # Main agent logic
│   ├── tools.py                # Tool definitions for UI control
│   ├── quiz_handler.py         # Quiz-specific logic
│   ├── requirements.txt
│   └── .env.example
│
├── docker-compose.yml          # Local LiveKit server (optional)
├── README.md
├── TECHNICAL_PLAN.md
└── .gitignore
```

## Phase Breakdown

---

## Phase 1: Base UI and Push-to-Talk

### Objectives
- Set up Next.js project with LiveKit integration
- Implement push-to-talk button functionality
- Create basic component rendering area
- Establish connection between frontend and agent

### Implementation Steps

#### 1.1 Project Setup
- [x] Initialize Next.js project with TypeScript
- [x] Install LiveKit dependencies:
  - `livekit-client`
  - `@livekit/components-react`
  - `@livekit/components-styles`
- [x] Set up Tailwind CSS
- [x] Create basic project structure

#### 1.2 LiveKit Configuration
- [x] Set up LiveKit server (local Docker or Cloud)
- [x] Create token generation API route (`/api/token/route.ts`)
- [x] Configure environment variables:
  - `LIVEKIT_URL`
  - `LIVEKIT_API_KEY`
  - `LIVEKIT_API_SECRET`

#### 1.3 Push-to-Talk Button
- [x] Create `PushToTalkButton` component
- [x] Implement mouse/touch event handlers:
  - `onMouseDown` / `onTouchStart`: Start listening
  - `onMouseUp` / `onTouchEnd`: Stop listening
  - `onMouseLeave`: Stop listening (if button released outside)
- [x] Visual feedback:
  - Active state styling (e.g., red background when listening)
  - Disabled state when not connected
- [x] Integrate with LiveKit room to control microphone track publishing

#### 1.4 Basic Agent Setup
- [x] Initialize Python agent project
- [x] Set up basic agent that connects to room
- [x] Configure STT/LLM/TTS pipeline (OpenAI Whisper/LLM/TTS + silero VAD)
- [x] Test basic voice interaction

#### 1.5 Component Rendering Area
- [x] Create main layout with:
  - Push-to-talk button at top
  - Content area below for dynamic components
- [x] Create placeholder component to show in Phase 1
- [x] Set up basic state management for component rendering

### Technical Details

**Push-to-Talk Implementation:**
```typescript
// Pseudocode
const handleMouseDown = () => {
  if (room && room.localParticipant) {
    // Enable microphone track
    room.localParticipant.setMicrophoneEnabled(true);
    setIsListening(true);
  }
};

const handleMouseUp = () => {
  if (room && room.localParticipant) {
    // Disable microphone track
    room.localParticipant.setMicrophoneEnabled(false);
    setIsListening(false);
  }
};
```

**LiveKit Room Connection:**
- Use `useRoom` hook from `@livekit/components-react`
- Connect to room on component mount
- Handle connection state changes
- Subscribe to agent participant's audio track

### Deliverables
- ✅ Working push-to-talk button
- ✅ Basic voice agent connection
- ✅ Component rendering area displaying placeholder component
- ✅ Visual feedback for connection and listening states

---

## Phase 2: Mode Switching via Tool Calls

### Objectives
- Implement RPC methods for UI mode control
- Create tool definitions in agent for mode switching
- Build different UI components (Quiz, Table, Blank)
- Enable voice commands to switch between modes

### Implementation Steps

#### 2.1 RPC Method Registration (Frontend)
- [x] Register RPC methods in frontend:
  - `set_mode` - Changes the current UI mode
  - `get_mode` - Returns current mode (for agent awareness)
- [x] Create `ModeContext` to manage current mode state
- [x] Implement mode switching logic

#### 2.2 Tool Definitions (Agent)
- [x] Define tools in agent:
  - `show_quiz` - Triggers quiz mode
  - `show_table` - Triggers table mode
  - `show_blank` - Triggers blank mode
- [x] Map tool calls to RPC method invocations
- [x] Add tool descriptions for LLM understanding

#### 2.3 UI Components
- [x] **Quiz Component** (placeholder):
  - Basic structure with title
  - Placeholder for questions/options
- [x] **Table Component**:
  - Hardcoded table data
  - Simple table rendering
- [x] **Blank Component**:
  - Empty component or minimal placeholder

#### 2.4 Mode Rendering Logic
- [x] Create mode renderer component that switches based on state
- [ ] Implement smooth transitions between modes (optional polish)
- [x] Handle mode state persistence during session

#### 2.5 Agent Tool Call Integration
- [ ] Configure agent to recognize mode-switching commands (LLM/tool prompt tuning in progress)
- [ ] Test voice commands:
  - "Show a quiz"
  - "Show a table"
  - "Show nothing" / "Clear screen"
- [ ] Add error handling for invalid modes

### Technical Details

**RPC Method Registration:**
```typescript
// Frontend - Register RPC method
room.registerRpcMethod('set_mode', async (request) => {
  const { mode } = request.payload as { mode: string };
  setCurrentMode(mode);
  return { success: true };
});
```

**Agent Tool Definition:**
```python
# Agent - Define tool
@agent.tool()
async def show_quiz() -> str:
    """Show a quiz interface to the user."""
    result = await room.rpc.call('set_mode', {'mode': 'quiz'})
    return "Quiz interface is now displayed."
```

**Mode Types:**
```typescript
type UIMode = 'blank' | 'quiz' | 'table';
```

### Deliverables
- 🟡 Voice commands can switch UI modes (tools defined; need final verification)
- ✅ Three distinct UI components (Quiz, Table, Blank)
- 🟡 Smooth transitions between modes (basic switch works; animation polish pending)
- ✅ Agent can query current mode

---

## Phase 3: Quiz Functionality

### Objectives
- Implement full quiz component with questions and options
- Add quiz data loading and state management
- Create option selection with animations
- Integrate quiz state with agent via RPC
- Implement next question navigation

### Implementation Steps

#### 3.1 Quiz Data Structure
- [ ] Create quiz data file with multiple questions:
  ```typescript
  interface QuizQuestion {
    id: string;
    question: string;
    options: { [key: string]: string }; // { A: "Option 1", B: "Option 2", ... }
    correctAnswer: string; // "A", "B", "C", or "D"
  }
  ```
- [ ] Hardcode quiz data (simulating backend response)
- [ ] Create quiz data loader utility

#### 3.2 Quiz State Management
- [ ] Create `QuizContext` for global quiz state:
  - Current question index
  - Selected option
  - Quiz questions array
  - Quiz status (idle, active, completed)
- [ ] Implement quiz initialization
- [ ] Handle question progression

#### 3.3 Quiz Component Implementation
- [ ] **QuestionCard Component**:
  - Display current question text
  - Show question number (e.g., "Question 1 of 5")
- [ ] **OptionButton Component**:
  - Render each option (A, B, C, D)
  - Handle click events
  - Visual states: default, selected, correct, incorrect
  - Cute animation on selection (e.g., scale, color transition)
- [ ] **NextButton Component**:
  - Show only when answer is selected
  - Navigate to next question
  - Handle quiz completion

#### 3.4 RPC Methods for Quiz Control
- [ ] Register RPC methods:
  - `load_quiz` - Loads quiz data
  - `select_option` - Selects an option (can be called by agent)
  - `next_question` - Moves to next question
  - `get_quiz_state` - Returns current quiz state
- [ ] Update agent with quiz state in context

#### 3.5 Agent Integration
- [ ] Add tool: `request_quiz` - Triggers quiz loading
- [ ] Add tool: `select_quiz_option` - Allows agent to select option via voice
- [ ] Update agent prompt to include:
  - Current question text
  - Available options
  - Current quiz state
- [ ] Handle voice commands:
  - "Give me a trivia question" → Load quiz
  - "Select A" / "Choose B" → Select option
  - "Next question" → Move to next

#### 3.6 Animations and Visual Feedback
- [ ] Implement selection animation:
  - Scale effect on click
  - Color transition (e.g., blue → green/red)
  - Smooth transitions
- [ ] Show correct/incorrect feedback:
  - Green highlight for correct
  - Red highlight for incorrect
  - Visual indicator (checkmark/X)
- [ ] Add loading states

#### 3.7 Quiz State Synchronization
- [ ] Send quiz state updates to agent via data channel or RPC
- [ ] Agent includes quiz context in LLM prompts
- [ ] Handle quiz completion state

### Technical Details

**Quiz Data Example:**
```typescript
const quizData: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: {
      A: 'London',
      B: 'Berlin',
      C: 'Paris',
      D: 'Madrid'
    },
    correctAnswer: 'C'
  },
  // ... more questions
];
```

**Option Selection Animation:**
```typescript
// Use framer-motion or CSS transitions
const OptionButton = ({ option, isSelected, isCorrect, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: isSelected 
          ? (isCorrect ? 'green' : 'red')
          : 'gray'
      }}
      onClick={onClick}
    >
      {option}
    </motion.button>
  );
};
```

**Agent Tool for Quiz:**
```python
@agent.tool()
async def request_quiz() -> str:
    """Load and display a quiz to the user."""
    result = await room.rpc.call('load_quiz', {})
    quiz_state = await room.rpc.call('get_quiz_state', {})
    
    # Include quiz state in agent context
    question = quiz_state['currentQuestion']
    options = quiz_state['options']
    
    return f"Quiz loaded. Current question: {question}. Options: {options}"
```

**Voice Command Handling:**
- Agent listens for: "select A", "choose B", "answer C", etc.
- Agent calls `select_quiz_option` RPC with selected option
- Frontend updates UI and shows feedback

### Deliverables
- ✅ Full quiz component with multiple questions
- ✅ Option selection with animations
- ✅ Correct/incorrect visual feedback
- ✅ Next question navigation
- ✅ Voice commands for quiz interaction
- ✅ Quiz state synchronized with agent

---

## Integration Points

### Frontend ↔ Agent Communication

1. **RPC Methods (Frontend → Agent)**:
   - Agent calls frontend methods to control UI
   - Methods: `set_mode`, `load_quiz`, `select_option`, `next_question`

2. **RPC Methods (Agent → Frontend)**:
   - Frontend can query agent state (optional)
   - Method: `get_agent_state`

3. **Data Channel** (Optional):
   - Send quiz state updates to agent
   - Receive agent context updates

4. **Participant Attributes**:
   - Agent state (`lk.agent.state`) for UI indicators
   - Custom attributes for mode/quiz state

### State Flow

```
User Voice Command
    ↓
Agent STT → LLM → Tool Call
    ↓
RPC Call to Frontend
    ↓
Frontend State Update
    ↓
UI Re-render
    ↓
Visual Feedback
```

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### Agent (.env)
```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key  # If using OpenAI
```

## Testing Strategy

### Phase 1 Testing
- [ ] Test push-to-talk button functionality
- [ ] Verify LiveKit connection
- [ ] Test microphone enable/disable
- [ ] Verify agent audio playback

### Phase 2 Testing
- [ ] Test each mode switch command
- [ ] Verify RPC method calls
- [ ] Test mode persistence
- [ ] Verify error handling

### Phase 3 Testing
- [ ] Test quiz loading
- [ ] Test option selection (click and voice)
- [ ] Verify animations
- [ ] Test question progression
- [ ] Test quiz completion
- [ ] Verify state synchronization

## Deployment Considerations

### Local Development
- Run LiveKit server via Docker: `docker run -p 7880:7880 livekit/livekit-server --dev`
- Or use LiveKit Cloud free tier
- Run Next.js dev server: `npm run dev`
- Run Python agent: `python agent/main.py`

### Production (Future)
- Deploy LiveKit server or use LiveKit Cloud
- Deploy Next.js to Vercel/Netlify
- Deploy Python agent to cloud service (Railway, Render, etc.)
- Set up proper authentication and token generation

## Security Considerations

1. **Token Generation**: Never expose API keys in frontend code
2. **RPC Validation**: Validate all RPC method inputs
3. **Rate Limiting**: Implement rate limiting on token endpoint
4. **CORS**: Configure CORS properly for LiveKit server

## Future Enhancements

- Real backend API for quiz data
- Multiple quiz categories
- Score tracking
- Quiz history
- More interactive components (charts, forms, etc.)
- Multi-user support
- Quiz sharing capabilities

## Dependencies

### Frontend
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "livekit-client": "^2.0.0",
    "@livekit/components-react": "^2.0.0",
    "@livekit/components-styles": "^2.0.0",
    "framer-motion": "^10.0.0",
    "zustand": "^4.0.0"
  }
}
```

### Agent
```txt
livekit-agents>=0.10.0
livekit-api>=0.10.0
openai>=1.0.0
python-dotenv>=1.0.0
```

## Timeline Estimate

- **Phase 1**: 4-6 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 6-8 hours
- **Total**: ~13-18 hours

## Notes

- Use LiveKit's free tier or local server for development
- Agent runs as local process, not deployed service
- All communication happens via WebRTC through LiveKit server
- RPC methods provide bidirectional communication
- Quiz data is hardcoded but structured to be easily replaced with API calls

