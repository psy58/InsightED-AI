
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentList from './components/StudentList';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentSurveyDashboard from './components/ParentSurveyDashboard';
import ParentSurveyEditor from './components/ParentSurveyEditor';
import StudentSurveyDashboard from './components/StudentSurveyDashboard';
import StudentSurveyEditor from './components/StudentSurveyEditor';
import ParentCounselingDashboard from './components/ParentCounselingDashboard';
import ParentCounselingEditor from './components/ParentCounselingEditor';
import ParentCounselingLogViewer from './components/ParentCounselingLogViewer';
import StudentCounselingDashboard from './components/StudentCounselingDashboard';
import StudentCounselingEditor from './components/StudentCounselingEditor';
import StudentCounselingLogViewer from './components/StudentCounselingLogViewer';
import TeacherObservationDashboard from './components/TeacherObservationDashboard';
import TeacherObservationEditor from './components/TeacherObservationEditor';
import TeacherObservationLogViewer from './components/TeacherObservationLogViewer';
import SearchResults from './components/SearchResults';
import PeerRelationshipDashboard from './components/PeerRelationshipDashboard';
import PeerRelationshipEditor from './components/PeerRelationshipEditor';
import PeerRelationshipResults from './components/PeerRelationshipResults';
import SettingsModal from './components/SettingsModal';
import Login from './components/Login';
import AddStudentModal from './components/AddStudentModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ParentCounselingRequestEditor from './components/ParentCounselingRequestEditor';
import Tutorial from './components/Tutorial';
import StudentReflectionDashboard from './components/StudentReflectionDashboard';
import StudentReflectionEditor from './components/StudentReflectionEditor';
import StudentReflectionLogViewer from './components/StudentReflectionLogViewer';
import TeacherCommunityDashboard from './components/TeacherCommunityDashboard';
import TeacherCommunityEditor from './components/TeacherCommunityEditor';
import TeacherCommunityPostViewer from './components/TeacherCommunityPostViewer';
import ParentConsentManagement from './components/ParentConsentManagement';
import { useAcroAppContext } from './context/AppContext';
import { View } from './types';

function App() {
  const { selectedStudent, currentView, isAuthenticated, studentToDelete, cancelStudentDeletion, confirmStudentDeletion, currentUser, markTutorialAsComplete, baseFontSize } = useAcroAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    // Apply the global base font size to the document root
    document.documentElement.style.fontSize = `${baseFontSize}px`;
  }, [baseFontSize]);

  useEffect(() => {
    // Start tutorial for new users on their very first login.
    if (isAuthenticated && currentUser?.hasCompletedTutorial === false) {
      setTimeout(() => {
        setTutorialStep(1);
      }, 500); // Delay to allow UI to render
    }
  }, [isAuthenticated, currentUser]);

  const handleSetTutorialStep = (step: number) => {
    setTutorialStep(step);
    // When tutorial is finished (step becomes 0), mark it as complete for the user.
    if (step === 0 && currentUser?.hasCompletedTutorial === false) {
      markTutorialAsComplete();
    }
  };


  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return selectedStudent ? <StudentDashboard /> : <Dashboard onAddStudentClick={() => setIsAddStudentModalOpen(true)} />;
      case View.PARENT_SURVEY_DASHBOARD:
        return <ParentSurveyDashboard />;
      case View.PARENT_SURVEY_EDITOR:
        return <ParentSurveyEditor />;
      case View.STUDENT_SURVEY_DASHBOARD:
          return <StudentSurveyDashboard />;
      case View.STUDENT_SURVEY_EDITOR:
          return <StudentSurveyEditor />;
      case View.PARENT_COUNSELING_DASHBOARD:
          return <ParentCounselingDashboard />;
      case View.PARENT_COUNSELING_EDITOR:
          return <ParentCounselingEditor />;
      case View.PARENT_COUNSELING_VIEW:
          return <ParentCounselingLogViewer />;
      case View.PARENT_COUNSELING_REQUEST_EDITOR:
          return <ParentCounselingRequestEditor />;
      case View.STUDENT_COUNSELING_DASHBOARD:
          return <StudentCounselingDashboard />;
      case View.STUDENT_COUNSELING_EDITOR:
          return <StudentCounselingEditor />;
      case View.STUDENT_COUNSELING_VIEW:
          return <StudentCounselingLogViewer />;
      case View.TEACHER_OBSERVATION_DASHBOARD:
          return <TeacherObservationDashboard />;
      case View.TEACHER_OBSERVATION_EDITOR:
          return <TeacherObservationEditor />;
      case View.TEACHER_OBSERVATION_VIEW:
          return <TeacherObservationLogViewer />;
      case View.SEARCH_RESULTS:
          return <SearchResults />;
      case View.PEER_RELATIONSHIP_DASHBOARD:
          return <PeerRelationshipDashboard />;
      case View.PEER_RELATIONSHIP_EDITOR:
          return <PeerRelationshipEditor />;
      case View.PEER_RELATIONSHIP_RESULTS:
          return <PeerRelationshipResults />;
      case View.STUDENT_REFLECTION_DASHBOARD:
        return <StudentReflectionDashboard />;
      case View.STUDENT_REFLECTION_EDITOR:
        return <StudentReflectionEditor />;
      case View.STUDENT_REFLECTION_VIEW:
        return <StudentReflectionLogViewer />;
      case View.TEACHER_COMMUNITY_DASHBOARD:
        return <TeacherCommunityDashboard />;
      case View.TEACHER_COMMUNITY_EDITOR:
        return <TeacherCommunityEditor />;
      case View.TEACHER_COMMUNITY_POST:
        return <TeacherCommunityPostViewer />;
      case View.PARENT_CONSENT_MANAGEMENT:
        return <ParentConsentManagement />;
      default:
        return selectedStudent ? <StudentDashboard /> : <Dashboard onAddStudentClick={() => setIsAddStudentModalOpen(true)} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="max-w-screen-2xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3">
            <StudentList />
          </div>
          <div className="lg:col-span-9">
            {renderCurrentView()}
          </div>
        </div>
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
      <ConfirmDeleteModal 
        isOpen={!!studentToDelete}
        student={studentToDelete}
        onClose={cancelStudentDeletion}
        onConfirm={confirmStudentDeletion}
      />
      {tutorialStep > 0 && <Tutorial step={tutorialStep} setStep={handleSetTutorialStep} />}
    </div>
  );
}

export default App;
