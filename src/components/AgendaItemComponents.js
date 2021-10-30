import { Card, Button } from 'react-bootstrap';
import { openFile } from '../services/files';
import { toast } from 'react-toastify';
import { isValidUrl } from '../common/CommonFunctions';
import { getFormattedDuration } from '../common/CommonFunctions';

export function SpeakerSection({ item }) {
  const speaker = item?.speaker?.userName;
  if (!speaker) return null;
  return (
    <Card.Subtitle style={{ marginBottom: '0.5rem' }}>
      Presented by {speaker}
    </Card.Subtitle>
  );
}

export function MaterialsSection({ item, variant = 'primary' }) {
  const materials = item.speakerMaterials;
  if (!materials || (!isValidUrl(materials) && !item.speaker)) return null;
  return (
    <Button
      variant={variant}
      onClick={() =>
        openFile(item.speakerMaterials, item.meetingId, item.speaker?.id).catch(
          (_err) => {
            toast.error('File not found');
          },
        )
      }
    >
      View Materials
    </Button>
  );
}

function DurationSection({ item, showDuration }) {
  if (!showDuration) return null;

  return <Card.Text>{getFormattedDuration(item.expectedDuration)}</Card.Text>;
}

function BufferedDescriptionSection({ item }) {
  if (!item.description) return null;

  return (
    <>
      <div className="Buffer--5px" />
      <Card.Text>{item.description}</Card.Text>
    </>
  );
}

export default function AgendaItemInfoSection({ item, showDuration }) {
  return (
    <Card.Body>
      <Card.Title>{item.name}</Card.Title>
      <SpeakerSection item={item} />
      <DurationSection item={item} showDuration={showDuration} />
      <BufferedDescriptionSection item={item} />
    </Card.Body>
  );
}
