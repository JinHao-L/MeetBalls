import { useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router';
import RedirectionScreen, {
  WAIT_MSG,
} from '../../components/RedirectionScreen';
import { UserContext } from '../../context/UserContext';
import { zoomLogin } from '../../services/auth';

const CODE_PARAM_KEY = 'code';
const STATE_PARAM_KEY = 'state';

export default function ZoomRedirectPage() {
  const { search } = useLocation();
  const user = useContext(UserContext);
  const history = useHistory();
  const query = new URLSearchParams(search);
  const code = query.get(CODE_PARAM_KEY);
  const fromDev = process.env.NODE_ENV === 'staging' && query.get(STATE_PARAM_KEY) === 'dev';

  useEffect(() => {
    if (!code || fromDev) {
      console.log(code);
      history.push('/login');
      return;
    }
    zoomLogin(code).catch((err) => {
      history.push('/login');
    });
  }, []);

  useEffect(() => {
    if (user) {
      history.push('/home');
    }
  }, [user]);

  return <RedirectionScreen message={WAIT_MSG} />;
}
