import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import RedirectionScreen, {
  LOADING_MSG,
  ERROR_MSG,
} from '../../components/RedirectionScreen';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { extractError } from '../../utils/extractError';

const TOKEN_KEY = 'token';

export default function RedirectScreen() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get(TOKEN_KEY);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const history = useHistory();

  useEffect(async () => {
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await server.get(
        `/meeting/magic-link/${token}`,
        defaultHeaders,
      );
      setError(false);
      setLoading(false);
      const id = response.data?.meeting?.id;
      const joiner = response.data?.joiner?.id;
      const name = response.data?.joiner?.userName;
      history.push(`/participant/${id}?joiner=${joiner}&name=${name}`);
    } catch (error) {
      toast.error(extractError(error));
      setError(true);
      setLoading(false);
    }
  }, []);

  const message = !loading && error ? ERROR_MSG : LOADING_MSG;

  return <RedirectionScreen message={message} />;
}
