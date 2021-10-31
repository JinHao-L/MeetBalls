import { useState } from 'react';
import { Form, Button, Toast, Container } from 'react-bootstrap';
import { useHistory } from 'react-router';
import server from '../../services/server';

const MISMATCHED_PWD =
  'Passwords do not match! Please retype them before submitting';

function RegistrationCompleteToast({ show, message }) {
  return (
    <Toast show={show}>
      <Toast.Header>
        <strong className="me-auto">Registration complete!</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}

function RegistrationErrorToast({ show, message }) {
  return (
    <Toast show={show}>
      <Toast.Header>
        <strong className="me-auto">Something went wrong!</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}

export default function RegistrationScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState(false);

  function readyToSubmit() {
    return (
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      firstName.trim().length > 0 &&
      lastName.trim().length > 0
    );
  }

  const history = useHistory();
  function toLogin() {
    history.push('/login');
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (password !== confirmationPassword) {
      setError(true);
      return;
    }

    setSending(true);
    return server
      .post('/auth/signup', {
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
      })
      .then((res) => {
        setResponse(res.data.message);
      })
      .catch((e) => {
        setError(true);
        if (e.response) setResponse(e.response.data.message);
      })
      .finally(() => {
        setSending(false);
        setSent(true);
      });
  }

  return (
    <>
      <Container className="Container__padding--horizontal Container__padding--vertical">
        <h2 style={{ padding: '0px 0px 10px 0px' }}> Signing up</h2>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="input"
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Please enter your first name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="input"
              autoFocus
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Please enter your last name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter your password"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formConfirmation">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              value={confirmationPassword}
              type="password"
              onChange={(e) => setConfirmationPassword(e.target.value)}
              placeholder="Please re-type your password"
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button
              block="true"
              size="lg"
              disabled={!readyToSubmit() || sending}
              type="submit"
            >
              {sending ? 'Please wait a moment' : 'Register'}
            </Button>
            <Button variant="link" onClick={toLogin}>
              Already have an account? Log in here!
            </Button>
          </div>
        </Form>
        <RegistrationCompleteToast show={sent && !error} message={response} />
        <RegistrationErrorToast show={sent && error} message={response} />
        <RegistrationErrorToast
          show={!sent && error}
          message={MISMATCHED_PWD}
        />
      </Container>
    </>
  );
}
