import React, { useState } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, SurveyQuestion } from '../types';
import { DEFAULT_COUNSELING_REQUEST_QUESTIONS } from '../constants';
import { ChevronLeftIcon, PlusIcon, TrashIcon, ClipboardIcon, EyeIcon } from './icons';
import ParentCounselingRequestPreview from './ParentCounselingRequestPreview';

const ParentCounselingRequestEditor = () => {
    const { setCurrentView } = useAcroAppContext();
    const [questions, setQuestions] = useState<SurveyQuestion[]>(DEFAULT_COUNSELING_REQUEST_QUESTIONS);
    const [surveyLink] = useState('https://forms.gle/your-mock-counseling-request-link');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleAddQuestion = () => {
        const newQuestion: SurveyQuestion = { id: `q${Date.now()}`, text: '', isDefault: false };
        setQuestions([...questions, newQuestion]);
    };

    const handleQuestionTextChange = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
    };
    
    const handleDeleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(surveyLink);
        alert('상담 신청 설문 링크가 복사되었습니다.');
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.PARENT_COUNSELING_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">학부모 상담 신청 설문 관리</h2>
                    </div>
                </header>
                
                <main className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <label htmlFor="surveyLink" className="block text-sm font-medium text-gray-700 mb-1">생성된 설문 링크</label>
                        <p className="text-sm text-gray-500 mb-2">이 링크를 학부모님께 공유하여 상담 신청을 받을 수 있습니다.</p>
                        <div className="flex gap-2">
                             <input id="surveyLink" type="text" readOnly value={surveyLink} className="flex-grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50" />
                             <button onClick={handleCopyLink} className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 whitespace-nowrap">
                                 <ClipboardIcon className="h-5 w-5 mr-2"/> 복사
                             </button>
                             <button
                                onClick={() => setIsPreviewOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
                            >
                                <EyeIcon className="h-5 w-5 mr-2"/> 미리보기
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-3 text-gray-800">필수 항목</h3>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                            <p className="font-semibold text-blue-800">학생 이름</p>
                            <p className="font-semibold text-blue-800">상담 신청자 관계 (부/모/기타)</p>
                            <p className="font-semibold text-blue-800">상담 방법 (전화/대면)</p>
                            <p className="font-semibold text-blue-800">상담 신청 이유</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3 text-gray-800">추가 질문 편집</h3>
                        <div className="space-y-3">
                            {questions.map((q, index) => (
                               <div key={q.id} className="flex items-center gap-3">
                                    <span className="text-gray-600 font-semibold">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                                        placeholder="질문 내용을 입력하세요"
                                        className="flex-grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
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
            {isPreviewOpen && (
                <ParentCounselingRequestPreview 
                    isOpen={isPreviewOpen} 
                    onClose={() => setIsPreviewOpen(false)}
                    customQuestions={questions}
                />
            )}
        </>
    );
};

export default ParentCounselingRequestEditor;
