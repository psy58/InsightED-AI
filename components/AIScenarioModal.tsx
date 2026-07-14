
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, XIcon, PrinterIcon, HighlighterIcon, PencilSquareIcon, CheckBadgeIcon } from './icons';

interface AIScenarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    scenario: string;
    title: string;
    onSave?: (content: string) => void;
    isSaved?: boolean;
}

const AIScenarioModal: React.FC<AIScenarioModalProps> = ({ isOpen, onClose, isLoading, scenario, title, onSave, isSaved }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scenario) {
            // If it starts with HTML tags (div, p, h3), assume it's already HTML (saved data)
            // Otherwise, assume Markdown (new data)
            if (scenario.trim().startsWith('<')) {
                setHtmlContent(scenario);
            } else {
                setHtmlContent(renderMarkdown(scenario));
            }
        }
    }, [scenario]);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        if (contentRef.current && onSave) {
            onSave(contentRef.current.innerHTML);
            setIsEditMode(false);
        }
    };

    const renderMarkdown = (text: string) => {
        if (!text) return '';
        const lines = text.split('\n');
        let html = '';
        let inList = false;
    
        const processLine = (line: string) => line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-700">$1</strong>');
    
        for (const line of lines) {
            if (line.trim() === '') {
                if(inList) { html += '</ul>'; inList = false; }
                continue;
            }
    
            if (line.startsWith('### ')) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<h3 class="text-lg font-bold text-gray-800 mt-6 mb-2">${processLine(line.substring(4))}</h3>`;
            } else if (line.startsWith('* ')) {
                if (!inList) { html += '<ul class="space-y-2 list-disc ml-5">'; inList = true; }
                html += `<li class="text-gray-700 pl-1">${processLine(line.substring(2))}</li>`;
            } else {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<p class="text-gray-700 mt-2 leading-relaxed">${processLine(line)}</p>`;
            }
        }
        if (inList) { html += '</ul>'; }
        return html;
    };

    const applyHighlight = (color: string) => {
        document.execCommand('hiliteColor', false, color);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
             <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 2rem;
                            font-size: 12pt;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                `}
            </style>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b no-print bg-white rounded-t-lg z-20 relative">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-blue-600" />
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                            title="수정 및 형광펜 모드"
                        >
                            {isEditMode ? <PencilSquareIcon className="w-6 h-6" /> : <HighlighterIcon className="w-6 h-6" />}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                <div className="relative flex-1 overflow-hidden flex flex-col">
                     {isEditMode && (
                        <div className="flex items-center gap-2 p-2 bg-gray-100 border-b justify-center no-print">
                            <span className="text-xs font-semibold text-gray-500 uppercase mr-2">형광펜 도구</span>
                            <button onMouseDown={(e) => { e.preventDefault(); applyHighlight('#fef08a'); }} className="w-6 h-6 rounded-full bg-yellow-200 border border-gray-300 hover:scale-110 transition-transform shadow-sm" title="노랑"></button>
                            <button onMouseDown={(e) => { e.preventDefault(); applyHighlight('#bbf7d0'); }} className="w-6 h-6 rounded-full bg-green-200 border border-gray-300 hover:scale-110 transition-transform shadow-sm" title="초록"></button>
                            <button onMouseDown={(e) => { e.preventDefault(); applyHighlight('#fbcfe8'); }} className="w-6 h-6 rounded-full bg-pink-200 border border-gray-300 hover:scale-110 transition-transform shadow-sm" title="분홍"></button>
                            <div className="w-px h-4 bg-gray-300 mx-2"></div>
                            <button onMouseDown={(e) => { e.preventDefault(); applyHighlight('transparent'); }} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50" title="지우개">지우개</button>
                        </div>
                    )}

                    <div className="p-6 overflow-y-auto printable-area flex-1">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600 font-semibold">AI가 학생 데이터를 종합적으로 분석하여</p>
                                <p className="text-gray-600 font-semibold">상담 시나리오를 생성하고 있습니다...</p>
                            </div>
                        ) : (
                            <div 
                                ref={contentRef}
                                className={`prose prose-sm max-w-none ${isEditMode ? 'cursor-text outline-none p-4 rounded border-2 border-blue-200 bg-blue-50/10' : ''}`}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                        )}
                    </div>
                </div>
                
                 <footer className="p-4 bg-gray-50 border-t flex justify-between items-center no-print">
                    <button 
                        onClick={handlePrint}
                        disabled={isLoading || !scenario}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <PrinterIcon className="w-5 h-5"/>
                        인쇄 / PDF
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-semibold">
                            닫기
                        </button>
                        {onSave && (
                            !isSaved ? (
                                <button 
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                                >
                                    편집하여 저장하기
                                </button>
                            ) : (
                                <button 
                                    disabled
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-sm opacity-90 cursor-default flex items-center gap-2"
                                >
                                    <CheckBadgeIcon className="w-5 h-5" />
                                    저장됨
                                </button>
                            )
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AIScenarioModal;