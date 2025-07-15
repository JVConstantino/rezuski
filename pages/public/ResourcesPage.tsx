import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNavBar from '../../components/BottomNavBar';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import { useResources } from '../../contexts/ResourceContext';
import { FileTextIcon, EyeIcon, DownloadIcon } from '../../components/Icons';

const ResourcesPage: React.FC = () => {
    const { resources } = useResources();

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="bg-white">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        <AnimateOnScroll>
                            <h1 className="text-4xl font-extrabold text-slate-900">Recursos e Documentos</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
                                Encontre aqui formulários, manuais e documentos importantes para facilitar seu processo de locação e administração.
                            </p>
                        </AnimateOnScroll>
                    </div>
                </div>

                <div className="py-16">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <ul className="divide-y divide-slate-200">
                                {resources.map((doc, index) => (
                                    <AnimateOnScroll key={doc.id} delay={index * 50}>
                                        <li className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-primary-blue/10 p-3 rounded-full mr-4">
                                                    <FileTextIcon className="w-6 h-6 text-primary-blue" />
                                                </div>
                                                <span className="font-semibold text-slate-800 text-lg">{doc.title}</span>
                                            </div>
                                            <div className="flex space-x-3 mt-4 sm:mt-0 self-end sm:self-center">
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                                                >
                                                    <EyeIcon className="w-5 h-5 mr-2" />
                                                    Visualizar
                                                </a>
                                                <a
                                                    href={doc.fileUrl}
                                                    download={`${doc.title.replace(/\s+/g, '_')}.pdf`}
                                                    className="flex items-center justify-center px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-colors"
                                                >
                                                    <DownloadIcon className="w-5 h-5 mr-2" />
                                                    Baixar
                                                </a>
                                            </div>
                                        </li>
                                    </AnimateOnScroll>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <BottomNavBar />
        </div>
    );
};

export default ResourcesPage;
