
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { generateFocusedReport, generateDataSummary, generateCounselingScenario, DataFilter } from '../services/geminiService';
import { DataStatus, DataSource, DataSourceType, Student, View } from '../types';
import { SparklesIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';
import DataSourceContentModal from './DataSourceContentModal';
import AIReportFocusModal from './AIReportFocusModal';
import AIReportResultModal from './AIReportResultModal';
import AIScenarioModal from './AIScenarioModal';
import AIScenarioConfigModal from './AIScenarioConfigModal';

const parseKeyValueContent = (content: string): Map<string, string> => {
    const dataMap = new Map<string, string>();
    if (!content) return dataMap;
    const lines = content.split('\n');
    for (const line of lines) {
        const parts = line.split('::');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('::').trim();
            dataMap.set(key, value);
        }
    }
    return dataMap;
};


const StudentDashboard = () => {
  const { selectedStudent, initialDataSourceToView, clearInitialDataSourceToView, setCurrentView, addDataSource } = useAcroAppContext();
  
  // AI Report States
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [isReportSaved, setIsReportSaved] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // AI Scenario States
  const [isScenarioConfigOpen, setIsScenarioConfigOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [scenarioContent, setScenarioContent] = useState('');
  const [isScenarioSaved, setIsScenarioSaved] = useState(false);

  // Data Viewing States
  const [viewingDataSource, setViewingDataSource] = useState<DataSource | null>(null);
  const [viewingDataSourceGroup, setViewingDataSourceGroup] = useState<{ type: DataSourceType; sources: DataSource[], initialLogId?: number } | null>(null);
  

  const reportHistory = useMemo(() => {
    if (!selectedStudent) return [];
    return selectedStudent.dataSources
        .filter(ds => ds.type === DataSourceType.AIReport)
        .sort((a, b) => b.id - a.id); // Sort by creation time (newest first)
  }, [selectedStudent]);

  const basicInfo = useMemo(() => {
    if (!selectedStudent) return null;
    const parentSurvey = selectedStudent.dataSources.find(ds => ds.type === DataSourceType.ParentSurvey);
    if (!parentSurvey || !parentSurvey.content) return null;
    
    const data = parseKeyValueContent(parentSurvey.content);
    const motherPhone = data.get('어머니 핸드폰 번호') || '정보 없음';
    const fatherPhone = data.get('아버지 핸드폰 번호') || '정보 없음';
    
    let parentPhoneDisplay = '';
    if (motherPhone !== '정보 없음' && fatherPhone !== '정보 없음') {
        parentPhoneDisplay = `${motherPhone} (모), ${fatherPhone} (부)`;
    } else if (motherPhone !== '정보 없음') {
        parentPhoneDisplay = `${motherPhone} (모)`;
    } else if (fatherPhone !== '정보 없음') {
        parentPhoneDisplay = `${fatherPhone} (부)`;
    } else {
        parentPhoneDisplay = '정보 없음';
    }

    return {
        address: data.get('학생 주소') || '정보 없음',
        studentPhone: data.get('학생 핸드폰 번호') || '정보 없음',
        parentPhone: parentPhoneDisplay,
    };
  }, [selectedStudent]);

  const groupedDataSources = useMemo(() => {
    if (!selectedStudent) return [];
    const groups = new Map<DataSourceType, DataSource[]>();
    selectedStudent.dataSources.forEach(ds => {
        if (ds.status === DataStatus.Submitted && ds.content) {
            if (!groups.has(ds.type)) {
                groups.set(ds.type, []);
            }
            groups.get(ds.type)!.push(ds);
        }
    });
    return Array.from(groups.entries()).map(([type, sources]) => ({ type, sources }));
  }, [selectedStudent]);
  
  const requiredDataSourceTypes = [
    DataSourceType.ParentSurvey,
    DataSourceType.StudentSurvey,
    DataSourceType.StudentCounseling,
    DataSourceType.ParentCounseling,
    DataSourceType.TeacherObservation,
    DataSourceType.StudentReflection,
    DataSourceType.AIScenario,
  ];
  
  useEffect(() => {
    setActiveReport(null);
    setError('');
    setIsLoading(false);
    setIsReportSaved(false);
    // Reset Scenario states
    setScenarioContent('');
    setIsScenarioLoading(false);
    setIsScenarioSaved(false);
  }, [selectedStudent]);

   useEffect(() => {
    if (initialDataSourceToView && selectedStudent) {
      const targetGroup = groupedDataSources.find(g => g.type === initialDataSourceToView.type);
      if (targetGroup) {
        if (targetGroup.sources.length === 1) {
          setViewingDataSource(targetGroup.sources[0]);
        } else {
          setViewingDataSourceGroup({ ...targetGroup, initialLogId: initialDataSourceToView.id });
        }
      }
      clearInitialDataSourceToView();
    }
  }, [selectedStudent, initialDataSourceToView, clearInitialDataSourceToView, groupedDataSources]);


  const handleGenerateReport = useCallback(async (type: 'focus' | 'summary', topics?: string[], filter?: DataFilter) => {
    if (!selectedStudent) return;

    if (type === 'focus' && (!topics || topics.length === 0)) {
        alert('분석할 주제를 하나 이상 선택해주세요.');
        return;
    }

    setIsFocusModalOpen(false);
    setIsLoading(true);
    setError('');
    setActiveReport(null);

    try {
        let result: string;
        if (type === 'summary') {
            result = await generateDataSummary(selectedStudent, filter);
        } else { // type === 'focus'
            result = await generateFocusedReport(selectedStudent, topics!, filter);
        }
        setActiveReport(result);
        setIsReportSaved(false);
        setIsResultModalOpen(true); // Open the result modal on success
    } catch (err) {
        setError('리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [selectedStudent]);

  const handleSaveReport = (contentToSave: string) => {
    if (!selectedStudent) return;
    
    // Note: contentToSave is passed from the modal. It might be raw markdown or HTML.
    // If it is HTML (starts with <), we save it as is. If markdown, we might prepend header.
    // The modal already passes the full content it wants to save.
    
    addDataSource(selectedStudent.id, {
        type: DataSourceType.AIReport,
        content: contentToSave,
    });
    
    setIsReportSaved(true);
  };
  
  const handleGenerateScenario = async (type: '학생' | '학부모', filter: DataFilter) => {
        if (!selectedStudent) return;
        
        setIsScenarioConfigOpen(false);
        setIsScenarioModalOpen(true);
        setIsScenarioLoading(true);
        setScenarioContent('');
        setIsScenarioSaved(false);
        
        try {
            const result = await generateCounselingScenario(selectedStudent, type, filter);
            setScenarioContent(result);
        } catch (err) {
            console.error(err);
            setScenarioContent('오류: 시나리오를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsScenarioLoading(false);
        }
  };

  const handleSaveScenario = (contentToSave: string) => {
      if (!selectedStudent) return;

      addDataSource(selectedStudent.id, {
          type: DataSourceType.AIScenario,
          content: contentToSave
      });
      
      setIsScenarioSaved(true);
  };

  const handleViewData = (group: { type: DataSourceType, sources: DataSource[] }) => {
    const viewMap: Partial<Record<DataSourceType, View>> = {
        [DataSourceType.ParentCounseling]: View.PARENT_COUNSELING_VIEW,
        [DataSourceType.StudentCounseling]: View.STUDENT_COUNSELING_VIEW,
        [DataSourceType.TeacherObservation]: View.TEACHER_OBSERVATION_VIEW,
        [DataSourceType.StudentReflection]: View.STUDENT_REFLECTION_VIEW
    };
    const targetView = viewMap[group.type];
    
    if (targetView) {
        setCurrentView(targetView);
    } else { // For surveys, scenarios, etc.
        if (group.sources.length === 1) {
            setViewingDataSource(group.sources[0]);
        } else {
            setViewingDataSourceGroup({ type: group.type, sources: group.sources });
        }
    }
  };


  if (!selectedStudent) {
    return <div className="text-center text-gray-500">학생을 선택해주세요.</div>;
  }
  
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center space-x-4 border-b pb-4">
              <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.number}. {selectedStudent.name} 학생</h2>
              </div>
            </div>
             <div className="space-y-3 pt-2">
                {requiredDataSourceTypes.map(type => {
                    const group = groupedDataSources.find(g => g.type === type);
                    const count = group ? group.sources.length : 0;
                    return (
                         <div key={type} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                            <span className="text-base font-medium text-gray-700">{type}</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {count}건
                                </span>
                                {count > 0 && group && (
                                    <button
                                        onClick={() => handleViewData(group)}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors whitespace-nowrap shadow-sm"
                                    >
                                        내용 보기
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
            {basicInfo && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">학생 기본 정보</h3>
                    <div className="text-sm text-gray-800 space-y-2">
                        <p><strong className="w-28 inline-block font-medium text-gray-500">학생 주소:</strong> {basicInfo.address}</p>
                        <p><strong className="w-28 inline-block font-medium text-gray-500">학생 연락처:</strong> {basicInfo.studentPhone}</p>
                        <p><strong className="w-28 inline-block font-medium text-gray-500">보호자 연락처:</strong> {basicInfo.parentPhone}</p>
                    </div>
                </div>
            )}
            
            {/* AI Report Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                <div className="flex justify-between items-center border-b pb-4 mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-blue-600" />
                        종합 리포트
                    </h3>
                    <button
                        onClick={() => setIsFocusModalOpen(true)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        AI 리포트 생성
                    </button>
                </div>
                
                <div className="py-8 text-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-gray-600 font-medium">AI가 데이터를 분석하고 있습니다...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-lg inline-block">{error}</div>
                    ) : (
                        <div className="text-gray-400">
                            <p className="text-lg font-medium mb-2">AI 리포트 생성 버튼을 눌러</p>
                            <p>{selectedStudent.name} 학생에 대한 심층 분석을 받아보세요.</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto border-t pt-4 flex-shrink-0">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">과거 AI 리포트 내역</h4>
                    {reportHistory.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {reportHistory.map((item) => {
                                    // Simple logic to display a title. If content starts with a known header (HTML save), use generic title
                                    let displayTitle = `ID: ${item.id} 리포트`;
                                    let reportContent = item.content;

                                    if (item.content.trim().startsWith('<')) {
                                        displayTitle = `${new Date(item.id).toLocaleDateString()} 저장된 리포트`;
                                    } else {
                                        // Markdown parsing
                                        const contentParts = item.content.split('\n---\n');
                                        const header = contentParts[0];
                                        reportContent = contentParts.length > 1 ? contentParts[1] : header;
                                        const dateMatch = header.match(/생성일시::(.*)/);
                                        const displayDate = dateMatch ? dateMatch[1].trim() : `${new Date(item.id).toLocaleDateString()}`;
                                        displayTitle = `${displayDate}에 생성된 리포트`;
                                    }

                                return (
                                    <button 
                                        key={item.id} 
                                        onClick={() => {
                                            setActiveReport(reportContent);
                                            setIsReportSaved(true);
                                            setIsResultModalOpen(true);
                                        }}
                                        className="w-full text-left p-3 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-sm font-medium text-gray-700 flex items-center justify-between"
                                    >
                                        <span>{displayTitle}</span>
                                        <span className="text-xs text-blue-500 font-semibold">다시 보기 &rarr;</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 bg-slate-50 p-4 rounded-md text-center">저장된 리포트가 없습니다.</p>
                    )}
                </div>
            </div>

             {/* AI Counseling Scenario Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                     <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-green-600" />
                        AI 상담 시나리오
                    </h3>
                    <button
                        onClick={() => setIsScenarioConfigOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                    >
                        AI 시나리오 생성
                    </button>
                </div>
                 <div className="py-6 text-center text-gray-400">
                    <p className="text-lg font-medium mb-2">상담 준비가 필요하신가요?</p>
                    <p>학생의 모든 데이터를 바탕으로 맞춤형 상담 시나리오를 제안해드립니다.</p>
                    <p className="text-sm mt-2">학생 상담 및 학부모 상담 가이드를 받아보세요.</p>
                </div>
            </div>

        </div>
      </div>
      {viewingDataSource && selectedStudent && (
        <DataSourceContentModal
          student={selectedStudent}
          dataSource={viewingDataSource}
          onClose={() => setViewingDataSource(null)}
        />
      )}
       <AIReportFocusModal 
        isOpen={isFocusModalOpen} 
        onClose={() => setIsFocusModalOpen(false)} 
        onGenerate={handleGenerateReport}
      />
      <AIReportResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        reportContent={activeReport}
        studentName={selectedStudent.name}
        onSave={handleSaveReport}
        isSaved={isReportSaved}
      />
       <AIScenarioConfigModal 
        isOpen={isScenarioConfigOpen}
        onClose={() => setIsScenarioConfigOpen(false)}
        onGenerate={handleGenerateScenario}
        initialType="학생"
      />
      <AIScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        isLoading={isScenarioLoading}
        scenario={scenarioContent}
        title={`${selectedStudent.name} AI 상담 시나리오`}
        onSave={handleSaveScenario}
        isSaved={isScenarioSaved}
      />
    </>
  );
};

export default StudentDashboard;