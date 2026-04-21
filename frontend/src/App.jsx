import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { routers } from './routers/Router.jsx';
import { Suspense } from 'react';



function renderRoutes(routes) {
  return routes.map((route, index) => {
    const Component = route.component;

    if (route.children) {
      return (
        <Route key={index} path={route.path} element={<Component />}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    // Route không có children
    if (route.index) {
      return <Route key={index} index element={<Component />} />;
    }

    return <Route key={index} path={route.path} element={<Component />} />;
  });
}



function App() {
  return(
    <BrowserRouter>
      <Suspense fallback={<div>Loading ...</div>}>
        <Routes>
          {renderRoutes(routers)}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App
