
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Conversation, Message, MessageSender } from '../../types';
import { MessageSquareIcon, SearchIcon, UserCircleIcon } from '../../components/Icons';
import { Database } from '../../types/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);


const ConversationList: React.FC<{
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelect: (conversation: Conversation) => void;
}> = ({ conversations, selectedConversationId, onSelect }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200">
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </span>
                    <input type="text" placeholder="Buscar conversas..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue"/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(convo => (
                    <div
                        key={convo.id}
                        onClick={() => onSelect(convo)}
                        className={`p-4 cursor-pointer border-l-4 flex items-center space-x-3 transition-colors
                            ${selectedConversationId === convo.id 
                                ? 'bg-primary-blue/10 border-primary-blue' 
                                : 'border-transparent hover:bg-slate-100'
                            }`
                        }
                    >
                        <UserCircleIcon className="w-10 h-10 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-slate-800 truncate">{convo.customer_name}</p>
                                <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{new Date(convo.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-slate-500 truncate">{convo.last_message_preview || '...'}</p>
                                {convo.admin_has_unread && <span className="w-2.5 h-2.5 bg-primary-blue rounded-full flex-shrink-0 ml-2 mt-1"></span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChatWindow: React.FC<{ 
    conversation: Conversation | null; 
}> = ({ conversation }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversation) return;
            setMessages([]);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });
            
            if (error) console.error("Error fetching messages:", error);
            else setMessages(data as Message[]);
        };
        fetchMessages();
    }, [conversation]);

     useEffect(() => {
        if (!conversation) return;

        const channel = supabase.channel(`messages:${conversation.id}`, {
            config: { broadcast: { self: true } },
        })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversation.id}`
            }, (payload: RealtimePostgresChangesPayload<Message>) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === (payload.new as Message).id)) {
                        return prev;
                    }
                    return [...prev, payload.new as Message];
                });
            })
            .subscribe();
        
        return () => { supabase.removeChannel(channel); };
    }, [conversation]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        
        const messagePayload: Database['public']['Tables']['messages']['Insert'] = {
            conversation_id: conversation.id,
            sender: MessageSender.ADMIN,
            content: messageContent
        };
        
        const { error: msgError } = await supabase
            .from('messages')
            .insert([messagePayload] as any);

        if (msgError) {
            console.error("Error sending message:", msgError);
            setNewMessage(messageContent);
        } else {
            const conversationUpdate: Database['public']['Tables']['conversations']['Update'] = {
                last_message_at: new Date().toISOString(),
                last_message_preview: messageContent,
                admin_has_unread: true
            };
            await supabase.from('conversations').update(conversationUpdate as any).eq('id', conversation.id);
        }
    };
    
    if (!conversation) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                <MessageSquareIcon className="w-20 h-20" />
                <p className="mt-4 text-lg">Selecione uma conversa para começar</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="p-4 bg-white border-b border-slate-200">
                <h2 className="font-bold text-lg text-slate-800">{conversation.customer_name}</h2>
                <p className="text-sm text-slate-500">{conversation.customer_email}</p>
            </header>
            <main className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === MessageSender.ADMIN ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === MessageSender.ADMIN ? 'bg-primary-blue text-white' : 'bg-white'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs mt-1 text-right opacity-70">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <button type="submit" className="p-3 bg-primary-blue text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!newMessage.trim()}>
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </form>
            </footer>
        </div>
    );
};


const MessagesPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .order('last_message_at', { ascending: false });

            if (error) console.error("Error fetching conversations:", error);
            else setConversations(data as Conversation[]);
        };
        fetchConversations();

        const channel = supabase.channel('conversations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, 
            (payload: RealtimePostgresChangesPayload<Conversation>) => {
                const updatedConvo = payload.new as Conversation;
                setConversations(prev => {
                    const existing = prev.find(c => c.id === updatedConvo.id);
                    let newConvos;
                    if (existing) {
                        newConvos = prev.map(c => c.id === updatedConvo.id ? updatedConvo : c);
                    } else {
                        newConvos = [updatedConvo, ...prev];
                    }
                    return newConvos.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
                });

                setSelectedConversation(current => 
                    (current?.id === updatedConvo.id) ? updatedConvo : current
                );
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        if (conversation.admin_has_unread) {
            const { error } = await supabase
                .from('conversations')
                .update({ admin_has_unread: false } as any)
                .eq('id', conversation.id);
            if (error) console.error('Error marking conversation as read:', error);
        }
    };

  return (
    <div className="h-full flex bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="w-1/3 border-r border-slate-200">
            <ConversationList 
                conversations={conversations}
                selectedConversationId={selectedConversation?.id || null}
                onSelect={handleSelectConversation}
            />
        </div>
        <div className="w-2/3">
            <ChatWindow conversation={selectedConversation} />
        </div>
    </div>
  );
};

export default MessagesPage;