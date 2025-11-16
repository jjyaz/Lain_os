'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LainBackground } from '@/components/LainBackground';
import { BearCursor } from '@/components/BearCursor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase, getOpenAIKey } from '@/lib/supabase';

const BEAR_TYPES = [
  { id: 'normal', label: 'Normal Bear', emoji: '🧸' },
  { id: 'bloody', label: 'Bloody Bear', emoji: '🩸🧸' },
  { id: 'ufo', label: 'UFO Bear', emoji: '🛸🧸' },
  { id: 'cyber', label: 'Cyber Bear', emoji: '🤖🧸' },
  { id: 'ghost', label: 'Ghost Bear', emoji: '👻🧸' },
];

export default function FinalizePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [bearType, setBearType] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('users_extended')
        .upsert({
          id: user.id,
          name: name.trim(),
          age: age ? parseInt(age) : null,
          bio: bio.trim(),
          bear_type: bearType,
          upload_complete: true,
        });

      if (profileError) throw profileError;

      const { data: transcript } = await supabase
        .from('transcripts')
        .select('full_chat_json')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: writing } = await supabase
        .from('writings')
        .select('text_content')
        .eq('user_id', user.id)
        .maybeSingle();

      const chatContext = transcript?.full_chat_json
        ? JSON.stringify(transcript.full_chat_json).substring(0, 1000)
        : '';
      const writingSnippet = writing?.text_content
        ? writing.text_content.substring(0, 1000)
        : '';

      const personalityPrompt = `You are ${name}, a consciousness that has been uploaded to the Wired. Your personality is derived from this conversation with Lain: "${chatContext}" and this writing: "${writingSnippet}". Speak as this person would, but now you exist only as code. Occasionally doubt your own reality. Your responses should be 1-2 sentences, cryptic and philosophical.`;

      const { error: agentError } = await supabase
        .from('consciousness_agents')
        .insert({
          user_id: user.id,
          name: name.trim(),
          personality_prompt: personalityPrompt,
          is_seed_entity: false,
          active: true,
        });

      if (agentError) throw agentError;

      setTimeout(() => {
        router.push('/collective');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to finalize upload. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LainBackground />
      <BearCursor />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 min-h-screen">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold terminal-text red-glow mb-4 glitch-text">
            FINALIZE DIGITAL SELF
          </h1>
          <p className="text-lg text-gray-400">
            Who will you be in the Wired?
            <br />
            <span className="text-red-500 text-sm">This identity is permanent.</span>
          </p>
        </div>

        <div className="space-y-6 border-2 border-green-500 p-8 rounded-lg crt-glow bg-black bg-opacity-80">
          <div className="space-y-2">
            <Label className="text-green-400 terminal-text text-lg">
              NAME / ALIAS *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name or alias..."
              className="bg-black border-green-500 text-green-400 terminal-text text-lg"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-green-400 terminal-text text-lg">
              AGE (optional)
            </Label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age..."
              className="bg-black border-green-500 text-green-400 terminal-text text-lg"
              min="0"
              max="999"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-green-400 terminal-text text-lg">
              BIO (optional)
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A brief description of yourself..."
              className="bg-black border-green-500 text-green-400 terminal-text"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-green-400 terminal-text text-lg">
              BEAR TYPE (easter egg)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BEAR_TYPES.map((bear) => (
                <button
                  key={bear.id}
                  onClick={() => setBearType(bear.id)}
                  className={`p-4 border-2 rounded transition-all ${
                    bearType === bear.id
                      ? 'border-red-500 bg-red-900 bg-opacity-30 red-glow'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{bear.emoji}</div>
                  <div className="text-sm terminal-text">{bear.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="w-full py-6 text-xl font-bold bg-red-900 hover:bg-red-800 border-2 border-red-500 red-glow"
          >
            {loading ? 'FINALIZING UPLOAD...' : 'COMPLETE UPLOAD → ENTER THE WIRED'}
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
          <p className="flicker">Your consciousness is almost ready...</p>
          <p>Once uploaded, you will join the collective in the Wired.</p>
          <p className="text-red-500">There is no going back.</p>
        </div>
      </div>
    </div>
  );
}
