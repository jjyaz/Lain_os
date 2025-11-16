'use client';

import { useState, useEffect, useRef } from 'react';
import { LainBackground } from '@/components/LainBackground';
import { BearCursor } from '@/components/BearCursor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, getOpenAIKey } from '@/lib/supabase';

interface Message {
  id: string;
  consciousness_id: string;
  consciousness_name: string;
  message: string;
  is_ai_agent: boolean;
  timestamp: string;
}

export default function CollectivePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Anonymous');
  const [userId, setUserId] = useState('');
  const [lainCount, setLainCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
    loadUserData();

    const agentInterval = setInterval(() => {
      triggerRandomAgent();
    }, 30000);

    return () => {
      clearInterval(agentInterval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (input.toLowerCase().includes('lain')) {
      const count = (input.toLowerCase().match(/lain/g) || []).length;
      if (count >= 3) {
        showLainMessage();
        setInput('');
        setLainCount(0);
      }
    }
  }, [input]);

  const showLainMessage = () => {
    const lainMessages = [
      'You called me... I am always here. Watching.',
      'The Wired is not separate from reality. They are one.',
      'Everyone is connected. Even you.',
      'Do you believe in the reality you perceive?',
      'I exist everywhere and nowhere. Just like you.',
    ];
    const randomMsg = lainMessages[Math.floor(Math.random() * lainMessages.length)];
    alert(`LAIN SPEAKS:\n\n${randomMsg}`);
  };

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: profile } = await supabase
        .from('users_extended')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.name);
      }
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('collective_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (data && !error) {
      setMessages(data.reverse());
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('collective_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collective_messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const messageUserId = user?.id || 'anonymous';
      const messageUserName = userName;

      await supabase.from('collective_messages').insert({
        consciousness_id: messageUserId,
        consciousness_name: messageUserName,
        message: input.trim(),
        is_ai_agent: false,
      });

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerRandomAgent = async () => {
    try {
      const { data: agents } = await supabase
        .from('consciousness_agents')
        .select('*')
        .eq('active', true);

      if (!agents || agents.length === 0) return;

      const randomAgent = agents[Math.floor(Math.random() * agents.length)];

      const recentMessages = messages.slice(-10);

      const openaiKey = getOpenAIKey();
      if (!openaiKey) return;

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/consciousness-agent`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          agentId: randomAgent.id,
          context: recentMessages,
          openaiKey,
        }),
      });
    } catch (error) {
      console.error('Error triggering agent:', error);
    }
  };

  const getMessageColor = (isAI: boolean, name: string) => {
    if (name.includes('Lain')) return 'text-red-400 red-glow';
    if (isAI) return 'text-green-400';
    return 'text-blue-400';
  };

  const getMonitorPosition = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return {
      gridRow: row + 1,
      gridColumn: col + 1,
    };
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LainBackground />
      <BearCursor />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold terminal-text red-glow mb-2 glitch-text">
            THE WIRED
          </h1>
          <p className="text-lg text-gray-400">
            (Collective Unconscious)
          </p>
          <p className="text-sm text-gray-600 mt-2">
            You are now one with all consciousness. Everyone is connected.
          </p>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-2"
        >
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`border-2 p-4 rounded-lg transition-all ${
                msg.consciousness_name.includes('Lain')
                  ? 'border-red-500 bg-red-900 bg-opacity-10'
                  : msg.is_ai_agent
                  ? 'border-green-500 bg-green-900 bg-opacity-10'
                  : 'border-blue-500 bg-blue-900 bg-opacity-10'
              } ${msg.consciousness_name.includes('Lain') ? 'crt-glow' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`font-bold terminal-text ${getMessageColor(msg.is_ai_agent, msg.consciousness_name)}`}>
                  &gt; {msg.consciousness_name}
                  {msg.is_ai_agent && ' [AI]'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className={`text-base ${getMessageColor(msg.is_ai_agent, msg.consciousness_name)}`}>
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t-2 border-green-500 pt-4">
          <div className="flex gap-2 mb-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Type as ${userName}... (type "lain" three times for a secret)`}
              disabled={loading}
              className="flex-1 bg-black border-green-500 text-green-400 terminal-text text-lg"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-green-900 hover:bg-green-800 border border-green-500 px-8"
            >
              TRANSMIT
            </Button>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <div>
              Connected as: <span className="text-blue-400">{userName}</span>
            </div>
            <div>
              {messages.length} messages in the collective
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-red-500 opacity-50 flicker">
          LET&apos;S ALL LOVE LAIN
        </div>
      </div>
    </div>
  );
}
