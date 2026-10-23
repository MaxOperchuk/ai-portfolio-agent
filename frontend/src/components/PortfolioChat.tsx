import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createThreadId } from "@/lib/thread-id";
import { isChatHistory, hasPendingAnswer, type ChatMessage, type PendingRequest } from "@/lib/chat-history";

const PENDING_KEY = "portfolio-pending-request";
const WAIT_LIMIT_MS = 180_000;

function readPending(threadId: string): PendingRequest | null {
  try {
    const data = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null");
    if (data?.threadId === threadId && Number.isInteger(data.userIndex) &&
        data.userIndex >= 0 && typeof data.content === "string") return data;
  } catch { /* Ignore unavailable storage or invalid saved data. */ }
  return null;
}

export default function PortfolioChat() {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [historyReady, setHistoryReady] = useState(false);
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const [recoveryVersion, setRecoveryVersion] = useState(0);
  const [storageError, setStorageError] = useState(false);
  const [threadId, setThreadId] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolio-thread-id");
      if (saved) return saved;
    } catch { /* Continue with an in-memory conversation. */ }
    return createThreadId();
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("portfolio-chat-history") ?? "null");
      if (saved?.threadId === threadId && isChatHistory(saved.messages)) return saved.messages;
    } catch { /* Ignore invalid saved history. */ }
    return [];
  });
  const historyRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const postControllerRef = useRef<AbortController | null>(null);

  function savePending(value: PendingRequest | null) {
    setPending(value);
    try {
      if (value) localStorage.setItem(PENDING_KEY, JSON.stringify(value));
      else localStorage.removeItem(PENDING_KEY);
    } catch {
      setStorageError(true);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let requestTimer: ReturnType<typeof setTimeout>;
    const savedPending = readPending(threadId);
    const waiting = savedPending;
    const deadline = Date.now() + WAIT_LIMIT_MS;
    setPending(savedPending);
    setIsLoading(true);
    setHistoryReady(false);
    setError("");

    function finishWithError(message: string) {
      setError(message);
      setIsLoading(false);
    }

    async function loadHistory() {
      // Separate timeout per request so an unreachable server cannot hang forever.
      const requestController = new AbortController();
      const abortRequest = () => requestController.abort();
      controller.signal.addEventListener("abort", abortRequest, { once: true });
      requestTimer = setTimeout(abortRequest, 10_000);
      try {
        const params = new URLSearchParams({ thread_id: threadId });
        const response = await fetch(`/api/v1/get-history?${params}`, {
          signal: requestController.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`History request failed (${response.status})`);
        const data = await response.json();
        if (!isChatHistory(data?.history)) throw new Error("Unexpected history response");
        if (controller.signal.aborted) return;

        if (!waiting || hasPendingAnswer(data.history, waiting)) {
          setMessages(data.history);
          if (waiting) {
            setPending(null);
            try { localStorage.removeItem(PENDING_KEY); } catch { setStorageError(true); }
          }
          setHistoryReady(true);
          setIsLoading(false);
          setError("");
          return;
        }

        // The checkpoint can briefly lag behind the question submitted by the browser.
        if (data.history.length > waiting.userIndex) setMessages(data.history);
        if (Date.now() >= deadline) {
          finishWithError("The answer is taking longer than expected. Check again or start a new conversation.");
          return;
        }
        timer = setTimeout(loadHistory, 2000);
      } catch {
        if (controller.signal.aborted) return;
        if (waiting && Date.now() < deadline) {
          timer = setTimeout(loadHistory, 2000);
        } else {
          finishWithError("Unable to restore the conversation. Check again; your question will not be resent.");
        }
      } finally {
        clearTimeout(requestTimer);
        controller.signal.removeEventListener("abort", abortRequest);
      }
    }

    void loadHistory();
    return () => {
      controller.abort();
      clearTimeout(timer);
      clearTimeout(requestTimer);
    };
  }, [threadId, recoveryVersion]);

  useEffect(() => () => postControllerRef.current?.abort(), []);

  useEffect(() => {
    try {
      localStorage.setItem("portfolio-thread-id", threadId);
      localStorage.setItem("portfolio-chat-history", JSON.stringify({ threadId, messages }));
    } catch { setStorageError(true); }
  }, [threadId, messages]);

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [messages, isLoading, error]);

  function startNewConversation() {
    if (sendingRef.current || isLoading) return;
    savePending(null);
    setHistoryReady(false);
    setIsLoading(true);
    setThreadId(createThreadId());
    setQuestion("");
    setMessages([]);
    setError("");
  }

  async function sendQuestion() {
    if (!question.trim() || sendingRef.current || isLoading || !historyReady || pending) return;
    sendingRef.current = true;
    const content = question.trim();
    const request: PendingRequest = { threadId, userIndex: messages.length, content };
    const controller = new AbortController();
    postControllerRef.current = controller;
    // Persist synchronously before starting POST; a reload can happen at any time.
    savePending(request);
    setIsLoading(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content }]);
    setQuestion("");
    const requestTimer = setTimeout(() => controller.abort(), WAIT_LIMIT_MS);
    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, thread_id: threadId }),
        signal: controller.signal,
      });
      if (response.status === 429) {
        savePending(null);
        setIsLoading(false);
        setQuestion(content);
        setMessages((current) => current.slice(0, request.userIndex));
        setError("Too many requests. Please wait a moment and try again.");
        return;
      }
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();
      if (typeof data?.message !== "string") throw new Error("Unexpected server response");
      if (controller.signal.aborted) return;
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
      savePending(null);
      setIsLoading(false);
    } catch {
      // A failed connection does not mean the server stopped processing the question.
      // Recover via GET rather than risk a second AI invocation.
      setRecoveryVersion((version) => version + 1);
    } finally {
      clearTimeout(requestTimer);
      sendingRef.current = false;
      postControllerRef.current = null;
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xl shadow-primary/5">
      <p className="text-muted-foreground mb-6">Hi! Ask about my backend experience, skills, or projects.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {["What is Maksym's backend experience?", "What projects has he built?", "What did he do at Rozetka?"].map((prompt) => (
          <Button key={prompt} className="h-auto whitespace-normal text-left" variant="outline" type="button" disabled={isLoading || !historyReady || !!pending} onClick={() => setQuestion(prompt)}>{prompt}</Button>
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
        {isLoading && <p className="text-muted-foreground">{pending ? "Waiting for the answer…" : "Loading conversation…"}</p>}
      </div>
      {error && (
        <div className="mb-4 space-y-3">
          <p role="alert" className="text-destructive">{error}</p>
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => setRecoveryVersion((version) => version + 1)}>Check again</Button>
        </div>
      )}
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void sendQuestion(); }}>
        <label htmlFor="portfolio-question" className="block font-medium">Your question</label>
        <Textarea id="portfolio-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" rows={4} maxLength={2000} disabled={isLoading || !historyReady || !!pending} required />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!question.trim() || isLoading || !historyReady || !!pending}>{isLoading ? "Thinking…" : "Send"}</Button>
          <Button type="button" variant="outline" onClick={startNewConversation} disabled={isLoading}>New conversation</Button>
        </div>
      </form>
    </div>
  );
}
