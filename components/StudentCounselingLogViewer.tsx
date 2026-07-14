
import React, { useState, useMemo, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { DataSource, DataSourceType, View } from '../types';
import { ChevronLeftIcon, PlusIcon, MicrophoneIcon } from './icons';

const parseComplexContent = (content: string) => {
    const dataMap = new Map<string, string>();
    const lines = content.split('\n');
    let currentSection = '';
    let sectionContent = '';
    const hasSections = content.includes('---');

    if (hasSections) {
        for (const line of lines) {
            if (line.startsWith('---') && line.endsWith('---')) {
                if (currentSection && sectionContent) {
                    dataMap.set(currentSection, sectionContent.trim());
                }
                currentSection = line.replace(/---/g, '').trim();
                sectionContent = '';
            } else {
                if (currentSection) {
                    sectionContent += line + '\n';
                } else {
                    const parts = line.split('::');
                    if (parts.length >= 2) {
                        dataMap.set(parts[0].trim(), parts.slice(1).join('::').trim());
                    }
                }
            }
        }
        if (currentSection && sectionContent) {
            dataMap.set(currentSection, sectionContent.trim());
        }
    } else {
        // Fallback for simple key-value content
        for (const line of lines) {
            const parts = line.split('::');
            if (parts.length >= 2) {
                dataMap.set(parts[0].trim(), parts.slice(1).join('::').trim());
            }
        }
        // If still no map but content exists, it's plain text
        if (dataMap.size === 0 && content) {
             dataMap.set('상담 내용', content);
        }
    }
    
    return dataMap;
};


const CounselingLogDetail: React.FC<{ log: DataSource }> = ({ log }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const parsedData = useMemo(() => parseComplexContent(log.content), [log]);
    
    const summary = parsedData.get('요약');
    const transcription = parsedData.get('전사');
    const teacherAction = parsedData.get('교사 조치 및 계획');
    const hasNewFormat = !!summary || !!transcription || (parsedData.has('교사 조치 및 계획') && !parsedData.has('상담 내용'));


    const oldContent = parsedData.get('상담 내용');
    const oldTeacherAction = parsedData.get('교사 조치 및 계획');
    const attachedFile = parsedData.get('첨부파일');

    useEffect(() => {
        if(hasNewFormat) {
            setActiveTab('summary');
        }
    }, [log, hasNewFormat]);


    return (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-5">
            <div className="p-4 border rounded-lg bg-slate-50">
                <strong className="text-gray-600 block text-sm">상담일:</strong>
                <span className="text-gray-800">{parsedData.get('상담일') || '기록 없음'}</span>
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">주요 안건</h4>
                <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[4rem]">{parsedData.get('주요 안건') || '내용 없음'}</p>
            </div>

            {hasNewFormat ? (
                <div>
                    {attachedFile && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">첨부 파일</h4>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded text-sm text-gray-700">
                                <MicrophoneIcon className="w-5 h-5 text-gray-500" />
                                <span>{attachedFile}</span>
                            </div>
                        </div>
                    )}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('summary')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>AI 핵심 요약</button>
                            <button onClick={() => setActiveTab('transcription')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'transcription' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>음성 전사</button>
                            <button onClick={() => setActiveTab('teacherAction')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'teacherAction' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>교사 조치 및 계획</button>
                        </nav>
                    </div>
                    <div className="py-4">
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[8rem]">
                            {activeTab === 'summary' && (summary || '내용 없음')}
                            {activeTab === 'transcription' && (transcription || '내용 없음')}
                            {activeTab === 'teacherAction' && (teacherAction || '내용 없음')}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">상담 내용</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[8rem]">{oldContent || log.content}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">교사 조치 및 계획</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[6rem]">{oldTeacherAction || '내용 없음'}</p>
                    </div>
                </>
            )}
        </div>
    );
};


const StudentCounselingLogViewer = () => {
    const { selectedStudent, setCurrentView } = useAcroAppContext();

    const counselingLogs = useMemo(() => {
        if (!selectedStudent) return [];
        return selectedStudent.dataSources
            .filter(ds => ds.type === DataSourceType.StudentCounseling)
            .sort((a, b) => {
                const dateA = parseComplexContent(a.content).get('상담일') || '';
                const dateB = parseComplexContent(b.content).get('상담일') || '';
                return dateA.localeCompare(dateB); // Sort descending
            });
    }, [selectedStudent]);

    const [selectedLog, setSelectedLog] = useState<DataSource | null>(null);

    useEffect(() => {
        if (counselingLogs.length > 0) {
            setSelectedLog(counselingLogs[0]);
        }
    }, [counselingLogs]);
    
    
    if (!selectedStudent) {
        return <div className="text-center p-8">학생을 선택해주세요.</div>;
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.STUDENT_COUNSELING_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name} 학생 상담 기록</h2>
                    </div>
                     <button
                        onClick={() => setCurrentView(View.STUDENT_COUNSELING_EDITOR)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        새 상담 기록 추가
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <aside className="lg:col-span-4 xl:col-span-3 border-r pr-4">
                        <div className="overflow-y-auto">
                            <h3 className="font-bold text-md mb-3 text-gray-700">상담 일지 목록 ({counselingLogs.length}건)</h3>
                            <ul className="space-y-2">
                                {counselingLogs.map(log => {
                                    const parsed = parseComplexContent(log.content);
                                    const date = parsed.get('상담일');
                                    return (
                                        <li key={log.id}>
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                                    selectedLog?.id === log.id 
                                                    ? 'bg-blue-500 text-white font-bold' 
                                                    : 'bg-slate-100 hover:bg-slate-200 text-gray-800 font-medium'
                                                }`}
                                            >
                                                {date ? `${date} 상담` : `기록 ID: ${log.id}`}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </aside>
                    <main className="lg:col-span-8 xl:col-span-9">
                        {selectedLog ? (
                            <CounselingLogDetail log={selectedLog} />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg">
                                <p className="text-gray-500">상담 기록이 없습니다.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default StudentCounselingLogViewer;
