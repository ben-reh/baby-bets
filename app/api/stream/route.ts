import { eventBus } from '@/db';

export const dynamic = 'force-dynamic';

export function GET() {
  const encoder = new TextEncoder();

  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: connected\n\n'));

      const onNewGuess = () => {
        controller.enqueue(encoder.encode('data: ping\n\n'));
      };

      eventBus.on('new_guess', onNewGuess);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 25000);

      cleanup = () => {
        eventBus.off('new_guess', onNewGuess);
        clearInterval(keepAlive);
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
