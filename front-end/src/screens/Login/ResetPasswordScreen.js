import { useState } from 'react';
import { useLocation } from 'react-router';
import { Form, Toast, Button, Container } from 'react-bootstrap';
import server from '../../services/server';

const MISMATCHED_PWD =
  'Passwords do not match! Please retype them before submitting';

function SuccessfulResetToast({ show, message }) {
  return (
    <Toast show={show}>
      <Toast.Header>
        <strong className="me-auto">Success!</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}

function ErrorToast({ show, message }) {
  return (
    <Toast show={show}>
      <Toast.Header>
        <strong className="me-auto">Error!</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}

export default function ResetPasswordScreen() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  function readyToSubmit() {
    return password.trim().length > 0 && confirmation.trim().length > 0;
  }

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [mismatchPasswords, setMismatchPasswords] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (password !== confirmation) {
      setSuccess(false);
      setMismatchPasswords(true);
      return;
    }

    setLoading(true);
    return server
      .post('/auth/password-reset', {
        token,
        password,
      })
      .then((response) => {
        const res = response.data;
        if (res.success) setSuccess(true);
        setResponseMsg(res.message);
      })
      .catch((e) => {
        console.error(e);
        if (e.response) setResponseMsg(e.response.data.message);
        setSuccess(false);
      })
      .finally(() => {
        setSent(true);
        setLoading(false);
      });
  }

  return (
    <>
      <Container className="Container__padding--horizontal Container__padding--vertical">
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password here"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formConfirm">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              autoFocus
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Retype your password here"
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button
              block="true"
              size="me"
              disabled={!readyToSubmit() || loading}
              type="submit"
            >
              {loading ? 'Please wait a moment' : 'Submit'}
            </Button>
          </div>
        </Form>
        <SuccessfulResetToast show={sent && success} message={responseMsg} />
        <ErrorToast
          show={sent && !success}
          message={responseMsg === '' ? 'Please try again later' : responseMsg}
        />
        <ErrorToast
          show={mismatchPasswords && !success}
          message={MISMATCHED_PWD}
        />
      </Container>
    </>
  );
}
