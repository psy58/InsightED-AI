

import React, { useState, useMemo, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { DataSource, DataSourceType, View } from '../types';
import { ChevronLeftIcon, PlusIcon } from './icons';

// Re-using a robust parser that can handle key-value and attachments
const parseObservationContent = (content: string): Map<string, string> => {
    const dataMap = new Map<string, string>();
    const lines = content.split('\n');
    lines.forEach(line => {
        const parts = line.split('::');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('::').trim();
            dataMap.set(key, value);
        }
    });
     // Fallback for plain text content
    if (dataMap.size === 0 && content) {
        dataMap.set('관찰 내용', content);
    }
    return dataMap;
};


const ObservationLogDetail: React.FC<{ log: DataSource }> = ({ log }) => {
    const parsedData = useMemo(() => parseObservationContent(log.content), [log]);
    
    const attachmentName = parsedData.get('첨부파일');
    const attachmentType = parsedData.get('첨부파일타입');
    const attachmentData = parsedData.get('첨부파일데이터');
    const teacherOpinion = parsedData.get('교사 의견');

    return (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50">
                <div>
                    <strong className="text-gray-600 block text-sm">관찰일:</strong>
                    <span className="text-gray-800">{parsedData.get('관찰일') || '기록 없음'}</span>
                </div>
                <div>
                    <strong className="text-gray-600 block text-sm">관찰 상황:</strong>
                    <span className="text-gray-800">{parsedData.get('관찰 상황') || '기록 없음'}</span>
                </div>
            </div>
            
            {attachmentData && (
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">첨부 파일: {attachmentName}</h4>
                    <div className="p-3 bg-slate-50 rounded-lg flex justify-center">
                        {attachmentType?.startsWith('image/') && <img src={attachmentData} alt={attachmentName} className="max-w-full max-h-96 object-contain rounded-md" />}
                        {attachmentType?.startsWith('video/') && <video controls src={attachmentData} className="max-w-full max-h-96 rounded-md" />}
                    </div>
                </div>
            )}

            <div>
                <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">관찰 내용</h4>
                <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[8rem]">{parsedData.get('관찰 내용') || '내용 없음'}</p>
            </div>
            
            {teacherOpinion && (
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">교사 의견</h4>
                    <p className="text-gray-700 whitespace-pre-wrap p-3 bg-slate-50 rounded min-h-[4rem]">{teacherOpinion}</p>
                </div>
            )}
        </div>
    );
};


const TeacherObservationLogViewer = () => {
    const { selectedStudent, setCurrentView } = useAcroAppContext();
    
    const observationLogs = useMemo(() => {
        if (!selectedStudent) return [];
        return selectedStudent.dataSources
            .filter(ds => ds.type === DataSourceType.TeacherObservation)
            .sort((a, b) => {
                const dateA = parseObservationContent(a.content).get('관찰일') || '';
                const dateB = parseObservationContent(b.content).get('관찰일') || '';
                return dateA.localeCompare(dateB); // Sort ascending
            });
    }, [selectedStudent]);

    const [selectedLog, setSelectedLog] = useState<DataSource | null>(null);

    useEffect(() => {
        if (observationLogs.length > 0) {
            setSelectedLog(observationLogs[0]);
        }
    }, [observationLogs]);
    
    if (!selectedStudent) {
        return <div className="text-center p-8">학생을 선택해주세요.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.TEACHER_OBSERVATION_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name} 교사 관찰 기록</h2>
                </div>
                 <button
                    onClick={() => setCurrentView(View.TEACHER_OBSERVATION_EDITOR)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    새 관찰 기록 추가
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <aside className="lg:col-span-4 xl:col-span-3 border-r pr-4">
                    <h3 className="font-bold text-md mb-3 text-gray-700">관찰 일지 목록 ({observationLogs.length}건)</h3>
                    <ul className="space-y-2">
                        {observationLogs.map(log => {
                            const parsed = parseObservationContent(log.content);
                            const date = parsed.get('관찰일');
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
                                        {date ? `${date} 관찰` : `기록 ID: ${log.id}`}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
                <main className="lg:col-span-8 xl:col-span-9">
                    {selectedLog ? (
                        <ObservationLogDetail log={selectedLog} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg">
                            <p className="text-gray-500">관찰 기록이 없습니다.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TeacherObservationLogViewer;