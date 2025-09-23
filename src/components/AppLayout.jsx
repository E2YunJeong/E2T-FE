import Header from './Header';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Header /> {/* 모든 페이지에 공통으로 표시되는 헤더 */}
            <main className="content">
                <Outlet /> {/* 각 페이지의 콘텐츠가 여기에 렌더링됨*/}
            </main>
        </div>
    );
};

export default AppLayout;