import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Loading from './components/UI/Loading';
import './styles/holographic.css';
import './styles/neumorphic.css';
import './styles/animations.css';
import Signup from './pages/Signup';

const Home = React.lazy(() => import('./pages/Home'));
const DriverHub = React.lazy(() => import('./pages/DriverHub'));
const FanZone = React.lazy(() => import('./pages/FanZone'));
const NairobiMap = React.lazy(() => import('./pages/NairobiMap'));
const AIChat = React.lazy(() => import('./pages/AIChat'));
const Profile = React.lazy(() => import('./pages/Profile'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/driver/:driverId" element={<DriverHub />} />
              <Route path="/fanzone" element={<FanZone />} />
              <Route path="/map" element={<NairobiMap />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;