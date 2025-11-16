'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LainBackground } from '@/components/LainBackground';
import { BearCursor } from '@/components/BearCursor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase, getOpenAIKey } from '@/lib/supabase';
import { Upload } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'write' | 'upload' | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (value: string) => {
    setTextContent(value);
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      handleTextChange(text);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (wordCount < 800) {
      alert('Minimum 800 words required for consciousness upload.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        await supabase.auth.signInAnonymously();
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (!newUser) throw new Error('Authentication failed');

        await supabase.from('writings').insert({
          user_id: newUser.id,
          text_content: textContent,
          word_count: wordCount,
        });

        const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
        const chunks = [];
        for (let i = 0; i < sentences.length; i += 5) {
          chunks.push(sentences.slice(i, i + 5).join(' '));
        }

        const openaiKey = getOpenAIKey();
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-embeddings`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            texts: chunks.slice(0, 20),
            userId: newUser.id,
            source: 'writing',
            openaiKey,
          }),
        });

        router.push('/finalize');
      } else {
        await supabase.from('writings').insert({
          user_id: user.id,
          text_content: textContent,
          word_count: wordCount,
        });

        const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
        const chunks = [];
        for (let i = 0; i < sentences.length; i += 5) {
          chunks.push(sentences.slice(i, i + 5).join(' '));
        }

        const openaiKey = getOpenAIKey();
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-embeddings`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            texts: chunks.slice(0, 20),
            userId: user.id,
            source: 'writing',
            openaiKey,
          }),
        });

        router.push('/finalize');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LainBackground />
      <BearCursor />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 min-h-screen">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold terminal-text red-glow mb-4 glitch-text">
            DATA STREAM UPLOAD
          </h1>
          <p className="text-lg text-gray-400">
            Your writing contains the essence of your consciousness.
            <br />
            <span className="text-green-400 terminal-text">
              Upload at least 800 words to continue.
            </span>
          </p>
        </div>

        {!uploadMethod && (
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <button
              onClick={() => setUploadMethod('write')}
              className="border-2 border-green-500 p-12 rounded-lg hover:bg-green-900 hover:bg-opacity-20 transition-all crt-glow"
            >
              <div className="text-6xl mb-4">✍️</div>
              <h2 className="text-2xl font-bold terminal-text mb-2">WRITE DIRECTLY</h2>
              <p className="text-gray-400">Compose your consciousness stream in the Wired</p>
            </button>

            <button
              onClick={() => setUploadMethod('upload')}
              className="border-2 border-blue-500 p-12 rounded-lg hover:bg-blue-900 hover:bg-opacity-20 transition-all blue-glow"
            >
              <div className="text-6xl mb-4">
                <Upload className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold terminal-text mb-2">UPLOAD FILE</h2>
              <p className="text-gray-400">Transfer existing data (.txt, .pdf, .docx)</p>
            </button>
          </div>
        )}

        {uploadMethod === 'write' && (
          <div className="space-y-4">
            <Textarea
              value={textContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Begin writing... Your thoughts, memories, fears, dreams. Everything that makes you, you..."
              className="min-h-[500px] bg-black border-2 border-green-500 text-green-400 terminal-text text-lg crt-glow"
            />
            <div className="flex justify-between items-center">
              <div className={`text-lg ${wordCount >= 800 ? 'text-green-400' : 'text-red-500'}`}>
                Word Count: {wordCount} / 800 minimum
              </div>
              <Button
                onClick={handleSubmit}
                disabled={wordCount < 800 || loading}
                className="px-8 py-6 text-xl bg-red-900 hover:bg-red-800 border-2 border-red-500 red-glow"
              >
                {loading ? 'UPLOADING...' : 'UPLOAD TO WIRED →'}
              </Button>
            </div>
          </div>
        )}

        {uploadMethod === 'upload' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-blue-500 rounded-lg p-12 text-center blue-glow">
              <Upload className="w-24 h-24 mx-auto mb-4 text-blue-400" />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  Click to select file
                </div>
                <div className="text-gray-400">Supported: .txt, .pdf, .docx</div>
              </label>
            </div>

            {textContent && (
              <>
                <Textarea
                  value={textContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="min-h-[300px] bg-black border-2 border-blue-500 text-blue-400 terminal-text text-lg blue-glow"
                />
                <div className="flex justify-between items-center">
                  <div className={`text-lg ${wordCount >= 800 ? 'text-green-400' : 'text-red-500'}`}>
                    Word Count: {wordCount} / 800 minimum
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={wordCount < 800 || loading}
                    className="px-8 py-6 text-xl bg-red-900 hover:bg-red-800 border-2 border-red-500 red-glow"
                  >
                    {loading ? 'UPLOADING...' : 'UPLOAD TO WIRED →'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {uploadMethod && (
          <button
            onClick={() => setUploadMethod(null)}
            className="mt-4 text-gray-500 hover:text-gray-300 underline"
          >
            ← Change upload method
          </button>
        )}
      </div>
    </div>
  );
}
