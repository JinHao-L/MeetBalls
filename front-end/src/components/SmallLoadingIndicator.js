import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

export const SmallLoadingIndicator = () => {
  return (
    <Container className="d-flex justify-content-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );
};
