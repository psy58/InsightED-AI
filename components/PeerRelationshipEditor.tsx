
import React, { useState, ReactNode } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, SurveyQuestion } from '../types';
import { ChevronLeftIcon, PlusIcon, TrashIcon, EyeIcon, ClipboardIcon, QrCodeIcon } from './icons';
import PeerRelationshipSurveyPreview from './PeerRelationshipSurveyPreview';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title: string;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                <div className="overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PeerRelationshipEditor = () => {
    const { setCurrentView, students } = useAcroAppContext();
    const [surveyTitle, setSurveyTitle] = useState('');
    const [customQuestions, setCustomQuestions] = useState<SurveyQuestion[]>([
        { id: 'custom1', text: '가장 친한 친구는 누구인가요? (최대 2명)', isDefault: false, askReason: false },
        { id: 'custom2', text: '우리 반에서 선생님이 안 계실 때도 가장 규칙을 잘 지키는 학생은 누구인가요?', isDefault: false, askReason: false },
    ]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
    const [surveyLink] = useState('https://forms.gle/your-mock-peer-survey-link');

    const handleAddQuestion = () => {
        const newQuestion: SurveyQuestion = {
            id: `q${Date.now()}`,
            text: '',
            isDefault: false,
            askReason: false,
        };
        setCustomQuestions([...customQuestions, newQuestion]);
    };

    const handleQuestionTextChange = (id: string, text: string) => {
        setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, text } : q));
    };
    
    const handleToggleReason = (id: string) => {
        setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, askReason: !q.askReason } : q));
    };

    const handleDeleteQuestion = (id: string) => {
        setCustomQuestions(customQuestions.filter(q => q.id !== id));
    };

    const handleDistribute = () => {
        if (!surveyTitle.trim()) {
            alert('설문 제목을 입력해주세요.');
            return;
        }
        setIsDistributeModalOpen(true);
    };
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(surveyLink);
        alert('설문 링크가 복사되었습니다.');
    };

    const closeDistributeModal = () => {
        setIsDistributeModalOpen(false);

        const newSurvey = {
            id: Date.now(),
            title: surveyTitle,
            date: new Date().toISOString().slice(0, 10),
            status: '진행중',
            participants: 0,
            total: students.length,
            isNew: true, // Flag to indicate it has no data
        };

        try {
            const existingSurveys = JSON.parse(sessionStorage.getItem('peerSurveys') || '[]');
            sessionStorage.setItem('peerSurveys', JSON.stringify([...existingSurveys, newSurvey]));
        } catch (e) {
            console.error("Failed to save survey to session storage:", e);
        }

        alert('학생들에게 교우 관계 설문이 배포되었습니다. (시뮬레이션)');
        setCurrentView(View.PEER_RELATIONSHIP_DASHBOARD);
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.PEER_RELATIONSHIP_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">교우관계 설문 및 분석</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            <EyeIcon className="w-5 h-5"/>
                            미리보기
                        </button>
                        <button
                            onClick={handleDistribute}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
                        >
                            설문 배포하기
                        </button>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <label htmlFor="surveyTitle" className="block text-sm font-medium text-gray-600 mb-2">설문 제목</label>
                        <input
                            type="text"
                            id="surveyTitle"
                            value={surveyTitle}
                            onChange={e => setSurveyTitle(e.target.value)}
                            placeholder="설문 제목을 입력하세요"
                            className="w-full border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-2xl font-bold placeholder-gray-300 px-0 py-2 transition-colors"
                        />
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-3 text-gray-800">필수 항목</h3>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="font-semibold text-blue-800">
                                나를 제외한 모든 친구들과 얼마나 친한가요?
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                (학생들에게는 1점 '전혀 안 친함' 부터 5점 '매우 친함' 까지 선택할 수 있는 화면이 제공됩니다.)
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3 text-gray-800">추가 항목 편집</h3>
                        <div className="space-y-4">
                            {customQuestions.map((q, index) => (
                                <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-gray-600 font-semibold w-6 text-center">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                                            placeholder="질문 내용을 입력하세요"
                                            className="flex-grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                                        />
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <div className="pl-9 flex items-center">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={q.askReason || false} 
                                                onChange={() => handleToggleReason(q.id)}
                                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-blue-500" 
                                            />
                                            <span className="ml-2 text-sm text-gray-600">이유 묻기 (학생이 선택한 이유를 작성하도록 함)</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddQuestion}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <PlusIcon className="w-5 h-5" />
                            항목 추가하기
                        </button>
                    </div>
                </main>
            </div>
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="교우 관계 설문 미리보기">
                <PeerRelationshipSurveyPreview customQuestions={customQuestions} />
            </Modal>
             <Modal isOpen={isDistributeModalOpen} onClose={closeDistributeModal} title="설문 배포">
                <div className="p-6 text-center">
                    <p className="text-sm text-gray-600 mb-4">학생들에게 QR 코드를 보여주거나 아래 링크를 복사하여 공유하세요.</p>
                    <div className="flex justify-center mb-4 p-4 bg-gray-100 rounded-md">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(surveyLink)}`} alt="Survey QR Code" />
                    </div>
                    <div className="flex gap-2">
                        <input type="text" readOnly value={surveyLink} className="flex-grow shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50" />
                        <button onClick={handleCopyLink} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                            링크 복사
                        </button>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 border-t text-right">
                    <button onClick={closeDistributeModal} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
                        닫기
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default PeerRelationshipEditor;
