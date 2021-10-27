import './css/Containers.css';
import './css/Images.css';
import './css/Toggles.css';
import './css/Text.css';
import './css/Others.css';
import './css/AddToCalendar.css';
import 'react-toastify/dist/ReactToastify.css';

import React, { useEffect, useContext } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import UpcomingMeetingScreen from './screens/UpcomingMeeting/UpcomingMeetingScreen';
import OngoingMeetingAdminScreen from './screens/OngoingMeetingAdmin/OngoingMeetingAdminScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import CompletedMeetingScreen from './screens/CompletedMeeting/CompletedMeetingScreen';
import { UserContext } from './context/UserContext';
import LandingScreen from './screens/LandingPage/LandingScreen';
import { AppNavbar } from './components/AppNavbar';
import CustomBootstrapStyle from './common/CustomBootstrapStyle';
import ZoomLoginScreen from './screens/Login/ZoomLoginScreen';
import PrivacyPolicyScreen from './screens/LandingPage/PrivacyPolicyScreen';
import ZoomRedirectPage from './screens/Login/ZoomRedirectPage';
import TermsNConditionScreen from './screens/LandingPage/TermsNConditionScreen';
import MeetingRedirectScreen from './screens/Participant/MeetingRedirectScreen';
import ParticipantScreen from './screens/Participant/ParticipantScreen';
import SupportPage from './screens/LandingPage/SupportPage';
import DocumentationScreen from './screens/LandingPage/DocumentationScreen';
import ScrollToTop from './ScrollToTop';
import server from './services/server';

export default function App() {
  const user = useContext(UserContext);

  useEffect(() => {
    server.get().catch((err) => {
      toast.error('Cannot connect to server');
    });
  }, []);

  /**
   * @param {JSX.Element} child
   * @returns
   */
  function RouteIfLoggedIn({ path, children }) {
    return <Route path={path}>{!user ? <Redirect to="/" /> : children}</Route>;
  }

  return (
    <Router>
      <ScrollToTop />
      <AppNavbar />
      <CustomBootstrapStyle />
      <div className="Container__content">
        <ToastContainer position="top-right" />
        <Switch>
          <Route exact path="/">
            <LandingScreen />
          </Route>
          <Route exact path="/privacy-policy">
            <PrivacyPolicyScreen />
          </Route>
          <Route exact path="/documentation">
            <DocumentationScreen />
          </Route>
          <Route exact path="/terms">
            <TermsNConditionScreen />
          </Route>
          <Route exact path="/support">
            <SupportPage />
          </Route>
          <Route exact path="/authorize">
            <ZoomRedirectPage />
          </Route>
          <Route path="/login">
            <ZoomLoginScreen />
          </Route>
          <Route path="/participant/:id">
            <ParticipantScreen />
          </Route>
          <RouteIfLoggedIn path="/home">
            <DashboardScreen />
          </RouteIfLoggedIn>
          <RouteIfLoggedIn path="/meeting/:id">
            <UpcomingMeetingScreen />
          </RouteIfLoggedIn>
          <Route path="/meeting">
            <MeetingRedirectScreen />
          </Route>
          <Route path="/participant/:id">
            <ParticipantScreen />
          </Route>
          <Route path="/ongoing/:id">
            <OngoingMeetingAdminScreen />
          </Route>
          <RouteIfLoggedIn path="/completed/:id">
            <CompletedMeetingScreen />
          </RouteIfLoggedIn>
          <Route path="*">
            <Redirect to={{ pathname: '/' }} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
