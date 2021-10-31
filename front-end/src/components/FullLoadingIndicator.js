import React from 'react';
import { Container } from 'react-bootstrap';
import { LoadingIndicator } from './LoadingIndicator';

export const FullLoadingIndicator = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <LoadingIndicator />
    </Container>
  );
};
