export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PendingRequest {
  threadId: string;
  userIndex: number;
  content: string;
}

export function isChatHistory(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every((message) =>
    message && (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

export function hasPendingAnswer(history: ChatMessage[], pending: PendingRequest): boolean {
  const question = history[pending.userIndex];
  const answer = history[pending.userIndex + 1];
  return question?.role === "user" && question.content === pending.content &&
    answer?.role === "assistant";
}
