import React, { useState, ClipboardEvent } from 'react';
import { useAcroAppContext } from '../context/AppContext';
import { PlusIcon, TrashIcon, XIcon } from './icons';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StudentData = {
  key: number;
  number: string;
  name: string;
  gender: string;
};

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { addStudents } = useAcroAppContext();
  const [parsedStudents, setParsedStudents] = useState<StudentData[]>([]);

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    parseAndSetStudents(text);
  };

  const parseAndSetStudents = (text: string) => {
    const parts = text.trim().split(/\s+/);
    const students: StudentData[] = [];
    let i = 0;
    while (i < parts.length) {
        const currentPart = parts[i];
        const nextPart = parts[i + 1];
        const thirdPart = parts[i + 2];

        // "번호 성별 이름" 패턴을 찾습니다. (예: "1 남 강지우")
        if (currentPart && /^\d+$/.test(currentPart) && nextPart && /^(남|여)$/.test(nextPart) && thirdPart) {
            let nameParts = [thirdPart];
            let j = i + 3;
            // 이름 뒤에 숫자로 시작하고 성별이 오는 패턴이 나오기 전까지 모두 이름으로 간주합니다.
            while (j < parts.length && !(/^\d+$/.test(parts[j]) && parts[j+1] && /^(남|여)$/.test(parts[j+1]))) {
                nameParts.push(parts[j]);
                j++;
            }
            students.push({
                key: Date.now() + students.length,
                number: currentPart,
                gender: nextPart,
                name: nameParts.join(' '),
            });
            i = j;
        } else {
            i++;
        }
    }
    setParsedStudents(current => [...current, ...students].sort((a,b) => parseInt(a.number) - parseInt(b.number)));
  };
  
  const handleInputChange = (key: number, field: keyof Omit<StudentData, 'key'>, value: string) => {
    setParsedStudents(current =>
      current.map(s => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  const handleAddNewRow = () => {
    const nextNumber = parsedStudents.length > 0 ? Math.max(...parsedStudents.map(s => parseInt(s.number, 10) || 0)) + 1 : 1;
    setParsedStudents(current => [
      ...current,
      { key: Date.now(), number: nextNumber.toString(), name: '', gender: '' },
    ]);
  };
  
  const handleDeleteRow = (key: number) => {
    setParsedStudents(current => current.filter(s => s.key !== key));
  };
  
  const handleSave = () => {
    const studentsToSave = parsedStudents
      .filter(s => s.name.trim() !== '' && s.number.trim() !== '')
      .map(s => ({ number: s.number, name: s.name, gender: s.gender }));

    if (studentsToSave.length > 0) {
        addStudents(studentsToSave);
    }
    handleClose();
  };

  const handleClose = () => {
    setParsedStudents([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">새로운 학생 추가</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">학생 명렬표 붙여넣기</h4>
            <p className="text-sm text-gray-500 mb-3">엑셀, 한글 등에서 '번호 성별 이름' 형식의 표를 복사하여 아래 칸에 붙여넣으세요.</p>
            <textarea
              className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="이곳에 명렬표를 붙여넣으세요. (탭, 공백, 줄바꿈으로 구분)&#10;예시) 1 남 강지우 2 여 권서연..."
              onPaste={handlePaste}
            />
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                  <h4 className="font-semibold text-gray-700">학생 정보 확인 및 개별 추가</h4>
                  <p className="text-sm text-gray-500">잘못된 부분이 있다면 수정하거나, 아래 버튼을 눌러 학생을 직접 추가할 수 있습니다.</p>
              </div>
              <button
                onClick={handleAddNewRow}
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap"
              >
                <PlusIcon className="w-5 h-5"/>
                학생 개별 추가하기
              </button>
            </div>

            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 border rounded-md p-2 bg-slate-50">
              <div className="grid grid-cols-12 gap-2 font-semibold text-sm text-gray-600 px-2 pb-2 border-b">
                <div className="col-span-2">번호</div>
                <div className="col-span-2">성별 (남/여)</div>
                <div className="col-span-7">이름</div>
                <div className="col-span-1"></div>
              </div>
              {parsedStudents.length > 0 ? parsedStudents.map(student => (
                <div key={student.key} className="grid grid-cols-12 gap-2 items-center bg-white p-1 rounded">
                  <input type="text" value={student.number} onChange={e => handleInputChange(student.key, 'number', e.target.value)} className="col-span-2 p-2 border border-gray-300 rounded-md"/>
                  <input type="text" value={student.gender} onChange={e => handleInputChange(student.key, 'gender', e.target.value)} className="col-span-2 p-2 border border-gray-300 rounded-md"/>
                  <input type="text" value={student.name} onChange={e => handleInputChange(student.key, 'name', e.target.value)} className="col-span-7 p-2 border border-gray-300 rounded-md"/>
                  <button onClick={() => handleDeleteRow(student.key)} className="col-span-1 p-2 text-gray-400 hover:text-red-600 flex justify-center">
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">붙여넣기 하거나 '학생 개별 추가하기' 버튼을 눌러 학생을 등록하세요.</div>
              )}
            </div>
          </div>
        </div>

        <footer className="p-4 bg-gray-50 border-t flex justify-end gap-2">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
            취소
          </button>
          <button onClick={handleSave} disabled={parsedStudents.filter(s => s.name.trim()).length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300">
            학생 목록에 저장
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddStudentModal;