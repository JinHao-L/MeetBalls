import { Badge } from 'react-bootstrap';

export default function RoleBadge({ role, isPresent }) {
  switch (role) {
    case 2:
      return <Badge bg="warning">Host</Badge>;
    case 3:
      return <Badge bg="warning">Co-Host</Badge>;
    case 1:
    default:
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
}
