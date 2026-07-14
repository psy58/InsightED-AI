
import React, { useMemo, useState, useRef } from 'react';
import { XIcon, PrinterIcon, SparklesIcon, HighlighterIcon, PencilSquareIcon, CheckBadgeIcon } from './icons';

interface AIReportResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportContent: string | null;
    studentName: string;
    onSave: (content: string) => void;
    isSaved: boolean;
}

interface ParsedReport {
    title: string;
    metadata: string[];
    sections: { title: string; content: string }[];
    insight: { title: string; content: string } | null;
    isHtml: boolean;
    fullHtml?: string;
}

const AIReportResultModal: React.FC<AIReportResultModalProps> = ({ isOpen, onClose, reportContent, studentName, onSave, isSaved }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };
    
    const applyHighlight = (color: string) => {
        document.execCommand('hiliteColor', false, color);
    };

    const handleSave = () => {
        if (containerRef.current) {
            const printableContent = containerRef.current.querySelector('.printable-content');
            if (printableContent) {
                onSave(printableContent.innerHTML);
                setIsEditMode(false);
            }
        }
    };

    // Helper function to render formatted HTML from text (optimized)
    const formatTextToHtml = (text: string) => {
        if (!text) return '';
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>') // Bold
            .replace(/^- (.*)/gm, '<li class="ml-4 list-disc marker:text-blue-500 mb-1">$1</li>'); // Lists

        // Clean up newlines after list items to prevent extra spacing
        html = html.replace(/<\/li>\n/g, '</li>');
        
        // Convert remaining newlines to breaks
        return html.replace(/\n/g, '<br/>');
    };

    const parsedReport: ParsedReport = useMemo(() => {
        const result: ParsedReport = {
            title: '',
            metadata: [],
            sections: [],
            insight: null,
            isHtml: false
        };

        if (!reportContent) return result;

        // Check if content is already HTML (saved report)
        if (reportContent.trim().startsWith('<')) {
            return { ...result, isHtml: true, fullHtml: reportContent };
        }

        const lines = reportContent.split('\n');
        let currentSectionTitle = '';
        let currentSectionContent = '';

        // Simple parser for the specific Gemini output format
        
        // 1. Extract Title and Metadata
        let lineIndex = 0;
        while (lineIndex < lines.length) {
            const line = lines[lineIndex];
            if (line.startsWith('### ')) {
                result.title = line.replace('### ', '').trim();
            } else if (line.trim().startsWith('- **') || line.trim().startsWith('- 생성') || line.trim().startsWith('- 분석')) {
                result.metadata.push(line.replace(/^- /, '').trim());
            } else if (line.startsWith('#### ')) {
                break; // Start of sections
            }
            lineIndex++;
        }

        // 2. Extract Sections
        for (; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (line.startsWith('#### ')) {
                // Push previous section if exists
                if (currentSectionTitle) {
                    const formattedContent = formatTextToHtml(currentSectionContent.trim());
                    if (currentSectionTitle.includes('교사 제언') || currentSectionTitle.includes('Actionable Insight')) {
                        result.insight = { title: currentSectionTitle, content: formattedContent };
                    } else {
                        result.sections.push({ title: currentSectionTitle, content: formattedContent });
                    }
                }
                currentSectionTitle = line.replace('#### ', '').trim();
                currentSectionContent = '';
            } else {
                currentSectionContent += line + '\n';
            }
        }
        // Push last section
        if (currentSectionTitle) {
            const formattedContent = formatTextToHtml(currentSectionContent.trim());
            if (currentSectionTitle.includes('교사 제언') || currentSectionTitle.includes('Actionable Insight')) {
                 result.insight = { title: currentSectionTitle, content: formattedContent };
            } else {
                result.sections.push({ title: currentSectionTitle, content: formattedContent });
            }
        }

        return result;
    }, [reportContent]);

    if (!isOpen || !reportContent) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
             <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        .printable-area, .printable-area * { visibility: visible; }
                        .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
                        .no-print { display: none; }
                        .modal-content { box-shadow: none; border: none; height: auto; overflow: visible; }
                    }
                `}
            </style>
            <div ref={containerRef} className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className="flex items-center justify-between p-5 border-b bg-white rounded-t-xl no-print z-20 relative">
                    <div className="flex items-center gap-2 text-blue-700">
                        <SparklesIcon className="w-6 h-6" />
                        <h2 className="text-xl font-bold">AI 분석 리포트</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                            title="수정 및 형광펜 모드"
                        >
                            {isEditMode ? <PencilSquareIcon className="w-6 h-6" /> : <HighlighterIcon className="w-6 h-6" />}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
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

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 printable-area">
                    <div className="max-w-4xl mx-auto printable-content">
                        {parsedReport.isHtml ? (
                            <div 
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                className={`outline-none ${isEditMode ? 'p-2 border border-blue-200 rounded bg-blue-50/10' : ''}`}
                                dangerouslySetInnerHTML={{ __html: parsedReport.fullHtml || '' }} 
                            />
                        ) : (
                            <>
                                {/* Report Header */}
                                <div className="mb-8 text-center">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{parsedReport.title || `${studentName} 학생 분석 리포트`}</h1>
                                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500 bg-white py-3 px-6 rounded-full shadow-sm inline-flex">
                                        {parsedReport.metadata.map((meta, idx) => (
                                            <span key={idx} dangerouslySetInnerHTML={{ __html: meta.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Grid Layout for Sections */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {parsedReport.sections.map((section, idx) => (
                                        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                                                <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                                                {section.title}
                                            </h3>
                                            <div 
                                                className={`text-gray-700 leading-relaxed text-sm ${isEditMode ? 'cursor-text outline-none border border-blue-100 rounded p-2 bg-blue-50/10' : ''}`}
                                                contentEditable={isEditMode}
                                                suppressContentEditableWarning={true}
                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Actionable Insight - Full Width Highlight */}
                                {parsedReport.insight && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
                                        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                                            <SparklesIcon className="w-5 h-5 text-blue-600" />
                                            {parsedReport.insight.title}
                                        </h3>
                                        <div className="bg-white/60 p-4 rounded-lg backdrop-blur-sm">
                                             <div 
                                                className={`text-gray-700 leading-relaxed text-sm ${isEditMode ? 'cursor-text outline-none border border-blue-200 rounded p-2' : ''}`}
                                                contentEditable={isEditMode}
                                                suppressContentEditableWarning={true}
                                                dangerouslySetInnerHTML={{ __html: parsedReport.insight.content }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer - Actions */}
                <footer className="p-4 bg-white border-t flex justify-between items-center no-print rounded-b-xl">
                    <button 
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        인쇄 / PDF 저장
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            닫기
                        </button>
                        {!isSaved ? (
                            <button 
                                onClick={handleSave}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-colors"
                            >
                                편집하여 저장하기
                            </button>
                        ) : (
                            <button 
                                disabled
                                className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold shadow-sm opacity-90 cursor-default flex items-center gap-2"
                            >
                                <CheckBadgeIcon className="w-5 h-5 text-white" />
                                저장되었습니다
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AIReportResultModal;
