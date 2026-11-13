import React, { useState } from 'react';
import { DataSourceType } from '../types';
import { DataFilter } from '../services/aiService';
import { SparklesIcon, XIcon } from './icons';

interface AIScenarioConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (type: '학생' | '학부모', filter: DataFilter) => void;
    initialType: '학생' | '학부모';
}

const availableDataSourceTypes = [
    DataSourceType.ParentSurvey,
    DataSourceType.StudentSurvey,
    DataSourceType.ParentCounseling,
    DataSourceType.StudentCounseling,
    DataSourceType.TeacherObservation,
    DataSourceType.StudentReflection,
    DataSourceType.PeerRelationshipSurvey,
    DataSourceType.ParentCounselingRequest,
];

const AIScenarioConfigModal: React.FC<AIScenarioConfigModalProps> = ({ isOpen, onClose, onGenerate, initialType }) => {
    const [counselingType, setCounselingType] = useState<'학생' | '학부모'>(initialType);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedSourceTypes, setSelectedSourceTypes] = useState<Set<DataSourceType>>(new Set(availableDataSourceTypes));

    if (!isOpen) return null;

    const handleToggleSourceType = (type: DataSourceType) => {
        const newSelection = new Set(selectedSourceTypes);
        if (newSelection.has(type)) {
            newSelection.delete(type);
        } else {
            newSelection.add(type);
        }
        setSelectedSourceTypes(newSelection);
    };

    const handleSelectAllSources = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedSourceTypes(new Set(availableDataSourceTypes));
        } else {
            setSelectedSourceTypes(new Set());
        }
    };

    const handleGenerateClick = () => {
        if (selectedSourceTypes.size === 0) {
            alert('데이터 소스를 최소 하나 이상 선택해주세요.');
            return;
        }
        
        const filter: DataFilter = {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            selectedTypes: Array.from(selectedSourceTypes),
        };
        onGenerate(counselingType, filter);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-lg">
                    <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6" />
                        AI 상담 시나리오 생성 설정
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Counseling Type Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">상담 대상</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${counselingType === '학생' ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type="radio" name="counselingType" value="학생" checked={counselingType === '학생'} onChange={() => setCounselingType('학생')} className="hidden" />
                                학생 상담
                            </label>
                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${counselingType === '학부모' ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type="radio" name="counselingType" value="학부모" checked={counselingType === '학부모'} onChange={() => setCounselingType('학부모')} className="hidden" />
                                학부모 상담
                            </label>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Data Filtering */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">분석 기간 (선택)</label>
                            <div className="flex flex-col gap-2">
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="시작일"
                                />
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="종료일"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">설정하지 않으면 전체 기간을 분석합니다.</p>
                        </div>

                        <div>
                             <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700">데이터 소스 선택</label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSourceTypes.size === availableDataSourceTypes.length}
                                        onChange={handleSelectAllSources}
                                        className="h-3 w-3 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-xs text-gray-500">전체 선택</span>
                                </label>
                             </div>
                             <div className="border border-gray-200 rounded-lg p-2 max-h-40 overflow-y-auto bg-gray-50">
                                 {availableDataSourceTypes.map(type => (
                                     <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1.5 rounded transition-colors">
                                         <input 
                                            type="checkbox" 
                                            checked={selectedSourceTypes.has(type)}
                                            onChange={() => handleToggleSourceType(type)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                         />
                                         <span className="text-gray-700">{type}</span>
                                     </label>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 border-t flex justify-end gap-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                        취소
                    </button>
                    <button onClick={handleGenerateClick} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">
                        시나리오 생성
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AIScenarioConfigModal;