import React, { useState, useEffect, useMemo } from 'react';
import { XIcon } from './icons';

interface TutorialProps {
  step: number;
  setStep: (step: number) => void;
}

const tutorialSteps = [
  {
    targetId: 'step-1',
    title: '학생 추가하기',
    content: '먼저, 관리할 학생을 추가해보세요. 엑셀 파일을 붙여넣거나 직접 입력할 수 있습니다.',
    position: 'top-right',
  },
  {
    targetId: 'step-2',
    title: '학생 목록 및 관리',
    content: '학생을 추가하면 여기에 목록이 나타납니다. 학생을 선택하여 개별 데이터를 보거나, 마우스 오른쪽 버튼으로 삭제할 수 있습니다.',
    position: 'right-center',
  },
  {
    targetId: 'step-3',
    title: '알림 기능',
    content: '학부모 상담 신청 등 새로운 활동이 발생하면 이곳에 알림이 표시됩니다.',
    position: 'bottom-right',
  },
  {
    targetId: 'step-4',
    title: '홈 화면 편집',
    content: '이 버튼을 눌러 홈 화면의 메뉴 탭 순서를 원하는 대로 변경하고 저장할 수 있습니다.',
    position: 'bottom-right',
  },
  {
    targetId: null, // No target, centered modal
    title: '튜토리얼 완료',
    content: '이제 모든 준비가 끝났습니다! 학생 데이터 관리 서비스를 시작해보세요.',
    position: 'center',
  },
];

const Tutorial: React.FC<TutorialProps> = ({ step, setStep }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const currentStep = useMemo(() => tutorialSteps[step - 1], [step]);

  useEffect(() => {
    if (currentStep?.targetId) {
      const targetElement = document.querySelector(`[data-tutorial-id='${currentStep.targetId}']`);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [currentStep]);

  if (!currentStep) return null;

  const handleNext = () => {
    if (step < tutorialSteps.length) {
      setStep(step + 1);
    } else {
      setStep(0); // End tutorial
    }
  };

  const handleSkip = () => {
    setStep(0); // End tutorial
  };

  const getTooltipPosition = () => {
    const offset = 12; // 12px gap
    switch (currentStep.position) {
      case 'top-right':
        return { top: position.top - offset, left: position.left, transform: 'translateY(-100%)' };
      case 'right-center':
        return { top: position.top + position.height / 2, left: position.left + position.width + offset, transform: 'translateY(-50%)' };
      case 'bottom-right':
        return { top: position.top + position.height + offset, left: position.left + position.width, transform: 'translateX(-100%)' };
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default:
        return { top: position.top, left: position.left + position.width + offset };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm transition-opacity duration-300">
      {currentStep.targetId && (
        <div
          className="absolute rounded-lg border-2 border-dashed border-white bg-blue-500/20"
          style={{ top: position.top - 4, left: position.left - 4, width: position.width + 8, height: position.height + 8, transition: 'all 0.3s ease' }}
        />
      )}
      
      <div
        className="absolute w-80 bg-white rounded-lg shadow-2xl p-5"
        style={{ ...tooltipStyle, transition: 'all 0.3s ease' }}
      >
        <button onClick={handleSkip} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <XIcon className="w-5 h-5"/>
        </button>

        <h3 className="text-lg font-bold text-gray-800 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-gray-600">{currentStep.content}</p>

        <div className="mt-5 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">{step} / {tutorialSteps.length}</span>
            <div>
                 <button onClick={handleSkip} className="text-sm font-semibold text-gray-600 hover:text-gray-800 mr-4">건너뛰기</button>
                <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm shadow-sm hover:bg-blue-700"
                >
                    {step === tutorialSteps.length ? '완료' : '다음'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;