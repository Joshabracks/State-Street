/**
 * WebLLM inference worker. Runs the model off the main thread so token generation
 * never blocks the render loop. Webpack bundles this as a separate chunk (referenced
 * by `new Worker(new URL("./llm.worker.ts", import.meta.url))` in llm.ts), so the
 * heavy WebLLM runtime only loads when the user summons the stylist.
 */
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => handler.onmessage(msg);
