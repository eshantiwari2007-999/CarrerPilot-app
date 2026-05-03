import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { chatService } from '../../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface HistorySidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPrompt?: (prompt: string) => void;
}

interface HistoryItem {
  id: number;
  input_text: string;
  output_text: string;
  request_type?: string;
  created_at: string;
}

export function HistorySidebar({ isOpen, onOpenChange, onSelectPrompt }: HistorySidebarProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadHistory();
    }
  }, [isOpen, isAuthenticated]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await chatService.getHistory();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load history.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[480px] flex flex-col p-0 border-r-0 shadow-2xl"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)' }}
      >
        <SheetHeader className="p-6 border-b border-gray-100">
          <SheetTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Conversation History
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            Your previous career conversations with Peter.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p>Please log in to view your conversation history.</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-medium text-gray-700 mb-1">No conversations yet</p>
              <p className="text-sm">Start chatting with Peter to see your history here!</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectPrompt?.(item.input_text)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectPrompt?.(item.input_text)}
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="font-semibold text-gray-900 line-clamp-1 flex-1 text-sm">
                    {item.input_text}
                  </div>
                  <div className="text-[11px] text-gray-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
                <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {item.output_text}
                </div>
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 rounded-2xl transition-colors pointer-events-none" />
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
