
import React, { useState, useRef, useEffect } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { View, MenuItem } from '../types';
import { DocumentTextIcon, ChatBubbleOvalLeftEllipsisIcon, EyeIcon, NetworkIcon, GripVerticalIcon, UserPlusIcon, PencilIcon, UsersIcon, ClipboardIcon, ExclamationTriangleIcon, SparklesIcon, CheckBadgeIcon } from './icons';

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  DocumentTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  EyeIcon,
  NetworkIcon,
  PencilIcon,
  UsersIcon,
  ClipboardIcon,
  CheckBadgeIcon,
};

const Dashboard = ({ onAddStudentClick }: { onAddStudentClick: () => void }) => {
  const { setCurrentView, currentUser, setMenuItems, baseFontSize, setBaseFontSize } = useAcroAppContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<MenuItem[]>([]);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (currentUser?.menuItems) {
      setEditedItems(currentUser.menuItems);
    }
  }, [currentUser?.menuItems]);

  const increaseFontSize = () => setBaseFontSize(Math.min(24, baseFontSize + 1));
  const decreaseFontSize = () => setBaseFontSize(Math.max(12, baseFontSize - 1));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    e.currentTarget.classList.add('bg-slate-200');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-slate-200');
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, mainItems: MenuItem[]) => {
    e.currentTarget.classList.remove('bg-slate-200');
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    // We are reordering within the main items subset
    const newMainItems = [...mainItems];
    const dragItemContent = newMainItems[dragItem.current];
    newMainItems.splice(dragItem.current, 1);
    newMainItems.splice(dragOverItem.current, 0, dragItemContent);
    
    // Reconstruct the full list: put consent items back where they belong (or keep them separated conceptually)
    // For simplicity in this UI, we update the editedItems to reflect this change in the subset, 
    // while preserving the excluded items.
    // However, since 'Parent Consent' is now fixed at the bottom, we should just update the state 
    // excluding it, and when saving, we might want to keep it in the data structure or handle it separately.
    // Here we assume the state tracks ALL items, but we only display reorderable ones.
    
    // Strategy: Rebuild the full list. 
    // 1. Get non-main items from current editedItems
    const consentItem = editedItems.find(item => item.view === View.PARENT_CONSENT_MANAGEMENT);
    
    // 2. Create new full list
    const newFullList = [...newMainItems];
    if (consentItem) {
        // Append at the end or keep it if it was in the list. 
        // To keep the data structure consistent, we add it back.
        // Note: The order in the data structure matters if we render all. 
        // But now we render separately. Let's just push it.
        newFullList.push(consentItem);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    
    setEditedItems(newFullList);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  }
  
  const handleSaveOrder = () => {
      setMenuItems(editedItems);
      setIsEditMode(false);
  }
  
  const handleCancelEdit = () => {
    if (currentUser?.menuItems) {
        setEditedItems(currentUser.menuItems);
    }
    setIsEditMode(false);
  }

  const allItems = isEditMode ? editedItems : (currentUser?.menuItems || []);
  
  // Separate the "Parent Consent" item from the rest
  const consentItem = allItems.find(item => item.view === View.PARENT_CONSENT_MANAGEMENT);
  const mainGridItems = allItems.filter(item => item.view !== View.PARENT_CONSENT_MANAGEMENT);

  const renderCardContent = (item: MenuItem, isSpecial: boolean = false) => {
      const IconComponent = iconMap[item.icon];
      return (
        <>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${isSpecial ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
            {IconComponent ? <IconComponent className="w-6 h-6" /> : <div className="w-6 h-6" />}
            </div>
            <div className="flex flex-col text-left">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{item.title}</h3>
            <p className="text-gray-600 text-sm flex-grow">{item.description}</p>
            </div>
        </>
      )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">안녕하세요, {currentUser?.name} 선생님!</h2>
            <p className="text-gray-600">학생 데이터 관리 서비스를 통해 학생들을 더 깊이 이해하고 지원하세요.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Font Size Controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 space-x-1">
                <button onClick={decreaseFontSize} className="px-2 py-1 hover:bg-white hover:shadow-sm rounded text-gray-600 text-sm font-bold" aria-label="글자 크기 작게">
                    A-
                </button>
                <span className="text-xs text-gray-500 w-4 text-center hidden sm:block">{baseFontSize}</span>
                <button onClick={increaseFontSize} className="px-2 py-1 hover:bg-white hover:shadow-sm rounded text-gray-600 text-sm font-bold" aria-label="글자 크기 크게">
                    A+
                </button>
            </div>

            {!isEditMode ? (
                <button data-tutorial-id="step-4" onClick={() => setIsEditMode(true)} className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50">
                    탭 위치 조정
                </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
                        취소
                    </button>
                    <button onClick={handleSaveOrder} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                        저장
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
            data-tutorial-id="step-1"
            onClick={onAddStudentClick} 
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 border border-blue-300 font-semibold rounded-lg shadow-sm hover:bg-blue-100 transition-colors whitespace-nowrap"
        >
            <UserPlusIcon className="w-5 h-5" />
            학생 추가하기
        </button>
      </div>

      {/* Main Menu Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainGridItems.map((item: MenuItem, index: number) => {
          if (isEditMode) {
            return (
              <div
                key={item.title}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, mainGridItems)}
                onDragEnd={handleDragEnd}
                className="relative px-6 py-4 bg-slate-100 rounded-lg transition-all text-left border-2 border-dashed border-slate-300 flex flex-row items-start gap-4 cursor-grab"
              >
                {renderCardContent(item)}
                <div className="absolute top-2 right-2 p-1 text-gray-400">
                  <GripVerticalIcon className="w-5 h-5"/>
                </div>
              </div>
            );
          }
          
          return (
            <button 
              key={item.title}
              onClick={() => setCurrentView(item.view)}
              className="px-6 py-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-md transition-all text-left border border-slate-200 flex flex-row items-start gap-4"
            >
              {renderCardContent(item)}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Parent Consent & AI Banner */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Parent Consent Management Card (Distinct) */}
          {consentItem && (
              <div className="lg:col-span-1 h-full">
                  <button 
                    onClick={() => setCurrentView(consentItem.view)}
                    className="w-full h-full px-6 py-6 bg-white rounded-xl hover:shadow-lg transition-all text-left border-2 border-indigo-100 hover:border-indigo-300 flex flex-col items-start gap-4 relative overflow-hidden group"
                  >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                      <div className="relative z-10 flex items-center gap-3 w-full">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex-shrink-0 shadow-sm">
                              <CheckBadgeIcon className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-indigo-900 mb-1 tracking-tight whitespace-nowrap">{consentItem.title}</h3>
                              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">Admin</span>
                          </div>
                      </div>
                      <p className="relative z-10 text-gray-600 text-sm leading-relaxed">
                          {consentItem.description}
                      </p>
                  </button>
              </div>
          )}

          {/* AI Banner */}
          <div className="lg:col-span-2 h-full">
            <div className="h-full relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white shadow-lg flex items-center">
                <div className="relative z-10 flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-full bg-white/20 p-3 backdrop-blur-sm">
                        <SparklesIcon className="h-8 w-8 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">💡 AI 기능을 100% 활용해보세요!</h3>
                        <p className="text-blue-50 text-sm leading-relaxed">
                            왼쪽 <span className="font-bold text-white border-b border-white/40 pb-0.5">'학생 바로가기'</span> 목록에서 학생을 선택하여 이동하면,<br className="hidden sm:block" />
                            해당 학생의 데이터를 바탕으로 <span className="font-bold text-yellow-300">AI 종합 리포트</span>와 <span className="font-bold text-yellow-300">AI 상담 시나리오</span>를 생성할 수 있습니다.
                        </p>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
