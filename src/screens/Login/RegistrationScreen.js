import axios from "axios";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";

export default function RegistrationScreen() {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ confirmationPassword, setConfirmationPassword ] = useState("");
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");

    const [ response, setResponse ] = useState("");
    const [ error, setError ] = useState(false);

    function readyToSubmit() {
        return email.trim().length > 0
            && password.trim().length > 0
            && firstName.trim().length > 0
            && lastName.trim().length > 0
            && password === confirmationPassword;
    }

    async function onSubmit() {
        return axios.post('/auth/signup', {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        }).then((res) => {
            console.log("Registered user with " + email);
            setResponse(res.data.message);
        }).catch((e) => {
            console.log(e)
            if (e.response) {
                setError(true);
                setResponse(e.response.data.message);
            }
        });
    }

    return (
        <div>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        autoFocus
                        value={email}
                        onChange={setEmail}
                        placeholder="Please enter your email"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="input"
                        autoFocus
                        value={firstName}
                        onChange={setFirstName}
                        placeholder="Please enter your first name"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="input"
                        autoFocus
                        value={lastName}
                        onChange={setLastName}
                        placeholder="Please enter your last name"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        value={password}
                        type="password"
                        onChange={setPassword}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formConfirmation">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        value={confirmationPassword}
                        type="password"
                        onChange={setConfirmationPassword}
                    />
                </Form.Group>
                <Button
                    block="true"
                    size="lg"
                    disabled={!readyToSubmit()}
                    type="submit"
                >
                    Login
                </Button>
            </Form>
        </div>
    );
}
