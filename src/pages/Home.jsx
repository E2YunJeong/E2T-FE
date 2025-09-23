import { useNavigate } from 'react-router-dom';

import '../styles/Home.css';

import howToUse1 from '../assets/howToUse1.svg';
import howToUse2 from '../assets/howToUse2.svg';
import howToUse3 from '../assets/howToUse3.svg';
import howToUse4 from '../assets/howToUse4.svg';
import howToUse5 from '../assets/howToUse5.svg';

import arrow from '../assets/arrow-forward.svg';
import horizontal from '../assets/ellipsis-horizontal.svg';

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className='home'>
            <main className='home-component'>
                <div className='title'>
                    <h2>눈으로 이어지는 대화, 눈소리</h2>

                    <button className='service-button' onClick={() => navigate('/service')}>
                        <span className='bigTitle'>서비스 이용하기</span>
                        <img src={arrow} alt="화살표 버튼" />
                    </button>
                </div>

                <section className='how-to-use'>
                    <h2>이용 방법</h2>

                    <div className='use-wrap'>
                        <div className='use use1'>
                            <img src={howToUse1} alt="이용방법1" className="use-img" />
                            <p className='title'>서비스 이용</p>
                            <p className='content'>{'서비스 이용하기\r\n버튼을 클릭해주세요.'}</p>
                        </div>
                        <img src={horizontal} alt="" className="horizontal-img" />
                        <div className='use use2'>
                            <img src={howToUse2} alt="이용방법2" className="use-img" />
                            <p className='title'>웹캠 허용</p>
                            <p className='content'>{'웹캠 사용 권한을\r\n허용해주세요.'}</p>
                        </div>
                        <img src={horizontal} alt="" className="horizontal-img" />
                        <div className='use use3'>
                            <img src={howToUse3} alt="이용방법3" className="use-img" />
                            <p className='title'>입력 시작</p>
                            <p className='content'>{'3초 이상 눈을 감아\r\n입력을 시작하세요.'}</p>
                        </div>
                        <img src={horizontal} alt="" className="horizontal-img" />
                        <div className='use use4'>
                            <img src={howToUse4} alt="이용방법4" className="use-img" />
                            <p className='title'>모스부호 입력</p>
                            <p className='content'>{'웹캠 아래에 있는\r\n모스부호를 사용하여\r\n문장을 입력해주세요.'}</p>
                        </div>
                        <img src={horizontal} alt="" className="horizontal-img" />
                        <div className='use use5'>
                            <img src={howToUse5} alt="이용방법5" className="use-img" />
                            <p className='title'>입력 종료</p>
                            <p className='content'>{'3초 이상 눈을 감아\r\n입력을 종료하세요.'}</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}