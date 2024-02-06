import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Chat from './components/Chats/Chat';
import Login from './components/auth/Login/Login';
import { useAuth } from './contexts/AuthContext';
import Convert from './components/mp4Tomp3/Convert';
import Test from './components/mp4Tomp3/Test';

function App() {
  return (
    <>
     <Routes>
        <Route path="/user-chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/test" element={<Test />} />
        <Route path="*" element={<Link to="/user-chat">Open Chat</Link>} />
      </Routes>
    </>
  );
}

export default App;
