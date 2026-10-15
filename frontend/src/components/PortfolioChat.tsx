import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createThreadId } from "@/lib/thread-id";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function PortfolioChat() {
  const [question, setQuestion] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [threadId, setThreadId] = useState(() => {
    const saved = localStorage.getItem("portfolio-thread-id");
    if (saved) return saved;

    const id = createThreadId();
    localStorage.setItem("portfolio-thread-id", id);
    return id;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("portfolio-chat-history") ?? "null");
      if (saved?.threadId === threadId && Array.isArray(saved.messages) &&
          saved.messages.every((m: ChatMessage) => m &&
            (m.role === "user" || m.role === "assistant") && typeof m.content === "string")) {
        return saved.messages;
      }
    } catch { /* Ignore invalid saved history. */ }
    return [];
  });
  const [storageError, setStorageError] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem("portfolio-chat-history", JSON.stringify({ threadId, messages }));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [threadId, messages]);

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [messages, isLoading, error]);

  function startNewConversation() {
    if (sendingRef.current) return;
    const id = createThreadId();

    localStorage.setItem("portfolio-thread-id", id);
    setThreadId(id);
    setQuestion("");
    setMessages([]);
    setError("");
  }

  async function sendQuestion() {
    if (!question.trim() || sendingRef.current) return;
    sendingRef.current = true;
    const content = question.trim();

    setIsLoading(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content }]);
    setQuestion("");

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          thread_id: threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();

      if (typeof data?.message !== "string") {
        throw new Error("Unexpected server response");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (error) {
      setQuestion(content);
      setError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xl shadow-primary/5">
      <p className="text-muted-foreground mb-6">Hi! Ask about my backend experience, skills, or projects.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {["What is Maksym's backend experience?", "What projects has he built?", "What did he do at Rozetka?"].map((prompt) => (
          <Button key={prompt} className="h-auto whitespace-normal text-left" variant="outline" type="button" disabled={isLoading} onClick={() => setQuestion(prompt)}>{prompt}</Button>
        ))}
      </div>
      {storageError && <p role="status" className="mb-4 text-sm text-muted-foreground">History could not be saved in this browser.</p>}
      <div ref={historyRef} role="log" aria-label="Conversation" aria-live="polite" className="mb-6 max-h-[55dvh] overflow-y-auto overscroll-contain space-y-4 pr-2">
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-2xl bg-primary/10 px-4 py-3" : "mr-auto max-w-[95%] rounded-2xl bg-muted/50 px-4 py-3"}>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">{message.role === "user" ? "You" : "AI assistant"}</p>
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          </div>
        ))}
        {isLoading && <p className="text-muted-foreground">Thinking…</p>}
      </div>
      {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void sendQuestion(); }}>
        <label htmlFor="portfolio-question" className="block font-medium">Your question</label>
        <Textarea id="portfolio-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" rows={4} maxLength={2000} disabled={isLoading} required />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!question.trim() || isLoading}>{isLoading ? "Thinking…" : "Send"}</Button>
          <Button type="button" variant="outline" onClick={startNewConversation} disabled={isLoading}>New conversation</Button>
        </div>
      </form>
    </div>
  );
}
