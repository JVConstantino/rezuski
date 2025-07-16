
import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Conversation, Message, MessageSender } from '../../types';
import { MessageSquareIcon, XIcon, UserCircleIcon, ChevronUpIcon } from '../Icons';

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const LOCAL_STORAGE_KEY = 'rezuski_chat_conversation_id';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'form' | 'chat'>('form');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const match = ReactRouterDOM.useMatch('/property/:propertyId');
    const propertyId = match?.params.propertyId;

    useEffect(() => {
        const conversationId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (conversationId) {
            fetchConversation(conversationId);
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (conversation) {
            const channel = supabase
                .channel(`chat:${conversation.id}`, {
                    config: { broadcast: { self: true } },
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation.id}`
                }, (payload) => {
                    setMessages(prev => {
                        if (prev.find(m => m.id === (payload.new as Message).id)) {
                            return prev;
                        }
                        return [...prev, payload.new as Message]
                    });
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [conversation]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const fetchConversation = async (conversationId: string) => {
        setIsLoading(true);
        const { data: convoData, error: convoError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        if (convoError || !convoData) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setConversation(null);
        } else {
            setConversation(convoData as Conversation);
            const { data: msgData, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            
            setMessages(msgData as Message[] || []);
            setView('chat');
        }
        setIsLoading(false);
    };

    const handleStartOrContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('customer_email', email)
            .single();
        
        if (data) {
            await fetchConversation(data.id);
            localStorage.setItem(LOCAL_STORAGE_KEY, data.id);
        } else {
            const { data: newConvo, error: insertError } = await supabase
                .from('conversations')
                .insert({
                    customer_name: name,
                    customer_email: email,
                    property_id: propertyId || null,
                    last_message_at: new Date().toISOString(),
                    last_message_preview: "Nova conversa iniciada",
                    admin_has_unread: true
                })
                .select()
                .single();
            
            if (insertError || !newConvo) {
                console.error("Error creating conversation:", insertError);
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY, newConvo.id);
                setConversation(newConvo as Conversation);
                setMessages([]);
                setView('chat');
            }
        }
        setIsLoading(false);
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversation.id,
                sender: MessageSender.CUSTOMER,
                content: messageContent
            });
        
        if (msgError) {
             console.error("Error sending message:", msgError);
             setNewMessage(messageContent);
        } else {
            await supabase.from('conversations').update({
                last_message_at: new Date().toISOString(),
                last_message_preview: messageContent,
                admin_has_unread: true
            }).eq('id', conversation.id);
        }
    };
    
    const handleEndChat = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setConversation(null);
        setMessages([]);
        setName('');
        setEmail('');
        setView('form');
        setIsOpen(false);
    }

    const renderView = () => {
        if (isLoading) {
            return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div></div>;
        }

        if (view === 'chat' && conversation) {
            return (
                <div className="flex flex-col h-full">
                    <header className="p-4 bg-primary-blue text-white flex justify-between items-center rounded-t-lg">
                        <div>
                            <h3 className="font-bold">Olá, {conversation.customer_name}</h3>
                            <p className="text-xs opacity-80">Estamos aqui para ajudar!</p>
                        </div>
                         <button onClick={handleEndChat} className="text-xs opacity-80 hover:opacity-100">Encerrar</button>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100">
                        {messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender === MessageSender.CUSTOMER ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === MessageSender.ADMIN && <UserCircleIcon className="w-8 h-8 text-slate-400 mr-2 flex-shrink-0"/>}
                                <div className={`max-w-xs p-3 rounded-lg ${msg.sender === MessageSender.CUSTOMER ? 'bg-primary-green text-white' : 'bg-white'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-xs mt-1 text-right opacity-70">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </main>
                    <footer className="p-2 bg-white border-t">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                             <input 
                                type="text" 
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue"
                            />
                            <button type="submit" className="p-3 bg-primary-green text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!newMessage.trim()}>
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </form>
                    </footer>
                </div>
            );
        }

        return (
            <div className="p-6">
                <h3 className="font-bold text-lg text-center">Fale Conosco</h3>
                <p className="text-sm text-slate-600 text-center mt-1">Preencha seus dados para iniciar ou continuar uma conversa.</p>
                <form onSubmit={handleStartOrContinue} className="mt-6 space-y-4">
                     <div>
                        <label htmlFor="chat-name" className="text-sm font-medium text-slate-700">Nome</label>
                        <input id="chat-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-blue focus:border-primary-blue"/>
                    </div>
                     <div>
                        <label htmlFor="chat-email" className="text-sm font-medium text-slate-700">Email</label>
                        <input id="chat-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-blue focus:border-primary-blue"/>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95">Iniciar Conversa</button>
                </form>
            </div>
        );
    };

    return (
        <div className="fixed bottom-4 right-4 z-40">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 h-96 mb-2 flex flex-col">
                   {renderView()}
                </div>
            )}
            
            {/* Launcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary-blue text-white rounded-full p-4 shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
            >
                {isOpen ? <XIcon className="w-8 h-8" /> : <MessageSquareIcon className="w-8 h-8" />}
            </button>
        </div>
    );
};

export default ChatWidget;
