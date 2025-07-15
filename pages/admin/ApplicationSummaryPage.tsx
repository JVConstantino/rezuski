import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { APPLICATIONS, USERS } from '../../constants';
import { useProperties } from '../../contexts/PropertyContext';
import { Application, Property, User, CreditReport, BackgroundCheck } from '../../types';
import { CheckCircleIcon, ChevronLeftIcon } from '../../components/Icons';

const CreditScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = (score - 300) / (850 - 300);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - percentage * circumference;
    
    let colorClass = 'text-red-500';
    if (score >= 740) colorClass = 'text-green-500';
    else if (score >= 670) colorClass = 'text-yellow-500';

    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className={`${colorClass} transition-all duration-1000`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
                <span className="text-sm text-slate-500">Pontuação</span>
            </div>
        </div>
    );
};

const CreditReportSection: React.FC<{ report: CreditReport }> = ({ report }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Relatório de Crédito</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1">
                <CreditScoreGauge score={report.score || 0} />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-slate-500">Pagamento em Dia</p>
                    <p className="text-lg font-semibold text-slate-800">{report.onTimePayment}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Crédito Utilizado</p>
                    <p className="text-lg font-semibold text-slate-800">{report.creditUtilized}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Pagamentos Mensais</p>
                    <p className="text-lg font-semibold text-slate-800">${report.estimatedMonthlyPayments?.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Dívida Total</p>
                    <p className="text-lg font-semibold text-slate-800">${report.totalDebt?.toLocaleString()}</p>
                </div>
            </div>
        </div>
    </div>
);


const BackgroundCheckSection: React.FC<{ checks: BackgroundCheck[] }> = ({ checks }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Relatório de Antecedentes</h3>
        <ul className="space-y-4">
            {checks.map(check => (
                 <li key={check.id} className="flex justify-between items-center">
                    <span className="text-slate-700">{check.type}</span>
                     <span className={`flex items-center px-3 py-1 text-sm font-medium rounded-full ${check.status === 'Clean' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <CheckCircleIcon className="w-4 h-4 mr-1.5"/>
                        {check.status}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

const ApplicantInfoCard: React.FC<{ applicant: User, application: Application }> = ({ applicant, application }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
        <img src={applicant.avatarUrl} alt={applicant.name} className="w-24 h-24 rounded-full mx-auto"/>
        <h3 className="text-xl font-semibold text-center mt-4">{applicant.name}</h3>
        <p className="text-center text-slate-500">{applicant.email}</p>
        <div className="mt-6 space-y-3">
            <p><span className="font-semibold">CPF:</span> ***.***.123-45</p>
            <p><span className="font-semibold">Nascimento:</span> 01/01/1990 (34 anos)</p>
            <p><span className="font-semibold">Telefone:</span> {applicant.phone || '(11) 98765-4321'}</p>
        </div>
        <button className="w-full mt-6 py-2 border border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-primary-blue/10 transition-colors">
            Enviar e-mail ao candidato
        </button>
    </div>
);

const ApplicationSummaryPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const { properties } = useProperties();
    const application = APPLICATIONS.find(a => a.id === applicationId);
    const applicant = USERS.find(u => u.id === application?.applicantId);
    const property = properties.find(p => p.id === application?.propertyId);

    if (!application || !applicant || !property) {
        return <div className="text-center p-8">Aplicação não encontrada.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                     <Link to="/admin/applications" className="flex items-center text-sm text-slate-600 hover:text-primary-blue font-semibold">
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        Voltar para todas as aplicações
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">Resumo da Aplicação</h1>
                </div>
                <div className="flex space-x-3">
                    <button className="px-6 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300">Rejeitar</button>
                    <button className="px-6 py-2 rounded-lg bg-primary-green text-white font-semibold hover:opacity-95">Aceitar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Propriedade Aplicada</h3>
                        <div className="flex items-center space-x-4">
                            <img src={property.images[0]} alt={property.title} className="w-24 h-16 rounded-lg object-cover"/>
                            <div>
                                <p className="font-semibold text-slate-800">{property.title}</p>
                                <p className="text-sm text-slate-500">{property.address}</p>
                            </div>
                        </div>
                    </div>
                    {application.creditReport && <CreditReportSection report={application.creditReport} />}
                    {application.backgroundChecks.length > 0 && <BackgroundCheckSection checks={application.backgroundChecks}/>}
                </div>
                <div className="lg:col-span-1">
                    <ApplicantInfoCard applicant={applicant} application={application} />
                </div>
            </div>
        </div>
    );
};

export default ApplicationSummaryPage;