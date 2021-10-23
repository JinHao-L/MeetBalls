import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Container, Navbar, Image, Button } from 'react-bootstrap';
import Logo from '../assets/logo.png';
import { useHistory, useLocation } from 'react-router';
import setAuthToken from '../utils/setAuthToken';

export const AppNavbar = () => {
  const user = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();

  var option = {
    button: null,
    home: HOME.LANDING,
  };

  if (location.pathname === '/') {
    option = {
      button: TOGGLES.CHOOSE,
      home: HOME.LANDING,
    };
  } else {
    for (let i = 0; i < mapping.length; i++) {
      if (location.pathname?.startsWith(mapping[i].route)) {
        option = mapping[i];
        break;
      }
    }
  }

  function logout() {
    window.sessionStorage.clear();
    window.localStorage.clear();
    setAuthToken(null);
    history.replace('/login');
  }

  return (
    <Navbar expand="lg" className="Container__header .navbar-text">
      <Container>
        <Navbar.Brand className="Clickable">
          <a href={option.home}>
            <Image src={Logo} style={{ height: 30 }} />
          </a>
        </Navbar.Brand>
        {option.button === TOGGLES.CHOOSE && !user ? (
          <Button
            variant="outline-primary"
            size="sm"
            style={{ borderRadius: 50 }}
            href="/login"
          >
            Login
          </Button>
        ) : option.button === TOGGLES.CHOOSE ||
          (option.button === TOGGLES.DASHBOARD && user) ? (
          <Button
            variant="outline-primary"
            size="sm"
            style={{ borderRadius: 50 }}
            href="/home"
          >
            Dashboard
          </Button>
        ) : option.button === TOGGLES.LOGOUT ? (
          <Button
            variant="outline-primary"
            size="sm"
            style={{ borderRadius: 50 }}
            onClick={logout}
          >
            Logout
          </Button>
        ) : null}
      </Container>
    </Navbar>
  );
};

const TOGGLES = {
  CHOOSE: 'Choose',
  LOGOUT: 'Logout',
  DASHBOARD: 'Dashboard',
};

const HOME = {
  LANDING: '/',
  DASHBOARD: '/home',
};

const mapping = [
  {
    route: '/home',
    button: TOGGLES.LOGOUT,
    home: HOME.DASHBOARD,
  },
  {
    route: '/meeting',
    button: TOGGLES.DASHBOARD,
    home: HOME.DASHBOARD,
  },
  {
    route: '/ongoing',
    button: TOGGLES.DASHBOARD,
    home: HOME.DASHBOARD,
  },
  {
    route: '/completed',
    button: TOGGLES.DASHBOARD,
    home: HOME.DASHBOARD,
  },
  {
    route: '/privacy-policy',
    button: TOGGLES.CHOOSE,
    home: HOME.LANDING,
  },
  {
    route: '/terms',
    button: TOGGLES.CHOOSE,
    home: HOME.LANDING,
  },
  {
    route: '/support',
    button: TOGGLES.CHOOSE,
    home: HOME.LANDING,
  },
];
