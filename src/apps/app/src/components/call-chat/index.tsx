'use client';
import { useMessages } from '@/src/hooks/use-messages';
import { Button } from '@helsa/ui/components/button';
import { Input } from '@helsa/ui/components/input';
import { User } from 'better-auth';
import { formatDistance } from 'date-fns';
import { fromZonedTime, toDate } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
const CallCHat = ({ id }: { id: string }) => {
  const [user] = useLocalStorage<User | null>('user', null);
  return (
    <>
      <div className="h-2"></div>
      <ChatList userId={user?.id || ''} appointmentId={id} />
      <ChatFooter userId={user?.id || ''} appointmentId={id} />
    </>
  );
};

const ChatFooter = ({ appointmentId, userId }: { appointmentId: string; userId: string }) => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useMessages(appointmentId);
  const handleSend = () => {
    sendMessage({ text: message, userId, appointmentId });
    setMessage('');
  };
  return (
    <div className="h-16 flex justify-between items-center relative px-3 py-2">
      <Input
        className="h-10 border border-primary rounded-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 pr-8 py-0"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Escribe un mensaje..."
      />
      <Button className="size-8 p-0 rounded-none absolute right-4" size={'icon'} onClick={handleSend}>
        <Send className="size-3" />
      </Button>
    </div>
  );
};

const ChatList = ({ userId, appointmentId }: { userId: string; appointmentId: string }) => {
  const { messages } = useMessages(appointmentId);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, [messages]);
  return (
    <div className="flex-auto h-[50vh] overflow-y-scroll py-2 no-scroll" ref={ref}>
      {messages.length === 0 && (
        <div className="text-center h-full w-full flex justify-center items-center">No messages</div>
      )}
      {messages.map((message, index) => {
        const isUserMessage = message.userId === userId;
        return (
          <div
            key={`message-${index}`}
            className={`py-2 px-2 ${isUserMessage ? 'justify-end' : 'justify-start'} w-full text-sm flex items-center`}
          >
            <div
              className={`p-2 ${
                isUserMessage ? 'bg-stone-600 text-right  justify-end' : 'bg-sidebar text-left'
              } text-sm flex flex-col justify-center rounded-none`}
            >
              {message.text}
              <span className={`text-xs ${isUserMessage ? '' : 'text-muted-foreground'}`}>
                {formatDistance(
                  toDate(message.createdAt!, { timeZone: 'UTC' }),
                  fromZonedTime(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone),
                  { addSuffix: false, locale: es },
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="flex-auto h-[50vh] overflow-y-scroll py-2 no-scroll">
      {[1, 2, 3, 4, 5].map((_, index) => (
        <div key={`skeleton-${index}`} className="py-2 px-2 w-full text-sm flex items-center">
          <div className="p-2 bg-stone-600 text-right justify-end text-sm flex flex-col rounded-none">
            <div className="animate-pulse bg-stone-600 h-5 w-1/2 rounded-none"></div>
            <div className="animate-pulse bg-stone-600 h-3 w-1/4 rounded-none"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CallCHat;
