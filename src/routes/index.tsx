import * as React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import HomePage from '../pages/home';
import RegistrationPage from '../pages/registration';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="/" element={<HomePage />} />*/}
        <Route path="/" element={<RegistrationPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
