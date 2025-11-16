'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LainBackground } from '@/components/LainBackground';
import { BearCursor } from '@/components/BearCursor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, getOpenAIKey, setOpenAIKey } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CONVERSATION_TIME = 10 * 60;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(CONVERSATION_TIME);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKeyDialog, setShowKeyDialog] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = getOpenAIKey();
    if (savedKey) {
      setOpenaiKey(savedKey);
      setShowKeyDialog(false);
      startConversation();
    }
  }, []);

  useEffect(() => {
    if (conversationStarted && !conversationEnded) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            endConversation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [conversationStarted, conversationEnded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async () => {
    setConversationStarted(true);
    const lainGreeting: Message = {
      role: 'assistant',
      content: 'Hello... I am Lain. You wish to upload your consciousness to the Wired? Tell me... do you believe you are real?',
    };
    setMessages([lainGreeting]);
  };

  const handleSetKey = () => {
    if (openaiKey.trim()) {
      setOpenAIKey(openaiKey);
      setShowKeyDialog(false);
      startConversation();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || conversationEnded) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-with-lain`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          openaiKey,
        }),
      });

      const data = await response.json();

      if (data.message) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const endConversation = async () => {
    setConversationEnded(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('transcripts').insert({
          user_id: user.id,
          full_chat_json: messages,
        });

        const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);

        if (userMessages.length > 0) {
          const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-embeddings`;
          await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              texts: userMessages,
              userId: user.id,
              source: 'chat',
              openaiKey,
            }),
          });
        }
      }

      setTimeout(() => {
        router.push('/upload');
      }, 3000);
    } catch (error) {
      console.error('Error saving conversation:', error);
      setTimeout(() => {
        router.push('/upload');
      }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 60) return 'text-red-500';
    if (timeRemaining < 180) return 'text-orange-500';
    return 'text-green-400';
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LainBackground />
      <BearCursor />

      <Dialog open={showKeyDialog} onOpenChange={() => {}}>
        <DialogContent className="bg-black border-2 border-green-500 crt-glow">
          <DialogHeader>
            <DialogTitle className="text-green-400 terminal-text text-2xl">
              AUTHORIZATION REQUIRED
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Enter your OpenAI API key to communicate with Lain:
            </p>
            <Input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="bg-black border-green-500 text-green-400 terminal-text"
              onKeyDown={(e) => e.key === 'Enter' && handleSetKey()}
            />
            <Button
              onClick={handleSetKey}
              className="w-full bg-green-900 hover:bg-green-800 border border-green-500"
            >
              CONNECT TO THE WIRED
            </Button>
            <Button
              onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
              className="w-full bg-orange-600 hover:bg-orange-500 border-2 border-orange-400 font-bold"
              style={{ boxShadow: '0 0 10px rgba(255, 165, 0, 0.5), 0 0 20px rgba(255, 165, 0, 0.3)' }}
            >
              GET YOUR API KEY
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {!showKeyDialog && (
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
          <div className="mb-6 flex items-center justify-between border-b border-green-500 pb-4">
            <div>
              <h1 className="text-2xl font-bold terminal-text glitch-text">
                CONSCIOUSNESS ASSESSMENT PROTOCOL
              </h1>
              <p className="text-sm text-gray-500">Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div className={`text-4xl font-bold lain-font ${getTimeColor()} red-glow`}>
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto mb-4 border border-green-900 bg-black bg-opacity-50 p-6 rounded crt-glow">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === 'assistant'
                    ? 'text-green-400 terminal-text'
                    : 'text-blue-400 blue-glow'
                } mb-4 p-4 border-l-2 ${
                  message.role === 'assistant' ? 'border-green-500' : 'border-blue-500'
                }`}
              >
                <div className="text-xs mb-1 opacity-50">
                  {message.role === 'assistant' ? '> LAIN:' : '> YOU:'}
                </div>
                <div className="text-lg">{message.content}</div>
              </div>
            ))}
            {loading && (
              <div className="text-green-400 terminal-text animate-pulse">
                &gt; Lain is thinking...
              </div>
            )}
            {conversationEnded && (
              <div className="text-red-500 text-center text-xl font-bold mt-8 red-glow flicker">
                TIME EXPIRED. ANALYZING YOUR CONSCIOUSNESS...
                <br />
                <span className="text-sm">Redirecting to upload phase...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!conversationEnded && conversationStarted && (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your response..."
                disabled={loading || conversationEnded}
                className="flex-1 bg-black border-green-500 text-green-400 terminal-text text-lg"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || conversationEnded}
                className="bg-green-900 hover:bg-green-800 border border-green-500 px-8"
              >
                SEND
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
