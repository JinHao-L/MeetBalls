import { useState } from 'react';
import { Form, Button, Toast, Container } from 'react-bootstrap';
import server from '../../services/server';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  function readyToSubmit() {
    return email.trim().length > 0;
  }

  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);

  function submit(event) {
    event.preventDefault();
    return server
      .post('/auth/forget-password', { email })
      .then((response) => {
        if (response.data.success) setSuccess(true);
      })
      .catch((error) => {
        console.error(error);
        setSuccess(false);
      })
      .finally(() => setSent(true));
  }

  return (
    <>
      <Container className="Container__padding--horizontal">
        <h2 style={{ padding: '10px 0px' }}> Send password reset email</h2>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="formReset">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email here "
            />
          </Form.Group>
          <Button
            block="true"
            size="me"
            disabled={!readyToSubmit()}
            type="submit"
          >
            Reset password
          </Button>
        </Form>
        <Toast show={sent && success}>
          <Toast.Header>
            <strong className="me-auto">Success!</strong>
          </Toast.Header>
          <Toast.Body>
            Password reset instructions has been sent to your inbox
          </Toast.Body>
        </Toast>
        <Toast show={sent && !success}>
          <Toast.Header>
            <strong className="me-auto">Error!</strong>
          </Toast.Header>
          <Toast.Body>
            Email not found, are you sure you have registered?
          </Toast.Body>
        </Toast>
      </Container>
    </>
  );
}
