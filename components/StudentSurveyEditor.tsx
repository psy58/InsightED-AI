
import React, { useState, ReactNode, useRef } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, SurveyQuestion } from '../types';
import { DEFAULT_STUDENT_SURVEY_QUESTIONS } from '../constants';
import { ChevronLeftIcon, PlusIcon, TrashIcon, ClipboardIcon, EyeIcon, QrCodeIcon, GripVerticalIcon } from './icons';
import StudentSurveyPreview from './StudentSurveyPreview';

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


const StudentSurveyEditor = () => {
    const { students, setCurrentView } = useAcroAppContext();
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [questions, setQuestions] = useState<SurveyQuestion[]>(DEFAULT_STUDENT_SURVEY_QUESTIONS.map(q => ({ ...q, type: q.type || 'text', options: q.options || [] })));
    const [surveyLink] = useState('https://forms.gle/your-mock-student-survey-link');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleSelectStudent = (studentId: number) => {
        const newSelection = new Set(selectedStudents);
        if (newSelection.has(studentId)) {
            newSelection.delete(studentId);
        } else {
            newSelection.add(studentId);
        }
        setSelectedStudents(newSelection);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allStudentIds = new Set(students.map(s => s.id));
            setSelectedStudents(allStudentIds);
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleAddQuestion = () => {
        const newQuestion: SurveyQuestion = {
            id: `q${Date.now()}`,
            text: '',
            isDefault: false,
            type: 'text',
            options: []
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleQuestionTextChange = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
    };
    
    const handleQuestionTypeChange = (id: string, type: 'text' | 'choice') => {
        setQuestions(questions.map(q => q.id === id ? { 
            ...q, 
            type, 
            options: type === 'choice' && (!q.options || q.options.length === 0) ? ['옵션 1'] : q.options 
        } : q));
    };

    const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleAddOption = (questionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, options: [...(q.options || []), `옵션 ${(q.options?.length || 0) + 1}`] };
            }
            return q;
        }));
    };

    const handleRemoveOption = (questionId: string, optionIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                const newOptions = q.options.filter((_, i) => i !== optionIndex);
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
        e.currentTarget.classList.add('bg-blue-50');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-blue-50');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-blue-50');
        if (dragItem.current === null || dragOverItem.current === null) return;

        const newQuestions = [...questions];
        const dragItemContent = newQuestions[dragItem.current];
        newQuestions.splice(dragItem.current, 1);
        newQuestions.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;
        setQuestions(newQuestions);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');
        e.currentTarget.classList.remove('bg-blue-50');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(surveyLink);
        alert('설문 링크가 복사되었습니다.');
    };

    const handleSendSurvey = () => {
        if (selectedStudents.size === 0) {
            alert('설문을 발송할 학생을 선택해주세요.');
            return;
        }
        const selectedStudentNames = students
            .filter(s => selectedStudents.has(s.id))
            .map(s => s.name)
            .join(', ');
        alert(`${selectedStudentNames} 학생에게 설문 링크가 발송되었습니다. (시뮬레이션)`);
    };

    const isAllSelected = selectedStudents.size > 0 && selectedStudents.size === students.length;
    
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.STUDENT_SURVEY_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">학생 기초조사서 생성</h2>
                </div>
                <button
                    onClick={handleSendSurvey}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                    선택한 학생에게 발송 ({selectedStudents.size})
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Student Selection Panel */}
                <aside className="lg:col-span-3 border-r-0 lg:border-r lg:pr-8">
                    <h3 className="font-bold text-lg mb-3">발송 대상 선택</h3>
                    <div className="flex items-center gap-3 px-3 py-2 border-b">
                        <input
                            type="checkbox"
                            id="selectAll"
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="selectAll" className="font-semibold text-gray-700">전체 선택</label>
                    </div>
                    <ul className="space-y-1 py-2 max-h-[60vh] overflow-y-auto">
                        {students.map(student => (
                            <li key={student.id}>
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedStudents.has(student.id)}
                                        onChange={() => handleSelectStudent(student.id)}
                                    />
                                    <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full" />
                                    <span className="text-gray-800">{student.name}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Editor Panel */}
                <main className="lg:col-span-9">
                    <div>
                         <div className="mb-6">
                            <label htmlFor="surveyLink" className="block text-sm font-medium text-gray-700 mb-1">설문 링크</label>
                            <div className="flex gap-2">
                                 <input id="surveyLink" type="text" readOnly value={surveyLink} className="flex-grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50" />
                                 <button onClick={handleCopyLink} className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 whitespace-nowrap">
                                     <ClipboardIcon className="h-5 w-5 mr-2"/> 복사
                                 </button>
                                 <button
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                >
                                    <QrCodeIcon className="h-5 w-5 mr-2"/> QR 생성
                                </button>
                                 <button
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
                                >
                                    <EyeIcon className="h-5 w-5 mr-2"/> 미리보기
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-3">설문 항목 편집 (드래그하여 순서 변경)</h3>
                        <div className="space-y-3">
                             {questions.map((q, index) => (
                               <div 
                                    key={q.id} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onDragEnd={handleDragEnd}
                                    className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex gap-3 items-start cursor-grab active:cursor-grabbing"
                                >
                                    <div className="mt-2 text-gray-400 cursor-grab">
                                        <GripVerticalIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-semibold w-6">{index + 1}.</span>
                                            <input
                                                type="text"
                                                value={q.text}
                                                onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                                                placeholder="질문 내용을 입력하세요 (엔터키로 추가 가능)"
                                                className="flex-grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md py-2 px-3"
                                            />
                                            <select
                                                value={q.type || 'text'}
                                                onChange={(e) => handleQuestionTypeChange(q.id, e.target.value as 'text' | 'choice')}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md py-2 px-3 bg-gray-50"
                                            >
                                                <option value="text">서술형</option>
                                                <option value="choice">객관식</option>
                                            </select>
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                        
                                        {q.type === 'choice' && (
                                            <div className="ml-8 space-y-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                                                {q.options?.map((opt, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <input type="radio" disabled className="h-4 w-4 text-gray-300 border-gray-300" />
                                                        <input 
                                                            type="text" 
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                                                            className="flex-grow border-b border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                                                            placeholder={`옵션 ${optIndex + 1}`}
                                                        />
                                                        <button onClick={() => handleRemoveOption(q.id, optIndex)} className="text-gray-400 hover:text-red-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => handleAddOption(q.id)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-1"
                                                >
                                                    <PlusIcon className="w-3 h-3" /> 옵션 추가
                                                </button>
                                            </div>
                                        )}
                                    </div>
                               </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddQuestion}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
                        >
                            <PlusIcon className="w-5 h-5" />
                            새 문항 추가하기
                        </button>
                    </div>
                </main>
            </div>

            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="설문 미리보기">
                <StudentSurveyPreview questions={questions} />
            </Modal>
            <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="설문 QR 코드 및 링크">
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
            </Modal>
        </div>
    );
};

export default StudentSurveyEditor;
