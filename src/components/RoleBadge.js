import { Badge } from 'react-bootstrap';

export default function RoleBadge({ role, isPresent }) {
  switch (role) {
    case 2:
      return (
        <p style={{ margin: 0 }}>
          <Badge bg="danger">Host</Badge>
        </p>
      );
    case 3:
      return (
        <p style={{ margin: 0 }}>
          <Badge bg="warning">Co-Host</Badge>
        </p>
      );
    case 1:
    default:
      if (isPresent) {
        return (
          <p style={{ margin: 0 }}>
            <Badge bg="light" text="dark">
              Participant
            </Badge>
          </p>
        );
      } else {
        return (
          <p style={{ margin: 0 }}>
            <Badge bg="success">Participant</Badge>
          </p>
        );
      }
  }
}
