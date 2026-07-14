
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { Student, View } from '../types';
import { ChevronLeftIcon, EyeIcon, XIcon, ExpandIcon } from './icons';
import { MOCK_PEER_RELATIONSHIP_RESULTS, MOCK_SCHOOL_VIOLENCE_RESULTS, MOCK_PEER_RELATIONSHIP_RESULTS_OCT_2025 } from '../constants';

const ResponseDataModal = ({ student, onClose, resultsData }: { student: Student | null, onClose: () => void, resultsData: any }) => {
    if (!student) return null;

    const studentRatings = resultsData.closenessRatings[student.name as keyof typeof resultsData.closenessRatings];
    const studentAnswers = resultsData.customQuestionResponses.map((q: any) => ({
        question: q.question,
        answer: q.answers[student.name as keyof typeof q.answers] || '응답 없음'
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{student.name} 학생 응답 원본</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">친구별 친밀도 응답</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {studentRatings && Object.entries(studentRatings).map(([name, rating]) => (
                                <div key={name} className="p-2 bg-slate-100 rounded">
                                    <span className="font-medium text-gray-700">{name}: </span>
                                    <span className="font-bold text-blue-600">{rating}점</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">추가 질문 응답</h4>
                        <div className="space-y-3">
                            {studentAnswers.map((item: any, index: number) => (
                                <div key={index} className="p-3 bg-slate-100 rounded">
                                    <p className="text-sm font-medium text-gray-700">{item.question}</p>
                                    <p className="text-md font-semibold text-blue-800 mt-1">{Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NominatorListModal = ({ data, onClose }: { data: { title: string; nominators: string[] } | null, onClose: () => void }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{data.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {data.nominators.length > 0 ? (
                        <ul className="space-y-2">
                            {data.nominators.map((nominator, index) => (
                                <li key={index} className="p-2 bg-slate-100 rounded text-gray-800">{nominator}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center">응답한 학생이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const CustomQuestionAnalysis = ({ question, answers, onNameClick }: { question: string, answers: any, onNameClick: (name: string) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const nominationCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        Object.values(answers).flat().forEach((name: any) => {
            if (name === '없음' || !name) return;
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [answers]);

    const maxCount = nominationCounts.length > 0 ? nominationCounts[0].count : 0;
    const displayedCounts = isExpanded ? nominationCounts : nominationCounts.slice(0, 3);

    const showFighterInsight = question.includes('자주 다투는');
    const showRuleKeeperInsight = question.includes('규칙을 잘 지키는');
    const topStudent = nominationCounts[0]?.name;

    return (
        <div className="p-4 border rounded-lg bg-slate-50">
            <h4 className="font-bold text-lg mb-1 text-gray-800">{question}</h4>
            <p className="text-xs text-gray-500 mb-3 font-normal">ℹ️ 이름을 클릭하면 지목한 학생을 확인할 수 있습니다.</p>
            {nominationCounts.length > 0 ? (
                <>
                    <div className="space-y-2.5 pr-4">
                        {displayedCounts.map(({ name, count }) => (
                            <div key={name} className="flex items-center gap-3">
                                <button onClick={() => onNameClick(name)} className="w-20 text-sm font-semibold text-gray-700 text-right shrink-0 hover:text-blue-600 hover:underline">{name}</button>
                                <div className="flex-1 bg-slate-200 rounded-full h-6">
                                    <div
                                        className="bg-sky-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold"
                                        style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%', minWidth: '24px' }}
                                    >
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {nominationCounts.length > 3 && (
                        <div className="text-center mt-3">
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                                {isExpanded ? '- 접기' : `+ 더보기 (${nominationCounts.length - 3}명)`}
                            </button>
                        </div>
                    )}
                    {showFighterInsight && topStudent && (
                         <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                            <h5 className="font-bold text-amber-800">분석 인사이트</h5>
                            <p className="text-sm text-amber-700 mt-1">
                                '{topStudent}' 학생이 친구들과의 다툼에서 가장 많이 언급되었습니다. 이는 학생의 교우 관계에 갈등 요소가 있음을 시사하며, 교사의 면밀한 관찰과 상담이 필요할 수 있습니다.
                            </p>
                        </div>
                    )}
                    {showRuleKeeperInsight && topStudent && (
                         <div className="mt-4 p-3 bg-teal-50 border-l-4 border-teal-400 rounded-r-lg">
                            <h5 className="font-bold text-teal-800">분석 인사이트</h5>
                            <p className="text-sm text-teal-700 mt-1">
                                '{topStudent}' 학생이 규칙을 잘 지키는 학생으로 가장 많이 언급되었습니다. 이는 학생이 학급에서 긍정적인 모범이 되고 있음을 시사합니다.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-sm text-gray-500">응답 데이터가 없습니다.</p>
            )}
        </div>
    );
};

const SchoolViolenceResults = () => {
    const data = MOCK_SCHOOL_VIOLENCE_RESULTS;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">설문 요약</h3>
                <div className="p-4 bg-slate-50 rounded-lg border grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-md text-center">
                        <p className="text-sm text-gray-500">총 응답자</p>
                        <p className="text-2xl font-bold text-gray-800">{data.totalRespondents}명</p>
                    </div>
                     <div className="p-3 bg-white rounded-md text-center">
                        <p className="text-sm text-gray-500">피해 응답</p>
                        <p className="text-2xl font-bold text-red-600">{data.victimReports.length}건</p>
                    </div>
                     <div className="p-3 bg-white rounded-md text-center">
                        <p className="text-sm text-gray-500">목격 응답</p>
                        <p className="text-2xl font-bold text-orange-600">{data.witnessReports.length}건</p>
                    </div>
                </div>
            </div>

            {data.victimReports.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">학교폭력 피해 응답 상세</h3>
                    <div className="space-y-4">
                        {data.victimReports.map((report, index) => (
                            <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><strong className="w-24 inline-block font-semibold text-gray-600">피해 학생:</strong> {report.victim}</p>
                                    <p><strong className="w-24 inline-block font-semibold text-gray-600">가해 학생:</strong> {report.perpetrator}</p>
                                    <p><strong className="w-24 inline-block font-semibold text-gray-600">발생 시기:</strong> {report.date}</p>
                                    <p><strong className="w-24 inline-block font-semibold text-gray-600">발생 장소:</strong> {report.location}</p>
                                    <p className="sm:col-span-2"><strong className="w-24 inline-block font-semibold text-gray-600">피해 유형:</strong> {report.type}</p>
                                    <p className="sm:col-span-2 mt-2"><strong className="w-24 inline-block font-semibold text-gray-600 align-top">상세 내용:</strong> <span className="inline-block w-[calc(100%-100px)]">{report.details}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {data.witnessReports.length > 0 && (
                 <div>
                    <h3 className="text-lg font-bold text-orange-800 mb-2">학교폭력 목격 응답 상세</h3>
                    {/* Placeholder for witness reports rendering */}
                    <p className="text-gray-500 text-sm">목격 응답 데이터가 여기에 표시됩니다.</p>
                </div>
            )}
        </div>
    );
};

interface Node {
    id: number;
    name: string;
    x: number;
    y: number;
    avatar?: string;
    score: number;
}

interface Link {
    source: string; // name
    target: string; // name
    strength: number;
    isMutualStrong: boolean;
}

const InteractiveNetworkGraph = ({ nodes, links, width = 500, height = 500, onNodeClick }: { nodes: Node[], links: Link[], width?: number|string, height?: number|string, onNodeClick?: (node: Node) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [graphNodes, setGraphNodes] = useState<Node[]>(nodes);
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    
    // State for dragging nodes
    const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
    // State for panning canvas
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Initialize/Reset nodes when props change, but don't overwrite if just re-rendering
    // We only want to reset if the dataset changes drastically (length change for simplicity here)
    useEffect(() => {
        setGraphNodes(nodes);
    }, [nodes.length]); // Simple dependency check. In real app, might check ID hash.

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        // For simplicity, zoom center is roughly container center or cursor, let's stick to simple zoom
        const newZoom = e.deltaY < 0 ? view.zoom * zoomFactor : view.zoom / zoomFactor;
        const clampedZoom = Math.max(0.2, Math.min(newZoom, 5));
        setView(prev => ({ ...prev, zoom: clampedZoom }));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        // If clicking a node, this won't fire if we stopPropagation on node
        e.preventDefault();
        isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        
        // Handle Node Dragging
        if (draggingNodeId !== null) {
            const dx = (e.clientX - lastMousePos.current.x) / view.zoom;
            const dy = (e.clientY - lastMousePos.current.y) / view.zoom;
            lastMousePos.current = { x: e.clientX, y: e.clientY };

            setGraphNodes(prevNodes => prevNodes.map(n => {
                if (n.id === draggingNodeId) {
                    return { ...n, x: n.x + dx, y: n.y + dy };
                }
                return n;
            }));
            return;
        }

        // Handle Canvas Panning
        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        }
    };

    const handleMouseUp = () => {
        isPanning.current = false;
        setDraggingNodeId(null);
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
        e.stopPropagation(); // Prevent canvas panning
        e.preventDefault();
        setDraggingNodeId(nodeId);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Helper to find node coordinates
    const getNode = (name: string) => graphNodes.find(n => n.name === name);

    return (
        <div 
            ref={containerRef}
            className="relative overflow-hidden bg-slate-100 rounded-md cursor-grab select-none"
            style={{ width, height }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="absolute top-0 left-0 w-full h-full origin-top-left"
                style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
            >
                <svg width="1000" height="1000" className="overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="25" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
                        </marker>
                        <marker id="arrowhead-strong" markerWidth="6" markerHeight="4" refX="25" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#F59E0B" /> {/* Amber-500 */}
                        </marker>
                    </defs>
                    {links.map((link, i) => {
                        const sourceNode = getNode(link.source);
                        const targetNode = getNode(link.target);
                        if (!sourceNode || !targetNode) return null;

                        return (
                            <line
                                key={i}
                                x1={sourceNode.x}
                                y1={sourceNode.y}
                                x2={targetNode.x}
                                y2={targetNode.y}
                                stroke={link.isMutualStrong ? "#F59E0B" : "#94a3b8"}
                                strokeWidth={link.isMutualStrong ? 3 : 1.5}
                                opacity={link.isMutualStrong ? 1 : 0.6}
                                markerEnd={link.isMutualStrong ? "url(#arrowhead-strong)" : "url(#arrowhead)"}
                            />
                        );
                    })}
                </svg>
                {graphNodes.map(node => (
                    <div
                        key={node.id}
                        className="absolute flex flex-col items-center cursor-pointer transition-transform duration-100 hover:scale-110 hover:z-10"
                        style={{ 
                            left: node.x, 
                            top: node.y, 
                            transform: 'translate(-50%, -50%)',
                            width: 50 
                        }}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onClick={(e) => { e.stopPropagation(); onNodeClick?.(node); }}
                    >
                        <img src={node.avatar} alt={node.name} className={`w-10 h-10 rounded-full bg-white border-2 shadow-lg pointer-events-none ${node.score >= 70 ? 'border-amber-500' : 'border-blue-500'}`}/>
                        <span className="text-xs font-semibold mt-1 bg-white/80 px-1.5 py-0.5 rounded text-gray-800 whitespace-nowrap pointer-events-none">{node.name}</span>
                    </div>
                ))}
            </div>
            
             <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded shadow text-xs text-gray-500 pointer-events-none">
                <p>• 드래그하여 이동, 휠로 확대/축소</p>
                <p>• 노드를 드래그하여 위치 변경 가능</p>
                <p>• 노드 클릭 시 학생 친밀도 점수 확인</p>
                <p className="flex items-center gap-1 mt-1"><span className="w-3 h-1 bg-amber-500 inline-block rounded"></span> 주황색 선: 상호 매우 친함 (5점)</p>
            </div>
        </div>
    );
}


const PeerRelationshipResults = () => {
    const { students, setCurrentView } = useAcroAppContext();
    const [survey, setSurvey] = useState<any>(null);
    const [nominatorsModalData, setNominatorsModalData] = useState<{ title: string; nominators: string[] } | null>(null);

    useEffect(() => {
        const selected = JSON.parse(sessionStorage.getItem('selectedPeerSurvey') || 'null');
        setSurvey(selected);
        if (selected?.isNew) {
            setActiveTab('responses');
        }
    }, []);

    const [selectedNode, setSelectedNode] = useState<{name: string, score: number, avatar?: string } | null>(null);
    const [activeTab, setActiveTab] = useState('analysis');
    const [viewingResponse, setViewingResponse] = useState<Student | null>(null);
    const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

    const resultsData = useMemo(() => {
        if (survey?.id === 3) { // ID 3 is the October 2025 survey
            return MOCK_PEER_RELATIONSHIP_RESULTS_OCT_2025;
        }
        return MOCK_PEER_RELATIONSHIP_RESULTS;
    }, [survey]);

    const respondents = useMemo(() => new Set(Object.keys(resultsData.closenessRatings)), [resultsData]);

    const analysis = useMemo(() => {
        const influenceScores: { [key: string]: number } = {};
        const studentMap = new Map(students.map(s => [s.name, s]));
        
        students.forEach(s => {
            influenceScores[s.name] = 0;
        });
        
        // Calculate scores based on who is being rated
        students.forEach(ratedStudent => {
            let totalScore = 0;
            students.forEach(ratingStudent => {
                if (ratingStudent.name === ratedStudent.name) return;
                const ratings = resultsData.closenessRatings[ratingStudent.name as keyof typeof resultsData.closenessRatings];
                if (ratings && ratings[ratedStudent.name as keyof typeof ratings] !== undefined) {
                    totalScore += ratings[ratedStudent.name as keyof typeof ratings];
                }
            });
            influenceScores[ratedStudent.name] = totalScore;
        });


        const sortedStudents = Object.entries(influenceScores)
            .map(([name, score]) => ({ name, score, avatar: studentMap.get(name)?.avatar }))
            .sort((a, b) => b.score - a.score);
        
        const influential = sortedStudents.slice(0, 3);
        const isolated = sortedStudents.slice(-3);

        return { influential, isolated, influenceScores, sortedStudents };
    }, [students, resultsData]);

    const graphData = useMemo(() => {
        const studentCount = analysis.sortedStudents.length;
        if (studentCount === 0) return { nodes: [], links: [] };

        const studentMap = new Map(students.map(s => [s.name, s]));
        const centerX = 250;
        const centerY = 250;
        const radius = 180;

        const nodes: Node[] = analysis.sortedStudents.map((student, index) => {
            const studentData = studentMap.get(student.name);
            const angle = (index / studentCount) * 2 * Math.PI;
            
            return {
                id: studentData?.id || index,
                name: student.name,
                avatar: studentData?.avatar,
                score: student.score,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            };
        });

        const links: Link[] = [];
        
        // Helper to check if a reverse link with score 5 exists
        const isMutualFive = (source: string, target: string) => {
            const sourceRatings = resultsData.closenessRatings[source as keyof typeof resultsData.closenessRatings];
            const targetRatings = resultsData.closenessRatings[target as keyof typeof resultsData.closenessRatings];
            
            const sToT = sourceRatings ? sourceRatings[target as keyof typeof sourceRatings] : 0;
            const tToS = targetRatings ? targetRatings[source as keyof typeof targetRatings] : 0;
            
            return sToT >= 5 && tToS >= 5;
        };

        Object.entries(resultsData.closenessRatings).forEach(([sourceName, ratings]) => {
            Object.entries(ratings).forEach(([targetName, rating]) => {
                if (sourceName === targetName) return;
                // Only draw arrow if rating is 5 (Highest Closeness)
                if (rating >= 5) {
                    links.push({ 
                        source: sourceName, 
                        target: targetName, 
                        strength: rating,
                        isMutualStrong: isMutualFive(sourceName, targetName)
                    });
                }
            });
        });

        return { nodes, links };
    }, [students, analysis, resultsData]);
    
    const handleNameClick = (question: string, name: string) => {
        const questionData = resultsData.customQuestionResponses.find((q: any) => q.question === question);
        if (!questionData) return;
    
        const nominators = Object.entries(questionData.answers)
            .filter(([_, nominated]) => Array.isArray(nominated) ? nominated.includes(name) : nominated === name)
            .map(([nominator, _]) => nominator);
        
        setNominatorsModalData({
            title: `'${name}' 학생을 지목한 친구들`,
            nominators,
        });
    };
    
    const handleNodeClick = (node: Node) => {
         setSelectedNode({ name: node.name, score: node.score, avatar: node.avatar });
    };
    
    if (!survey) {
        return <div>Loading survey...</div>
    }

    if (survey.dataType === 'schoolViolence') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <header className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(View.PEER_RELATIONSHIP_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">{survey.title} 결과</h2>
                    </div>
                </header>
                <SchoolViolenceResults />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.PEER_RELATIONSHIP_DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">{survey.title} 결과</h2>
                </div>
            </header>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {!survey.isNew && (
                         <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            분석 결과
                        </button>
                    )}
                    <button onClick={() => setActiveTab('responses')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'responses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        응답 현황
                    </button>
                </nav>
            </div>
            
            {activeTab === 'analysis' && survey.isNew && (
                 <div className="text-center py-16 text-gray-500 bg-slate-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">분석 결과 없음</h3>
                    <p className="mt-1 text-sm text-gray-500">아직 설문 응답이 없어 분석 결과를 표시할 수 없습니다.</p>
                </div>
            )}

            {activeTab === 'analysis' && !survey.isNew && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-bold text-lg mb-3 text-gray-800">친밀도 점수가 높은 학생</h3>
                            <ul className="space-y-3">
                                {analysis.influential.map(s => (
                                    <li key={s.name} className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                                        <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full" />
                                        <span className="font-semibold text-gray-700">{s.name}</span>
                                        <span className="ml-auto text-sm font-bold text-blue-600">총 {s.score}점</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div className="p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-bold text-lg mb-3 text-red-800">친밀도 점수가 낮은 학생</h3>
                             <ul className="space-y-3">
                                {analysis.isolated.map(s => (
                                    <li key={s.name} className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                                        <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full" />
                                        <span className="font-semibold text-gray-700">{s.name}</span>
                                        <span className="ml-auto text-sm font-bold text-red-600">총 {s.score}점</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                         <div className="p-4 border rounded-lg bg-slate-50 relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-800">교우 관계 네트워크</h3>
                                <button 
                                    onClick={() => setIsGraphModalOpen(true)}
                                    className="p-1.5 rounded-md bg-white border text-gray-600 hover:bg-gray-100"
                                    title="크게 보기"
                                >
                                    <ExpandIcon className="w-5 h-5" />
                                </button>
                            </div>
                             
                             <InteractiveNetworkGraph 
                                nodes={graphData.nodes}
                                links={graphData.links}
                                width="100%"
                                height={500}
                                onNodeClick={handleNodeClick}
                             />

                             {selectedNode && (
                                <div 
                                    className="absolute top-16 left-6 p-3 bg-white/90 border rounded-lg shadow-lg z-20 max-w-xs"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img src={selectedNode.avatar} className="w-8 h-8 rounded-full" alt={selectedNode.name} />
                                            <span className="font-bold text-gray-800">{selectedNode.name}</span>
                                        </div>
                                        <button onClick={() => setSelectedNode(null)}><XIcon className="w-4 h-4 text-gray-400" /></button>
                                    </div>
                                    <p className="text-sm text-gray-600">친밀도 점수 합계: <span className="font-bold text-blue-600">{selectedNode.score}점</span></p>
                                </div>
                             )}
                        </div>
                    </div>
                     <div className="lg:col-span-12 space-y-4">
                        {resultsData.customQuestionResponses.map((res: any, i: number) => (
                            <div key={res.question}>
                                <CustomQuestionAnalysis
                                    question={`${i + 1}. ${res.question}`}
                                    answers={res.answers}
                                    onNameClick={(name) => handleNameClick(res.question, name)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'responses' && (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        응답 현황 ({survey.isNew ? 0 : respondents.size}/{students.length})
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">응답 상태</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">보기</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(student => {
                                    const hasResponded = !survey.isNew && respondents.has(student.name);
                                    return (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full" src={student.avatar} alt={student.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{student.number}. {student.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {hasResponded ? (
                                                    <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">응답 완료</span>
                                                ) : (
                                                    <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">미응답</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {hasResponded && (
                                                    <button onClick={() => setViewingResponse(student)} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-900">
                                                        <EyeIcon className="w-5 h-5"/>
                                                        <span>원본 데이터 보기</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isGraphModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center" onClick={() => setIsGraphModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-800">교우 관계 네트워크 상세 보기</h3>
                            <button onClick={() => setIsGraphModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="flex-grow overflow-hidden relative bg-slate-100">
                            <InteractiveNetworkGraph 
                                nodes={graphData.nodes}
                                links={graphData.links}
                                width="100%"
                                height="100%"
                                onNodeClick={handleNodeClick}
                            />
                        </div>
                    </div>
                </div>
            )}

            <ResponseDataModal student={viewingResponse} onClose={() => setViewingResponse(null)} resultsData={resultsData} />
            <NominatorListModal data={nominatorsModalData} onClose={() => setNominatorsModalData(null)} />
        </div>
    );
};

export default PeerRelationshipResults;
