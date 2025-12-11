# RPC Methods and Agent Tools Reference

This document provides a quick reference for all RPC methods and agent tools used in the project.

## RPC Methods (Frontend → Agent)

These methods are registered in the frontend and can be called by the agent.

### `set_mode`
Changes the current UI mode.

**Request:**
```typescript
{
  mode: 'blank' | 'quiz' | 'table'
}
```

**Response:**
```typescript
{
  success: boolean
}
```

**Usage in Agent:**
```python
await room.rpc.call('set_mode', {'mode': 'quiz'})
```

---

### `get_mode`
Returns the current UI mode.

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
{
  mode: 'blank' | 'quiz' | 'table'
}
```

**Usage in Agent:**
```python
result = await room.rpc.call('get_mode', {})
current_mode = result['mode']
```

---

### `load_quiz`
Loads quiz data and initializes the quiz component.

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
{
  success: boolean,
  questionCount: number
}
```

**Usage in Agent:**
```python
result = await room.rpc.call('load_quiz', {})
```

---

### `select_option`
Selects an option in the current quiz question.

**Request:**
```typescript
{
  option: 'A' | 'B' | 'C' | 'D'
}
```

**Response:**
```typescript
{
  success: boolean,
  isCorrect: boolean,
  correctAnswer: string
}
```

**Usage in Agent:**
```python
result = await room.rpc.call('select_option', {'option': 'A'})
is_correct = result['isCorrect']
```

---

### `next_question`
Moves to the next question in the quiz.

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
{
  success: boolean,
  hasMoreQuestions: boolean,
  questionNumber?: number
}
```

**Usage in Agent:**
```python
result = await room.rpc.call('next_question', {})
has_more = result['hasMoreQuestions']
```

---

### `get_quiz_state`
Returns the current quiz state.

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
{
  isActive: boolean,
  currentQuestionIndex: number,
  totalQuestions: number,
  currentQuestion?: {
    id: string,
    question: string,
    options: { [key: string]: string },
    correctAnswer: string
  },
  selectedOption?: string,
  isCorrect?: boolean
}
```

**Usage in Agent:**
```python
state = await room.rpc.call('get_quiz_state', {})
if state['isActive']:
    question = state['currentQuestion']['question']
    options = state['currentQuestion']['options']
```

---

## Agent Tools (Agent → Frontend)

These tools are defined in the agent and can be called by the LLM based on user voice commands.

### `show_quiz`
Displays the quiz interface.

**Tool Definition:**
```python
@agent.tool()
async def show_quiz() -> str:
    """Show a quiz interface to the user. Use this when the user asks for a quiz or trivia question."""
    result = await room.rpc.call('set_mode', {'mode': 'quiz'})
    return "Quiz interface is now displayed. You can ask the user if they want to start a quiz."
```

**Voice Triggers:**
- "Show a quiz"
- "Give me a quiz"
- "I want to see a quiz"
- "Display quiz"

---

### `show_table`
Displays the table interface.

**Tool Definition:**
```python
@agent.tool()
async def show_table() -> str:
    """Show a table interface to the user. Use this when the user asks to see a table."""
    result = await room.rpc.call('set_mode', {'mode': 'table'})
    return "Table interface is now displayed."
```

**Voice Triggers:**
- "Show a table"
- "Display table"
- "I want to see a table"

---

### `show_blank`
Displays a blank screen.

**Tool Definition:**
```python
@agent.tool()
async def show_blank() -> str:
    """Clear the screen and show a blank interface. Use this when the user asks to clear the screen or show nothing."""
    result = await room.rpc.call('set_mode', {'mode': 'blank'})
    return "Screen is now cleared."
```

**Voice Triggers:**
- "Show nothing"
- "Clear screen"
- "Blank screen"
- "Hide everything"

---

### `request_quiz`
Loads and displays a quiz with questions.

**Tool Definition:**
```python
@agent.tool()
async def request_quiz() -> str:
    """Load and display a quiz to the user. This will show the first question with options."""
    result = await room.rpc.call('load_quiz', {})
    quiz_state = await room.rpc.call('get_quiz_state', {})
    
    if quiz_state['isActive']:
        question = quiz_state['currentQuestion']
        question_text = question['question']
        options_text = "\n".join([f"{k}: {v}" for k, v in question['options'].items()])
        
        return f"Quiz loaded! Here's the first question:\n\n{question_text}\n\nOptions:\n{options_text}\n\nYou can ask the user which option they'd like to select."
    else:
        return "Failed to load quiz. Please try again."
```

**Voice Triggers:**
- "Give me a trivia question"
- "Start a quiz"
- "Load a quiz"
- "I want to answer some questions"

---

### `select_quiz_option`
Selects an option in the current quiz question.

**Tool Definition:**
```python
@agent.tool()
async def select_quiz_option(option: str) -> str:
    """Select an option (A, B, C, or D) in the current quiz question.
    
    Args:
        option: The option to select, must be 'A', 'B', 'C', or 'D'
    """
    if option.upper() not in ['A', 'B', 'C', 'D']:
        return f"Invalid option '{option}'. Please select A, B, C, or D."
    
    result = await room.rpc.call('select_option', {'option': option.upper()})
    
    if result['success']:
        if result['isCorrect']:
            return f"Correct! Option {option.upper()} is the right answer. Great job!"
        else:
            correct = result['correctAnswer']
            return f"Incorrect. The correct answer is {correct}. Would you like to continue to the next question?"
    else:
        return "Failed to select option. Please try again."
```

**Voice Triggers:**
- "Select A" / "Choose A" / "Answer A"
- "I think it's B"
- "Option C"
- "The answer is D"

---

### `next_quiz_question`
Moves to the next question in the quiz.

**Tool Definition:**
```python
@agent.tool()
async def next_quiz_question() -> str:
    """Move to the next question in the quiz. Use this when the user wants to continue."""
    result = await room.rpc.call('next_question', {})
    
    if result['success']:
        if result['hasMoreQuestions']:
            quiz_state = await room.rpc.call('get_quiz_state', {})
            question = quiz_state['currentQuestion']
            question_text = question['question']
            options_text = "\n".join([f"{k}: {v}" for k, v in question['options'].items()])
            
            return f"Next question:\n\n{question_text}\n\nOptions:\n{options_text}"
        else:
            return "Congratulations! You've completed the quiz. Great job!"
    else:
        return "Failed to move to next question."
```

**Voice Triggers:**
- "Next question"
- "Continue"
- "Show me the next one"
- "Move on"

---

## Frontend RPC Registration Example

```typescript
// In your LiveKit room setup
room.registerRpcMethod('set_mode', async (request) => {
  const { mode } = request.payload as { mode: string };
  
  // Validate mode
  if (!['blank', 'quiz', 'table'].includes(mode)) {
    return { success: false, error: 'Invalid mode' };
  }
  
  // Update state
  setCurrentMode(mode);
  
  return { success: true };
});

room.registerRpcMethod('load_quiz', async (request) => {
  const quizData = loadQuizData(); // Load from your data source
  initializeQuiz(quizData);
  
  return { 
    success: true, 
    questionCount: quizData.length 
  };
});

room.registerRpcMethod('select_option', async (request) => {
  const { option } = request.payload as { option: string };
  const currentQuestion = getCurrentQuestion();
  
  const isCorrect = option === currentQuestion.correctAnswer;
  selectOption(option, isCorrect);
  
  return {
    success: true,
    isCorrect,
    correctAnswer: currentQuestion.correctAnswer
  };
});
```

---

## Agent Tool Registration Example

```python
from livekit.agents import llm, rtc

# In your agent setup
@agent.tool()
async def show_quiz() -> str:
    """Show a quiz interface to the user."""
    result = await room.rpc.call('set_mode', {'mode': 'quiz'})
    return "Quiz interface displayed."

# Register tools with LLM
tools = [
    show_quiz,
    show_table,
    show_blank,
    request_quiz,
    select_quiz_option,
    next_quiz_question,
]

# Configure LLM with tools
llm = llm.LLM(
    model="gpt-4",
    tools=tools,
)
```

---

## Error Handling

All RPC methods should handle errors gracefully:

**Frontend:**
```typescript
try {
  const result = await room.rpc.call('method_name', payload);
  // Handle success
} catch (error) {
  console.error('RPC call failed:', error);
  // Handle error
}
```

**Agent:**
```python
try:
    result = await room.rpc.call('method_name', payload)
    # Handle success
except Exception as e:
    logger.error(f"RPC call failed: {e}")
    return f"Sorry, I encountered an error: {str(e)}"
```

---

## State Flow Example

1. **User says**: "Give me a trivia question"
2. **Agent LLM** → Calls `request_quiz` tool
3. **Tool** → Calls `load_quiz` RPC method
4. **Frontend** → Loads quiz data, updates state, renders quiz
5. **Tool** → Calls `get_quiz_state` RPC method
6. **Frontend** → Returns current question and options
7. **Agent** → Speaks question and options to user
8. **User says**: "Select A"
9. **Agent LLM** → Calls `select_quiz_option` tool with "A"
10. **Tool** → Calls `select_option` RPC method
11. **Frontend** → Updates UI, shows correct/incorrect feedback
12. **Tool** → Returns feedback to agent
13. **Agent** → Speaks feedback to user

