
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Student, View, SearchResult, DataSource, DataStatus, User, DataSourceType, MenuItem } from '../types';
import { MOCK_STUDENTS, MALE_AVATAR, FEMALE_AVATAR, INITIAL_MENU_ITEMS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  students: Student[];
  selectedStudent: Student | null;
  selectStudent: (studentId: number | null) => void;
  goHome: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  performSearch: (term: string) => void;
  initialDataSourceToView: DataSource | null;
  viewSearchResult: (result: SearchResult) => void;
  clearInitialDataSourceToView: () => void;
  addDataSource: (studentId: number, dataSource: Omit<DataSource, 'id' | 'status'>) => void;
  addStudents: (newStudentsData: Array<{ number: string, name: string; gender: string }>) => void;
  isAuthenticated: boolean;
  login: (id: string, pass: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'students' | 'menuItems'>) => Promise<void>;
  studentToDelete: Student | null;
  requestStudentDeletion: (student: Student) => void;
  cancelStudentDeletion: () => void;
  confirmStudentDeletion: () => void;
  newCounselingRequests: DataSource[];
  markRequestAsHandled: (requestId: number) => void;
  counselingRequestToProcess: DataSource | null;
  processCounselingRequest: (request: DataSource) => void;
  setMenuItems: (items: MenuItem[]) => void;
  markTutorialAsComplete: () => void;
  baseFontSize: number;
  setBaseFontSize: (size: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const createSnippet = (content: string, term: string): string => {
  const lowerContent = content.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const index = lowerContent.indexOf(lowerTerm);

  if (index === -1) {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + lowerTerm.length + 40);
  
  let snippet = content.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
};

const sortedMockStudents = [...MOCK_STUDENTS].sort((a, b) => a.number - b.number);

const initialUser: User = {
    id: 'korea0508',
    password: '0000',
    name: '홍길동',
    school: '한국초등학교',
    grade: '5',
    classNum: '8',
    students: sortedMockStudents,
    menuItems: INITIAL_MENU_ITEMS,
    hasCompletedTutorial: true,
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([initialUser]);
  // Initialize with demo user to bypass login screen for evaluation
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [initialDataSourceToView, setInitialDataSourceToView] = useState<DataSource | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  // Initialize counseling requests from the initial user data
  const initialRequests = initialUser.students.flatMap(s => s.dataSources).filter(ds => ds.type === DataSourceType.ParentCounselingRequest);
  const [newCounselingRequests, setNewCounselingRequests] = useState<DataSource[]>(initialRequests);
  const [counselingRequestToProcess, setCounselingRequestToProcess] = useState<DataSource | null>(null);
  
  // Default font size set to 17px (approx +1pt from standard 16px)
  const [baseFontSize, setBaseFontSize] = useState(17);


  const isAuthenticated = !!currentUser;
  const students = currentUser?.students || [];

  const login = useCallback(async (id: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.id === id && u.password === pass);
        if (user) {
          // If it's the demo user, make sure to reset to the initial state
          if (user.id === 'korea0508') {
             const freshInitialUser = {
                ...initialUser,
                students: [...MOCK_STUDENTS].sort((a, b) => a.number - b.number),
                menuItems: INITIAL_MENU_ITEMS,
             };
             setUsers(prev => prev.map(u => u.id === 'korea0508' ? freshInitialUser : u));
             setCurrentUser(freshInitialUser);
          } else {
             const userWithMenu = { ...user, menuItems: user.menuItems || INITIAL_MENU_ITEMS };
             setCurrentUser(userWithMenu);
          }
          
          const requests = user.students.flatMap(s => s.dataSources).filter(ds => ds.type === DataSourceType.ParentCounselingRequest);
          setNewCounselingRequests(requests);
          resolve();
        } else {
          reject(new Error('아이디 또는 비밀번호가 일치하지 않습니다.'));
        }
      }, 500);
    });
  }, [users]);
  
  const register = useCallback(async (userData: Omit<User, 'students' | 'menuItems'>) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (users.some(u => u.id === userData.id)) {
                reject(new Error('이미 사용 중인 아이디입니다.'));
                return;
            }
            const newUser: User = { ...userData, students: [], menuItems: INITIAL_MENU_ITEMS, hasCompletedTutorial: false };
            setUsers(prev => [...prev, newUser]);
            resolve();
        }, 500);
    });
  }, [users]);


  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedStudent(null);
    setCurrentView(View.DASHBOARD);
    setSearchTerm('');
    setSearchResults([]);
    setInitialDataSourceToView(null);
    setNewCounselingRequests([]);
    setCounselingRequestToProcess(null);
  }, []);
  
  const updateUserState = (updatedUser: User) => {
      // Always update the current session's user state for immediate UI feedback.
      setCurrentUser(updatedUser);

      // But only persist the changes to the main users array if it's NOT the demo account.
      if (updatedUser.id !== 'korea0508') {
          setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
  };

  const markRequestAsHandled = useCallback((requestId: number) => {
      setNewCounselingRequests(prev => prev.filter(r => r.id !== requestId));
  }, []);
  
  const processCounselingRequest = useCallback((request: DataSource) => {
      const student = students.find(s => s.dataSources.some(ds => ds.id === request.id));
      if (student) {
          selectStudent(student.id);
          setCounselingRequestToProcess(request);
          markRequestAsHandled(request.id);
          setCurrentView(View.PARENT_COUNSELING_EDITOR);
      }
  }, [students, markRequestAsHandled]);


  const selectStudent = useCallback((studentId: number | null) => {
    if (studentId === null) {
        setSelectedStudent(null);
        setCurrentView(View.DASHBOARD);
        return;
    }
    const student = students.find(s => s.id === studentId) || null;
    setSelectedStudent(student);
    setInitialDataSourceToView(null);
    setCurrentView(View.DASHBOARD);
  }, [students]);

  const goHome = useCallback(() => {
    setSelectedStudent(null);
    setCurrentView(View.DASHBOARD);
    setSearchTerm('');
    setSearchResults([]);
    setInitialDataSourceToView(null);
  }, []);

  const performSearch = useCallback((term: string) => {
    const trimmedTerm = term.trim().toLowerCase();
    if (!trimmedTerm) {
        setSearchResults([]);
        setCurrentView(View.SEARCH_RESULTS);
        return;
    }

    const results: SearchResult[] = [];
    students.forEach(student => {
        const studentIdentifier = `${student.number}. ${student.name}`;
        if (studentIdentifier.toLowerCase().includes(trimmedTerm)) {
            results.push({
                student,
                dataSource: { id: -1, type: '학생 정보' as any, status: '이름' as any, content: `학생 이름: ${student.number}. ${student.name}` },
                snippet: `학생 정보에서 '${term}' 검색어와 일치합니다.`
            });
        }

        student.dataSources.forEach(ds => {
            const contentMatch = ds.content && ds.content.toLowerCase().includes(trimmedTerm);
            const typeMatch = ds.type && ds.type.toLowerCase().includes(trimmedTerm);
            
            if (contentMatch || typeMatch) {
                results.push({
                    student,
                    dataSource: ds,
                    snippet: createSnippet(ds.content, trimmedTerm),
                });
            }
        });
    });
    
    setSearchResults(results);
    setCurrentView(View.SEARCH_RESULTS);
  }, [students]);

  const viewSearchResult = useCallback((result: SearchResult) => {
    const student = students.find(s => s.id === result.student.id) || null;
    setSelectedStudent(student);
    if (result.dataSource.id !== -1) {
        setInitialDataSourceToView(result.dataSource);
    } else {
        setInitialDataSourceToView(null);
    }
    setCurrentView(View.DASHBOARD);
  }, [students]);

  const clearInitialDataSourceToView = useCallback(() => {
    setInitialDataSourceToView(null);
  }, []);

  const addDataSource = useCallback((studentId: number, dataSource: Omit<DataSource, 'id' | 'status'>) => {
    if (!currentUser) return;
    
    const updatedStudents = currentUser.students.map(student => {
        if (student.id === studentId) {
            const newDataSource: DataSource = {
                ...dataSource,
                id: Date.now(),
                status: DataStatus.Submitted,
            };
            return {
                ...student,
                dataSources: [...student.dataSources, newDataSource],
            };
        }
        return student;
    });

    const updatedUser = { ...currentUser, students: updatedStudents };
    updateUserState(updatedUser);
  }, [currentUser]);

  const addStudents = useCallback((newStudentsData: Array<{ number: string; name: string; gender: string }>) => {
    if (!currentUser) return;

    const currentStudents = currentUser.students;
    const maxId = Math.max(0, ...currentStudents.map(st => st.id));
    const newStudents: Student[] = newStudentsData.filter(s => s.name.trim()).map((s, index) => ({
        id: maxId + 1 + index,
        number: parseInt(s.number, 10) || 0,
        name: s.name.trim(),
        avatar: s.gender.trim() === '남' ? MALE_AVATAR : FEMALE_AVATAR,
        dataSources: [],
    }));

    const updatedStudents = [...currentStudents, ...newStudents].sort((a, b) => a.number - b.number);
    const updatedUser = { ...currentUser, students: updatedStudents };
    updateUserState(updatedUser);
  }, [currentUser]);

  const requestStudentDeletion = useCallback((student: Student) => {
    setStudentToDelete(student);
  }, []);

  const cancelStudentDeletion = useCallback(() => {
    setStudentToDelete(null);
  }, []);

  const confirmStudentDeletion = useCallback(() => {
    if (!studentToDelete || !currentUser) return;

    const updatedStudents = currentUser.students.filter(s => s.id !== studentToDelete.id);
    const updatedUser = { ...currentUser, students: updatedStudents };
    updateUserState(updatedUser);

    if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
        setCurrentView(View.DASHBOARD);
    }
    setStudentToDelete(null);
  }, [studentToDelete, currentUser, selectedStudent]);

   const setMenuItems = useCallback((items: MenuItem[]) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, menuItems: items };
    updateUserState(updatedUser);
  }, [currentUser]);

  const markTutorialAsComplete = useCallback(() => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, hasCompletedTutorial: true };
    updateUserState(updatedUser);
  }, [currentUser]);


  return (
    <AppContext.Provider value={{ currentUser, students, selectedStudent, selectStudent, goHome, currentView, setCurrentView, searchTerm, setSearchTerm, searchResults, performSearch, initialDataSourceToView, viewSearchResult, clearInitialDataSourceToView, addDataSource, addStudents, isAuthenticated, login, logout, register, studentToDelete, requestStudentDeletion, cancelStudentDeletion, confirmStudentDeletion, newCounselingRequests, markRequestAsHandled, counselingRequestToProcess, processCounselingRequest, setMenuItems, markTutorialAsComplete, baseFontSize, setBaseFontSize }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAcroAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAcroAppContext must be used within an AppProvider');
  }
  return context;
};
