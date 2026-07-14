

import React, { useState, useMemo, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { DataSource, DataSourceType, View } from '../types';
import { ChevronLeftIcon, PlusIcon } from './icons';

const parseReflectionContent = (content: string): Map<string, string> => {
    const dataMap = new Map<string, string>();
    const lines = content.split('\n');
    let lastKey: string | null = null;
    for (const line of lines) {
        const parts = line.split('::');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('::').trim();
            dataMap.set(key, value);
            lastKey = key;
        } else if (lastKey) {
            const existingValue = dataMap.get(lastKey) || '';
            dataMap.set(lastKey, existingValue + '\n' + line);
        }
    }
    return dataMap;
};


const ReflectionLogDetail: React.FC<{ log: DataSource }> = ({ log }) => {
    const parsedData = useMemo(() => parseReflectionContent(log.content), [log]);
    const keywords = parsedData.get('주요키워드')?.split(', ') || [];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-5">
            <div className="p-4 border rounded-lg bg-slate-50">
                <strong className="text-gray-600 block text-sm">제출일:</strong>
                <span className="text-gray-800">{parsedData.get('제출일') || '기록 없음'}</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">원본 이미지</h4>
                        <div className="p-2 border rounded-md bg-gray-100 flex items-center justify-center">
                            <img src={parsedData.get('원본이미지')} alt="원본 성찰 기록" className="max-w-full max-h-[50vh] object-contain"/>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">교사 메모</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-100 rounded min-h-[6rem]">{parsedData.get('교사메모') || '메모 없음'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">AI 요약문</h4>
                        <p className="text-gray-700 p-3 bg-slate-100 rounded min-h-[5rem]">{parsedData.get('AI요약') || '요약 없음'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">주요 키워드</h4>
                        <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-md min-h-[40px]">
                           {keywords.map((kw, i) => kw && <span key={i} className="px-2 py-1 bg-sky-200 text-sky-800 text-xs font-semibold rounded-full">{kw}</span>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">추출된 텍스트</h4>
                        <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-100 rounded min-h-[8rem]">{parsedData.get('텍스트추출') || '추출된 텍스트 없음'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const StudentReflectionLogViewer = () => {
    const { selectedStudent, setCurrentView } = useAcroAppContext();
    
    const reflectionLogs = useMemo(() => {
        if (!selectedStudent) return [];
        return selectedStudent.dataSources
            .filter(ds => ds.type === DataSourceType.StudentReflection)
            .sort((a, b) => {
                const dateA = parseReflectionContent(a.content).get('제출일') || '';
                const dateB = parseReflectionContent(b.content).get('제출일') || '';
                return dateA.localeCompare(dateB); // Sort ascending
            });
    }, [selectedStudent]);

    const [selectedLog, setSelectedLog] = useState<DataSource | null>(null);

    useEffect(() => {
        if (reflectionLogs.length > 0) {
            setSelectedLog(reflectionLogs[0]);
        }
    }, [reflectionLogs]);
    
    if (!selectedStudent) {
        return <div className="text-center p-8">학생을 선택해주세요.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.STUDENT_REFLECTION_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name} 학생 성찰 기록</h2>
                </div>
                 <button
                    onClick={() => setCurrentView(View.STUDENT_REFLECTION_EDITOR)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    새 성찰 기록 추가
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <aside className="lg:col-span-3 border-r pr-4">
                    <h3 className="font-bold text-md mb-3 text-gray-700">기록 목록 ({reflectionLogs.length}건)</h3>
                    <ul className="space-y-2">
                        {reflectionLogs.map(log => {
                            const date = parseReflectionContent(log.content).get('제출일');
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
                                        {date ? `${date} 기록` : `기록 ID: ${log.id}`}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
                <main className="lg:col-span-9">
                    {selectedLog ? (
                        <ReflectionLogDetail log={selectedLog} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg">
                            <p className="text-gray-500">성찰 기록이 없습니다.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudentReflectionLogViewer;