
import React, { useState, useRef, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { SettingsIcon, HomeIcon, SearchIcon, XIcon, BellIcon, ExclamationTriangleIcon } from './icons';
import { View, DataSource } from '../types';

interface HeaderProps {
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
    const { goHome, searchTerm, setSearchTerm, performSearch, logout, currentUser, newCounselingRequests, setCurrentView, processCounselingRequest } = useAcroAppContext();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const hasSchoolViolenceAlert = true; // Based on mock data
    const totalNotifications = newCounselingRequests.length + (hasSchoolViolenceAlert ? 1 : 0);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        goHome();
    };
    
    const handleViewSchoolViolenceReport = () => {
        const schoolViolenceSurvey = {
            id: 2,
            title: '1분기 한국초등학교 자체 학교폭력 실태조사',
            date: '2024-03-20',
            status: '완료',
            participants: 20,
            total: 20,
            isNew: false,
            dataType: 'schoolViolence'
        };
        sessionStorage.setItem('selectedPeerSurvey', JSON.stringify(schoolViolenceSurvey));
        setCurrentView(View.PEER_RELATIONSHIP_RESULTS);
        setIsNotificationOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef]);
    
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md h-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={goHome} className="flex items-center space-x-3 text-xl font-bold text-blue-600">
            <div className="p-2 bg-blue-100 rounded-lg">
                <HomeIcon className="h-6 w-6 text-blue-600"/>
            </div>
            <h1 className="hidden sm:block">학생 데이터 관리 서비스</h1>
          </button>
          <div className="hidden md:flex items-center border-l border-gray-200 ml-4 pl-4 space-x-2 text-gray-600">
              {currentUser && <span className="font-semibold">{currentUser.school} {currentUser.grade}학년 {currentUser.classNum}반</span>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative w-64 hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="전체 데이터 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </form>
          <span className="text-gray-800 hidden xl:block">
            {currentUser && <span className="font-semibold">{currentUser.name}</span>} 선생님
          </span>
          
          <div data-tutorial-id="step-3" className="relative" ref={notificationRef}>
            <button onClick={() => setIsNotificationOpen(prev => !prev)} className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <BellIcon className="h-6 w-6 text-gray-600"/>
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-20">
                  {hasSchoolViolenceAlert && (
                      <div className="p-4 border-b bg-red-50">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 pt-0.5">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-gray-800 text-sm">학교폭력 실태조사 결과 확인 필요</h3>
                                <p className="text-xs text-gray-600 mt-1">'1분기 학교폭력 실태조사'에서 1건의 피해 응답이 접수되었습니다.</p>
                                <button
                                    onClick={handleViewSchoolViolenceReport}
                                    className="text-xs font-bold text-blue-600 hover:underline mt-2"
                                >
                                    자세히 보기 &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                  )}
                  <div className="p-3 border-b">
                      <h3 className="font-semibold text-gray-800">새로운 상담 신청 ({newCounselingRequests.length}건)</h3>
                  </div>
                  {newCounselingRequests.length > 0 ? (
                      <ul className="py-1 max-h-60 overflow-y-auto">
                          {newCounselingRequests.map(req => {
                              const content = new Map(req.content.split('\n').map(line => line.split('::') as [string, string]));
                              const studentName = content.get('학생 이름');
                              const applicant = content.get('상담 신청자 관계');

                              return (
                                  <li key={req.id}>
                                      <button 
                                          onClick={() => {
                                              processCounselingRequest(req);
                                              setIsNotificationOpen(false);
                                          }}
                                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                          <p className="font-semibold text-gray-800">{studentName} ({applicant})</p>
                                          <p className="text-xs text-gray-500 truncate mt-1">사유: {content.get('상담 신청 이유')}</p>
                                      </button>
                                  </li>
                              );
                          })}
                      </ul>
                  ) : (
                      <p className="text-center text-gray-500 text-sm py-6">새로운 상담 신청이 없습니다.</p>
                  )}
                  <div className="p-2 border-t bg-gray-50 text-center">
                      <button 
                          onClick={() => {
                              setCurrentView(View.PARENT_COUNSELING_DASHBOARD);
                              setIsNotificationOpen(false);
                          }}
                          className="text-sm font-medium text-blue-600 hover:underline"
                      >
                          모든 신청 보기
                      </button>
                  </div>
              </div>
            )}
          </div>
          <button onClick={onSettingsClick} className="p-2 rounded-full hover:bg-gray-100 transition">
            <SettingsIcon className="h-6 w-6 text-gray-600"/>
          </button>
          <button onClick={logout} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
