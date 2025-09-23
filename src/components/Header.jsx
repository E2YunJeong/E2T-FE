import '../styles/Header.css';
import { useNavigate } from 'react-router-dom';

import header_logo1 from '../assets/logo1.svg';
import header_logo2 from '../assets/logo2.svg';

const Header = () => {
    const navigate = useNavigate();
    
    return (
        <header className="header">
            <div className='header-container'>
                <div className="header-logo1">
                    <img src={header_logo1} alt="눈소리 이미지 로고" className="logo-img1" onClick={() => navigate('/')} />
                </div>
                <div className="header-logo2">
                    <img src={header_logo2} alt="눈소리 글자 로고" className="logo-img2" onClick={() => navigate('/')} />
                </div>
            </div>
        </header>
    );
}

export default Header;