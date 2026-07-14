import React, { useState } from 'react';
import { InformationCircleIcon, DocumentTextIcon } from './icons';
import { DataSourceType } from '../types';
import { DataFilter } from '../services/geminiService';

interface AIReportFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: 'focus' | 'summary', selectedTopics?: string[], filter?: DataFilter) => void;
}

const focusOptions = {
  "학생의 기본 모습 이해하기": [
    { key: "집과 학교 모습 비교하기", label: "집과 학교 모습 비교하기", description: "학부모님이 말씀하신 가정 내 모습과 교사가 관찰한 학교생활 모습이 어떻게 다른지, 혹은 같은지 비교합니다." },
    { key: "학생 최근 변화 모습", label: "학생 최근 변화 모습", description: "최근 학생의 긍정적/부정적 변화가 언제부터, 어떤 일을 계기로 시작됐는지 기록을 바탕으로 탐색합니다." }
  ],
  "특정 행동의 원인 파악하기": [
    { key: "행동의 원인과 결과 분석", label: "행동의 원인과 결과 분석", description: "특정 행동이 '언제' 주로 일어나고, 그 행동 '직후에' 어떤 결과가 따르는지 행동 패턴을 분석합니다." },
    { key: "공부에 대한 생각/태도", label: "공부에 대한 생각/태도", description: "학생의 말이나 기록에서 '공부를 대하는 태도'나 '학습 동기'가 어떠한지 요약합니다." }
  ],
  "친구 관계 및 학교생활 파악하기": [
    { key: "교우관계", label: "교우관계", description: "주로 누구와 어울리는지, 긍정적인 관계를 맺고 있는지, 혹시 소외되는 징후는 없는지 분석합니다." },
    { key: "과제에 대한 도전 태도", label: "과제에 대한 도전 태도", description: "과제 수행이나 모둠 활동에서 '스스로 해내려는 의지'나 '어려움을 만났을 때의 태도'를 분석합니다." }
  ],
  "상담 및 지도 자료로 활용하기": [
    { key: "학생 강점 및 흥미 찾기", label: "학생 강점 및 흥미 찾기", description: "학생이 언제 가장 활기차고 즐거워하는지, 기록에 숨겨진 강점과 흥미를 찾아 요약합니다." },
    { key: "학부모 상담용 긍정 요약", label: "학부모 상담용 긍정 요약", description: "학부모님께 전달할 내용을 '성장한 점'과 '강점' 위주로 긍정적인 문장으로 정리합니다." }
  ]
};

const availableDataSourceTypes = [
    DataSourceType.ParentSurvey,
    DataSourceType.StudentSurvey,
    DataSourceType.ParentCounseling,
    DataSourceType.StudentCounseling,
    DataSourceType.TeacherObservation,
    DataSourceType.StudentReflection,
    DataSourceType.PeerRelationshipSurvey,
];

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute left-full ml-3 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
};

const AIReportFocusModal: React.FC<AIReportFocusModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [isSummarySelected, setIsSummarySelected] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<Set<DataSourceType>>(new Set(availableDataSourceTypes));

  const handleSummaryToggle = () => {
    const newIsSummarySelected = !isSummarySelected;
    setIsSummarySelected(newIsSummarySelected);
    if (newIsSummarySelected) {
      setSelectedTopics(new Set()); // Clear focus topics if summary is selected
    }
  };

  const handleToggleTopic = (topicKey: string) => {
    const newSelection = new Set(selectedTopics);
    if (newSelection.has(topicKey)) {
      newSelection.delete(topicKey);
    } else {
      newSelection.add(topicKey);
    }
    setSelectedTopics(newSelection);
    if (newSelection.size > 0) {
      setIsSummarySelected(false); // Unselect summary if a focus topic is selected
    }
  };

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
      if(e.target.checked) {
          setSelectedSourceTypes(new Set(availableDataSourceTypes));
      } else {
          setSelectedSourceTypes(new Set());
      }
  };

  const handleGenerate = () => {
    const filter: DataFilter = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        selectedTypes: Array.from(selectedSourceTypes),
    };

    if (isSummarySelected) {
      onGenerate('summary', undefined, filter);
    } else if (selectedTopics.size > 0) {
      onGenerate('focus', Array.from(selectedTopics), filter);
    } else {
      alert('분석할 주제를 선택해주세요.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-screen-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">AI 리포트 생성</h3>
        </header>
        
        <div className="p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Filters */}
            <div className="lg:w-1/3 space-y-6 border-r pr-6">
                 <h4 className="font-bold text-gray-800 text-lg">데이터 필터링</h4>
                 
                 <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">분석 기간</label>
                     <div className="flex flex-col gap-2">
                         <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="시작일"
                         />
                         <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="종료일"
                         />
                     </div>
                 </div>

                 <div>
                     <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">데이터 소스</label>
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
                     <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                         {availableDataSourceTypes.map(type => (
                             <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
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

            {/* Right Column: Topics */}
            <div className="lg:w-2/3">
                <div className="mb-6">
                    <label className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${selectedTopics.size > 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-teal-50 border-teal-200 hover:bg-teal-100 cursor-pointer'}`}>
                        <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-300"
                        checked={isSummarySelected}
                        onChange={handleSummaryToggle}
                        disabled={selectedTopics.size > 0}
                        />
                        <DocumentTextIcon className="w-8 h-8 text-teal-600 flex-shrink-0" />
                        <div>
                        <h4 className="font-bold text-lg text-teal-800">분석 없이 학생 데이터 모아보기</h4>
                        <p className="text-sm text-teal-700">학생에 대해 기록된 모든 데이터를 분석 없이 객관적인 요약본으로 확인합니다.</p>
                        </div>
                    </label>
                </div>
                
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="text-sm font-medium text-gray-500">또는</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <h4 className="font-bold text-gray-800 mb-4">특정 주제를 선택하여 심층 분석하기</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(focusOptions).map(([category, options]) => (
                    <div key={category}>
                    <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1 text-sm">{category}</h4>
                    <div className="space-y-2">
                        {options.map(option => (
                        <label key={option.key} className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isSummarySelected ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100 cursor-pointer'}`}>
                            <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-300"
                            checked={selectedTopics.has(option.key)}
                            onChange={() => handleToggleTopic(option.key)}
                            disabled={isSummarySelected}
                            />
                            <span className="text-sm font-medium text-gray-800 flex-grow">{option.label}</span>
                            <Tooltip text={option.description}>
                            <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                            </Tooltip>
                        </label>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>
        </div>
        <footer className="flex-shrink-0 p-4 bg-gray-50 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
            취소
          </button>
          <button
            onClick={handleGenerate}
            disabled={(!isSummarySelected && selectedTopics.size === 0) || selectedSourceTypes.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300"
          >
            생성하기
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AIReportFocusModal;