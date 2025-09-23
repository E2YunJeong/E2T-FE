import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from '../components/AppLayout';
import {Home} from '../pages/Home';
import {B2T} from '../pages/B2T';

/*
    < 중첩 라우터 관리 >
    router 객체 선언부
    path 부분의 경로로 들어오면
    element에 있는 페이지로 렌더링
*/
const router = createBrowserRouter( [
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/service',
                element: <B2T />
            }
        ],
    },
]);

// router 객체를 컴포넌트로 제공해주기 위한 provider
// 객체로 만들어둔 라이터 설정을 파라미터로 받아서 적용시킴
export const RootRouter = () => {
    return <RouterProvider router={router} />;
};

export default RootRouter;