import { Badge } from 'react-bootstrap';

export default function RoleBadge({ role, isPresent }) {
  switch (role) {
    case 1: {
      if (isPresent) {
        return (
          <Badge bg="light" text="dark">
            Participant
          </Badge>
        );
      } else {
        return <Badge bg="success">Participant</Badge>;
      }
    }
    case 2:
      return <Badge bg="warning">Host</Badge>;
  }
}
