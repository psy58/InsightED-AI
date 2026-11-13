
import React, { useState, useRef, DragEvent } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, DataSourceType } from '../types';
import { ChevronLeftIcon, PaperClipIcon, MicrophoneIcon } from './icons';
import StudentCounselingPreview from './StudentCounselingPreview';
import { blobToBase64 } from '../utils';
import { transcribeAndSummarizeAudio } from '../services/aiService';

const StudentCounselingEditor = () => {
    const { selectedStudent, setCurrentView, addDataSource } = useAcroAppContext();
    const [counselingDate, setCounselingDate] = useState(new Date().toISOString().slice(0, 10));
    const [mainIssues, setMainIssues] = useState('');
    
    const [summary, setSummary] = useState('');
    const [transcription, setTranscription] = useState('');
    const [teacherAction, setTeacherAction] = useState('');

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [processingError, setProcessingError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!selectedStudent) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p>상담 기록을 추가할 학생을 선택해주세요.</p>
                <button onClick={() => setCurrentView(View.STUDENT_COUNSELING_DASHBOARD)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    상담 현황으로 돌아가기
                </button>
            </div>
        );
    }
    
    const processAudio = async (audioBlob: Blob, sourceName: string) => {
        setFileName(sourceName);
        setIsProcessing(true);
        setProcessingError('');
        // Don't clear automatically to allow manual edits/comparison
        // setSummary('');
        // setTranscription('');

        try {
            const base64Audio = await blobToBase64(audioBlob);
            const result = await transcribeAndSummarizeAudio(base64Audio, audioBlob.type);
            setSummary(result.summary);
            setTranscription(result.transcription);
        } catch (error) {
            console.error(error);
            setProcessingError(error instanceof Error ? error.message : '오디오 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processAudio(file, file.name);
        }
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            setProcessingError('');
            audioChunksRef.current = [];
            
            const options = { mimeType: 'audio/webm' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunksRef.current.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                processAudio(audioBlob, '녹음된 상담.webm');
                stream.getTracks().forEach(track => track.stop());
            });
            
            mediaRecorder.start();

        } catch (err) {
            console.error("Error starting recording:", err);
            setProcessingError('마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
            setIsRecording(false);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    
    const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        if (!isProcessing && !isRecording) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            processAudio(file, file.name);
        } else {
            setProcessingError('오디오 파일만 업로드할 수 있습니다.');
        }
    };

    const handleSave = () => {
        if (!selectedStudent) return;
        const content = `상담일::${counselingDate}\n주요 안건::${mainIssues}\n---요약---\n${summary}\n---전사---\n${transcription}\n---교사 조치 및 계획---\n${teacherAction}`;
        
        addDataSource(selectedStudent.id, {
            type: DataSourceType.StudentCounseling,
            content: content,
        });

        alert(`${selectedStudent.name} 학생의 상담 내용이 저장되었습니다.`);
        setCurrentView(View.STUDENT_COUNSELING_DASHBOARD);
    };
    
    const formData = {
        studentName: `${selectedStudent.number}. ${selectedStudent.name}`,
        counselingDate,
        mainIssues,
        summary,
        transcription,
        teacherAction,
    };
    
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.STUDENT_COUNSELING_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">{selectedStudent.number}. ${selectedStudent.name} 학생 상담 기록</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            미리보기
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
                        >
                            저장하기
                        </button>
                    </div>
                </header>

                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">상담일</label>
                        <input type="date" value={counselingDate} onChange={e => setCounselingDate(e.target.value)} className="w-full md:w-1/3 shadow-sm block sm:text-sm border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">주요 안건</label>
                        <textarea rows={2} value={mainIssues} onChange={e => setMainIssues(e.target.value)} placeholder="예: 교우 관계, 학습 태도 등" className="w-full shadow-sm block sm:text-sm border-gray-300 rounded-md"></textarea>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-700">상담 내용 기록</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".mp3,.wav,.m4a,audio/*"
                                    className="hidden"
                                />
                                <button onClick={triggerFileSelect} disabled={isRecording || isProcessing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                                    <PaperClipIcon />
                                    파일 첨부
                                </button>
                                {!isRecording ? (
                                    <button onClick={handleStartRecording} disabled={isProcessing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                                        <MicrophoneIcon />
                                        녹음하기
                                    </button>
                                ) : (
                                    <button onClick={handleStopRecording} className="inline-flex items-center gap-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        녹음 중지
                                    </button>
                                )}
                            </div>
                        </div>
                        {(fileName || isRecording) && (
                            <div className="text-sm text-gray-600 my-2 p-2 bg-gray-100 rounded-md">
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>'{fileName}' 파일을 분석하여 요약 중입니다...</span>
                                    </div>
                                ) : isRecording ? (
                                    <span className="text-red-600 font-semibold">녹음이 진행 중입니다...</span>
                                ) : (
                                    <span>✓ '{fileName}' 파일 분석 및 요약 완료</span>
                                )}
                            </div>
                        )}
                        {processingError && <p className="text-sm text-red-500 my-2">{processingError}</p>}
                       
                        <div
                            className={`mt-2 rounded-md transition-colors p-4 border-2 border-dashed ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragEvents}
                            onDrop={handleDrop}
                        >
                             {/* Split View Layout */}
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                {/* Left Column: Transcription */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">음성 전사 (전체 내용)</label>
                                        <span className="text-xs text-gray-400">자동 생성됨</span>
                                    </div>
                                    <textarea
                                        value={transcription}
                                        onChange={e => setTranscription(e.target.value)}
                                        placeholder="녹음 파일의 전체 대화 내용이 여기에 표시됩니다. 직접 수정할 수도 있습니다."
                                        className="w-full flex-grow min-h-[400px] shadow-sm block sm:text-sm border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Right Column: Summary & Action Plan */}
                                <div className="flex flex-col h-full gap-6">
                                    <div className="flex flex-col h-1/2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-semibold text-blue-700">AI 핵심 요약</label>
                                            <span className="text-xs text-blue-400">AI 생성</span>
                                        </div>
                                        <textarea
                                            value={summary}
                                            onChange={e => setSummary(e.target.value)}
                                            placeholder="AI가 분석한 상담의 핵심 내용이 요약됩니다."
                                            className="w-full flex-grow min-h-[180px] shadow-sm block sm:text-sm border-blue-200 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/30"
                                        />
                                    </div>
                                    <div className="flex flex-col h-1/2">
                                        <label className="block text-sm font-semibold text-green-700 mb-2">교사 조치 및 계획</label>
                                        <textarea
                                            value={teacherAction}
                                            onChange={e => setTeacherAction(e.target.value)}
                                            placeholder="상담 결과를 바탕으로 한 교사의 구체적인 조치사항이나 추후 계획을 기록해주세요."
                                            className="w-full flex-grow min-h-[180px] shadow-sm block sm:text-sm border-green-200 rounded-md p-3 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
                                        />
                                    </div>
                                </div>
                             </div>

                             {!summary && !transcription && !teacherAction && (
                                <div className="mt-8 text-center text-gray-400 text-sm pointer-events-none">
                                    <p>녹음 파일을 첨부하거나 끌어다 놓아 AI 요약/전사를 생성하세요.<br/>또는 각 영역에 직접 내용을 입력할 수 있습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isPreviewOpen && (
                <StudentCounselingPreview 
                    formData={formData} 
                    onClose={() => setIsPreviewOpen(false)} 
                />
            )}
        </>
    );
};

export default StudentCounselingEditor;
