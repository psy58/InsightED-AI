
import React, { useState, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View } from '../types';
import { PencilIcon, EyeIcon, ChevronLeftIcon } from './icons';

const mockSurveys = [
    {
        id: 3,
        title: '2025년 10월 교우관계 조사',
        date: '2025-10-15',
        status: '완료',
        participants: 20,
        total: 20,
        isNew: false,
        dataType: 'peerRelationship',
    },
    {
        id: 1,
        title: '2024년 5월 교우관계 조사',
        date: '2024-05-15',
        status: '완료',
        participants: 20,
        total: 20,
        isNew: false,
        dataType: 'peerRelationship',
    },
    {
        id: 2,
        title: '1분기 한국초등학교 자체 학교폭력 실태조사',
        date: '2024-03-20',
        status: '완료',
        participants: 20,
        total: 20,
        isNew: false,
        dataType: 'schoolViolence',
    },
];

const PeerRelationshipDashboard = () => {
    const { setCurrentView } = useAcroAppContext();
    const [surveys, setSurveys] = useState(mockSurveys);

    useEffect(() => {
        const storedSurveysJSON = sessionStorage.getItem('peerSurveys');
        if (storedSurveysJSON) {
            const storedSurveys = JSON.parse(storedSurveysJSON);
            const combinedSurveys = [...mockSurveys];
            const mockSurveyIds = new Set(mockSurveys.map(s => s.id));
            storedSurveys.forEach((stored: any) => {
                if (!mockSurveyIds.has(stored.id)) {
                    combinedSurveys.push(stored);
                }
            });
            setSurveys(combinedSurveys);
        }
    }, []);

    const handleViewResults = (survey: any) => {
        sessionStorage.setItem('selectedPeerSurvey', JSON.stringify(survey));
        setCurrentView(View.PEER_RELATIONSHIP_RESULTS);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">교우 관계 관리</h2>
                </div>
                <button
                    onClick={() => setCurrentView(View.PEER_RELATIONSHIP_EDITOR)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <PencilIcon className="w-5 h-5" />
                    새 설문 생성하기
                </button>
            </header>

            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">실시한 설문 목록</h3>
                <div className="space-y-3">
                    {surveys.map(survey => (
                        <div key={survey.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-800">{survey.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    실시일: {survey.date} | 상태: {survey.status} | 참여율: {survey.participants}/{survey.total} ({survey.total > 0 ? Math.round(survey.participants/survey.total*100) : 0}%)
                                </p>
                            </div>
                            <button
                                onClick={() => handleViewResults(survey)}
                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-900 font-semibold"
                            >
                                <EyeIcon className="w-5 h-5"/>
                                <span>결과 보기</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PeerRelationshipDashboard;
