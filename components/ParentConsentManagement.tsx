
import React, { useState } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View } from '../types';
import { ChevronLeftIcon, ShareIcon, DocumentArrowDownIcon, ChevronDownIcon, ChevronUpIcon, QrCodeIcon } from './icons';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "Q. AI가 우리 아이 정보를 유출하지 않나요?",
        answer: "수집된 모든 데이터는 강력한 암호화 기술을 통해 안전하게 저장되며, 오직 담임 교사의 교육 및 생활지도 목적으로만 활용됩니다. 외부 유출이나 상업적 이용은 엄격히 금지되어 있습니다."
    },
    {
        question: "Q. 동의하지 않으면 어떻게 되나요?",
        answer: "AI 생활지도 시스템 활용에 동의하지 않으셔도 학교 생활에 불이익은 없습니다. 다만, AI 기반의 맞춤형 분석 리포트나 심층적인 생활지도 서비스 제공이 제한될 수 있습니다."
    },
    {
        question: "Q. 언제든지 동의를 철회할 수 있나요?",
        answer: "네, 언제든지 담임 교사에게 요청하여 동의를 철회하실 수 있습니다. 철회 시 수집된 데이터는 즉시 파기되거나 식별 불가능한 형태로 처리됩니다."
    },
    {
        question: "Q. 어떤 데이터가 수집되나요?",
        answer: "학생의 기초조사서, 상담 기록, 수업 중 관찰 내용, 교우 관계 설문 결과 등이 수집됩니다. 이는 학생을 더 깊이 이해하고 맞춤형 교육을 제공하기 위한 목적으로만 사용됩니다."
    }
];

const ParentConsentManagement = () => {
    const { setCurrentView } = useAcroAppContext();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const surveyLink = "https://school-ai-consent.com/view/2024-class-5-8";

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(surveyLink);
        alert('안내장 링크가 복사되었습니다.');
    };

    const handleDownloadHWP = () => {
        alert('가정통신문(HWP) 파일 다운로드를 시작합니다.');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">학부모 안내 및 동의 관리</h2>
                        <p className="text-sm text-gray-500 mt-1">AI 생활지도 시스템 활용에 대해 학부모님께 안내하고 동의를 구하는 자료를 관리합니다.</p>
                    </div>
                </div>
            </header>

            <div className="space-y-8">
                <section>
                    <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4">
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        안내 자료 배포
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mobile Link Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <ShareIcon className="w-8 h-8" />
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">추천</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">모바일 안내 링크 전송</h4>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                학부모님 카카오톡이나 문자로 웹 안내장 링크를 전송합니다. 별도의 앱 설치 없이 내용을 확인하고 서명할 수 있습니다.
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCopyLink}
                                    className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    URL 복사
                                </button>
                                <button 
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    QR코드 보기
                                </button>
                            </div>
                        </div>

                        {/* Paper Form Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                    <DocumentArrowDownIcon className="w-8 h-8" />
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">종이 가정통신문 인쇄</h4>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                학교장 직인이 포함된 공식 가정통신문 양식(HWP)입니다. 인쇄하여 학생 편에 가정으로 배부할 수 있습니다.
                            </p>
                            <button 
                                onClick={handleDownloadHWP}
                                className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                HWP 양식 다운로드
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-full border-2 border-purple-800 flex items-center justify-center text-xs font-bold">?</div>
                        학부모 상담 핵심 가이드 (Q&A)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">학부모님이 시스템에 대해 문의하실 때 이렇게 답변해주세요.</p>
                    
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                                <button 
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-medium text-gray-800">{faq.question}</span>
                                    {openFaqIndex === index ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                {openFaqIndex === index && (
                                    <div className="p-4 bg-slate-50 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {isQrModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setIsQrModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-800">안내장 QR 코드</h3>
                            <button onClick={() => setIsQrModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">닫기</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </header>
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4 p-4 bg-gray-100 rounded-md">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(surveyLink)}`} alt="Consent QR Code" />
                            </div>
                            <p className="text-sm text-gray-600 mb-4">학부모님께 이 QR 코드를 보여주세요.</p>
                            <button onClick={handleCopyLink} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                                링크 복사하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentConsentManagement;
